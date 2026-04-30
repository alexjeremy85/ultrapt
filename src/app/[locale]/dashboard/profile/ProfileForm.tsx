"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { saveProfile } from "./actions";
import { TestimonialsEditor } from "./TestimonialsEditor";
import { HighlightsEditor } from "./HighlightsEditor";

type Trainer = {
  id: string;
  full_name: string;
  slug: string;
  cref: string | null;
  bio: string | null;
  photo_url: string | null;
  cover_image_url: string | null;
  specialties: string[] | null;
  services_description: string | null;
  pricing_summary: string | null;
  phone: string | null;
  whatsapp_phone: string | null;
  instagram_handle: string | null;
  city: string | null;
  state: string | null;
  template_id: string | null;
  accent_color: string | null;
  headline: string | null;
  subheadline: string | null;
  cta_text: string | null;
  years_experience: number | null;
  students_helped: number | null;
  testimonials: Array<{
    name: string;
    role?: string;
    text: string;
    rating?: number;
  }> | null;
  highlights: Array<{
    icon?: string;
    title: string;
    description?: string;
  }> | null;
};

const TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  swatch: string;
}> = [
  {
    id: "bold",
    name: "Bold",
    description: "Hero gigante com gradiente. Visual impactante.",
    swatch: "linear-gradient(135deg, #ff6b00 0%, #ff8533 50%, #ffaa66 100%)",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Profissional, fundo claro, layout enxuto.",
    swatch: "linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)",
  },
  {
    id: "energy",
    name: "Energy",
    description: "Hero full-bleed, atlético, alta conversão.",
    swatch: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
  },
];

const ACCENT_COLORS = [
  { name: "Laranja", value: "#ff6b00" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Verde neon", value: "#10b981" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Dourado", value: "#f59e0b" },
  { name: "Preto", value: "#0f172a" },
];

export function ProfileForm({
  trainer,
  publicUrl,
}: {
  trainer: Trainer;
  publicUrl: string;
}) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(
    trainer.template_id ?? "bold"
  );
  const [accentColor, setAccentColor] = useState(
    trainer.accent_color ?? "#ff6b00"
  );
  // Previews locais quando o user troca arquivo (sem precisar salvar pra ver)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const onCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setPhotoPreview(f ? URL.createObjectURL(f) : null);
  };
  const onPickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setCoverPreview(f ? URL.createObjectURL(f) : null);
  };

  return (
    <form
      action={saveProfile}
      encType="multipart/form-data"
      className="space-y-5"
    >
      {/* Hidden inputs pros states de template/cor */}
      <input type="hidden" name="template_id" value={selectedTemplate} />
      <input type="hidden" name="accent_color" value={accentColor} />

      {/* Foto + capa */}
      <Section title="Foto de perfil e capa">
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-bg-elevated">
              {photoPreview || trainer.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview ?? trainer.photo_url ?? ""}
                  alt={trainer.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-accent">
                  {trainer.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <label className="label">Foto de perfil</label>
              <input
                name="photo"
                type="file"
                accept="image/*"
                onChange={onPickPhoto}
                className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-bg-elevated file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-accent"
              />
              <p className="hint">Máx 5MB. Salva quando você apertar &quot;Salvar tudo&quot;.</p>
            </div>
          </div>

          {/* Capa */}
          <div>
            <label className="label">Imagem de capa (opcional)</label>
            {(coverPreview || trainer.cover_image_url) && (
              <div className="mb-2 h-28 w-full overflow-hidden rounded-lg bg-bg-elevated">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview ?? trainer.cover_image_url ?? ""}
                  alt="Capa"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <input
              name="cover"
              type="file"
              accept="image/*"
              onChange={onPickCover}
              className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-bg-elevated file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-accent"
            />
            <p className="hint">Máx 8MB. Banner do topo da landing (1920×1080 ideal).</p>
          </div>
        </div>
      </Section>

      {/* Dados básicos */}
      <Section title={t("Profile.section_basic")}>
        <Field label={t("Profile.field_full_name")}>
          <input
            name="full_name"
            defaultValue={trainer.full_name}
            required
            className="input h-11"
          />
        </Field>
        <Field label={t("Profile.field_cref")}>
          <input
            name="cref"
            defaultValue={trainer.cref ?? ""}
            className="input h-11"
          />
        </Field>
      </Section>

      {/* Página pública */}
      <Section title={t("Profile.section_public")}>
        <Field
          label={t("Profile.field_slug")}
          hint={t("Profile.field_slug_hint", { url: publicUrl })}
          extra={
            <button
              type="button"
              onClick={onCopy}
              className="ml-2 text-xs text-accent hover:text-accent-hover"
            >
              {copied ? t("Common.copied") : t("Common.copy")}
            </button>
          }
        >
          <input
            name="slug"
            defaultValue={trainer.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className="input h-11"
          />
        </Field>

        <Field label={t("Profile.field_bio")} hint={t("Profile.field_bio_hint")}>
          <textarea
            name="bio"
            defaultValue={trainer.bio ?? ""}
            rows={4}
            className="input"
          />
        </Field>

        <Field
          label={t("Profile.field_specialties")}
          hint={t("Profile.field_specialties_hint")}
        >
          <input
            name="specialties"
            defaultValue={(trainer.specialties ?? []).join(", ")}
            className="input h-11"
          />
        </Field>

        <Field
          label={t("Profile.field_services")}
          hint={t("Profile.field_services_hint")}
        >
          <textarea
            name="services_description"
            defaultValue={trainer.services_description ?? ""}
            rows={3}
            className="input"
          />
        </Field>

        <Field
          label={t("Profile.field_pricing")}
          hint={t("Profile.field_pricing_hint")}
        >
          <input
            name="pricing_summary"
            defaultValue={trainer.pricing_summary ?? ""}
            className="input h-11"
          />
        </Field>
      </Section>

      {/* Contato */}
      <Section title={t("Profile.section_contact")}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label={t("Profile.field_whatsapp")}
            hint={t("Profile.field_whatsapp_hint")}
          >
            <input
              name="whatsapp_phone"
              defaultValue={trainer.whatsapp_phone ?? ""}
              className="input h-11"
            />
          </Field>
          <Field
            label={t("Profile.field_instagram")}
            hint={t("Profile.field_instagram_hint")}
          >
            <input
              name="instagram_handle"
              defaultValue={trainer.instagram_handle ?? ""}
              className="input h-11"
            />
          </Field>
          <Field label={t("Profile.field_city")}>
            <input
              name="city"
              defaultValue={trainer.city ?? ""}
              className="input h-11"
            />
          </Field>
          <Field label={t("Profile.field_state")}>
            <input
              name="state"
              defaultValue={trainer.state ?? ""}
              maxLength={2}
              className="input h-11 uppercase"
            />
          </Field>
        </div>
      </Section>

      {/* Template */}
      <Section
        title="Template da página pública"
        subtitle="Escolha o estilo visual da sua landing."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedTemplate(tpl.id)}
              className={`rounded-xl border-2 p-4 text-left transition ${
                selectedTemplate === tpl.id
                  ? "border-accent bg-accent/10"
                  : "border-border bg-bg-surface hover:border-border-strong"
              }`}
            >
              <div
                className="h-12 w-full rounded-lg border border-border"
                style={{ background: tpl.swatch }}
              />
              <div className="mt-3 font-bold">{tpl.name}</div>
              <div className="mt-1 text-xs text-ink-muted">
                {tpl.description}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="label">Cor de destaque</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setAccentColor(c.value)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                  accentColor === c.value
                    ? "border-ink"
                    : "border-border hover:border-border-strong"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ background: c.value }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Texto principal */}
      <Section
        title="Texto principal (opcional)"
        subtitle="Personalize título e subtítulo do hero. Vazio = usa nome e bio."
      >
        <Field
          label="Título principal"
          hint="Ex.: 'Transforme seu corpo em 90 dias'"
        >
          <input
            name="headline"
            defaultValue={trainer.headline ?? ""}
            maxLength={120}
            className="input h-11"
          />
        </Field>

        <Field
          label="Subtítulo"
          hint="Ex.: 'Método validado em 200+ alunas. Online ou presencial.'"
        >
          <textarea
            name="subheadline"
            defaultValue={trainer.subheadline ?? ""}
            rows={2}
            maxLength={300}
            className="input"
          />
        </Field>

        <Field
          label="Texto do botão CTA"
          hint="Ex.: 'Quero treinar com você', 'Começar agora'"
        >
          <input
            name="cta_text"
            defaultValue={trainer.cta_text ?? ""}
            maxLength={50}
            className="input h-11"
          />
        </Field>
      </Section>

      {/* Estatísticas */}
      <Section
        title="Estatísticas de credibilidade"
        subtitle="Números em destaque. Deixe vazio se não quiser exibir."
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Anos de experiência">
            <input
              name="years_experience"
              type="number"
              min="0"
              max="60"
              defaultValue={trainer.years_experience ?? ""}
              className="input h-11"
            />
          </Field>
          <Field label="Alunos atendidos">
            <input
              name="students_helped"
              type="number"
              min="0"
              max="100000"
              defaultValue={trainer.students_helped ?? ""}
              className="input h-11"
            />
          </Field>
        </div>
      </Section>

      {/* Diferenciais */}
      <Section
        title="Diferenciais (até 6)"
        subtitle="Cards com ícone + título + descrição."
      >
        <HighlightsEditor initial={trainer.highlights ?? []} />
      </Section>

      {/* Depoimentos */}
      <Section
        title="Depoimentos (até 6)"
        subtitle="Aumenta drasticamente a conversão. Use depoimentos reais."
      >
        <TestimonialsEditor initial={trainer.testimonials ?? []} />
      </Section>

      {/* Botão único de salvar tudo */}
      <button
        type="submit"
        className="btn-primary h-12 w-full text-base md:ml-auto md:flex md:w-auto md:px-8"
      >
        Salvar tudo
      </button>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  extra,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center label">
        {label}
        {extra}
      </label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
