"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * LGPD Art. 18 V — portabilidade. Gera JSON com todos os dados do trainer
 * autenticado e seus alunos. Server action retorna a string; o client baixa
 * como arquivo.
 */
export async function exportMyData(): Promise<
  { ok: true; data: string; filename: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  const [
    { data: trainer },
    { data: students },
    { data: workouts },
    { data: payments },
  ] = await Promise.all([
    supabase.from("trainers").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("students").select("*").eq("trainer_id", user.id),
    supabase
      .from("workouts")
      .select(
        "*, workout_blocks(*, workout_exercises(*))"
      )
      .eq("trainer_id", user.id),
    supabase
      .from("student_payments")
      .select("*")
      .eq("trainer_id", user.id),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    note: "Exportação de dados pessoais do titular (LGPD Art. 18 V — portabilidade). Anamneses dos alunos estão dentro de students[].anamnesis_data.",
    trainer,
    students,
    workouts,
    student_payments: payments,
  };

  const json = JSON.stringify(payload, null, 2);
  const filename = `ultrapt-export-${new Date().toISOString().slice(0, 10)}.json`;
  return { ok: true, data: json, filename };
}

/**
 * LGPD Art. 18 IV — apagamento. Anonimiza todos os dados pessoais do trainer
 * e dos alunos dele. Mantem registros fiscais (5 anos CTN). Desloga e remove
 * o usuario do Supabase Auth.
 */
export async function deleteMyAccount(formData: FormData) {
  const locale = await getLocale();
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== "EXCLUIR") {
    redirect({
      href: `/dashboard/profile?delete_error=${encodeURIComponent(
        "Digite EXCLUIR exatamente pra confirmar."
      )}`,
      locale,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: "/login", locale });
  }

  const admin = adminClient();

  // 1. Anonimiza via funcao SQL definida na migration 0031
  const { error: anonErr } = await admin.rpc("anonymize_trainer_account", {
    target_id: user!.id,
  });
  if (anonErr) {
    console.error("[lgpd-delete] anonymize failed", {
      userId: user!.id,
      code: anonErr.code,
      message: anonErr.message,
    });
    redirect({
      href: `/dashboard/profile?delete_error=${encodeURIComponent(
        "Falha ao processar exclusão. Contate privacidade@ultrapt.com.br."
      )}`,
      locale,
    });
  }

  // 2. Cancela subscription Asaas se existir (best-effort, nao bloqueia)
  // O webhook Asaas SUBSCRIPTION_DELETED ja atualiza o status, mas como
  // estamos anonimizando o registro, esse webhook nao vai casar mais.
  // Deixar pra suporte fiscal cuidar se houver charge pendente.

  // 3. Remove usuario do auth (signOut local + admin.deleteUser)
  await supabase.auth.signOut();
  const { error: authErr } = await admin.auth.admin.deleteUser(user!.id);
  if (authErr) {
    console.error("[lgpd-delete] auth deleteUser failed", {
      userId: user!.id,
      code: authErr.status,
      message: authErr.message,
    });
    // Mesmo se a remocao do auth falhar, os dados ja foram anonimizados.
    // Loga e segue.
  }

  console.log("[lgpd-delete] account anonymized", { userId: user!.id });
  redirect({ href: "/?account_deleted=1", locale });
}
