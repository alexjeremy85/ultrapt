"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStudentLimit } from "@/lib/student-limit";
import { type PlanId } from "@/lib/plans";

export async function quickStart(formData: FormData) {
  const locale = await getLocale();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });

  const studentName = String(formData.get("student_name") ?? "").trim();
  const studentPhone = String(formData.get("student_phone") ?? "").replace(/\D/g, "") || null;
  const workoutName = String(formData.get("workout_name") ?? "Treino A").trim() || "Treino A";

  if (!studentName) {
    redirect({
      href: `/dashboard/onboarding?error=${encodeURIComponent("Informe o nome do aluno")}`,
      locale,
    });
  }

  // Limite de alunos por plano
  const [{ data: tr }, { count: studentCount }] = await Promise.all([
    supabase
      .from("trainers")
      .select("subscription_plan")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("trainer_id", user!.id),
  ]);
  const planId = (tr?.subscription_plan ?? "free") as PlanId;
  const limit = computeStudentLimit(planId, studentCount ?? 0);
  if (limit.atLimit) {
    redirect({
      href: `/dashboard/onboarding?limit=1`,
      locale,
    });
  }

  const { data: student, error: errStudent } = await supabase
    .from("students")
    .insert({
      trainer_id: user!.id,
      full_name: studentName,
      phone: studentPhone,
      status: "active",
    })
    .select("id")
    .single();

  if (errStudent || !student) {
    redirect({
      href: `/dashboard/onboarding?error=${encodeURIComponent(errStudent?.message ?? "Erro ao criar aluno")}`,
      locale,
    });
  }
  const studentId = student!.id;

  const { data: workout, error: errWorkout } = await supabase
    .from("workouts")
    .insert({
      trainer_id: user!.id,
      name: workoutName,
    })
    .select("id")
    .single();

  if (errWorkout || !workout) {
    redirect({
      href: `/dashboard/students/${studentId}?error=${encodeURIComponent("Aluno criado, mas falhou ao criar treino")}`,
      locale,
    });
  }

  const workoutId = workout!.id;

  // Bloco inicial vazio pro PT comecar a adicionar exercicios direto
  await supabase.from("workout_blocks").insert({
    workout_id: workoutId,
    name: "Treino A",
    position: 1,
  });

  await supabase.from("workout_assignments").insert({
    workout_id: workoutId,
    student_id: studentId,
    start_date: new Date().toISOString().slice(0, 10),
    is_active: true,
  });

  revalidatePath("/[locale]/dashboard", "layout");
  redirect({
    href: `/dashboard/workouts/${workoutId}?onboarding=1&student=${studentId}`,
    locale,
  });
}
