"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { PLANS, type PlanId } from "@/lib/plans";
import { startSubscription, checkVoucher, type VoucherCheckResult } from "./actions";

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function BillingClient({
  status,
  currentPlan,
  daysLeft,
  savedCpf,
  voucherUsed,
}: {
  status: string;
  currentPlan: PlanId;
  daysLeft: number;
  savedCpf: string | null;
  voucherUsed: string | null;
}) {
  const t = useTranslations();
  const [cpf, setCpf] = useState(savedCpf ? maskCpf(savedCpf) : "");
  const [voucher, setVoucher] = useState("");
  const [voucherSelectedPlan, setVoucherSelectedPlan] = useState<PlanId>("pro");
  const [voucherResult, setVoucherResult] = useState<VoucherCheckResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [submittingPlan, setSubmittingPlan] = useState<PlanId | null>(null);

  const cpfDigits = cpf.replace(/\D/g, "");
  const cpfReady = cpfDigits.length === 11;

  const onValidateVoucher = async (planForCheck: PlanId) => {
    const code = voucher.trim().toUpperCase();
    if (!code) {
      setVoucherResult(null);
      return;
    }
    setValidating(true);
    setVoucherSelectedPlan(planForCheck);
    const r = await checkVoucher(code, planForCheck);
    setVoucherResult(r);
    setValidating(false);
  };

  const handleSubscribe = (planId: PlanId) => {
    if (!cpfReady) {
      alert("Informe seu CPF antes de assinar.");
      return;
    }
    setSubmittingPlan(planId);
    const fd = new FormData();
    fd.append("plan_id", planId);
    fd.append("cpf", cpfDigits);
    if (voucherResult?.ok && voucher.trim()) {
      fd.append("voucher_code", voucher.trim().toUpperCase());
    }
    startTransition(async () => {
      await startSubscription(fd);
      setSubmittingPlan(null);
    });
  };

  const voucherActive =
    voucherResult?.ok &&
    voucher.trim().length > 0 &&
    voucherSelectedPlan != null;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-dim">
              {t("Billing.current_plan")}
            </div>
            <div className="mt-1 text-2xl font-bold">
              {PLANS[currentPlan].name}
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
        {status === "trialing" && (
          <p className="mt-3 text-sm text-ink-muted">
            {t("Billing.trial_days_left", { days: daysLeft })} —{" "}
            {t("Billing.trial_subtitle")}
          </p>
        )}
      </div>

      {/* CPF */}
      <div className="card">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
          Dados de pagamento
        </h3>
        <p className="mt-1 text-sm text-ink-muted">
          O CPF é exigido para emissão da cobrança (Pix ou cartão).
        </p>
        <div className="mt-3 max-w-xs">
          <label className="label">CPF do titular</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            placeholder="000.000.000-00"
            className="input"
            inputMode="numeric"
            maxLength={14}
          />
          {!cpfReady && cpf.length > 0 && (
            <p className="hint text-warning">CPF incompleto</p>
          )}
          {cpfReady && <p className="hint text-success">CPF válido ✓</p>}
        </div>
      </div>

      {/* Voucher */}
      <div className="card border-accent/40 bg-accent/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              🎟️ Cupom de desconto
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Tem um cupom? Cole abaixo e aperte <strong>Validar</strong>.
            </p>
          </div>
          {voucherUsed && (
            <span className="text-xs text-ink-dim">
              Você já usou: <code className="text-accent">{voucherUsed}</code>
            </span>
          )}
        </div>

        {!voucherUsed && (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[200px]">
              <label className="label">Código</label>
              <input
                type="text"
                value={voucher}
                onChange={(e) => {
                  setVoucher(e.target.value.toUpperCase());
                  setVoucherResult(null);
                }}
                placeholder="Insira o código"
                className="input uppercase"
              />
            </div>
            <button
              type="button"
              onClick={() => onValidateVoucher(voucherSelectedPlan)}
              disabled={!voucher.trim() || validating}
              className="btn-secondary"
            >
              {validating ? "Validando..." : "Validar"}
            </button>
          </div>
        )}

        {voucherResult?.ok && (
          <div className="mt-3 rounded-lg border border-success/40 bg-success/10 p-3 text-sm">
            <div className="font-bold text-success">✓ Cupom válido</div>
            {voucherResult.description && (
              <div className="mt-1 text-ink">{voucherResult.description}</div>
            )}
            <div className="mt-2 text-ink">
              No plano <strong>{PLANS[voucherSelectedPlan].name}</strong>:{" "}
              <span className="line-through text-ink-dim">
                {formatBrl(PLANS[voucherSelectedPlan].price)}
              </span>{" "}
              →{" "}
              <strong className="text-success">
                {formatBrl(voucherResult.finalPrice)}
              </strong>{" "}
              <span className="text-ink-dim">
                (economia de {formatBrl(voucherResult.discount)})
              </span>
            </div>
          </div>
        )}
        {voucherResult?.ok === false && (
          <div className="mt-3 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            ✗ {voucherResult.reason}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanId[]).map((planId) => {
          const p = PLANS[planId];
          const isCurrent = currentPlan === planId && status === "active";
          const isPro = planId === "pro";
          const submitting = submittingPlan === planId && isPending;
          const showVoucherPrice =
            voucherActive && voucherSelectedPlan === planId;
          return (
            <div
              key={planId}
              className={`relative card transition ${
                isPro ? "border-accent shadow-glow" : ""
              }`}
            >
              {isPro && (
                <div className="absolute -top-2 right-4 rounded-full bg-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  {t("Billing.plan_pro_recommended")}
                </div>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="mt-2">
                {showVoucherPrice ? (
                  <>
                    <span className="text-sm text-ink-dim line-through">
                      {formatBrl(p.price)}
                    </span>
                    <div className="mt-1">
                      <span className="text-3xl font-black text-success">
                        {formatBrl(voucherResult!.ok ? voucherResult!.finalPrice : p.price)}
                      </span>
                      <span className="text-sm text-ink-dim"> hoje</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-black">
                      R$ {p.price}
                    </span>
                    <span className="text-sm text-ink-dim"> / mês</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                {planId === "starter"
                  ? "Até 10 alunos. Para quem está começando."
                  : planId === "pro"
                  ? "Até 50 alunos. Para PT em crescimento."
                  : "Alunos ilimitados. Para PT consolidado."}
              </p>

              <ul className="mt-4 space-y-1.5 text-sm text-ink-muted">
                <li>✓ Workout builder ilimitado</li>
                <li>
                  ✓{" "}
                  {p.studentLimit
                    ? `Até ${p.studentLimit} alunos`
                    : "Alunos ilimitados"}
                </li>
                <li>✓ Página pública personalizada</li>
                <li>✓ Anamnese e captação automática</li>
                <li>✓ App do aluno (PWA)</li>
                <li>✓ Multi-idioma (PT/EN/ES)</li>
              </ul>

              {voucher.trim() &&
                !voucherUsed &&
                !showVoucherPrice && (
                  <button
                    type="button"
                    onClick={() => onValidateVoucher(planId)}
                    className="mt-3 text-xs text-accent hover:underline"
                  >
                    Aplicar cupom neste plano →
                  </button>
                )}

              <button
                onClick={() => handleSubscribe(planId)}
                disabled={isCurrent || !cpfReady || submitting}
                className={`mt-6 w-full ${
                  isPro ? "btn-primary" : "btn-secondary"
                } ${
                  isCurrent || !cpfReady ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {submitting
                  ? "Processando..."
                  : isCurrent
                  ? t("Billing.current_plan")
                  : !cpfReady
                  ? "Preencha o CPF acima"
                  : showVoucherPrice
                  ? `Assinar por ${formatBrl(voucherResult!.ok ? voucherResult!.finalPrice : p.price)}`
                  : status === "active"
                  ? t("Billing.btn_change_plan")
                  : t("Billing.btn_choose_plan")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    trialing: {
      label: "Em trial",
      className: "bg-accent/15 text-accent",
    },
    pending_payment: {
      label: "Aguardando pagamento",
      className: "bg-warning/15 text-warning",
    },
    active: {
      label: "Ativo",
      className: "bg-success/15 text-success",
    },
    past_due: {
      label: "Pagamento pendente",
      className: "bg-warning/15 text-warning",
    },
    trial_expired: {
      label: "Trial expirado",
      className: "bg-danger/15 text-danger",
    },
    canceled: {
      label: "Cancelado",
      className: "bg-bg-elevated text-ink-dim",
    },
  };
  const info = map[status] ?? map.trialing;
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${info.className}`}
    >
      {info.label}
    </span>
  );
}
