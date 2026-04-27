import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoldTemplate } from "./templates/BoldTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { EnergyTemplate } from "./templates/EnergyTemplate";
import type { TrainerProfile } from "./templates/types";

export const revalidate = 60;

export default async function PublicTrainerPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainers")
    .select(
      "full_name, slug, cref, bio, photo_url, cover_image_url, specialties, services_description, pricing_summary, whatsapp_phone, instagram_handle, city, state, template_id, accent_color, headline, subheadline, cta_text, years_experience, students_helped, testimonials, highlights"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!trainer) notFound();

  const profile = trainer as unknown as TrainerProfile;
  const ctaUrl = `/pt/${slug}/anamnese`;

  switch (profile.template_id) {
    case "minimal":
      return <MinimalTemplate trainer={profile} ctaUrl={ctaUrl} />;
    case "energy":
      return <EnergyTemplate trainer={profile} ctaUrl={ctaUrl} />;
    case "bold":
    default:
      return <BoldTemplate trainer={profile} ctaUrl={ctaUrl} />;
  }
}
