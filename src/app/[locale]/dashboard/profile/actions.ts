"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_TEMPLATES = ["bold", "minimal", "energy"] as const;

function parseSpecialties(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function isValidColor(c: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(c);
}

function safeJson<T>(input: string, fallback: T): T {
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

async function uploadImageToBucket(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  prefix: string,
  file: File,
  maxBytes: number
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (file.size > maxBytes) {
    return { ok: false, error: `Imagem maior que ${Math.round(maxBytes / 1024 / 1024)}MB.` };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Apenas arquivos de imagem." };
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${prefix}-${Date.now()}.${ext}`;
  const buf = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("trainer-photos")
    .upload(path, buf, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (uploadError) return { ok: false, error: "Falha no upload: " + uploadError.message };
  const {
    data: { publicUrl },
  } = supabase.storage.from("trainer-photos").getPublicUrl(path);
  return { ok: true, url: publicUrl };
}

/**
 * Action unica que salva tudo do perfil:
 * - Upload de foto (se enviada)
 * - Upload de capa (se enviada)
 * - Dados basicos
 * - Personalizacao da landing
 *
 * Tudo em uma transacao logica. Se upload falha, dados de texto ainda
 * sao salvos. Migration 0008 ausente: salva o que da, avisa o que faltou.
 */
export async function saveProfile(formData: FormData) {
  const locale = await getLocale();
  const t = await getTranslations({ locale });

  let resultPath = `/dashboard/profile?error=${encodeURIComponent("Erro inesperado")}`;
  const warnings: string[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      resultPath = "/login";
      throw new Error("done");
    }

    // 1. Validacoes ----------------------------------------------------
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

    // 2. Uploads opcionais --------------------------------------------
    let photoUrl: string | null = null;
    let coverUrl: string | null = null;

    const photoRaw = formData.get("photo");
    if (photoRaw instanceof File && photoRaw.size > 0) {
      const r = await uploadImageToBucket(
        supabase,
        user.id,
        "avatar",
        photoRaw,
        5 * 1024 * 1024
      );
      if (r.ok) photoUrl = r.url;
      else warnings.push("Foto: " + r.error);
    }

    const coverRaw = formData.get("cover");
    if (coverRaw instanceof File && coverRaw.size > 0) {
      const r = await uploadImageToBucket(
        supabase,
        user.id,
        "cover",
        coverRaw,
        8 * 1024 * 1024
      );
      if (r.ok) coverUrl = r.url;
      else warnings.push("Capa: " + r.error);
    }

    // 3. Monta update -------------------------------------------------
    const yearsRaw = formData.get("years_experience");
    const studentsRaw = formData.get("students_helped");

    const baseUpdate: Record<string, unknown> = {
      full_name: String(formData.get("full_name") ?? "").trim(),
      slug,
      cref: String(formData.get("cref") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      specialties: parseSpecialties(String(formData.get("specialties") ?? "")),
      services_description:
        String(formData.get("services_description") ?? "").trim() || null,
      pricing_summary:
        String(formData.get("pricing_summary") ?? "").trim() || null,
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
    if (photoUrl) baseUpdate.photo_url = photoUrl;

    const templateRaw = String(formData.get("template_id") ?? "bold");
    const template = (VALID_TEMPLATES as readonly string[]).includes(templateRaw)
      ? templateRaw
      : "bold";
    const accentRaw = String(formData.get("accent_color") ?? "#ff6b00");
    const accent = isValidColor(accentRaw) ? accentRaw : "#ff6b00";

    const customizationUpdate: Record<string, unknown> = {
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
    if (coverUrl) customizationUpdate.cover_image_url = coverUrl;

    // 4. Tenta update completo ----------------------------------------
    const fullUpdate = { ...baseUpdate, ...customizationUpdate };
    const { error: errFull } = await supabase
      .from("trainers")
      .update(fullUpdate)
      .eq("id", user.id);

    if (errFull) {
      const msg = errFull.message || "";
      const isMissingColumns =
        msg.includes("Could not find") || msg.includes("does not exist");
      if (!isMissingColumns) {
        resultPath = `/dashboard/profile?error=${encodeURIComponent(msg)}`;
        throw new Error("done");
      }
      // 4b. Fallback: salva so o que existe (migration 0008 ausente)
      const { error: errBase } = await supabase
        .from("trainers")
        .update(baseUpdate)
        .eq("id", user.id);
      if (errBase) {
        resultPath = `/dashboard/profile?error=${encodeURIComponent(errBase.message)}`;
        throw new Error("done");
      }
      warnings.push(
        "Personalização avançada não foi salva (rode migration 0008_landing_templates.sql)."
      );
    }

    revalidatePath("/[locale]/dashboard", "layout");
    revalidatePath("/[locale]/pt", "layout");

    if (warnings.length > 0) {
      resultPath = `/dashboard/profile?error=${encodeURIComponent(
        "Salvo com avisos: " + warnings.join(" | ")
      )}`;
    } else {
      resultPath = `/dashboard/profile?success=${encodeURIComponent(
        "Perfil atualizado!"
      )}`;
    }
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof Error && err.message !== "done") {
      resultPath = `/dashboard/profile?error=${encodeURIComponent(err.message)}`;
    }
  }

  redirect({ href: resultPath, locale });
}
