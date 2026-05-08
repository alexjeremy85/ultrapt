import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { trainerUnreadCounts } from "@/lib/chat";
import { UsersIcon, ArrowRightIcon, ChatIcon } from "@/components/icons";

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

  const [{ data: students }, unread] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, full_name, email, phone, status, objective, experience_level, photo_url, anamnesis_submitted_at, tags, workout_assignments(workout:workouts(id, name))"
      )
      .eq("trainer_id", user!.id)
      .order("created_at", { ascending: false }),
    trainerUnreadCounts(),
  ]);

  const list = (students ?? []) as Array<{
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    status: string;
    objective: string | null;
    experience_level: string | null;
    photo_url: string | null;
    anamnesis_submitted_at: string | null;
    tags: string[] | null;
    workout_assignments: Array<{
      workout: { id: string; name: string } | { id: string; name: string }[] | null;
    }>;
  }>;

  function getWorkouts(s: (typeof list)[number]): Array<{ id: string; name: string }> {
    return (s.workout_assignments ?? [])
      .flatMap((a) =>
        Array.isArray(a.workout) ? a.workout : a.workout ? [a.workout] : []
      )
      .filter(Boolean);
  }

  return (
    <div className="space-y-5">
      {/* Header sticky em mobile pra acao primaria sempre visivel */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{t("Students.title")}</h1>
          <p className="text-sm text-ink-muted">{t("Students.subtitle")}</p>
        </div>
        <Link
          href="/dashboard/students/new"
          className="btn-primary shrink-0 whitespace-nowrap"
        >
          + {t("Students.btn_new")}
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <UsersIcon className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold">{t("Students.empty_title")}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {t("Students.empty_message")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/dashboard/students/new" className="btn-primary">
              {t("Students.btn_new")}
            </Link>
            <Link href="/dashboard/leads" className="btn-secondary">
              {t("Nav.leads")}
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {list.map((s) => {
            const workouts = getWorkouts(s);
            const hasWorkout = workouts.length > 0;
            const unreadCount = unread.byStudent[s.id] ?? 0;
            return (
              <li key={s.id}>
                <Link
                  href={`/dashboard/students/${s.id}`}
                  className="block rounded-xl border border-border bg-bg-card p-3 transition active:scale-[0.99] hover:border-accent/40 hover:bg-bg-surface"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-bg-elevated">
                      {s.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.photo_url}
                          alt={s.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-base font-bold text-accent">
                          {s.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info principal */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-base font-semibold">
                          {s.full_name}
                        </span>
                        <StatusBadge status={s.status} />
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-black">
                            <ChatIcon className="h-3 w-3" />
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-dim">
                        {s.objective && <span>{s.objective}</span>}
                        {s.experience_level && (
                          <span className="capitalize">{s.experience_level}</span>
                        )}
                      </div>

                      {(s.tags ?? []).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(s.tags ?? []).slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Estado do treino — chamada a acao se nao tem treino */}
                      <div className="mt-1.5">
                        {hasWorkout ? (
                          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                            <span className="text-accent">●</span>
                            <span className="truncate">
                              {workouts.map((w) => w.name).join(", ")}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                            Sem treino — atribuir →
                          </div>
                        )}
                      </div>
                    </div>

                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-dim" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: "Ativo", className: "bg-success/15 text-success" },
    pending: { label: "Lead", className: "bg-accent/15 text-accent" },
    paused: { label: "Pausado", className: "bg-warning/15 text-warning" },
    inactive: { label: "Inativo", className: "bg-bg-elevated text-ink-dim" },
  };
  const info = map[status] ?? {
    label: status,
    className: "bg-bg-elevated text-ink-dim",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${info.className}`}
    >
      {info.label}
    </span>
  );
}
