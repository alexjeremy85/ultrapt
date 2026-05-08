"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  PLANS,
  PIONEIRO_VAGAS_POR_PLANO,
  priceFor,
  type PlanId,
  type Cycle,
} from "@/lib/plans";
import {
  asaasCreateCustomer,
  asaasFindCustomerByCpf,
  asaasCreateSubscription,
  asaasCancelSubscription,
  asaasListSubscriptionPayments,
  asaasGetPaymentPixQr,
  asaasGetPayment,
  asaasGetSubscription,
  asaasCreatePayment,
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
  planId: PlanId,
  cycle: Cycle = "monthly",
  isPioneiro = false
): Promise<VoucherCheckResult> {
  if (!PLANS[planId]) return { ok: false, reason: "Plano invalido" };
  const base = priceFor(planId, cycle, isPioneiro);
  if (base <= 0) return { ok: false, reason: "Plano sem preco" };
  const result = await validateVoucher(code, base);
  if (!result.ok) return { ok: false, reason: result.reason };
  return {
    ok: true,
    finalPrice: result.finalPrice,
    discount: result.discount,
    description: result.voucher.description,
  };
}

/**
 * Conta quantas vagas Pioneiro restam por plano. So conta assinaturas
 * efetivamente pagas (status='active'). Pending_payment, canceled, past_due
 * nao consomem vaga.
 */
export async function countPioneiroSlots(): Promise<
  Record<Exclude<PlanId, "free">, number>
> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("trainers")
    .select("subscription_plan")
    .eq("is_pioneiro", true)
    .eq("subscription_status", "active");
  const used: Record<string, number> = { solo: 0, pro: 0, escala: 0 };
  (data ?? []).forEach((row: { subscription_plan: string | null }) => {
    if (row.subscription_plan && used[row.subscription_plan] !== undefined) {
      used[row.subscription_plan]++;
    }
  });
  return {
    solo: Math.max(0, PIONEIRO_VAGAS_POR_PLANO - used.solo),
    pro: Math.max(0, PIONEIRO_VAGAS_POR_PLANO - used.pro),
    escala: Math.max(0, PIONEIRO_VAGAS_POR_PLANO - used.escala),
  };
}

export type PartnerVoucherResult =
  | { ok: true; message: string }
  | { ok: false; reason: string };

/**
 * Cupom de parceiro foi descontinuado no modelo Free Tier. O Free agora e
 * para sempre com ate 2 alunos — nao ha trial pra estender. Retorna mensagem
 * direcionando o usuario pra usar cupom de desconto ao assinar.
 */
export async function applyPartnerVoucher(
  _code: string
): Promise<PartnerVoucherResult> {
  void _code;
  return {
    ok: false,
    reason:
      "Cupom de parceiro indisponivel. O plano Free agora e pra sempre — use o cupom de desconto ao assinar um plano pago.",
  };
}

/**
 * Cria a cobranca via Asaas e retorna o QR Pix pra UI embutida.
 * - Mensal: cria subscription com cycle MONTHLY (cobranca recorrente)
 * - Anual: cria payment unico (sem renovacao automatica)
 * Pioneiro: bloqueia se nao houver vagas pro plano.
 */
export async function startSubscription(input: {
  planId: PlanId;
  cycle?: Cycle;
  isPioneiro?: boolean;
  cpf: string;
  voucherCode?: string;
}): Promise<StartSubscriptionResult> {
  const planId = input.planId;
  const cycle: Cycle = input.cycle ?? "monthly";
  const wantsPioneiro = !!input.isPioneiro;
  const cpfInput = String(input.cpf ?? "").replace(/\D/g, "");
  const voucherCode = String(input.voucherCode ?? "").trim();

  if (!PLANS[planId] || planId === "free") {
    return { ok: false, reason: "Plano invalido" };
  }

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

  // Trava de vagas Pioneiro
  let isPioneiro = wantsPioneiro;
  if (isPioneiro) {
    const slots = await countPioneiroSlots();
    const remaining =
      slots[planId as Exclude<PlanId, "free">] ?? 0;
    if (remaining <= 0) {
      isPioneiro = false; // sem vagas — cai pra preco cheio em vez de bloquear
    }
  }

  const basePrice = priceFor(planId, cycle, isPioneiro);
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

    let paymentId: string | null = null;
    let subscriptionId: string | null = null;

    const planLabel = PLANS[planId].name;
    const cycleLabel = cycle === "annual" ? "Anual" : "Mensal";
    const pioLabel = isPioneiro ? " · Pioneiro" : "";
    const description = voucherCodeUsed
      ? `Ultra PT - ${planLabel} ${cycleLabel}${pioLabel} (cupom ${voucherCodeUsed})`
      : `Ultra PT - ${planLabel} ${cycleLabel}${pioLabel}`;

    if (cycle === "annual") {
      // Pagamento unico
      const payment = await asaasCreatePayment({
        customer: customerId!,
        billingType: "PIX",
        value: finalPrice,
        dueDate: todayDate(),
        description,
        externalReference: user.id,
      });
      paymentId = payment.id;
    } else {
      // Mensal recorrente
      const sub = await asaasCreateSubscription({
        customer: customerId!,
        billingType: "PIX",
        value: finalPrice,
        nextDueDate: todayDate(),
        cycle: "MONTHLY",
        description,
        externalReference: user.id,
      });
      subscriptionId = sub.id;

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
        asaas_subscription_id: subscriptionId,
        asaas_payment_id: paymentId,
        subscription_plan: planId,
        subscription_status: "pending_payment",
        subscription_cycle: cycle,
        subscription_value: finalPrice,
        is_pioneiro: isPioneiro,
        subscription_started_at: new Date().toISOString(),
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
