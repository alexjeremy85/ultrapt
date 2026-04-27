import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlockExecution } from "./BlockExecution";

export default async function BlockExecutionPage({
  params,
}: {
  params: Promise<{ locale: string; code: string; blockId: string }>;
}) {
  const { locale, code, blockId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = createAdminClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("access_code", code)
    .maybeSingle();

  if (!student) notFound();

  const { data: block } = await supabase
    .from("workout_blocks")
    .select(
      "id, name, notes, workout_id, workout:workouts(id, name), workout_exercises(id, position, sets, reps, weight, rest_seconds, tempo, notes, custom_name, custom_youtube_id, exercise:exercises(id, name, muscle_group, youtube_id))"
    )
    .eq("id", blockId)
    .maybeSingle();

  if (!block) notFound();

  // Verifica que esse bloco pertence a um treino atribuido a este aluno
  const { data: assignment } = await supabase
    .from("workout_assignments")
    .select("id")
    .eq("workout_id", block.workout_id)
    .eq("student_id", student.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) notFound();

  type ExType = {
    id: string;
    position: number;
    sets: number;
    reps: string;
    weight: string | null;
    rest_seconds: number | null;
    tempo: string | null;
    notes: string | null;
    custom_name: string | null;
    custom_youtube_id: string | null;
    exercise: {
      id: string;
      name: string;
      muscle_group: string;
      youtube_id: string | null;
    } | null;
  };

  const rawExercises = (block.workout_exercises ?? []) as unknown as Array<
    Omit<ExType, "exercise"> & {
      exercise: ExType["exercise"] | ExType["exercise"][] | null;
    }
  >;

  const exercises: ExType[] = rawExercises
    .map((e) => ({
      ...e,
      exercise: Array.isArray(e.exercise)
        ? e.exercise[0] ?? null
        : e.exercise ?? null,
    }))
    .sort((a, b) => a.position - b.position);

  return (
    <main className="min-h-screen bg-bg pb-32">
      <header className="sticky top-0 z-10 border-b border-border bg-bg-surface/95 backdrop-blur px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href={`/aluno/${code}`}
            className="text-ink-muted hover:text-accent"
          >
            ←
          </Link>
          <div className="flex-1">
            <div className="text-xs text-ink-dim">
              {(block.workout as unknown as { name: string }).name}
            </div>
            <div className="font-semibold">{block.name}</div>
          </div>
        </div>
      </header>

      {block.notes && (
        <div className="mx-auto max-w-2xl px-5 pt-4">
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-ink">
            {block.notes}
          </div>
        </div>
      )}

      <BlockExecution
        studentId={student.id}
        blockId={block.id}
        exercises={exercises as ExType[]}
        backCode={code}
      />
    </main>
  );
}
