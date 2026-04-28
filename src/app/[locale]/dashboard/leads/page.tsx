import { setRequestLocale, getTranslations, getFormatter } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const format = await getFormatter();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads } = await supabase
    .from("students")
    .select(
      "id, full_name, email, phone, objective, experience_level, photo_url, anamnesis_submitted_at"
    )
    .eq("trainer_id", user!.id)
    .eq("status", "pending")
    .order("anamnesis_submitted_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Leads.title")}</h1>
        <p className="text-sm text-ink-muted">{t("Leads.subtitle")}</p>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mb-3 text-4xl">👋</div>
          <h2 className="text-lg font-semibold">{t("Leads.empty_title")}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {t("Leads.empty_message")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
          <ul className="divide-y divide-border">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between gap-3 p-4 hover:bg-bg-surface"
              >
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-bg-elevated">
                  {lead.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={lead.photo_url}
                      alt={lead.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-accent">
                      {lead.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{lead.full_name}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-dim">
                    {lead.objective && (
                      <span>
                        {t("Leads.objective_label")}: {lead.objective}
                      </span>
                    )}
                    {lead.experience_level && (
                      <span>
                        {t("Leads.experience_label")}: {lead.experience_level}
                      </span>
                    )}
                    {lead.phone && (
                      <span>
                        {t("Leads.phone_label")}: {lead.phone}
                      </span>
                    )}
                    {lead.anamnesis_submitted_at && (
                      <span>
                        {t("Leads.submitted_at", {
                          date: format.dateTime(
                            new Date(lead.anamnesis_submitted_at),
                            { dateStyle: "short", timeStyle: "short" }
                          ),
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/dashboard/leads/${lead.id}`}
                  className="btn-secondary text-sm"
                >
                  {t("Leads.btn_view")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
