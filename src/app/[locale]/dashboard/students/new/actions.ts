"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createStudent(formData: FormData) {
  const locale = await getLocale();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: "/login", locale });
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) {
    redirect({
      href: `/dashboard/students/new?error=${encodeURIComponent("Nome obrigatorio")}`,
      locale,
    });
  }

  const expRaw = String(formData.get("experience_level") ?? "").trim();
  const expLevel: "iniciante" | "intermediario" | "avancado" | null =
    expRaw === "iniciante" || expRaw === "intermediario" || expRaw === "avancado"
      ? expRaw
      : null;

  const birthRaw = String(formData.get("birth_date") ?? "").trim();

  const { error, data } = await supabase
    .from("students")
    .insert({
      trainer_id: user!.id,
      full_name: fullName,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").replace(/\D/g, "") || null,
      objective: String(formData.get("objective") ?? "").trim() || null,
      experience_level: expLevel,
      birth_date: birthRaw || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    redirect({
      href: `/dashboard/students/new?error=${encodeURIComponent(error.message)}`,
      locale,
    });
  }

  revalidatePath("/[locale]/dashboard", "layout");
  redirect({ href: `/dashboard/students/${data!.id}`, locale });
}
