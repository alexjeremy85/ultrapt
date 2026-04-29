import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeftIcon } from "@/components/icons";
import { WorkoutBuilder } from "./WorkoutBuilder";

export default async function WorkoutEditPage({
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
            </div>
          </div>
        </div>
      </div>

      <WorkoutBuilder
        workoutId={workout.id}
        initialBlocks={blocks}
        exerciseLibrary={exercises ?? []}
      />
    </div>
  );
}
