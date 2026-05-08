import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeftIcon } from "@/components/icons";
import { WorkoutBuilder } from "./WorkoutBuilder";
import { BulkAssignButton } from "./BulkAssignButton";

export default async function WorkoutEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ onboarding?: string; student?: string }>;
}) {
  const { locale, id } = await params;
  const { onboarding, student: studentId } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workout } = await supabase
    .from("workouts")
    .select(
      "*, workout_blocks(id, position, name, notes, workout_exercises(id, position, sets, reps, weight, rest_seconds, tempo, notes, custom_name, custom_youtube_id, exercise:exercises(id, name, muscle_group, youtube_id)))"
    )
    .eq("id", id)
    .eq("trainer_id", user!.id)
    .maybeSingle();

  if (!workout) notFound();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, equipment, level, modality, youtube_id")
    .order("muscle_group", { ascending: true })
    .order("name", { ascending: true })
    .limit(500);

  const blocks = (workout.workout_blocks ?? []).sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position
  );

  const { data: studentsRaw } = await supabase
    .from("students")
    .select("id, full_name, workout_assignments(workout_id)")
    .eq("trainer_id", user!.id)
    .order("full_name", { ascending: true });
  const studentList = (studentsRaw ?? []).map(
    (s: {
      id: string;
      full_name: string;
      workout_assignments: Array<{ workout_id: string }>;
    }) => ({
      id: s.id,
      full_name: s.full_name,
      hasThisWorkout: (s.workout_assignments ?? []).some(
        (wa) => wa.workout_id === workout.id
      ),
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/workouts"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-accent"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("Common.back")}
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{workout.name}</h1>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-dim">
              {workout.goal && <span>{workout.goal}</span>}
              {workout.level && <span>· {workout.level}</span>}
              {workout.duration_weeks && (
                <span>· {workout.duration_weeks} semanas</span>
              )}
              {workout.weekly_frequency && (
                <span>· {workout.weekly_frequency}x/sem</span>
              )}
              {workout.week_index && workout.week_index > 1 && (
                <span>· semana {workout.week_index}</span>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <BulkAssignButton workoutId={workout.id} students={studentList} />
          </div>
        </div>
      </div>

      {onboarding === "1" && (
        <div className="rounded-xl border-2 border-accent bg-accent/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Passo 2 de 3
          </p>
          <h2 className="mt-1 text-base font-bold">Adicione exercícios ao bloco</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Escolha 4-6 exercícios pra começar. Quando terminar, clique em &quot;Voltar&quot; e
            no aluno você gera o PDF e manda pelo WhatsApp.
          </p>
          {studentId && (
            <Link
              href={`/dashboard/students/${studentId}`}
              className="mt-3 inline-flex text-xs font-semibold text-accent hover:text-accent-hover"
            >
              Ir pro aluno (depois de adicionar exercícios) →
            </Link>
          )}
        </div>
      )}

      <WorkoutBuilder
        workoutId={workout.id}
        initialBlocks={blocks}
        exerciseLibrary={exercises ?? []}
      />
    </div>
  );
}
