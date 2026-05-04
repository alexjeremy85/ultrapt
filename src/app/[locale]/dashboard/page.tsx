import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  PlusIcon,
  ArrowRightIcon,
  DumbbellIcon,
  UserIcon,
  ChatIcon,
} from "@/components/icons";
import { trainerUnreadCounts } from "@/lib/chat";
import { CaptacaoCard } from "./CaptacaoCard";

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

  // Pega listas pra acoes pendentes (alunos sem treino + leads + chat)
  const [
    { data: studentsRaw },
    { count: studentsCount },
    { count: activeStudents },
    { count: workoutCount },
    unread,
  ] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, full_name, photo_url, status, anamnesis_submitted_at, workout_assignments(workout_id)"
      )
      .eq("trainer_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20),
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
      .from("workouts")
      .select("*", { count: "exact", head: true })
      .eq("trainer_id", user!.id),
    trainerUnreadCounts(),
  ]);

  type StudentRow = {
    id: string;
    full_name: string;
    photo_url: string | null;
    status: string;
    anamnesis_submitted_at: string | null;
    workout_assignments: Array<{ workout_id: string | null }>;
  };
  const all = (studentsRaw ?? []) as StudentRow[];
  const studentsWithoutWorkout = all.filter(
    (s) => !(s.workout_assignments ?? []).some((a) => a.workout_id)
  );
  const pendingLeads = all.filter((s) => s.status === "pending");

  // Alunos com mensagens nao lidas — ordena pela contagem desc e
  // garante que a lista preserva info de nome/foto do aluno
  const studentsWithUnread = all
    .map((s) => ({ student: s, unread: unread.byStudent[s.id] ?? 0 }))
    .filter((x) => x.unread > 0)
    .sort((a, b) => b.unread - a.unread);

  const publicUrl = `${getSiteUrl()}/pt/${trainer.slug}`;
  const firstName = (trainer.full_name ?? "").split(" ")[0] || "PT";

  return (
    <div className="space-y-5">
      {/* Header simplificado */}
      <div>
        <h1 className="text-2xl font-bold">Olá, {firstName} 👋</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {(activeStudents ?? 0)} ativo
          {(activeStudents ?? 0) === 1 ? "" : "s"} ·{" "}
          {(studentsCount ?? 0) - (activeStudents ?? 0)} pendente
          {(studentsCount ?? 0) - (activeStudents ?? 0) === 1 ? "" : "s"} ·{" "}
          {workoutCount ?? 0} treino
          {(workoutCount ?? 0) === 1 ? "" : "s"} criado
          {(workoutCount ?? 0) === 1 ? "" : "s"}
        </p>
      </div>

      {(studentsCount ?? 0) === 0 && (
        <Link
          href="/dashboard/onboarding"
          className="block rounded-xl border-2 border-accent bg-accent/10 p-4 transition active:scale-[0.99] hover:bg-accent/15"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Comece aqui
              </p>
              <h2 className="mt-1 text-base font-bold">
                Do zero ao primeiro PDF em 5 minutos
              </h2>
              <p className="mt-1 text-xs text-ink-muted">
                Cadastre o primeiro aluno + treino. Te levo direto pro construtor.
              </p>
            </div>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-accent" />
          </div>
        </Link>
      )}

      {/* Acoes rapidas top */}
      <div className="flex gap-2">
        <Link
          href="/dashboard/students/new"
          className="btn-primary inline-flex flex-1 items-center justify-center gap-1.5"
        >
          <PlusIcon className="h-4 w-4" />
          Novo aluno
        </Link>
        <Link
          href="/dashboard/workouts/new"
          className="btn-secondary inline-flex flex-1 items-center justify-center gap-1.5"
        >
          <PlusIcon className="h-4 w-4" />
          Novo treino
        </Link>
      </div>

      {/* Mensagens nao lidas — prioridade max */}
      {studentsWithUnread.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-dim">
            <ChatIcon className="h-3.5 w-3.5" />
            Mensagens novas
          </h2>
          <ul className="space-y-2">
            {studentsWithUnread.slice(0, 5).map(({ student: s, unread: count }) => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/students/${s.id}/chat`}
                  className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 p-3 transition active:scale-[0.99] hover:border-accent/60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-elevated">
                    {s.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.photo_url}
                        alt={s.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-accent">
                        {s.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {s.full_name}
                    </div>
                    <div className="text-xs text-accent">
                      {count === 1 ? "1 mensagem nova" : `${count} mensagens novas`}{" "}
                      →
                    </div>
                  </div>
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-black">
                    {count > 99 ? "99+" : count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Acoes pendentes — destaque pra alunos sem treino */}
      {studentsWithoutWorkout.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
            Alunos sem treino atribuído
          </h2>
          <ul className="space-y-2">
            {studentsWithoutWorkout.slice(0, 3).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/students/${s.id}`}
                  className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3 transition active:scale-[0.99] hover:border-warning/60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-elevated">
                    {s.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.photo_url}
                        alt={s.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-warning">
                        {s.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {s.full_name}
                    </div>
                    <div className="text-xs text-warning">
                      Atribuir treino →
                    </div>
                  </div>
                  <DumbbellIcon className="h-4 w-4 text-warning" />
                </Link>
              </li>
            ))}
            {studentsWithoutWorkout.length > 3 && (
              <Link
                href="/dashboard/students"
                className="block rounded-lg p-2 text-center text-xs font-medium text-warning hover:underline"
              >
                Ver todos os {studentsWithoutWorkout.length} alunos sem treino →
              </Link>
            )}
          </ul>
        </section>
      )}

      {/* Leads pendentes */}
      {pendingLeads.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
            Leads novos pra aprovar
          </h2>
          <ul className="space-y-2">
            {pendingLeads.slice(0, 3).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/leads/${s.id}`}
                  className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3 transition active:scale-[0.99] hover:border-accent/60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-elevated">
                    <UserIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {s.full_name}
                    </div>
                    <div className="text-xs text-accent">
                      {s.anamnesis_submitted_at
                        ? "Anamnese preenchida"
                        : "Aguardando anamnese"}{" "}
                      →
                    </div>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-accent" />
                </Link>
              </li>
            ))}
            {pendingLeads.length > 3 && (
              <Link
                href="/dashboard/leads"
                className="block rounded-lg p-2 text-center text-xs font-medium text-accent hover:underline"
              >
                Ver todos os {pendingLeads.length} leads →
              </Link>
            )}
          </ul>
        </section>
      )}

      {/* Pagina publica */}
      <CaptacaoCard publicUrl={publicUrl} trainerSlug={trainer.slug} />

      {/* Atalho perfil */}
      <Link
        href="/dashboard/profile"
        className="block rounded-xl border border-border bg-bg-card p-3 text-center text-sm text-ink-muted transition hover:border-accent/40 hover:text-ink"
      >
        Editar perfil →
      </Link>
    </div>
  );
}
