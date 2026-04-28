"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Valida o codigo de acesso do aluno contra o trainer da pagina publica.
 * Retorna a URL do app do aluno se OK.
 *
 * Usa admin client porque o aluno e anonimo (sem login).
 */
export async function studentLogin(
  trainerSlug: string,
  accessCode: string
): Promise<{ ok: true; redirect: string } | { ok: false; reason: string }> {
  const cleanCode = accessCode.trim().toUpperCase();
  if (!cleanCode) return { ok: false, reason: "Informe o código." };

  const supabase = createAdminClient();

  // 1. Pega o trainer pelo slug
  const { data: trainer } = await supabase
    .from("trainers")
    .select("id")
    .eq("slug", trainerSlug)
    .maybeSingle();

  if (!trainer) {
    return { ok: false, reason: "Personal não encontrado." };
  }

  // 2. Procura aluno desse trainer com o access_code informado
  const { data: student } = await supabase
    .from("students")
    .select("access_code")
    .eq("trainer_id", trainer.id)
    .ilike("access_code", cleanCode)
    .maybeSingle();

  if (!student) {
    return {
      ok: false,
      reason: "Código não encontrado. Confirme com seu personal.",
    };
  }

  return { ok: true, redirect: `/aluno/${student.access_code}` };
}
