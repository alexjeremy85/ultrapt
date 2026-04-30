"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "@/lib/plans";
import {
  asaasCreateCustomer,
  asaasFindCustomerByCpf,
  asaasCreateSubscription,
  asaasCancelSubscription,
  asaasListSubscriptionPayments,
  asaasGetPaymentPixQr,
  asaasGetPayment,
  asaasGetSubscription,
} from "@/lib/asaas";
import { validateVoucher } from "@/lib/vouchers";
import { createAdminClient } from "@/lib/supabase/admin";

function todayDate(): string {
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

export type StartSubscriptionResult =
  | {
      ok: true;
      paymentId: string;
      qrImage: string;
      qrPayload: string;
      expiresAt: string;
      value: number;
      planId: PlanId;
      voucherApplied: string | null;
    }
  | { ok: false; reason: string };

export type PaymentStatusResult =
  | { ok: true; status: string; paid: boolean }
  | { ok: false; reason: string };

export type SubscriptionDetails = {
  plan: PlanId;
  status: string;
  value: number;
  nextDueDate: string | null;
  payments: Array<{
    id: string;
    value: number;
    status: string;
    dueDate: string;
    paymentDate: string | null;
    invoiceUrl: string | null;
  }>;
};

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

export type PartnerVoucherResult =
  | { ok: true; daysExtended: number; newTrialEndsAt: string }
  | { ok: false; reason: string };

/**
 * Aplica cupom de parceiro: estende trial_ends_at em N dias.
 * Diferente do voucher de desconto, nao envolve Asaas.
 * So permitido durante trial (impede uso depois de assinar).
 */
export async function applyPartnerVoucher(
  code: string
): Promise<PartnerVoucherResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "Nao autenticado" };

  const cleanCode = String(code ?? "").trim().toUpperCase();
  if (!cleanCode) return { ok: false, reason: "Codigo vazio" };

  const { data: trainer } = await supabase
    .from("trainers")
    .select("subscription_status, trial_ends_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!trainer) return { ok: false, reason: "Trainer nao encontrado" };
  if (trainer.subscription_status !== "trialing") {
    return {
      ok: false,
      reason: "Cupom de parceiro so pode ser usado durante o trial",
    };
  }

  const admin = createAdminClient();
  const { data: claim, error: claimError } = await admin.rpc("claim_voucher", {
    p_trainer_id: user.id,
    p_code: cleanCode,
  });
  if (claimError) {
    console.error("[partner-voucher] claim falhou", claimError);
    return { ok: false, reason: "Erro ao aplicar cupom" };
  }
  const claimRow = Array.isArray(claim) ? claim[0] : claim;
  if (!claimRow?.ok) {
    return { ok: false, reason: claimRow?.reason ?? "Cupom invalido" };
  }
  if (claimRow.voucher_type !== "extend_trial_days") {
    // Reverte: o claim ja marcou voucher_used. Pra MVP, retorna erro
    // claro; usuario deve usar o campo correto (voucher de desconto vs
    // voucher de parceiro).
    console.warn("[partner-voucher] tipo errado", claimRow.voucher_type);
    return {
      ok: false,
      reason: "Este codigo nao e de parceiro. Use o campo de cupom de desconto.",
    };
  }

  // Estende a partir do MAIOR entre now() e trial_ends_at atual,
  // pra evitar que um cupom encurte trial existente.
  const days = Number(claimRow.voucher_value);
  const currentTrialEnd = trainer.trial_ends_at
    ? new Date(trainer.trial_ends_at)
    : new Date();
  const base = currentTrialEnd > new Date() ? currentTrialEnd : new Date();
  const newTrialEnd = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  const { error: updateError } = await admin
    .from("trainers")
    .update({ trial_ends_at: newTrialEnd.toISOString() })
    .eq("id", user.id);
  if (updateError) {
    console.error("[partner-voucher] update trial_ends_at falhou", updateError);
    return { ok: false, reason: "Erro ao estender trial" };
  }

  console.log("[partner-voucher] aplicado", {
    trainerId: user.id,
    code: cleanCode,
    days,
    newTrialEndsAt: newTrialEnd.toISOString(),
  });

  revalidatePath("/[locale]/dashboard", "layout");

  return {
    ok: true,
    daysExtended: days,
    newTrialEndsAt: newTrialEnd.toISOString(),
  };
}

/**
 * Cria a subscription Pix e retorna QR code + copia e cola pra UI embutida.
 * O client faz polling em getPaymentStatus ate confirmar.
 */
export async function startSubscription(input: {
  planId: PlanId;
  cpf: string;
  voucherCode?: string;
}): Promise<StartSubscriptionResult> {
  const planId = input.planId;
  const cpfInput = String(input.cpf ?? "").replace(/\D/g, "");
  const voucherCode = String(input.voucherCode ?? "").trim();

  if (!PLANS[planId]) return { ok: false, reason: "Plano invalido" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "Nao autenticado" };

  const { data: trainer } = await supabase
    .from("trainers")
    .select(
      "asaas_customer_id, asaas_subscription_id, full_name, phone, whatsapp_phone, cpf, voucher_used"
    )
    .eq("id", user.id)
    .single();

  const cpf = cpfInput || trainer?.cpf || "";
  if (!cpf) return { ok: false, reason: "Informe seu CPF para continuar." };
  if (!isValidCpf(cpf)) return { ok: false, reason: "CPF invalido." };

  const basePrice = PLANS[planId].price;
  let finalPrice = basePrice;
  let voucherCodeUsed: string | null = null;

  if (voucherCode) {
    if (trainer?.voucher_used) {
      return { ok: false, reason: "Voce ja usou um cupom anteriormente." };
    }
    const v = await validateVoucher(voucherCode, basePrice);
    if (!v.ok) return { ok: false, reason: "Cupom: " + v.reason };
    finalPrice = v.finalPrice;
    voucherCodeUsed = v.voucher.code;
  }

  let customerId = trainer?.asaas_customer_id ?? null;

  try {
    if (!customerId) {
      const existing = await asaasFindCustomerByCpf(cpf);
      if (existing) customerId = existing.id;

      if (!customerId) {
        const customer = await asaasCreateCustomer({
          name: trainer?.full_name ?? user.email ?? "Personal Trainer",
          email: user.email ?? undefined,
          cpfCnpj: cpf,
          mobilePhone: trainer?.whatsapp_phone ?? trainer?.phone ?? undefined,
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
      nextDueDate: todayDate(),
      cycle: "MONTHLY",
      description: voucherCodeUsed
        ? `Ultra PT - Plano ${PLANS[planId].name} (cupom ${voucherCodeUsed})`
        : `Ultra PT - Plano ${PLANS[planId].name}`,
      externalReference: user.id,
    });

    let paymentId: string | null = null;
    for (let i = 0; i < 12 && !paymentId; i++) {
      try {
        const payments = await asaasListSubscriptionPayments(sub.id);
        const first = payments.data?.[0];
        if (first?.id) {
          paymentId = first.id;
          break;
        }
      } catch (e) {
        console.warn("[billing] list payments retry", i, (e as Error).message);
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!paymentId) {
      return {
        ok: false,
        reason: "Asaas demorou pra gerar a cobranca. Tente novamente em 30s.",
      };
    }

    const pix = await asaasGetPaymentPixQr(paymentId);

    await supabase
      .from("trainers")
      .update({
        asaas_customer_id: customerId,
        asaas_subscription_id: sub.id,
        asaas_payment_id: paymentId,
        subscription_plan: planId,
        subscription_status: "pending_payment",
        cpf,
      })
      .eq("id", user.id);

    if (voucherCodeUsed) {
      const admin = createAdminClient();
      const { data: claim } = await admin.rpc("claim_voucher", {
        p_trainer_id: user.id,
        p_code: voucherCodeUsed,
      });
      const claimRow = Array.isArray(claim) ? claim[0] : claim;
      if (!claimRow?.ok) {
        console.warn("[billing] claim_voucher falhou:", claimRow?.reason);
      }
    }

    revalidatePath("/[locale]/dashboard", "layout");

    return {
      ok: true,
      paymentId,
      qrImage: pix.encodedImage,
      qrPayload: pix.payload,
      expiresAt: pix.expirationDate,
      value: finalPrice,
      planId,
      voucherApplied: voucherCodeUsed,
    };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

/**
 * Verifica o status do pagamento atual no Asaas.
 * Usado pra polling do client enquanto o QR Pix esta na tela.
 * Tambem atualiza subscription_status local pra "active" se o pagamento
 * ja foi confirmado (resiliencia caso o webhook atrase).
 */
export async function getPaymentStatus(): Promise<PaymentStatusResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "Nao autenticado" };

  const { data: trainer } = await supabase
    .from("trainers")
    .select("asaas_payment_id, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!trainer?.asaas_payment_id) {
    return { ok: false, reason: "Sem pagamento pendente" };
  }

  if (trainer.subscription_status === "active") {
    return { ok: true, status: "RECEIVED", paid: true };
  }

  try {
    const payment = await asaasGetPayment(trainer.asaas_payment_id);
    const paid =
      payment.status === "RECEIVED" ||
      payment.status === "CONFIRMED" ||
      payment.status === "RECEIVED_IN_CASH";

    if (paid && trainer.subscription_status !== "active") {
      const admin = createAdminClient();
      await admin
        .from("trainers")
        .update({ subscription_status: "active" })
        .eq("id", user.id);
      revalidatePath("/[locale]/dashboard", "layout");
    }

    return { ok: true, status: payment.status, paid };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

/**
 * Retorna detalhes da assinatura ativa pra exibir no painel:
 * status, valor, proxima cobranca e historico de pagamentos.
 */
export async function getSubscriptionDetails(): Promise<SubscriptionDetails | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: trainer } = await supabase
    .from("trainers")
    .select("asaas_subscription_id, subscription_plan, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!trainer?.asaas_subscription_id) return null;

  try {
    const [sub, paymentsRes] = await Promise.all([
      asaasGetSubscription(trainer.asaas_subscription_id),
      asaasListSubscriptionPayments(trainer.asaas_subscription_id),
    ]);

    const payments = (paymentsRes.data ?? []).slice(0, 6).map((p) => ({
      id: p.id,
      value: p.value,
      status: p.status,
      dueDate: (p as unknown as { dueDate: string }).dueDate,
      paymentDate:
        (p as unknown as { paymentDate?: string | null }).paymentDate ?? null,
      invoiceUrl: p.invoiceUrl ?? null,
    }));

    return {
      plan: (trainer.subscription_plan ?? "starter") as PlanId,
      status: trainer.subscription_status ?? "active",
      value: sub.value,
      nextDueDate: sub.nextDueDate ?? null,
      payments,
    };
  } catch (e) {
    console.warn("[billing] getSubscriptionDetails failed:", (e as Error).message);
    return null;
  }
}

/**
 * Re-busca o QR Pix do pagamento pendente (caso a UI precise renovar).
 */
export async function refreshPixQr(): Promise<
  | {
      ok: true;
      paymentId: string;
      qrImage: string;
      qrPayload: string;
      expiresAt: string;
    }
  | { ok: false; reason: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "Nao autenticado" };

  const { data: trainer } = await supabase
    .from("trainers")
    .select("asaas_payment_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!trainer?.asaas_payment_id) {
    return { ok: false, reason: "Sem cobranca pendente" };
  }

  try {
    const pix = await asaasGetPaymentPixQr(trainer.asaas_payment_id);
    return {
      ok: true,
      paymentId: trainer.asaas_payment_id,
      qrImage: pix.encodedImage,
      qrPayload: pix.payload,
      expiresAt: pix.expirationDate,
    };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

export async function cancelSubscription(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "Nao autenticado" };

  const { data: trainer } = await supabase
    .from("trainers")
    .select("asaas_subscription_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!trainer?.asaas_subscription_id) {
    return { ok: false, reason: "Sem assinatura ativa" };
  }

  try {
    await asaasCancelSubscription(trainer.asaas_subscription_id);
    await supabase
      .from("trainers")
      .update({ subscription_status: "canceled" })
      .eq("id", user.id);
    revalidatePath("/[locale]/dashboard", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}
