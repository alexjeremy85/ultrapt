"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  PLANS,
  PAID_PLAN_ORDER,
  priceFor,
  type PlanId,
  type Cycle,
} from "@/lib/plans";
import {
  ClockIcon,
  TicketIcon,
  CheckIcon,
  CloseIcon,
  ArrowRightIcon,
} from "@/components/icons";
import {
  startSubscription,
  checkVoucher,
  getPaymentStatus,
  refreshPixQr,
  cancelSubscription,
  type VoucherCheckResult,
  type StartSubscriptionResult,
  type SubscriptionDetails,
} from "./actions";

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBr(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type PaidPlanId = Exclude<PlanId, "free">;

type PixData = {
  paymentId: string;
  qrImage: string;
  qrPayload: string;
  expiresAt: string;
  value: number;
  planId: PlanId;
};

export function BillingClient({
  status,
  currentPlan,
  savedCpf,
  voucherUsed,
  subscriptionDetails,
  pioneiroSlots,
}: {
  status: string;
  currentPlan: PlanId;
  savedCpf: string | null;
  voucherUsed: string | null;
  subscriptionDetails: SubscriptionDetails | null;
  pioneiroSlots: Record<PaidPlanId, number>;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [cpf, setCpf] = useState(savedCpf ? maskCpf(savedCpf) : "");
  const [voucher, setVoucher] = useState("");
  const [voucherSelectedPlan, setVoucherSelectedPlan] = useState<PaidPlanId>("pro");
  const [voucherResult, setVoucherResult] = useState<VoucherCheckResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [isPending, startTransition] = useTransition();
  const [submittingPlan, setSubmittingPlan] = useState<PlanId | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cpfDigits = cpf.replace(/\D/g, "");
  const cpfReady = cpfDigits.length === 11;

  useEffect(() => {
    if (status !== "pending_payment" || pixData) return;
    let cancelled = false;
    (async () => {
      const r = await refreshPixQr();
      if (!cancelled && r.ok) {
        setPixData({
          paymentId: r.paymentId,
          qrImage: r.qrImage,
          qrPayload: r.qrPayload,
          expiresAt: r.expiresAt,
          value: subscriptionDetails?.value ?? 0,
          planId: currentPlan,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, pixData, currentPlan, subscriptionDetails?.value]);

  const onValidateVoucher = async (planForCheck: PaidPlanId) => {
    const code = voucher.trim().toUpperCase();
    if (!code) {
      setVoucherResult(null);
      return;
    }
    setValidating(true);
    setVoucherSelectedPlan(planForCheck);
    const slots = pioneiroSlots[planForCheck] ?? 0;
    const willBePioneiro = slots > 0;
    const r = await checkVoucher(code, planForCheck, cycle, willBePioneiro);
    setVoucherResult(r);
    setValidating(false);
  };

  const handleSubscribe = (planId: PaidPlanId) => {
    if (!cpfReady) {
      setErrorMsg("Informe seu CPF antes de assinar.");
      return;
    }
    setErrorMsg(null);
    setSubmittingPlan(planId);
    const wantsPioneiro = (pioneiroSlots[planId] ?? 0) > 0;
    startTransition(async () => {
      const result: StartSubscriptionResult = await startSubscription({
        planId,
        cycle,
        isPioneiro: wantsPioneiro,
        cpf: cpfDigits,
        voucherCode:
          voucherResult?.ok && voucher.trim()
            ? voucher.trim().toUpperCase()
            : undefined,
      });
      setSubmittingPlan(null);
      if (result.ok) {
        setPixData({
          paymentId: result.paymentId,
          qrImage: result.qrImage,
          qrPayload: result.qrPayload,
          expiresAt: result.expiresAt,
          value: result.value,
          planId: result.planId,
        });
      } else {
        setErrorMsg(result.reason);
      }
    });
  };

  const voucherActive =
    voucherResult?.ok &&
    voucher.trim().length > 0 &&
    voucherSelectedPlan != null;

  if (status === "active" && subscriptionDetails) {
    return (
      <ActiveSubscriptionPanel
        details={subscriptionDetails}
        currentPlan={currentPlan}
        onChange={() => router.refresh()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {pixData && (
        <PixPaymentModal
          data={pixData}
          onClose={() => {
            setPixData(null);
            router.refresh();
          }}
          onPaid={() => {
            setPixData(null);
            router.refresh();
          }}
        />
      )}

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-dim">
              {t("Billing.current_plan")}
            </div>
            <div className="mt-1 text-2xl font-bold">
              {PLANS[currentPlan].name}
            </div>
            {currentPlan === "free" && (
              <p className="mt-1 text-sm text-ink-muted">
                Até 2 alunos. Pra cadastrar mais ou desbloquear features extras,
                escolhe um plano abaixo.
              </p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>
        {status === "pending_payment" && !pixData && (
          <div className="mt-4 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
            <div className="flex items-center gap-2 font-bold text-warning">
              <ClockIcon className="h-4 w-4" />
              Sua assinatura está aguardando pagamento
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Carregando QR Code do Pix…
            </p>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {errorMsg}
        </div>
      )}

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
            <p className="hint flex items-center gap-1 text-success">
              <CheckIcon className="h-3 w-3" /> CPF válido
            </p>
          )}
        </div>
      </div>

      {/* Cycle toggle */}
      <div className="card">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
          Forma de pagamento
        </h3>
        <div className="mt-3 inline-flex rounded-lg border border-border bg-bg-surface p-1">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              cycle === "monthly"
                ? "bg-accent text-black"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setCycle("annual")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              cycle === "annual"
                ? "bg-accent text-black"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Anual <span className="ml-1 text-[10px] opacity-80">−40%</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          {cycle === "annual"
            ? "Pagamento único de 12 meses, sem renovação automática."
            : "Cobrança recorrente mensal via Pix. Cancela quando quiser."}
        </p>
      </div>

      {/* Voucher */}
      <div className="card border-accent/40 bg-accent/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
              <TicketIcon className="h-4 w-4" />
              Cupom de desconto
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
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="characters"
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
            <div className="flex items-center gap-2 font-bold text-success">
              <CheckIcon className="h-4 w-4" />
              Cupom válido
            </div>
            {voucherResult.description && (
              <div className="mt-1 text-ink">{voucherResult.description}</div>
            )}
            <div className="mt-2 text-ink">
              No plano <strong>{PLANS[voucherSelectedPlan].name}</strong>{" "}
              ({cycle === "annual" ? "anual" : "mensal"}):{" "}
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
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            <CloseIcon className="h-4 w-4 shrink-0" />
            {voucherResult.reason}
          </div>
        )}
      </div>

      {/* Planos pagos */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PAID_PLAN_ORDER.map((planId) => {
          const p = PLANS[planId];
          if (!p.prices) return null;
          const isCurrent = currentPlan === planId && status === "active";
          const isPro = planId === "pro";
          const submitting = submittingPlan === planId && isPending;
          const slots = pioneiroSlots[planId] ?? 0;
          const willBePioneiro = slots > 0;
          const cheio = cycle === "monthly" ? p.prices.monthly : p.prices.annual;
          const pio = priceFor(planId, cycle, willBePioneiro);
          const off = Math.round(((cheio - pio) / cheio) * 100);
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
                  Mais escolhido
                </div>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>

              {willBePioneiro && (
                <>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-[10px] font-black uppercase tracking-wide text-black">
                    Oferta de lançamento · {off}% off
                  </div>
                  <p className="mt-1 text-[10px] text-ink-muted">
                    Primeiros 10 do plano travam esse preço.
                  </p>
                </>
              )}

              <div className="mt-3">
                {showVoucherPrice ? (
                  <>
                    <span className="text-sm text-ink-dim line-through">
                      {formatBrl(pio)}
                    </span>
                    <div className="mt-1">
                      <span className="text-3xl font-black text-success">
                        {formatBrl(
                          voucherResult!.ok ? voucherResult!.finalPrice : pio
                        )}
                      </span>
                      <span className="text-sm text-ink-dim"> hoje</span>
                    </div>
                  </>
                ) : (
                  <>
                    {willBePioneiro && (
                      <div className="text-sm text-ink-dim line-through">
                        {formatBrl(cheio)}
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">{formatBrl(pio)}</span>
                      <span className="text-sm text-ink-dim">
                        {cycle === "annual" ? " / ano" : " / mês"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {willBePioneiro ? (
                <div className="mt-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                    </span>
                    <span className="text-sm font-bold text-accent">
                      {slots} de 10 vagas restantes
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bg-elevated">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${((10 - slots) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-xs text-ink-muted">
                  Oferta de lançamento esgotada neste plano. Preço cheio.
                </p>
              )}

              <p className="mt-3 text-sm text-ink-muted">{p.desc}</p>

              <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                <PlanFeature>
                  {p.studentLimit
                    ? `Até ${p.studentLimit} alunos`
                    : "Alunos ilimitados"}
                </PlanFeature>
                <PlanFeature>Página pública personalizada</PlanFeature>
                <PlanFeature>Avaliação física Pollock 7 dobras</PlanFeature>
                <PlanFeature>Anamnese, treinos, chat</PlanFeature>
                <PlanFeature>WhatsApp Send + PDF profissional</PlanFeature>
                {willBePioneiro && (
                  <PlanFeature>
                    Preço travado enquanto for assinante
                  </PlanFeature>
                )}
              </ul>

              {voucher.trim() && !voucherUsed && !showVoucherPrice && (
                <button
                  type="button"
                  onClick={() => onValidateVoucher(planId)}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  Aplicar cupom neste plano
                  <ArrowRightIcon className="h-3 w-3" />
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
                  ? "Gerando Pix..."
                  : isCurrent
                  ? "Plano atual"
                  : !cpfReady
                  ? "Preencha o CPF acima"
                  : showVoucherPrice
                  ? `Pagar ${formatBrl(
                      voucherResult!.ok ? voucherResult!.finalPrice : pio
                    )} com Pix`
                  : `Pagar ${formatBrl(pio)} com Pix`}
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
    free: { label: "Free", className: "bg-bg-elevated text-ink-dim" },
    pending_payment: {
      label: "Aguardando pagamento",
      className: "bg-warning/15 text-warning",
    },
    active: { label: "Ativo", className: "bg-success/15 text-success" },
    past_due: {
      label: "Pagamento pendente",
      className: "bg-warning/15 text-warning",
    },
    canceled: { label: "Cancelado", className: "bg-bg-elevated text-ink-dim" },
  };
  const info = map[status] ?? map.free;
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${info.className}`}
    >
      {info.label}
    </span>
  );
}

function PixPaymentModal({
  data,
  onClose,
  onPaid,
}: {
  data: PixData;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [pollMsg] = useState("Aguardando pagamento...");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const exp = new Date(data.expiresAt).getTime();
    const tick = () => {
      const ms = exp - Date.now();
      setSecondsLeft(Math.max(0, Math.floor(ms / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.expiresAt]);

  useEffect(() => {
    if (paid) return;
    let cancelled = false;
    const poll = async () => {
      const r = await getPaymentStatus();
      if (cancelled) return;
      if (r.ok && r.paid) {
        setPaid(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => onPaid(), 2000);
      }
    };
    poll();
    intervalRef.current = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paid, onPaid]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const minutes = secondsLeft != null ? Math.floor(secondsLeft / 60) : null;
  const seconds = secondsLeft != null ? secondsLeft % 60 : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="card relative w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-ink-dim hover:text-ink"
          aria-label="Fechar"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {paid ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
              <CheckIcon className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-success">
              Pagamento confirmado!
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Sua assinatura está ativa. Atualizando…
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold">Pague com Pix</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {PLANS[data.planId].name} —{" "}
              <strong className="text-ink">{formatBrl(data.value)}</strong>
            </p>

            <div className="mt-4 flex justify-center rounded-xl bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${data.qrImage}`}
                alt="QR Code Pix"
                className="h-56 w-56"
              />
            </div>

            <div className="mt-4">
              <label className="label">Pix Copia e Cola</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={data.qrPayload}
                  className="input flex-1 font-mono text-xs"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn-primary inline-flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4" /> Copiado
                    </>
                  ) : (
                    "Copiar"
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-bg-elevated bg-bg-elevated/50 p-3 text-xs text-ink-muted">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-warning" />
                {pollMsg}
              </div>
              {minutes != null && seconds != null && secondsLeft! > 0 && (
                <div className="mt-1">
                  Expira em{" "}
                  <strong>
                    {String(minutes).padStart(2, "0")}:
                    {String(seconds).padStart(2, "0")}
                  </strong>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-xs text-ink-muted">
              <div>1. Abra o app do seu banco</div>
              <div>2. Escolha pagar com Pix → Copia e Cola (ou QR Code)</div>
              <div>3. Confirme o pagamento — a tela atualiza sozinha</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ActiveSubscriptionPanel({
  details,
  currentPlan,
  onChange,
}: {
  details: SubscriptionDetails;
  currentPlan: PlanId;
  onChange: () => void;
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setCanceling(true);
    setError(null);
    const r = await cancelSubscription();
    setCanceling(false);
    if (r.ok) {
      onChange();
    } else {
      setError(r.reason);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card border-success/40 bg-success/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/20 text-success">
                <CheckIcon className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-success">
                Assinatura ativa
              </h2>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              Você tem acesso completo ao Ultra PT.
            </p>
          </div>
          <StatusBadge status="active" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label="Plano atual" value={PLANS[currentPlan].name} />
          <Stat label="Valor" value={formatBrl(details.value)} />
          <Stat
            label="Próxima cobrança"
            value={formatDateBr(details.nextDueDate)}
          />
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
          Histórico de pagamentos
        </h3>

        {details.payments.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            Nenhum pagamento registrado ainda.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-elevated text-left text-xs uppercase text-ink-dim">
                  <th className="pb-2 pr-4">Vencimento</th>
                  <th className="pb-2 pr-4">Pago em</th>
                  <th className="pb-2 pr-4">Valor</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {details.payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-bg-elevated/50 last:border-0"
                  >
                    <td className="py-2 pr-4">{formatDateBr(p.dueDate)}</td>
                    <td className="py-2 pr-4 text-ink-muted">
                      {formatDateBr(p.paymentDate)}
                    </td>
                    <td className="py-2 pr-4 font-medium">
                      {formatBrl(p.value)}
                    </td>
                    <td className="py-2 pr-4">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="py-2 text-right">
                      {p.invoiceUrl && (
                        <a
                          href={p.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          Ver
                          <ArrowRightIcon className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card border-danger/30">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
          Cancelar assinatura
        </h3>
        <p className="mt-1 text-sm text-ink-muted">
          Você manterá acesso até o fim do ciclo atual. Não há reembolso
          proporcional.
        </p>

        {error && <p className="mt-2 text-sm text-danger">{error}</p>}

        {!confirmCancel ? (
          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            className="btn-secondary mt-3 border-danger/40 text-danger"
          >
            Cancelar assinatura
          </button>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={canceling}
              className="btn-primary bg-danger hover:bg-danger/90"
            >
              {canceling ? "Cancelando…" : "Confirmar cancelamento"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmCancel(false)}
              disabled={canceling}
              className="btn-secondary"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-dim">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      <span>{children}</span>
    </li>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    RECEIVED: { label: "Pago", className: "bg-success/15 text-success" },
    CONFIRMED: { label: "Pago", className: "bg-success/15 text-success" },
    RECEIVED_IN_CASH: {
      label: "Pago",
      className: "bg-success/15 text-success",
    },
    PENDING: {
      label: "Pendente",
      className: "bg-warning/15 text-warning",
    },
    OVERDUE: {
      label: "Vencido",
      className: "bg-danger/15 text-danger",
    },
    REFUNDED: {
      label: "Reembolsado",
      className: "bg-bg-elevated text-ink-dim",
    },
  };
  const info = map[status] ?? {
    label: status,
    className: "bg-bg-elevated text-ink-dim",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${info.className}`}
    >
      {info.label}
    </span>
  );
}
