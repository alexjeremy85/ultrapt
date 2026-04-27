import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function WorkoutsPage({
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

  const { data: workouts } = await supabase
    .from("workouts")
    .select(
      "id, name, goal, level, is_template, workout_blocks(count), workout_assignments(count)"
    )
    .eq("trainer_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("Workouts.title")}</h1>
          <p className="text-sm text-ink-muted">{t("Workouts.subtitle")}</p>
        </div>
        <Link href="/dashboard/workouts/new" className="btn-primary">
          {t("Workouts.btn_new")}
        </Link>
      </div>

      {!workouts || workouts.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mb-3 text-4xl">💪</div>
          <h2 className="text-lg font-semibold">
            {t("Workouts.empty_title")}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {t("Workouts.empty_message")}
          </p>
          <Link href="/dashboard/workouts/new" className="btn-primary mt-6">
            {t("Workouts.btn_new")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((w) => {
            const blockCount =
              (w.workout_blocks as Array<{ count: number }>)?.[0]?.count ?? 0;
            const assignedCount =
              (w.workout_assignments as Array<{ count: number }>)?.[0]?.count ??
              0;
            return (
              <Link
                key={w.id}
                href={`/dashboard/workouts/${w.id}`}
                className="card transition hover:border-accent/40 hover:shadow-glow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{w.name}</h3>
                  {w.is_template && <span className="chip">Template</span>}
                </div>
                {w.goal && (
                  <p className="mt-1 text-sm text-ink-muted line-clamp-2">
                    {w.goal}
                  </p>
                )}
                <div className="mt-4 flex gap-4 text-xs text-ink-dim">
                  <span>{blockCount} blocos</span>
                  <span>{assignedCount} alunos</span>
                  {w.level && <span>{w.level}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
