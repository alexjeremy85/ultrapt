import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ChatIcon, ClockIcon } from "@/components/icons";

export default async function StudentHomePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = createAdminClient();

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, photo_url, trainer:trainers(full_name, photo_url, slug, whatsapp_phone)"
    )
    .eq("access_code", code)
    .maybeSingle();

  if (!student) notFound();

  const { data: assignments } = await supabase
    .from("workout_assignments")
    .select(
      "id, start_date, is_active, workout:workouts(id, name, goal, level, duration_weeks, workout_blocks(id, position, name, notes, workout_exercises(count)))"
    )
    .eq("student_id", student.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const trainer = student.trainer as unknown as {
    full_name: string;
    photo_url: string | null;
    slug: string;
    whatsapp_phone: string | null;
  };

  return (
    <main className="min-h-screen bg-bg pb-20">
      <header className="border-b border-border bg-bg-surface px-5 py-4">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-ink-dim">
            Meu Personal
          </p>
          <div className="mt-1 flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-bg-elevated">
              {trainer.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trainer.photo_url}
                  alt={trainer.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-accent">
                  {trainer.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{trainer.full_name}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                <Link
                  href={`/aluno/${code}/chat`}
                  className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                >
                  <ChatIcon className="h-3.5 w-3.5" />
                  Conversar
                </Link>
                {trainer.whatsapp_phone && (
                  <a
                    href={`https://wa.me/55${trainer.whatsapp_phone}`}
                    target="_blank"
                    rel="noopener"
                    className="text-ink-muted hover:text-accent"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-6">
        <div className="flex items-center gap-3">
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
          <h1 className="text-2xl font-bold">
            {t("StudentApp.welcome", { name: student.full_name.split(" ")[0] })}
          </h1>
        </div>

        {!assignments || assignments.length === 0 ? (
          <div className="card mt-6 text-center py-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <ClockIcon className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold">
              {t("StudentApp.no_workout_title")}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {t("StudentApp.no_workout_message")}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {assignments.map((a) => {
              const w = a.workout as unknown as {
                id: string;
                name: string;
                goal: string | null;
                level: string | null;
                duration_weeks: number | null;
                workout_blocks: Array<{
                  id: string;
                  position: number;
                  name: string;
                  notes: string | null;
                  workout_exercises: Array<{ count: number }>;
                }>;
              };
              const blocks = (w.workout_blocks ?? []).sort(
                (x, y) => x.position - y.position
              );
              return (
                <div key={a.id} className="space-y-3">
                  <div className="card">
                    <div className="text-xs uppercase tracking-wider text-ink-dim">
                      {t("StudentApp.active_workout")}
                    </div>
                    <h2 className="mt-1 text-xl font-bold">{w.name}</h2>
                    {w.goal && (
                      <p className="mt-1 text-sm text-ink-muted">{w.goal}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {w.level && <span className="chip">{w.level}</span>}
                      {w.duration_weeks && (
                        <span className="chip">{w.duration_weeks} sem</span>
                      )}
                      <span className="chip">{blocks.length} blocos</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
                      {t("StudentApp.blocks_title")}
                    </h3>
                    {blocks.map((b) => {
                      const exCount =
                        (b.workout_exercises ?? [])[0]?.count ?? 0;
                      return (
                        <Link
                          key={b.id}
                          href={`/aluno/${code}/treino/${b.id}`}
                          className="card flex items-center justify-between transition hover:border-accent/40"
                        >
                          <div>
                            <div className="font-semibold">{b.name}</div>
                            <div className="text-xs text-ink-dim">
                              {exCount} exercícios
                            </div>
                          </div>
                          <span className="text-accent">→</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
