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
      "id, full_name, email, phone, objective, experience_level, anamnesis_submitted_at"
    )
    .eq("trainer_id", user!.id)
    .eq("status", "pending")
    .order("anamnesis_submitted_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("Leads.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("Leads.subtitle")}</p>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-medium text-slate-700">
            {t("Leads.empty_title")}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {t("Leads.empty_message")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-200">
            {leads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900">
                    {lead.full_name}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
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
                  className="ml-4 rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
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
