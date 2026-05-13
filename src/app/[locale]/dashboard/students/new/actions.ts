"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStudentLimit } from "@/lib/student-limit";
import { type PlanId } from "@/lib/plans";

export async function createStudent(formData: FormData) {
  const locale = await getLocale();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.warn("[students-create] no user, redirecting to login");
    redirect({ href: "/login", locale });
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) {
    redirect({
      href: `/dashboard/students/new?error=${encodeURIComponent("Nome obrigatorio")}`,
      locale,
    });
  }

  // Limite de alunos por plano
  const [{ data: trainer }, { count: studentCount }] = await Promise.all([
    supabase
      .from("trainers")
      .select("subscription_plan, subscription_status")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("trainer_id", user!.id),
  ]);
  const planId = (trainer?.subscription_plan ?? "free") as PlanId;
  const limit = computeStudentLimit(planId, studentCount ?? 0);
  if (limit.atLimit) {
    redirect({
      href: `/dashboard/students/new?limit=1`,
      locale,
    });
  }

  const expRaw = String(formData.get("experience_level") ?? "").trim();
  const expLevel: "iniciante" | "intermediario" | "avancado" | null =
    expRaw === "iniciante" || expRaw === "intermediario" || expRaw === "avancado"
      ? expRaw
      : null;

  const birthRaw = String(formData.get("birth_date") ?? "").trim();

  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 30)
        .slice(0, 10)
    : [];

  const monthlyValueRaw = String(formData.get("monthly_value") ?? "").trim();
  const monthlyValue = monthlyValueRaw ? Number(monthlyValueRaw) : null;
  const dueDayRaw = String(formData.get("payment_due_day") ?? "").trim();
  const dueDayNum = dueDayRaw ? Number(dueDayRaw) : null;
  const dueDay =
    dueDayNum !== null && dueDayNum >= 1 && dueDayNum <= 31 ? dueDayNum : null;

  const insertPayload = {
    trainer_id: user!.id,
    full_name: fullName,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").replace(/\D/g, "") || null,
    objective: String(formData.get("objective") ?? "").trim() || null,
    experience_level: expLevel,
    birth_date: birthRaw || null,
    tags,
    monthly_value: monthlyValue,
    payment_due_day: dueDay,
    status: "active",
  };

  const { error, data } = await supabase
    .from("students")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    console.error("[students-create] insert failed", {
      trainerId: user!.id,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    redirect({
      href: `/dashboard/students/new?error=${encodeURIComponent(error.message)}`,
      locale,
    });
  }

  const studentId = data?.id;
  if (!studentId) {
    console.error("[students-create] insert returned no id", {
      trainerId: user!.id,
    });
    redirect({
      href: `/dashboard/students/new?error=${encodeURIComponent("Falha ao criar aluno: sem ID retornado")}`,
      locale,
    });
  }

  console.log("[students-create] success", {
    trainerId: user!.id,
    studentId,
  });

  revalidatePath("/[locale]/dashboard", "layout");
  redirect({ href: `/dashboard/students/${studentId}`, locale });
}
