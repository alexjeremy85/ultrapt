import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoldTemplate } from "./templates/BoldTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { EnergyTemplate } from "./templates/EnergyTemplate";
import type { TrainerProfile } from "./templates/types";

export const revalidate = 60;

const FULL_COLS =
  "full_name, slug, cref, bio, photo_url, cover_image_url, specialties, services_description, pricing_summary, whatsapp_phone, instagram_handle, city, state, template_id, accent_color, headline, subheadline, cta_text, years_experience, students_helped, testimonials, highlights";

const BASE_COLS =
  "full_name, slug, cref, bio, photo_url, specialties, services_description, pricing_summary, whatsapp_phone, instagram_handle, city, state";

const PERSONALIZATION_DEFAULTS = {
  cover_image_url: null,
  template_id: "bold",
  accent_color: null,
  headline: null,
  subheadline: null,
  cta_text: null,
  years_experience: null,
  students_helped: null,
  testimonials: null,
  highlights: null,
};

export default async function PublicTrainerPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  // 1) Tenta com todas as colunas (migration 0008 aplicada)
  let trainer: TrainerProfile | null = null;
  const fullQuery = await supabase
    .from("trainers")
    .select(FULL_COLS)
    .eq("slug", slug)
    .maybeSingle();

  if (fullQuery.data && !fullQuery.error) {
    trainer = fullQuery.data as unknown as TrainerProfile;
  } else {
    // 2) Fallback: 0008 nao aplicada — usa apenas colunas garantidas
    const baseQuery = await supabase
      .from("trainers")
      .select(BASE_COLS)
      .eq("slug", slug)
      .maybeSingle();

    if (baseQuery.data) {
      trainer = {
        ...(baseQuery.data as unknown as Omit<
          TrainerProfile,
          keyof typeof PERSONALIZATION_DEFAULTS
        >),
        ...PERSONALIZATION_DEFAULTS,
      } as TrainerProfile;
    }
  }

  if (!trainer) notFound();

  const ctaUrl = `/pt/${slug}/anamnese`;

  switch (trainer.template_id) {
    case "minimal":
      return <MinimalTemplate trainer={trainer} ctaUrl={ctaUrl} />;
    case "energy":
      return <EnergyTemplate trainer={trainer} ctaUrl={ctaUrl} />;
    case "bold":
    default:
      return <BoldTemplate trainer={trainer} ctaUrl={ctaUrl} />;
  }
}
