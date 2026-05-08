"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"];

// Whitelist de campos que o cliente anonimo pode enviar
const ALLOWED_FORM_FIELDS = new Set([
  "full_name", "email", "phone", "birth_date", "gender",
  "weight", "height", "objective", "objective_detail",
  "experience", "training_practiced", "training_detail",
  "where_train", "days_available", "time_per_session",
  "exercises_likes", "exercises_dislikes",
  "health_conditions", "health_detail", "medications",
  "injuries", "recent_surgery", "nutritionist",
  "medical_clearance", "stress_level",
  "birth_control", "menopause", "cycle_variation", "pcos",
  "diet", "meals_per_day", "alcohol", "smoking",
  "water_liters", "sleep_hours", "sleep_quality",
  "extra_info", "commitment", "consent",
]);

export async function submitAnamnesis(formData: FormData) {
  const locale = await getLocale();
  const trainerId = String(formData.get("trainer_id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!trainerId || !slug) {
    redirect({ href: "/", locale });
  }

  // Coleta APENAS campos da whitelist (impede o cliente injetar
  // user_id, access_code, status, tags, etc).
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (!ALLOWED_FORM_FIELDS.has(key)) return;
    if (typeof value !== "string") return;
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
    redirect({ href: `/pt/${slug}/anamnese?error=name`, locale });
  }

  // Upload da foto (opcional)
  let photoUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) {
      redirect({ href: `/pt/${slug}/anamnese?error=photo_size`, locale });
    }
    if (!ALLOWED_PHOTO_MIME.includes(photo.type)) {
      redirect({ href: `/pt/${slug}/anamnese?error=photo_type`, locale });
    }
    const ext = photo.type === "image/png"
      ? "png"
      : photo.type === "image/webp"
      ? "webp"
      : "jpg";
    const objectPath = `${trainerId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const admin = createAdminClient();
    const { error: upErr } = await admin.storage
      .from("student-photos")
      .upload(objectPath, photo, {
        contentType: photo.type,
        upsert: false,
      });
    if (!upErr) {
      const { data: pub } = admin.storage
        .from("student-photos")
        .getPublicUrl(objectPath);
      photoUrl = pub.publicUrl ?? null;
    }
  }

  // Valida que o trainer existe (impede inserir lixo em conta inexistente)
  const admin2 = createAdminClient();
  const { data: trainerExists, error: trainerErr } = await admin2
    .from("trainers")
    .select("id")
    .eq("id", trainerId)
    .maybeSingle();
  if (trainerErr) {
    console.error("[anamnesis] trainer lookup failed", {
      trainerId,
      slug,
      code: trainerErr.code,
      message: trainerErr.message,
    });
  }
  if (!trainerExists) {
    console.warn("[anamnesis] trainer not found, redirecting", {
      trainerId,
      slug,
    });
    redirect({ href: `/`, locale });
  }

  const acquisitionSource =
    String(formData.get("utm_source") ?? "").trim() || null;
  const acquisitionCampaign =
    String(formData.get("utm_campaign") ?? "").trim() || null;
  const acquisitionReferrer =
    String(formData.get("referrer") ?? "").trim() || null;

  // Insert via admin client com whitelist explicita de colunas.
  // (RLS anon insert revogada via migration 0014)
  const { error, data: insertedRow } = await admin2
    .from("students")
    .insert({
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
      photo_url: photoUrl,
      anamnesis_data: data,
      anamnesis_submitted_at: new Date().toISOString(),
      acquisition_source: acquisitionSource,
      acquisition_campaign: acquisitionCampaign,
      acquisition_referrer: acquisitionReferrer,
      // user_id e access_code ficam null/default - o cliente NUNCA controla
    })
    .select("id")
    .single();

  if (error) {
    console.error("[anamnesis] insert failed", {
      trainerId,
      slug,
      fullName,
      code: error.code,
      message: error.message,
      details: error.details,
    });
    redirect({
      href: `/pt/${slug}/anamnese?error=${encodeURIComponent(error.message)}`,
      locale,
    });
  }

  console.log("[anamnesis] success", {
    trainerId,
    slug,
    studentId: insertedRow?.id,
  });
  redirect({ href: `/pt/${slug}/anamnese?success=1`, locale });
}
