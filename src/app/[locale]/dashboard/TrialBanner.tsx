import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function TrialBanner({
  status,
  trialEndsAt,
}: {
  status: string | null;
  trialEndsAt: string | null;
}) {
  const t = await getTranslations();

  if (status === "active") return null;

  let daysLeft = 0;
  if (trialEndsAt) {
    daysLeft = Math.max(
      0,
      Math.ceil(
        (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    );
  }

  const expired =
    status === "trial_expired" || status === "past_due" || daysLeft === 0;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-6 py-3 text-sm ${
        expired
          ? "bg-danger/10 text-danger"
          : "bg-accent/10 text-accent"
      }`}
    >
      <div>
        {expired ? (
          <>
            <strong>{t("Billing.trial_expired_title")}</strong>{" "}
            <span className="opacity-80">
              {t("Billing.trial_expired_message")}
            </span>
          </>
        ) : (
          <>
            <strong>
              {t("Billing.trial_days_left", { days: daysLeft })}
            </strong>{" "}
            <span className="opacity-80">{t("Billing.trial_subtitle")}</span>
          </>
        )}
      </div>
      <Link
        href="/dashboard/billing"
        className="rounded-md border border-current px-3 py-1 font-medium hover:bg-current/10"
      >
        {t("Billing.btn_subscribe_now")}
      </Link>
    </div>
  );
}
