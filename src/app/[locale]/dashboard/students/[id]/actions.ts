"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function assignWorkoutToStudent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const studentId = String(formData.get("student_id") ?? "");
  const workoutId = String(formData.get("workout_id") ?? "");
  const startDate = String(formData.get("start_date") ?? "");

  if (!studentId || !workoutId) {
    return { ok: false, error: "Selecione um treino" };
  }

  // Garante que ambos pertencem ao trainer
  const [{ data: student }, { data: workout }] = await Promise.all([
    supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .eq("trainer_id", user.id)
      .maybeSingle(),
    supabase
      .from("workouts")
      .select("id")
      .eq("id", workoutId)
      .eq("trainer_id", user.id)
      .maybeSingle(),
  ]);

  if (!student || !workout) {
    return { ok: false, error: "Recurso nao encontrado" };
  }

  const { error } = await supabase.from("workout_assignments").insert({
    workout_id: workoutId,
    student_id: studentId,
    start_date: startDate || new Date().toISOString().slice(0, 10),
    is_active: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Esse aluno ja tem esse treino atribuido." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/[locale]/dashboard", "layout");
  return { ok: true };
}
