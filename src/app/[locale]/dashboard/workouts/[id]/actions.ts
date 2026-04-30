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

const ALLOWED_LEVELS = ["iniciante", "intermediario", "avancado"] as const;
type AllowedLevel = (typeof ALLOWED_LEVELS)[number];

function normalizeLevel(input: string): AllowedLevel | null {
  const v = input.trim().toLowerCase();
  return (ALLOWED_LEVELS as readonly string[]).includes(v)
    ? (v as AllowedLevel)
    : null;
}

/**
 * Cria um exercicio customizado do PT (is_global=false) e retorna a row.
 * Pra usar no modal "Adicionar exercicio" -> "Criar novo".
 */
export async function createCustomExercise(input: {
  name: string;
  muscle_group: string;
  equipment?: string;
  level?: string;
  notes?: string;
}): Promise<
  | { ok: true; exercise: { id: string; name: string; muscle_group: string; equipment: string | null; level: string | null; modality: string; youtube_id: string | null } }
  | { ok: false; error: string }
> {
  const { supabase, user } = await authedClient();

  const name = input.name.trim();
  const muscleGroup = input.muscle_group.trim();
  if (!name) return { ok: false, error: "Nome obrigatorio" };
  if (!muscleGroup) return { ok: false, error: "Grupo muscular obrigatorio" };
  if (name.length > 100) return { ok: false, error: "Nome muito longo" };

  const equipment = (input.equipment ?? "").trim() || null;
  const level = input.level ? normalizeLevel(input.level) : null;
  const notes = (input.notes ?? "").trim() || null;

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      trainer_id: user.id,
      name,
      muscle_group: muscleGroup,
      equipment,
      level,
      modality: "musculacao",
      is_global: false,
      technique_tips: notes,
    })
    .select(
      "id, name, muscle_group, equipment, level, modality, youtube_id"
    )
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/[locale]/dashboard/workouts", "layout");
  return { ok: true, exercise: data };
}
