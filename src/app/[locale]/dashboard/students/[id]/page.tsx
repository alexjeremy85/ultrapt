import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssignWorkoutForm } from "./AssignWorkoutForm";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from("students")
    .select(
      "*, workout_assignments(id, start_date, is_active, workout:workouts(id, name, goal, level))"
    )
    .eq("id", id)
    .eq("trainer_id", user!.id)
    .maybeSingle();

  if (!student) notFound();

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, name, goal")
    .eq("trainer_id", user!.id)
    .order("created_at", { ascending: false });

  const studentLink = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/aluno/${student.access_code}`;

  const assignments = (student.workout_assignments ?? []) as Array<{
    id: string;
    start_date: string;
    is_active: boolean;
    workout: { id: string; name: string; goal: string | null; level: string | null };
  }>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/students"
        className="text-sm text-ink-muted hover:text-accent"
      >
        ← {t("Common.back")}
      </Link>

      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{student.full_name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
              {student.email && <span>{student.email}</span>}
              {student.phone && <span>WhatsApp: {student.phone}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {student.objective && (
                <span className="chip">{student.objective}</span>
              )}
              {student.experience_level && (
                <span className="chip">{student.experience_level}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
          Link do app do aluno
        </h2>
        <p className="mt-1 text-xs text-ink-muted">
          Compartilhe esse link com o aluno (WhatsApp). Ele acessa o treino sem precisar de login.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-bg-surface px-3 py-2 text-xs text-accent">
            {studentLink}
          </code>
          {student.phone && (
            <a
              href={`https://wa.me/55${student.phone}?text=${encodeURIComponent(`Oi ${student.full_name}, aqui esta o link do seu app de treino: ${studentLink}`)}`}
              target="_blank"
              rel="noopener"
              className="btn-secondary text-sm"
            >
              Enviar WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
          {t("Nav.workouts")}
        </h2>

        {assignments.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            {t("Students.no_workout")}
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-surface p-3"
              >
                <div>
                  <div className="font-medium">{a.workout.name}</div>
                  <div className="text-xs text-ink-dim">
                    {a.workout.goal ?? ""} · {a.workout.level ?? ""}
                  </div>
                </div>
                <Link
                  href={`/dashboard/workouts/${a.workout.id}`}
                  className="btn-ghost text-sm"
                >
                  {t("Common.edit")}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <AssignWorkoutForm
            studentId={student.id}
            workouts={workouts ?? []}
          />
        </div>
      </div>
    </div>
  );
}
