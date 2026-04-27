import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { type PlanId } from "@/lib/plans";
import { BillingClient } from "./BillingClient";

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
      "subscription_status, subscription_plan, trial_ends_at, asaas_customer_id, asaas_subscription_id, full_name, cpf"
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
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          {decodeURIComponent(success)}
        </div>
      )}

      <BillingClient
        status={status}
        currentPlan={currentPlan}
        daysLeft={daysLeft}
        savedCpf={trainer?.cpf ?? null}
      />
    </div>
  );
}
