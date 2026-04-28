import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintWorkout } from "./PrintWorkout";

export default async function PrintWorkoutPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; assignmentId: string }>;
}) {
  const { locale, id, assignmentId } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // Trainer (cabecalho do PDF)
  const { data: trainer } = await supabase
    .from("trainers")
    .select(
      "id, full_name, photo_url, accent_color, cref, whatsapp_phone, instagram_handle, slug"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!trainer) notFound();

  // Aluno (validacao de propriedade)
  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, photo_url, objective, experience_level, birth_date, phone"
    )
    .eq("id", id)
    .eq("trainer_id", user.id)
    .maybeSingle();

  if (!student) notFound();

  // Assignment + treino completo
  const { data: assignment } = await supabase
    .from("workout_assignments")
    .select(
      `id, start_date, end_date,
       workout:workouts(
         id, name, description, goal, level, duration_weeks,
         workout_blocks(
           id, position, name, notes,
           workout_exercises(
             id, position, sets, reps, weight, rest_seconds, tempo, notes,
             custom_name, custom_youtube_id,
             exercise:exercises(id, name, youtube_id, muscle_group)
           )
         )
       )`
    )
    .eq("id", assignmentId)
    .eq("student_id", id)
    .maybeSingle();

  if (!assignment) notFound();

  // Normaliza joins (Supabase pode retornar array ou objeto)
  const workoutRaw = assignment.workout as unknown;
  const workout = Array.isArray(workoutRaw) ? workoutRaw[0] : workoutRaw;
  if (!workout) notFound();

  type RawExercise = {
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
    exercise:
      | { id: string; name: string; youtube_id: string | null; muscle_group: string | null }
      | { id: string; name: string; youtube_id: string | null; muscle_group: string | null }[]
      | null;
  };

  const blocks = (
    (workout as { workout_blocks?: Array<{
      id: string;
      position: number;
      name: string;
      notes: string | null;
      workout_exercises: RawExercise[];
    }> }).workout_blocks ?? []
  )
    .map((b) => ({
      ...b,
      workout_exercises: (b.workout_exercises ?? [])
        .map((e) => {
          const ex = Array.isArray(e.exercise) ? e.exercise[0] : e.exercise;
          return {
            ...e,
            display_name: e.custom_name ?? ex?.name ?? "Exercicio",
            youtube_id: e.custom_youtube_id ?? ex?.youtube_id ?? null,
            muscle_group: ex?.muscle_group ?? null,
          };
        })
        .sort((a, b) => a.position - b.position),
    }))
    .sort((a, b) => a.position - b.position);

  return (
    <PrintWorkout
      trainer={{
        full_name: trainer.full_name,
        photo_url: trainer.photo_url,
        accent_color: trainer.accent_color ?? "#ff6b00",
        cref: trainer.cref,
        whatsapp_phone: trainer.whatsapp_phone,
        instagram_handle: trainer.instagram_handle,
      }}
      student={{
        full_name: student.full_name,
        photo_url: student.photo_url,
        objective: student.objective,
        experience_level: student.experience_level,
      }}
      workout={{
        name: (workout as { name: string }).name,
        description: (workout as { description: string | null }).description,
        goal: (workout as { goal: string | null }).goal,
        level: (workout as { level: string | null }).level,
        duration_weeks: (workout as { duration_weeks: number | null }).duration_weeks,
      }}
      blocks={blocks}
    />
  );
}
