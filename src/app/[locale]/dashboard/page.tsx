import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

  const { data: trainer } = await supabase
    .from("trainers")
    .select("full_name, slug")
    .eq("id", user!.id)
    .single();

  if (!trainer) {
    return null;
  }

  const [{ count: studentsCount }, { count: activeStudents }, { count: pendingLeads }, { count: workoutCount }] =
    await Promise.all([
      supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("trainer_id", user!.id),
      supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("trainer_id", user!.id)
        .eq("status", "active"),
      supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("trainer_id", user!.id)
        .eq("status", "pending"),
      supabase
        .from("workouts")
        .select("*", { count: "exact", head: true })
        .eq("trainer_id", user!.id),
    ]);

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/pt/${trainer.slug}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("Dashboard.title")}</h1>
        <p className="mt-1 text-ink-muted">{t("Dashboard.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card icon="🔥" title={t("Dashboard.card_active_students")} value={activeStudents ?? 0} />
        <Card icon="👥" title={t("Dashboard.card_total_students")} value={studentsCount ?? 0} />
        <Card icon="👋" title={t("Dashboard.card_pending_leads")} value={pendingLeads ?? 0} highlight={(pendingLeads ?? 0) > 0} />
        <Card icon="💪" title={t("Dashboard.card_workouts")} value={workoutCount ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
            {t("Dashboard.share_link_title")}
          </h2>
          <p className="mt-2 text-ink-muted">{t("Dashboard.share_link_subtitle")}</p>
          <div className="mt-4 flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-bg-surface px-3 py-2.5 text-sm text-accent">
              {publicUrl}
            </code>
            <Link
              href={`/pt/${trainer.slug}`}
              target="_blank"
              className="btn-secondary"
            >
              {t("Dashboard.open")}
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
            {t("Dashboard.quick_actions")}
          </h2>
          <div className="mt-4 space-y-2">
            <Link href="/dashboard/students/new" className="btn-primary w-full">
              + {t("Dashboard.action_new_student")}
            </Link>
            <Link href="/dashboard/workouts/new" className="btn-secondary w-full">
              + {t("Dashboard.action_new_workout")}
            </Link>
            <Link href="/dashboard/profile" className="btn-ghost w-full">
              {t("Dashboard.action_edit_profile")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  value,
  highlight,
}: {
  icon: string;
  title: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card transition ${
        highlight ? "border-accent/40 shadow-glow-sm" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-dim">
            {title}
          </div>
          <div className="mt-1 text-3xl font-bold">{value}</div>
        </div>
        <div className="text-2xl opacity-70">{icon}</div>
      </div>
    </div>
  );
}
