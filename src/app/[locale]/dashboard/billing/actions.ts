"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect as nextRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "@/lib/plans";
import {
  asaasCreateCustomer,
  asaasFindCustomerByCpf,
  asaasCreateSubscription,
  asaasCancelSubscription,
  asaasListSubscriptionPayments,
} from "@/lib/asaas";
import { validateVoucher } from "@/lib/vouchers";
import { createAdminClient } from "@/lib/supabase/admin";

function todayDate(): string {
  // Asaas aceita data atual como primeira cobranca, gerando link/QR Code na hora
  return new Date().toISOString().slice(0, 10);
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

    // Pre-validacao de voucher (apenas pra computar finalPrice).
    // O CLAIM atomico acontece via RPC depois que a Asaas confirmar.
    const basePrice = PLANS[planId].price;
    let finalPrice = basePrice;
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
      billingType: "UNDEFINED", // permite Pix OU Cartao no checkout do Asaas
      value: finalPrice,
      nextDueDate: todayDate(), // cobranca disponivel HOJE
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
        subscription_status: "pending_payment",
        cpf,
      })
      .eq("id", user.id);

    // Claim atomico do voucher (RPC com row locks). Se falhar agora,
    // o trainer ja tem a Asaas subscription criada e o voucher_used
    // segue null — pode tentar de novo. O Asaas sub pode ser cancelada
    // depois manualmente em caso de inconsistencia rara.
    if (voucherCodeUsed) {
      const admin = createAdminClient();
      const { data: claim } = await admin.rpc("claim_voucher", {
        p_trainer_id: user.id,
        p_code: voucherCodeUsed,
      });
      const claimRow = Array.isArray(claim) ? claim[0] : claim;
      if (!claimRow?.ok) {
        // Cupom ja foi reivindicado por outra request — segue sem desconto
        console.warn("[billing] claim_voucher falhou:", claimRow?.reason);
      }
    }

    // Busca a primeira cobranca da subscription pra obter o invoiceUrl
    // (pagina do Asaas onde o cliente escolhe Pix ou Cartao)
    let invoiceUrl: string | null = null;
    for (let i = 0; i < 5 && !invoiceUrl; i++) {
      const payments = await asaasListSubscriptionPayments(sub.id);
      const first = payments.data?.[0];
      if (first?.invoiceUrl) {
        invoiceUrl = first.invoiceUrl;
        break;
      }
      // Asaas as vezes leva 1-2s pra criar o payment apos a subscription
      await new Promise((r) => setTimeout(r, 800));
    }

    revalidatePath("/[locale]/dashboard", "layout");
    if (invoiceUrl) {
      // Redireciona direto pro checkout hospedado do Asaas
      resultPath = invoiceUrl;
    } else {
      const successMsg = voucherCodeUsed
        ? `Assinatura criada com cupom ${voucherCodeUsed}! Pague hoje para ativar.`
        : `Assinatura criada. Pague hoje para ativar.`;
      resultPath = `/dashboard/billing?success=${encodeURIComponent(successMsg)}`;
    }
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof Error && err.message !== "done") {
      resultPath = `/dashboard/billing?error=${encodeURIComponent(err.message)}`;
    }
  }

  // URLs externas (invoiceUrl do Asaas) precisam do redirect do next/navigation
  if (/^https?:\/\//.test(resultPath)) {
    nextRedirect(resultPath);
  }
  redirect({ href: resultPath, locale });
}
