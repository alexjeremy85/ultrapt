"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitAnamnesis(formData: FormData) {
  const locale = await getLocale();
  const trainerId = String(formData.get("trainer_id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!trainerId || !slug) {
    redirect({ href: "/", locale });
  }

  // Coleta tudo no formulario como dados de anamnese
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (["trainer_id", "slug"].includes(key)) return;
    if (data[key] !== undefined) {
      const existing = data[key];
      data[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    } else {
      data[key] = value;
    }
  });

  const fullName = String(data.full_name ?? "").trim();
  const email = String(data.email ?? "").trim() || null;
  const phone = String(data.phone ?? "").replace(/\D/g, "") || null;
  const objective = String(data.objective ?? "").trim() || null;
  const experience = String(data.experience ?? "").trim() || null;
  const birthDate = String(data.birth_date ?? "").trim() || null;

  if (!fullName) {
    redirect({
      href: `/pt/${slug}/anamnese?error=name`,
      locale,
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("students").insert({
    trainer_id: trainerId,
    full_name: fullName,
    email,
    phone,
    birth_date: birthDate,
    objective,
    experience_level:
      experience === "iniciante" ||
      experience === "intermediario" ||
      experience === "avancado"
        ? experience
        : null,
    status: "pending",
    anamnesis_data: data,
    anamnesis_submitted_at: new Date().toISOString(),
  });

  if (error) {
    redirect({
      href: `/pt/${slug}/anamnese?error=${encodeURIComponent(error.message)}`,
      locale,
    });
  }

  redirect({
    href: `/pt/${slug}/anamnese?success=1`,
    locale,
  });
}
