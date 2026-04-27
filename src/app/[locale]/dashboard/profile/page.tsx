import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

const FULL_COLS = "*";
const BASE_COLS =
  "id, full_name, slug, cref, bio, photo_url, specialties, services_description, pricing_summary, phone, whatsapp_phone, instagram_handle, city, state";

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

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { error, success } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Tenta com todas as colunas; se falhar (0008 nao aplicada), usa fallback.
  let trainer: Record<string, unknown> | null = null;
  let needsMigration0008 = false;

  const full = await supabase
    .from("trainers")
    .select(FULL_COLS)
    .eq("id", user!.id)
    .maybeSingle();

  if (full.data && !full.error) {
    trainer = full.data;
    // detecta se as colunas de personalizacao existem
    if (!("template_id" in (full.data as Record<string, unknown>))) {
      needsMigration0008 = true;
    }
  } else {
    needsMigration0008 = true;
    const base = await supabase
      .from("trainers")
      .select(BASE_COLS)
      .eq("id", user!.id)
      .maybeSingle();
    trainer = base.data
      ? { ...(base.data as Record<string, unknown>), ...PERSONALIZATION_DEFAULTS }
      : null;
  }

  if (!trainer) {
    return (
      <div className="card text-center">
        <p>Erro ao carregar perfil.</p>
      </div>
    );
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/pt/${trainer.slug}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("Profile.title")}</h1>
          <p className="text-sm text-ink-muted">{t("Profile.subtitle")}</p>
        </div>
        <Link
          href={`/pt/${trainer.slug}`}
          target="_blank"
          className="btn-secondary text-sm"
        >
          {t("Profile.btn_view_public")} ↗
        </Link>
      </div>

      {needsMigration0008 && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          <strong>Atenção:</strong> A personalização avançada (templates,
          depoimentos, diferenciais) ainda não está ativa. Rode a migration{" "}
          <code className="rounded bg-bg-elevated px-1 py-0.5">
            0008_landing_templates.sql
          </code>{" "}
          no Supabase SQL Editor para liberar.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          {decodeURIComponent(success)}
        </div>
      )}

      {/* @ts-expect-error trainer shape compativel via fallback */}
      <ProfileForm trainer={trainer} publicUrl={publicUrl} />
    </div>
  );
}
