"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");
  return { supabase, user };
}

export async function addBlock(workoutId: string, name: string) {
  const { supabase, user } = await authedClient();

  // confirm ownership
  const { data: workout } = await supabase
    .from("workouts")
    .select("id")
    .eq("id", workoutId)
    .eq("trainer_id", user.id)
    .maybeSingle();
  if (!workout) return { ok: false, error: "Treino nao encontrado" };

  const { count } = await supabase
    .from("workout_blocks")
    .select("*", { count: "exact", head: true })
    .eq("workout_id", workoutId);

  const { data, error } = await supabase
    .from("workout_blocks")
    .insert({
      workout_id: workoutId,
      name: name || `Treino ${String.fromCharCode(65 + (count ?? 0))}`,
      position: (count ?? 0) + 1,
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/[locale]/dashboard/workouts", "layout");
  return { ok: true, block: data };
}

export async function updateBlock(
  blockId: string,
  fields: { name?: string; notes?: string }
) {
  const { supabase } = await authedClient();
  const { error } = await supabase
    .from("workout_blocks")
    .update(fields)
    .eq("id", blockId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteBlock(blockId: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase
    .from("workout_blocks")
    .delete()
    .eq("id", blockId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/[locale]/dashboard/workouts", "layout");
  return { ok: true };
}

export async function addExerciseToBlock(
  blockId: string,
  exerciseId: string | null,
  customName?: string
) {
  const { supabase } = await authedClient();

  const { count } = await supabase
    .from("workout_exercises")
    .select("*", { count: "exact", head: true })
    .eq("block_id", blockId);

  const { data, error } = await supabase
    .from("workout_exercises")
    .insert({
      block_id: blockId,
      exercise_id: exerciseId,
      custom_name: customName ?? null,
      position: (count ?? 0) + 1,
      sets: 3,
      reps: "10-12",
      rest_seconds: 60,
    })
    .select(
      "id, position, sets, reps, weight, rest_seconds, tempo, notes, custom_name, custom_youtube_id, exercise:exercises(id, name, muscle_group, youtube_id)"
    )
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/[locale]/dashboard/workouts", "layout");
  return { ok: true, exercise: data };
}

export async function updateWorkoutExercise(
  id: string,
  fields: Partial<{
    sets: number;
    reps: string;
    weight: string;
    rest_seconds: number;
    tempo: string;
    notes: string;
  }>
) {
  const { supabase } = await authedClient();
  const { error } = await supabase
    .from("workout_exercises")
    .update(fields)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteWorkoutExercise(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/[locale]/dashboard/workouts", "layout");
  return { ok: true };
}
