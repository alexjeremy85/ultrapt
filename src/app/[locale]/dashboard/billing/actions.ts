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
import { validateVoucher, incrementVoucherUse } from "@/lib/vouchers";

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

export type VoucherCheckResult =
  | { ok: true; finalPrice: number; discount: number; description: string | null }
  | { ok: false; reason: string };

export async function checkVoucher(
  code: string,
  planId: PlanId
): Promise<VoucherCheckResult> {
  if (!PLANS[planId]) return { ok: false, reason: "Plano invalido" };
  const result = await validateVoucher(code, PLANS[planId].price);
  if (!result.ok) return { ok: false, reason: result.reason };
  return {
    ok: true,
    finalPrice: result.finalPrice,
    discount: result.discount,
    description: result.voucher.description,
  };
}

export async function startSubscription(formData: FormData) {
  const locale = await getLocale();
  const planId = String(formData.get("plan_id") ?? "") as PlanId;
  const cpfInput = String(formData.get("cpf") ?? "").replace(/\D/g, "");
  const voucherCode = String(formData.get("voucher_code") ?? "").trim();

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
        "asaas_customer_id, asaas_subscription_id, full_name, phone, whatsapp_phone, cpf, voucher_used"
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

    // Validacao de voucher (opcional)
    const basePrice = PLANS[planId].price;
    let finalPrice = basePrice;
    let voucherIdToIncrement: string | null = null;
    let voucherCodeUsed: string | null = null;

    if (voucherCode) {
      if (trainer?.voucher_used) {
        resultPath = `/dashboard/billing?error=${encodeURIComponent("Voce ja usou um cupom anteriormente.")}`;
        throw new Error("done");
      }
      const v = await validateVoucher(voucherCode, basePrice);
      if (!v.ok) {
        resultPath = `/dashboard/billing?error=${encodeURIComponent("Cupom: " + v.reason)}`;
        throw new Error("done");
      }
      finalPrice = v.finalPrice;
      voucherIdToIncrement = v.voucher.id;
      voucherCodeUsed = v.voucher.code;
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
      value: finalPrice,
      nextDueDate: nextDueDate(),
      cycle: "MONTHLY",
      description: voucherCodeUsed
        ? `Ultra PT - Plano ${PLANS[planId].name} (cupom ${voucherCodeUsed})`
        : `Ultra PT - Plano ${PLANS[planId].name}`,
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
        ...(voucherCodeUsed
          ? {
              voucher_used: voucherCodeUsed,
              voucher_used_at: new Date().toISOString(),
            }
          : {}),
      })
      .eq("id", user.id);

    if (voucherIdToIncrement) {
      await incrementVoucherUse(voucherIdToIncrement);
    }

    revalidatePath("/[locale]/dashboard", "layout");
    const successMsg = voucherCodeUsed
      ? `Assinatura criada com cupom ${voucherCodeUsed}! Primeira cobranca de R$ ${finalPrice.toFixed(2).replace(".", ",")} via Pix em ate 14 dias.`
      : `Assinatura criada. A primeira cobranca chega via Pix em ate 14 dias.`;
    resultPath = `/dashboard/billing?success=${encodeURIComponent(successMsg)}`;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof Error && err.message !== "done") {
      resultPath = `/dashboard/billing?error=${encodeURIComponent(err.message)}`;
    }
  }

  redirect({ href: resultPath, locale });
}
