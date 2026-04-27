"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "@/lib/plans";
import {
  asaasCreateCustomer,
  asaasFindCustomerByCpf,
  asaasCreateSubscription,
  asaasCancelSubscription,
} from "@/lib/asaas";

function nextDueDate(): string {
  // Daqui a 14 dias (alinhado com fim do trial). Asaas exige formato YYYY-MM-DD.
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export async function startSubscription(formData: FormData) {
  const locale = await getLocale();
  const planId = String(formData.get("plan_id") ?? "") as PlanId;
  if (!PLANS[planId]) {
    redirect({
      href: `/dashboard/billing?error=${encodeURIComponent("Plano invalido")}`,
      locale,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });

  const { data: trainer } = await supabase
    .from("trainers")
    .select(
      "asaas_customer_id, asaas_subscription_id, full_name, phone, whatsapp_phone"
    )
    .eq("id", user!.id)
    .single();

  // Pega CPF do raw_user_meta_data ou do app_metadata. Como nao temos coletado ainda,
  // por enquanto usamos um placeholder. Em producao, coletariamos CPF antes do checkout.
  // Para o MVP de validacao, marcamos a assinatura local mas pulamos o Asaas se nao tiver CPF.
  const cpf = String(formData.get("cpf") ?? "").replace(/\D/g, "");

  try {
    let customerId = trainer?.asaas_customer_id ?? null;

    if (!customerId) {
      // Tenta achar customer existente pelo CPF (se foi informado), senao cria
      if (cpf) {
        const existing = await asaasFindCustomerByCpf(cpf);
        if (existing) customerId = existing.id;
      }

      if (!customerId) {
        if (!cpf) {
          // Fluxo simplificado: salvar plano localmente como pending_cpf
          // e redirecionar para tela que coleta CPF
          await supabase
            .from("trainers")
            .update({ subscription_plan: planId })
            .eq("id", user!.id);
          redirect({
            href: `/dashboard/billing?error=${encodeURIComponent("Informe seu CPF para continuar.")}`,
            locale,
          });
          return;
        }
        const customer = await asaasCreateCustomer({
          name: trainer?.full_name ?? user!.email ?? "Personal Trainer",
          email: user!.email ?? undefined,
          cpfCnpj: cpf,
          mobilePhone: trainer?.whatsapp_phone ?? trainer?.phone ?? undefined,
        });
        customerId = customer.id;
      }
    }

    // Se ja existe subscription, cancela antes de criar nova (troca de plano)
    if (trainer?.asaas_subscription_id) {
      try {
        await asaasCancelSubscription(trainer.asaas_subscription_id);
      } catch {
        // Continua mesmo se falhar (pode estar ja cancelada)
      }
    }

    const sub = await asaasCreateSubscription({
      customer: customerId!,
      billingType: "PIX",
      value: PLANS[planId].price,
      nextDueDate: nextDueDate(),
      cycle: "MONTHLY",
      description: `Ultra PT - Plano ${PLANS[planId].name}`,
      externalReference: user!.id,
    });

    await supabase
      .from("trainers")
      .update({
        asaas_customer_id: customerId,
        asaas_subscription_id: sub.id,
        subscription_plan: planId,
        subscription_status: "trialing",
      })
      .eq("id", user!.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro inesperado";
    redirect({
      href: `/dashboard/billing?error=${encodeURIComponent(msg)}`,
      locale,
    });
  }

  revalidatePath("/[locale]/dashboard", "layout");
  redirect({
    href: `/dashboard/billing?success=${encodeURIComponent("Assinatura criada. A primeira cobranca chega via Pix em ate 14 dias.")}`,
    locale,
  });
}
