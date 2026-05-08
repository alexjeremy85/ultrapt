"use client";

import { useState, useTransition } from "react";
import { recordStudentPayment } from "./actions";
import { CheckIcon, MoneyIcon } from "@/components/icons";

type Props = {
  studentId: string;
  monthlyValue: number | null;
  paymentDueDay: number | null;
  lastPaymentAt: string | null;
  recentPayments: Array<{
    id: string;
    amount: number;
    paid_at: string;
    reference_month: string;
  }>;
};

function paymentStatus(dueDay: number | null, lastPaymentAt: string | null) {
  if (!dueDay) return { label: "Sem cobrança configurada", className: "text-ink-dim" };
  const now = new Date();
  const lastPayment = lastPaymentAt ? new Date(lastPaymentAt) : null;

  const dueThisMonth = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (dueThisMonth > now) {
    return {
      label: `Próximo vencimento: dia ${dueDay}`,
      className: "text-ink-muted",
    };
  }
  if (lastPayment && lastPayment >= dueThisMonth) {
    return { label: "Em dia", className: "text-success" };
  }
  const daysOverdue = Math.floor(
    (now.getTime() - dueThisMonth.getTime()) / (1000 * 60 * 60 * 24)
  );
  return {
    label: `Atrasado há ${daysOverdue} ${daysOverdue === 1 ? "dia" : "dias"}`,
    className: "text-danger",
  };
}

export function PaymentCard({
  studentId,
  monthlyValue,
  paymentDueDay,
  lastPaymentAt,
  recentPayments,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const status = paymentStatus(paymentDueDay, lastPaymentAt);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("student_id", studentId);
    startTransition(async () => {
      const res = await recordStudentPayment(fd);
      if (!res.ok) setError(res.error ?? "Erro ao registrar pagamento");
      else setShowForm(false);
    });
  }

  if (!monthlyValue && !paymentDueDay) {
    return null;
  }

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <MoneyIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
              Cobrança
            </h2>
            <p className="mt-1 text-base font-bold">
              {monthlyValue
                ? `R$ ${monthlyValue.toFixed(2).replace(".", ",")} / mês`
                : "—"}
            </p>
            <p className={`mt-0.5 text-xs font-medium ${status.className}`}>
              {status.label}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="btn-secondary text-sm"
        >
          {showForm ? "Cancelar" : "Marcar pagamento"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor recebido (R$)</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={monthlyValue ?? undefined}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Mês de referência</label>
              <input
                name="reference_month"
                type="month"
                defaultValue={defaultMonth}
                required
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Observações (opcional)</label>
            <input
              name="notes"
              type="text"
              placeholder="Pix, cartão, dinheiro..."
              className="input"
            />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="btn-primary inline-flex items-center gap-1.5"
          >
            <CheckIcon className="h-4 w-4" />
            {pending ? "Salvando..." : "Confirmar pagamento"}
          </button>
        </form>
      )}

      {recentPayments.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
            Últimos pagamentos
          </p>
          <ul className="space-y-1.5 text-sm">
            {recentPayments.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">
                  {new Date(p.reference_month).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="font-medium text-success">
                  R$ {p.amount.toFixed(2).replace(".", ",")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
