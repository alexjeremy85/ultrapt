"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
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
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  const digits = cpf.split("").map(Number);
  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) sum += digits[i] * (t + 1 - i);
    let d = (sum * 10) % 11;
    if (d === 10) d = 0;
    if (d !== digits[t]) return false;
  }
  return true;
}

export async function startSubscription(formData: FormData) {
  const locale = await getLocale();
  const planId = String(formData.get("plan_id") ?? "") as PlanId;
  const cpfInput = String(formData.get("cpf") ?? "").replace(/\D/g, "");

  // Resultado: definimos o destino e redirecionamos UMA UNICA VEZ
  // FORA do try/catch, para nao engolir o NEXT_REDIRECT.
  let resultPath: string = `/dashboard/billing?error=${encodeURIComponent("Erro inesperado")}`;

  try {
    if (!PLANS[planId]) {
      resultPath = `/dashboard/billing?error=${encodeURIComponent("Plano invalido")}`;
      throw new Error("done");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      resultPath = "/login";
      throw new Error("done");
    }

    const { data: trainer } = await supabase
      .from("trainers")
      .select(
        "asaas_customer_id, asaas_subscription_id, full_name, phone, whatsapp_phone, cpf"
      )
      .eq("id", user.id)
      .single();

    const cpf = cpfInput || trainer?.cpf || "";
    if (!cpf) {
      resultPath = `/dashboard/billing?error=${encodeURIComponent("Informe seu CPF para continuar.")}`;
      throw new Error("done");
    }
    if (!isValidCpf(cpf)) {
      resultPath = `/dashboard/billing?error=${encodeURIComponent("CPF invalido.")}`;
      throw new Error("done");
    }

    let customerId = trainer?.asaas_customer_id ?? null;

    if (!customerId) {
      const existing = await asaasFindCustomerByCpf(cpf);
      if (existing) customerId = existing.id;

      if (!customerId) {
        const customer = await asaasCreateCustomer({
          name: trainer?.full_name ?? user.email ?? "Personal Trainer",
          email: user.email ?? undefined,
          cpfCnpj: cpf,
          mobilePhone:
            trainer?.whatsapp_phone ?? trainer?.phone ?? undefined,
        });
        customerId = customer.id;
      }
    }

    if (trainer?.asaas_subscription_id) {
      try {
        await asaasCancelSubscription(trainer.asaas_subscription_id);
      } catch {
        // ignora se ja cancelada
      }
    }

    const sub = await asaasCreateSubscription({
      customer: customerId!,
      billingType: "PIX",
      value: PLANS[planId].price,
      nextDueDate: nextDueDate(),
      cycle: "MONTHLY",
      description: `Ultra PT - Plano ${PLANS[planId].name}`,
      externalReference: user.id,
    });

    await supabase
      .from("trainers")
      .update({
        asaas_customer_id: customerId,
        asaas_subscription_id: sub.id,
        subscription_plan: planId,
        subscription_status: "trialing",
        cpf,
      })
      .eq("id", user.id);

    revalidatePath("/[locale]/dashboard", "layout");
    resultPath = `/dashboard/billing?success=${encodeURIComponent(
      "Assinatura criada. A primeira cobranca chega via Pix em ate 14 dias."
    )}`;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof Error && err.message !== "done") {
      resultPath = `/dashboard/billing?error=${encodeURIComponent(err.message)}`;
    }
  }

  redirect({ href: resultPath, locale });
}
