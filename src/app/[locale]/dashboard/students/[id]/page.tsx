import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { ChatIcon, ArrowLeftIcon } from "@/components/icons";
import { AssignWorkoutForm } from "./AssignWorkoutForm";
import { CopyLinkButton } from "./CopyLinkButton";
import { WhatsAppWorkoutButton } from "./WhatsAppWorkoutButton";

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

  if (!user) {
    console.error("[students-detail] no user in session", { studentId: id });
    notFound();
  }

  // Query do aluno isolada — JOIN aninhado quebrava silenciosamente
  // e mascarava como 404. Quebrar em duas queries elimina o problema
  // e deixa logs explicitos pra debug.
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(
      "id, full_name, email, phone, photo_url, objective, experience_level, access_code, status, anamnesis_submitted_at"
    )
    .eq("id", id)
    .eq("trainer_id", user.id)
    .maybeSingle();

  if (studentError) {
    console.error("[students-detail] student query failed", {
      studentId: id,
      trainerId: user.id,
      code: studentError.code,
      message: studentError.message,
      details: studentError.details,
      hint: studentError.hint,
    });
    return (
      <ErrorPanel
        message="Não foi possível carregar este aluno. Tente recarregar a página em alguns segundos."
        code={studentError.code}
      />
    );
  }

  if (!student) {
    console.warn("[students-detail] student not found", {
      studentId: id,
      trainerId: user.id,
    });
    notFound();
  }

  // Assignments + workouts em queries separadas — se uma falhar,
  // o restante da pagina ainda renderiza.
  const { data: assignmentsRaw, error: assignError } = await supabase
    .from("workout_assignments")
    .select(
      "id, start_date, is_active, workout:workouts(id, name, goal, level)"
    )
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  if (assignError) {
    console.error("[students-detail] assignments query failed", {
      studentId: id,
      code: assignError.code,
      message: assignError.message,
    });
  }

  const { data: workouts, error: workoutsError } = await supabase
    .from("workouts")
    .select("id, name, goal")
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false });

  if (workoutsError) {
    console.error("[students-detail] workouts list query failed", {
      trainerId: user.id,
      code: workoutsError.code,
      message: workoutsError.message,
    });
  }

  const { data: trainer } = await supabase
    .from("trainers")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle();

  const siteUrl = getSiteUrl();
  const studentLink = `${siteUrl}/aluno/${student.access_code}`;
  const anamnesisLink = trainer?.slug
    ? `${siteUrl}/pt/${trainer.slug}/anamnese`
    : null;
  const hasAnamnesis = Boolean(student.anamnesis_submitted_at);

  const assignments = (assignmentsRaw ?? []) as unknown as Array<{
    id: string;
    start_date: string;
    is_active: boolean;
    workout: { id: string; name: string; goal: string | null; level: string | null };
  }>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-accent"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t("Common.back")}
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
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Link
              href={`/dashboard/students/${student.id}/chat`}
              className="btn-secondary inline-flex items-center gap-1.5 text-sm"
            >
              <ChatIcon className="h-4 w-4" />
              Conversar
            </Link>
            <Link
              href={`/dashboard/students/${student.id}/avaliacoes`}
              className="btn-ghost text-sm"
            >
              Avaliação física
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
              Links pra mandar pro aluno
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Dois links diferentes. Mande o que fizer sentido pelo WhatsApp.
            </p>
          </div>
          <StudentStatusBadge status={student.status} hasAnamnesis={hasAnamnesis} />
        </div>

        <div className="mt-5 space-y-5">
          {/* Link 1: App do aluno */}
          <LinkBlock
            title="Link do app de treino"
            description="Abre o app do aluno: ele vê os treinos atribuídos, executa, conversa com você."
            link={studentLink}
            phone={student.phone ?? null}
            studentName={student.full_name}
            whatsAppText={`Oi ${student.full_name}, aqui está o link do seu app de treino: ${studentLink}`}
          />

          {/* Link 2: Anamnese (só se PT tem slug e aluno ainda não preencheu) */}
          {anamnesisLink && !hasAnamnesis && (
            <LinkBlock
              title="Link da anamnese"
              description="Pra você conhecer o histórico, lesões, objetivos. O aluno preenche uma vez."
              link={anamnesisLink}
              phone={student.phone ?? null}
              studentName={student.full_name}
              whatsAppText={`Oi ${student.full_name}, antes do primeiro treino preciso que você preencha esse formulário: ${anamnesisLink}`}
              variant="anamnesis"
            />
          )}

          {hasAnamnesis && (
            <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-xs text-ink-muted">
              <strong className="text-success">✓ Anamnese preenchida.</strong>{" "}
              Você já tem o histórico dele. Não precisa mandar o link da anamnese.
            </div>
          )}

          <div className="border-t border-border pt-3 text-xs text-ink-dim">
            <strong className="text-ink-muted">Código de acesso:</strong>{" "}
            <code className="font-mono text-accent">{student.access_code}</code>
            <span className="ml-2">— se ele perder o link, o código serve pra entrar pela página pública.</span>
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
                <div className="flex shrink-0 flex-wrap gap-2">
                  <WhatsAppWorkoutButton
                    assignmentId={a.id}
                    phone={student.phone ?? null}
                    studentName={student.full_name}
                  />
                  <Link
                    href={`/dashboard/students/${student.id}/treino/${a.id}/imprimir`}
                    target="_blank"
                    className="btn-secondary text-sm"
                  >
                    PDF
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

function LinkBlock({
  title,
  description,
  link,
  phone,
  studentName,
  whatsAppText,
  variant,
}: {
  title: string;
  description: string;
  link: string;
  phone: string | null;
  studentName: string;
  whatsAppText: string;
  variant?: "anamnesis";
}) {
  void studentName;
  const accentClass =
    variant === "anamnesis"
      ? "border-warning/30 bg-warning/5"
      : "border-accent/30 bg-accent/5";

  return (
    <div className={`rounded-xl border p-4 ${accentClass}`}>
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-1 text-xs text-ink-muted">{description}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="flex-1 truncate rounded-lg bg-bg-surface px-3 py-2 text-xs text-accent">
          {link}
        </code>
        <div className="flex shrink-0 gap-2">
          <CopyLinkButton link={link} />
          {phone && (
            <a
              href={`https://wa.me/55${phone}?text=${encodeURIComponent(whatsAppText)}`}
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
  );
}

function StudentStatusBadge({
  status,
  hasAnamnesis,
}: {
  status: string | null | undefined;
  hasAnamnesis: boolean;
}) {
  let label = "Ativo";
  let className = "bg-success/15 text-success";
  if (status === "pending") {
    label = hasAnamnesis ? "Lead novo" : "Aguardando anamnese";
    className = "bg-accent/15 text-accent";
  } else if (status === "paused") {
    label = "Pausado";
    className = "bg-warning/15 text-warning";
  } else if (status === "inactive" || status === "canceled") {
    label = "Inativo";
    className = "bg-bg-elevated text-ink-dim";
  }
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function ErrorPanel({
  message,
  code,
}: {
  message: string;
  code?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card border-danger/40 bg-danger/5">
        <h1 className="text-lg font-bold text-danger">Erro ao carregar</h1>
        <p className="mt-2 text-sm text-ink">{message}</p>
        {code && (
          <p className="mt-3 text-xs text-ink-dim">
            Código técnico: <code>{code}</code>
          </p>
        )}
        <Link
          href="/dashboard/students"
          className="btn-secondary mt-4 inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar para alunos
        </Link>
      </div>
    </div>
  );
}
