import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { ChatIcon } from "@/components/icons";
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

  const studentLink = `${getSiteUrl()}/aluno/${student.access_code}`;

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
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-bg-elevated">
              {student.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.photo_url}
                  alt={student.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-accent">
                  {student.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
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
          <Link
            href={`/dashboard/students/${student.id}/chat`}
            className="btn-secondary inline-flex shrink-0 items-center gap-1.5 text-sm"
          >
            <ChatIcon className="h-4 w-4" />
            Conversar
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
          Acesso do aluno
        </h2>
        <p className="mt-1 text-xs text-ink-muted">
          Compartilhe o link OU informe apenas o código de acesso (caso ele entre pela sua página pública).
        </p>
        <div className="mt-3 space-y-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-dim">
              Código de acesso
            </div>
            <code className="mt-1 inline-block rounded-lg bg-bg-surface px-3 py-2 font-mono text-base font-bold text-accent">
              {student.access_code}
            </code>
          </div>
          <div className="flex items-center gap-2">
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
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-bg-surface p-3"
              >
                <div className="min-w-0">
                  <div className="font-medium">{a.workout.name}</div>
                  <div className="text-xs text-ink-dim">
                    {a.workout.goal ?? ""} · {a.workout.level ?? ""}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/dashboard/students/${student.id}/treino/${a.id}/imprimir`}
                    target="_blank"
                    className="btn-secondary text-sm"
                  >
                    Imprimir / PDF
                  </Link>
                  <Link
                    href={`/dashboard/workouts/${a.workout.id}`}
                    className="btn-ghost text-sm"
                  >
                    {t("Common.edit")}
                  </Link>
                </div>
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
