"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { PLANS, type PlanId } from "@/lib/plans";
import { startSubscription } from "./actions";

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function BillingClient({
  status,
  currentPlan,
  daysLeft,
  savedCpf,
}: {
  status: string;
  currentPlan: PlanId;
  daysLeft: number;
  savedCpf: string | null;
}) {
  const t = useTranslations();
  const [cpf, setCpf] = useState(savedCpf ? maskCpf(savedCpf) : "");
  const [isPending, startTransition] = useTransition();
  const [submittingPlan, setSubmittingPlan] = useState<PlanId | null>(null);

  const cpfDigits = cpf.replace(/\D/g, "");
  const cpfReady = cpfDigits.length === 11;

  const handleSubscribe = (planId: PlanId) => {
    if (!cpfReady) {
      alert("Informe seu CPF antes de assinar.");
      return;
    }
    setSubmittingPlan(planId);
    const fd = new FormData();
    fd.append("plan_id", planId);
    fd.append("cpf", cpfDigits);
    startTransition(async () => {
      await startSubscription(fd);
      setSubmittingPlan(null);
    });
  };

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
          O CPF é exigido para emissão da cobrança Pix.
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
          {cpfReady && (
            <p className="hint text-success">CPF válido ✓</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanId[]).map((planId) => {
          const p = PLANS[planId];
          const isCurrent = currentPlan === planId && status === "active";
          const isPro = planId === "pro";
          const submitting = submittingPlan === planId && isPending;
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
                <span className="text-3xl font-black">R$ {p.price}</span>
                <span className="text-sm text-ink-dim"> / mês</span>
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
