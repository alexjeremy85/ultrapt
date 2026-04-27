"use server";

import { createAdminClient } from "@/lib/supabase/admin";

async function ensureStudentOwnsBlock(studentId: string, blockId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("workout_blocks")
    .select("id, workout:workouts(workout_assignments(student_id))")
    .eq("id", blockId)
    .maybeSingle();
  type Joined = {
    id: string;
    workout: { workout_assignments: Array<{ student_id: string }> };
  };
  const j = data as unknown as Joined | null;
  if (!j) return false;
  return j.workout.workout_assignments.some(
    (a) => a.student_id === studentId
  );
}

export async function logSet(input: {
  studentId: string;
  workoutExerciseId: string;
  setNumber: number;
  reps?: number;
  weight?: number;
}) {
  const supabase = createAdminClient();
  // Verifica que o exercicio pertence a um treino atribuido a esse aluno
  const { data: we } = await supabase
    .from("workout_exercises")
    .select("id, block:workout_blocks(workout:workouts(workout_assignments(student_id)))")
    .eq("id", input.workoutExerciseId)
    .maybeSingle();

  type Joined = {
    id: string;
    block: {
      workout: { workout_assignments: Array<{ student_id: string }> };
    };
  };
  const j = we as unknown as Joined | null;
  if (
    !j ||
    !j.block.workout.workout_assignments.some(
      (a) => a.student_id === input.studentId
    )
  ) {
    return { ok: false };
  }

  const { error } = await supabase.from("exercise_logs").insert({
    workout_exercise_id: input.workoutExerciseId,
    student_id: input.studentId,
    set_number: input.setNumber,
    reps_done: input.reps ?? null,
    weight_used: input.weight ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function finishBlockExecution(input: {
  studentId: string;
  blockId: string;
  perceivedEffort?: number;
  durationSeconds?: number;
}) {
  const ok = await ensureStudentOwnsBlock(input.studentId, input.blockId);
  if (!ok) return { ok: false };
  const supabase = createAdminClient();
  const { error } = await supabase.from("workout_executions").insert({
    block_id: input.blockId,
    student_id: input.studentId,
    perceived_effort: input.perceivedEffort ?? null,
    duration_seconds: input.durationSeconds ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
