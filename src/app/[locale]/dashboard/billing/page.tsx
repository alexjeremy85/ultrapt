import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { type PlanId } from "@/lib/plans";
import { BillingClient } from "./BillingClient";
import { getSubscriptionDetails, countPioneiroSlots } from "./actions";

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
      "subscription_status, subscription_plan, asaas_customer_id, asaas_subscription_id, full_name, cpf, voucher_used"
    )
    .eq("id", user!.id)
    .single();

  const status = trainer?.subscription_status ?? "free";
  const currentPlan = (trainer?.subscription_plan ?? "free") as PlanId;

  const subscriptionDetails =
    status === "active" || status === "past_due"
      ? await getSubscriptionDetails()
      : null;

  const pioneiroSlots = await countPioneiroSlots();

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
        savedCpf={trainer?.cpf ?? null}
        voucherUsed={trainer?.voucher_used ?? null}
        subscriptionDetails={subscriptionDetails}
        pioneiroSlots={pioneiroSlots}
      />
    </div>
  );
}
