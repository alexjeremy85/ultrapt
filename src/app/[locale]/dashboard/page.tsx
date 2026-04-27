import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: studentsCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("trainer_id", user!.id);

  const { count: activeStudents } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("trainer_id", user!.id)
    .eq("status", "active");

  const { count: pendingLeads } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("trainer_id", user!.id)
    .eq("status", "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("Dashboard.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("Dashboard.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card
          title={t("Dashboard.card_active_students")}
          value={activeStudents ?? 0}
        />
        <Card
          title={t("Dashboard.card_total_students")}
          value={studentsCount ?? 0}
        />
        <Card
          title={t("Dashboard.card_pending_leads")}
          value={pendingLeads ?? 0}
        />
        <Card
          title={t("Dashboard.card_mrr")}
          value="R$ 0,00"
          hint={t("Dashboard.card_mrr_hint")}
        />
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-slate-600">{t("Dashboard.empty_state")}</p>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
