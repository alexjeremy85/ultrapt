"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"];

export async function submitAnamnesis(formData: FormData) {
  const locale = await getLocale();
  const trainerId = String(formData.get("trainer_id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!trainerId || !slug) {
    redirect({ href: "/", locale });
  }

  // Coleta tudo no formulario (exceto trainer_id, slug e photo) como anamnesis_data
  const data: Record<string, unknown> = {};
  const skipKeys = new Set(["trainer_id", "slug", "photo"]);
  formData.forEach((value, key) => {
    if (skipKeys.has(key)) return;
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
    photo_url: photoUrl,
    anamnesis_data: data,
    anamnesis_submitted_at: new Date().toISOString(),
  });

  if (error) {
    redirect({
      href: `/pt/${slug}/anamnese?error=${encodeURIComponent(error.message)}`,
      locale,
    });
  }

  redirect({ href: `/pt/${slug}/anamnese?success=1`, locale });
}
