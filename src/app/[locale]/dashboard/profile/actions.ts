"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseSpecialties(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function updateProfile(formData: FormData) {
  const locale = await getLocale();
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: "/login", locale });
  }

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!SLUG_REGEX.test(slug)) {
    redirect({
      href: `/dashboard/profile?error=${encodeURIComponent(t("Profile.error_invalid_slug"))}`,
      locale,
    });
  }

  // Verifica se slug ja eh usado por outro PT
  const { data: existing } = await supabase
    .from("trainers")
    .select("id")
    .eq("slug", slug)
    .neq("id", user!.id)
    .maybeSingle();

  if (existing) {
    redirect({
      href: `/dashboard/profile?error=${encodeURIComponent(t("Profile.error_slug_taken"))}`,
      locale,
    });
  }

  const update = {
    full_name: String(formData.get("full_name") ?? "").trim(),
    slug,
    cref: String(formData.get("cref") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    specialties: parseSpecialties(String(formData.get("specialties") ?? "")),
    services_description:
      String(formData.get("services_description") ?? "").trim() || null,
    pricing_summary: String(formData.get("pricing_summary") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    whatsapp_phone:
      String(formData.get("whatsapp_phone") ?? "").replace(/\D/g, "") || null,
    instagram_handle:
      String(formData.get("instagram_handle") ?? "")
        .trim()
        .replace(/^@/, "") || null,
    city: String(formData.get("city") ?? "").trim() || null,
    state: String(formData.get("state") ?? "").trim().toUpperCase() || null,
    onboarding_completed: true,
  };

  const { error } = await supabase
    .from("trainers")
    .update(update)
    .eq("id", user!.id);

  if (error) {
    redirect({
      href: `/dashboard/profile?error=${encodeURIComponent(error.message)}`,
      locale,
    });
  }

  revalidatePath("/[locale]/dashboard", "layout");
  redirect({
    href: `/dashboard/profile?success=${encodeURIComponent(t("Profile.saved_message"))}`,
    locale,
  });
}

export async function uploadProfilePhoto(formData: FormData) {
  const locale = await getLocale();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: "/login", locale });
  }

  const fileRaw = formData.get("photo");
  if (!(fileRaw instanceof File) || fileRaw.size === 0) {
    redirect({
      href: `/dashboard/profile?error=${encodeURIComponent("Selecione uma imagem.")}`,
      locale,
    });
    return;
  }
  const file: File = fileRaw;

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${user!.id}/avatar-${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("trainer-photos")
    .upload(path, arrayBuffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    redirect({
      href: `/dashboard/profile?error=${encodeURIComponent(uploadError.message)}`,
      locale,
    });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("trainer-photos").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("trainers")
    .update({ photo_url: publicUrl })
    .eq("id", user!.id);

  if (updateError) {
    redirect({
      href: `/dashboard/profile?error=${encodeURIComponent(updateError.message)}`,
      locale,
    });
  }

  revalidatePath("/[locale]/dashboard", "layout");
  redirect({ href: "/dashboard/profile?success=ok", locale });
}
