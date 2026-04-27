"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
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

  let resultPath = `/dashboard/profile?error=${encodeURIComponent("Erro inesperado")}`;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      resultPath = "/login";
      throw new Error("done");
    }

    const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
    if (!SLUG_REGEX.test(slug)) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent(t("Profile.error_invalid_slug"))}`;
      throw new Error("done");
    }

    const { data: existing } = await supabase
      .from("trainers")
      .select("id")
      .eq("slug", slug)
      .neq("id", user.id)
      .maybeSingle();
    if (existing) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent(t("Profile.error_slug_taken"))}`;
      throw new Error("done");
    }

    const update = {
      full_name: String(formData.get("full_name") ?? "").trim(),
      slug,
      cref: String(formData.get("cref") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      specialties: parseSpecialties(String(formData.get("specialties") ?? "")),
      services_description:
        String(formData.get("services_description") ?? "").trim() || null,
      pricing_summary:
        String(formData.get("pricing_summary") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      whatsapp_phone:
        String(formData.get("whatsapp_phone") ?? "").replace(/\D/g, "") || null,
      instagram_handle:
        String(formData.get("instagram_handle") ?? "")
          .trim()
          .replace(/^@/, "") || null,
      city: String(formData.get("city") ?? "").trim() || null,
      state:
        String(formData.get("state") ?? "").trim().toUpperCase() || null,
      onboarding_completed: true,
    };

    const { error } = await supabase
      .from("trainers")
      .update(update)
      .eq("id", user.id);
    if (error) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent(error.message)}`;
      throw new Error("done");
    }

    revalidatePath("/[locale]/dashboard", "layout");
    resultPath = `/dashboard/profile?success=${encodeURIComponent(t("Profile.saved_message"))}`;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof Error && err.message !== "done") {
      resultPath = `/dashboard/profile?error=${encodeURIComponent(err.message)}`;
    }
  }

  redirect({ href: resultPath, locale });
}

export async function uploadProfilePhoto(formData: FormData) {
  const locale = await getLocale();

  let resultPath = `/dashboard/profile?error=${encodeURIComponent("Erro inesperado")}`;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      resultPath = "/login";
      throw new Error("done");
    }

    const fileRaw = formData.get("photo");
    if (!(fileRaw instanceof File) || fileRaw.size === 0) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent("Selecione uma imagem.")}`;
      throw new Error("done");
    }
    if (fileRaw.size > 5 * 1024 * 1024) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent("Imagem maior que 5MB.")}`;
      throw new Error("done");
    }
    if (!fileRaw.type.startsWith("image/")) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent("Apenas arquivos de imagem.")}`;
      throw new Error("done");
    }

    const ext = fileRaw.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;

    const arrayBuffer = await fileRaw.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("trainer-photos")
      .upload(path, arrayBuffer, {
        contentType: fileRaw.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent("Falha no upload: " + uploadError.message)}`;
      throw new Error("done");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("trainer-photos").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("trainers")
      .update({ photo_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent("Upload OK, mas falha ao salvar URL: " + updateError.message)}`;
      throw new Error("done");
    }

    revalidatePath("/[locale]/dashboard", "layout");
    resultPath = `/dashboard/profile?success=${encodeURIComponent("Foto atualizada!")}`;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof Error && err.message !== "done") {
      resultPath = `/dashboard/profile?error=${encodeURIComponent(err.message)}`;
    }
  }

  redirect({ href: resultPath, locale });
}

export async function uploadCoverImage(formData: FormData) {
  const locale = await getLocale();

  let resultPath = `/dashboard/profile?error=${encodeURIComponent("Erro inesperado")}`;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      resultPath = "/login";
      throw new Error("done");
    }

    const fileRaw = formData.get("cover");
    if (!(fileRaw instanceof File) || fileRaw.size === 0) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent("Selecione uma imagem.")}`;
      throw new Error("done");
    }
    if (fileRaw.size > 8 * 1024 * 1024) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent("Imagem maior que 8MB.")}`;
      throw new Error("done");
    }
    if (!fileRaw.type.startsWith("image/")) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent("Apenas arquivos de imagem.")}`;
      throw new Error("done");
    }

    const ext = fileRaw.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${user.id}/cover-${Date.now()}.${ext}`;

    const arrayBuffer = await fileRaw.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("trainer-photos")
      .upload(path, arrayBuffer, {
        contentType: fileRaw.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent("Falha no upload: " + uploadError.message)}`;
      throw new Error("done");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("trainer-photos").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("trainers")
      .update({ cover_image_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      const m = updateError.message || "";
      if (m.includes("Could not find") || m.includes("does not exist")) {
        resultPath = `/dashboard/profile?error=${encodeURIComponent(
          "Imagem enviada, mas para usar capa rode a migration 0008_landing_templates.sql."
        )}`;
        throw new Error("done");
      }
      resultPath = `/dashboard/profile?error=${encodeURIComponent(updateError.message)}`;
      throw new Error("done");
    }

    revalidatePath("/[locale]/dashboard", "layout");
    revalidatePath(`/[locale]/pt`, "layout");
    resultPath = `/dashboard/profile?success=${encodeURIComponent("Capa atualizada!")}`;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof Error && err.message !== "done") {
      resultPath = `/dashboard/profile?error=${encodeURIComponent(err.message)}`;
    }
  }

  redirect({ href: resultPath, locale });
}

const VALID_TEMPLATES = ["bold", "minimal", "energy"] as const;

function isValidColor(c: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(c);
}

function safeJson<T>(input: string, fallback: T): T {
  try {
    const v = JSON.parse(input);
    return v as T;
  } catch {
    return fallback;
  }
}

export async function updateLandingCustomization(formData: FormData) {
  const locale = await getLocale();

  let resultPath = `/dashboard/profile?error=${encodeURIComponent("Erro inesperado")}`;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      resultPath = "/login";
      throw new Error("done");
    }

    const templateRaw = String(formData.get("template_id") ?? "bold");
    const template = (VALID_TEMPLATES as readonly string[]).includes(templateRaw)
      ? templateRaw
      : "bold";

    const accentRaw = String(formData.get("accent_color") ?? "#ff6b00");
    const accent = isValidColor(accentRaw) ? accentRaw : "#ff6b00";

    const yearsRaw = formData.get("years_experience");
    const studentsRaw = formData.get("students_helped");

    const update = {
      template_id: template,
      accent_color: accent,
      headline: String(formData.get("headline") ?? "").trim() || null,
      subheadline: String(formData.get("subheadline") ?? "").trim() || null,
      cta_text: String(formData.get("cta_text") ?? "").trim() || null,
      years_experience:
        yearsRaw && String(yearsRaw).trim() !== ""
          ? Math.max(0, Math.min(60, Number(yearsRaw)))
          : null,
      students_helped:
        studentsRaw && String(studentsRaw).trim() !== ""
          ? Math.max(0, Math.min(100000, Number(studentsRaw)))
          : null,
      testimonials: safeJson<unknown[]>(
        String(formData.get("testimonials") ?? "[]"),
        []
      ),
      highlights: safeJson<unknown[]>(
        String(formData.get("highlights") ?? "[]"),
        []
      ),
    };

    const { error } = await supabase
      .from("trainers")
      .update(update)
      .eq("id", user.id);

    if (error) {
      // Erro tipico quando migration 0008 nao foi aplicada
      const msg = error.message || "";
      if (msg.includes("Could not find") || msg.includes("does not exist")) {
        resultPath = `/dashboard/profile?error=${encodeURIComponent(
          "Para salvar personalização avançada, rode a migration 0008_landing_templates.sql no Supabase SQL Editor."
        )}`;
      } else {
        resultPath = `/dashboard/profile?error=${encodeURIComponent(msg)}`;
      }
      throw new Error("done");
    }

    revalidatePath("/[locale]/dashboard", "layout");
    revalidatePath(`/[locale]/pt`, "layout");
    resultPath = `/dashboard/profile?success=${encodeURIComponent("Personalização salva!")}`;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof Error && err.message !== "done") {
      resultPath = `/dashboard/profile?error=${encodeURIComponent(err.message)}`;
    }
  }

  redirect({ href: resultPath, locale });
}
