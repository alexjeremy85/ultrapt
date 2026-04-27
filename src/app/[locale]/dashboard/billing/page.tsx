import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "@/lib/plans";
import { startSubscription } from "./actions";

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { error, success } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trainer } = await supabase
    .from("trainers")
    .select(
      "subscription_status, subscription_plan, trial_ends_at, asaas_customer_id, asaas_subscription_id, full_name"
    )
    .eq("id", user!.id)
    .single();

  const status = trainer?.subscription_status ?? "trialing";
  const currentPlan = (trainer?.subscription_plan ?? "starter") as PlanId;
  const trialEnds = trainer?.trial_ends_at
    ? new Date(trainer.trial_ends_at)
    : null;
  const daysLeft = trialEnds
    ? Math.max(
        0,
        Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("Billing.title")}</h1>
        <p className="text-sm text-ink-muted">{t("Billing.subtitle")}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          {decodeURIComponent(success)}
        </div>
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
          </div>
          <StatusBadge status={status} t={t} />
        </div>
        {status === "trialing" && (
          <p className="mt-3 text-sm text-ink-muted">
            {t("Billing.trial_days_left", { days: daysLeft })} —{" "}
            {t("Billing.trial_subtitle")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanId[]).map((planId) => {
          const p = PLANS[planId];
          const isCurrent = currentPlan === planId && status === "active";
          const isPro = planId === "pro";
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

              <form action={startSubscription} className="mt-6">
                <input type="hidden" name="plan_id" value={planId} />
                <button
                  type="submit"
                  disabled={isCurrent}
                  className={`w-full ${
                    isPro ? "btn-primary" : "btn-secondary"
                  } ${isCurrent ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {isCurrent
                    ? t("Billing.current_plan")
                    : status === "active"
                    ? t("Billing.btn_change_plan")
                    : t("Billing.btn_choose_plan")}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: string;
  t: (key: string) => string;
}) {
  const map: Record<string, { label: string; className: string }> = {
    trialing: {
      label: t("Billing.status_trialing"),
      className: "bg-accent/15 text-accent",
    },
    active: {
      label: t("Billing.status_active"),
      className: "bg-success/15 text-success",
    },
    past_due: {
      label: t("Billing.status_past_due"),
      className: "bg-warning/15 text-warning",
    },
    trial_expired: {
      label: t("Billing.status_trial_expired"),
      className: "bg-danger/15 text-danger",
    },
    canceled: {
      label: t("Billing.status_canceled"),
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
