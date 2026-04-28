"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resolve studentId a partir do access_code.
 * NUNCA confiar em studentId vindo do cliente.
 */
async function resolveStudent(accessCode: string) {
  if (!accessCode || typeof accessCode !== "string") return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("students")
    .select("id, trainer_id")
    .eq("access_code", accessCode)
    .maybeSingle();
  return data as { id: string; trainer_id: string } | null;
}

/**
 * Verifica que o exercicio pertence a um treino atribuido a esse aluno.
 * Faz o join com .eq() pra nao expor IDs de outros alunos no resultado.
 */
async function exerciseBelongsToStudent(
  workoutExerciseId: string,
  studentId: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("workout_exercises")
    .select(
      "id, block:workout_blocks!inner(workout:workouts!inner(workout_assignments!inner(student_id)))"
    )
    .eq("id", workoutExerciseId)
    .eq(
      "block.workout.workout_assignments.student_id",
      studentId
    )
    .maybeSingle();
  if (error || !data) return false;
  return true;
}

async function blockBelongsToStudent(
  blockId: string,
  studentId: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("workout_blocks")
    .select(
      "id, workout:workouts!inner(workout_assignments!inner(student_id))"
    )
    .eq("id", blockId)
    .eq("workout.workout_assignments.student_id", studentId)
    .maybeSingle();
  if (error || !data) return false;
  return true;
}

export async function logSet(input: {
  accessCode: string;
  workoutExerciseId: string;
  setNumber: number;
  reps?: number;
  weight?: number;
}) {
  const student = await resolveStudent(input.accessCode);
  if (!student) return { ok: false };

  const owns = await exerciseBelongsToStudent(
    input.workoutExerciseId,
    student.id
  );
  if (!owns) return { ok: false };

  const supabase = createAdminClient();
  const { error } = await supabase.from("exercise_logs").insert({
    workout_exercise_id: input.workoutExerciseId,
    student_id: student.id,
    set_number: input.setNumber,
    reps_done: input.reps ?? null,
    weight_used: input.weight ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function finishBlockExecution(input: {
  accessCode: string;
  blockId: string;
  perceivedEffort?: number;
  durationSeconds?: number;
}) {
  const student = await resolveStudent(input.accessCode);
  if (!student) return { ok: false };

  const owns = await blockBelongsToStudent(input.blockId, student.id);
  if (!owns) return { ok: false };

  const supabase = createAdminClient();
  const { error } = await supabase.from("workout_executions").insert({
    block_id: input.blockId,
    student_id: student.id,
    perceived_effort: input.perceivedEffort ?? null,
    duration_seconds: input.durationSeconds ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
