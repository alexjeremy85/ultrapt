"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createWorkout(formData: FormData) {
  const locale = await getLocale();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect({
      href: `/dashboard/workouts/new?error=${encodeURIComponent("Nome obrigatorio")}`,
      locale,
    });
  }

  const lvlRaw = String(formData.get("level") ?? "").trim();
  const level: "iniciante" | "intermediario" | "avancado" | null =
    lvlRaw === "iniciante" || lvlRaw === "intermediario" || lvlRaw === "avancado"
      ? lvlRaw
      : null;

  const { data, error } = await supabase
    .from("workouts")
    .insert({
      trainer_id: user!.id,
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      goal: String(formData.get("goal") ?? "").trim() || null,
      level,
      duration_weeks: Number(formData.get("duration_weeks")) || 4,
      is_template: formData.get("is_template") === "1",
    })
    .select("id")
    .single();

  if (error) {
    redirect({
      href: `/dashboard/workouts/new?error=${encodeURIComponent(error.message)}`,
      locale,
    });
  }

  revalidatePath("/[locale]/dashboard", "layout");
  redirect({ href: `/dashboard/workouts/${data!.id}`, locale });
}
