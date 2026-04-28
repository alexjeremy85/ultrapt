import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StudentsPage({
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

  const { data: students } = await supabase
    .from("students")
    .select(
      "id, full_name, email, phone, status, objective, experience_level, photo_url, workout_assignments(workout:workouts(id, name))"
    )
    .eq("trainer_id", user!.id)
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("Students.title")}</h1>
          <p className="text-sm text-ink-muted">{t("Students.subtitle")}</p>
        </div>
        <Link href="/dashboard/students/new" className="btn-primary">
          {t("Students.btn_new")}
        </Link>
      </div>

      {!students || students.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mb-3 text-4xl">👥</div>
          <h2 className="text-lg font-semibold">
            {t("Students.empty_title")}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {t("Students.empty_message")}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/dashboard/students/new" className="btn-primary">
              {t("Students.btn_new")}
            </Link>
            <Link href="/dashboard/leads" className="btn-secondary">
              {t("Nav.leads")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface text-left text-xs uppercase tracking-wider text-ink-dim">
              <tr>
                <th className="px-4 py-3">{t("Students.th_name")}</th>
                <th className="px-4 py-3">{t("Students.th_status")}</th>
                <th className="px-4 py-3">{t("Students.th_objective")}</th>
                <th className="px-4 py-3">{t("Students.th_level")}</th>
                <th className="px-4 py-3">{t("Students.th_workout")}</th>
                <th className="px-4 py-3 text-right">{t("Students.th_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s) => {
                const rawAssignments = (s.workout_assignments ?? []) as Array<{
                  workout: { id: string; name: string } | { id: string; name: string }[] | null;
                }>;
                const assignedWorkouts = rawAssignments
                  .flatMap((a) =>
                    Array.isArray(a.workout)
                      ? a.workout
                      : a.workout
                      ? [a.workout]
                      : []
                  )
                  .filter(Boolean);
                return (
                  <tr key={s.id} className="hover:bg-bg-surface">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-bg-elevated">
                          {s.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={s.photo_url}
                              alt={s.full_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-accent">
                              {s.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span>{s.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {s.objective ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {s.experience_level ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {assignedWorkouts.length > 0
                        ? assignedWorkouts.map((w) => w.name).join(", ")
                        : t("Students.no_workout")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/students/${s.id}`}
                        className="text-accent hover:underline"
                      >
                        {t("Students.btn_view")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-success/15 text-success",
    paused: "bg-warning/15 text-warning",
    inactive: "bg-bg-elevated text-ink-dim",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-bg-elevated"
      }`}
    >
      {status}
    </span>
  );
}
