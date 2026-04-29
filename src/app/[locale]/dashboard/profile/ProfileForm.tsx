"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  updateProfile,
  uploadProfilePhoto,
  uploadCoverImage,
  updateLandingCustomization,
} from "./actions";
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

  const onCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Foto de perfil */}
      <Section title={t("Profile.field_photo")}>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-bg-elevated">
            {trainer.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={trainer.photo_url}
                alt={trainer.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-accent">
                {trainer.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <form action={uploadProfilePhoto} className="flex items-center gap-2">
            <input
              name="photo"
              type="file"
              accept="image/*"
              required
              className="block text-sm text-ink-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-bg-elevated file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-accent"
            />
            <button type="submit" className="btn-primary text-sm">
              {t("Common.save")}
            </button>
          </form>
        </div>
      </Section>

      {/* Cover image */}
      <Section
        title="Imagem de capa (opcional)"
        subtitle="Banner do topo da página. Recomendamos foto sua treinando, paisagem fitness, etc. (1920x1080 ideal)"
      >
        {trainer.cover_image_url && (
          <div className="mb-3 h-32 w-full overflow-hidden rounded-lg bg-bg-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trainer.cover_image_url}
              alt="Capa"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <form action={uploadCoverImage} className="flex items-center gap-2">
          <input
            name="cover"
            type="file"
            accept="image/*"
            required
            className="block text-sm text-ink-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-bg-elevated file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-accent"
          />
          <button type="submit" className="btn-primary text-sm">
            Enviar
          </button>
        </form>
      </Section>

      {/* Dados básicos */}
      <form action={updateProfile} className="space-y-6">
        <Section title={t("Profile.section_basic")}>
          <Field label={t("Profile.field_full_name")}>
            <input
              name="full_name"
              defaultValue={trainer.full_name}
              required
              className="input"
            />
          </Field>
          <Field label={t("Profile.field_cref")}>
            <input
              name="cref"
              defaultValue={trainer.cref ?? ""}
              className="input"
            />
          </Field>
        </Section>

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
              className="input"
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
              className="input"
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
              className="input"
            />
          </Field>
        </Section>

        <Section title={t("Profile.section_contact")}>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label={t("Profile.field_whatsapp")}
              hint={t("Profile.field_whatsapp_hint")}
            >
              <input
                name="whatsapp_phone"
                defaultValue={trainer.whatsapp_phone ?? ""}
                className="input"
              />
            </Field>
            <Field
              label={t("Profile.field_instagram")}
              hint={t("Profile.field_instagram_hint")}
            >
              <input
                name="instagram_handle"
                defaultValue={trainer.instagram_handle ?? ""}
                className="input"
              />
            </Field>
            <Field label={t("Profile.field_city")}>
              <input
                name="city"
                defaultValue={trainer.city ?? ""}
                className="input"
              />
            </Field>
            <Field label={t("Profile.field_state")}>
              <input
                name="state"
                defaultValue={trainer.state ?? ""}
                maxLength={2}
                className="input uppercase"
              />
            </Field>
          </div>
        </Section>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            {t("Profile.btn_save")}
          </button>
        </div>
      </form>

      {/* PERSONALIZAÇÃO DA LANDING */}
      <form action={updateLandingCustomization} className="space-y-6">
        <Section
          title="Template da página pública"
          subtitle="Escolha o estilo visual da sua landing. Você pode trocar a qualquer momento."
        >
          <input type="hidden" name="template_id" value={selectedTemplate} />
          <input type="hidden" name="accent_color" value={accentColor} />

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

          <div className="mt-6">
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

        <Section
          title="Texto principal (opcional)"
          subtitle="Personalize o título e subtítulo do hero. Em branco = usa seu nome e bio."
        >
          <Field
            label="Título principal"
            hint="Ex.: 'Transforme seu corpo em 90 dias'"
          >
            <input
              name="headline"
              defaultValue={trainer.headline ?? ""}
              maxLength={120}
              className="input"
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
            label="Texto do botão de CTA"
            hint="Ex.: 'Quero treinar com você', 'Começar agora', 'Agendar conversa'"
          >
            <input
              name="cta_text"
              defaultValue={trainer.cta_text ?? ""}
              maxLength={50}
              className="input"
            />
          </Field>
        </Section>

        <Section
          title="Estatísticas de credibilidade"
          subtitle="Números que aparecem em destaque. Deixe 0 se não quiser exibir."
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Anos de experiência">
              <input
                name="years_experience"
                type="number"
                min="0"
                max="60"
                defaultValue={trainer.years_experience ?? ""}
                className="input"
              />
            </Field>
            <Field label="Alunos atendidos (total)">
              <input
                name="students_helped"
                type="number"
                min="0"
                max="100000"
                defaultValue={trainer.students_helped ?? ""}
                className="input"
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Diferenciais (até 6)"
          subtitle="Cards com ícone + título + descrição que aparecem na landing."
        >
          <HighlightsEditor initial={trainer.highlights ?? []} />
        </Section>

        <Section
          title="Depoimentos de alunos (até 6)"
          subtitle="Aumenta drasticamente a conversão. Use depoimentos reais com nome e cargo/situação."
        >
          <TestimonialsEditor initial={trainer.testimonials ?? []} />
        </Section>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Salvar personalização
          </button>
        </div>
      </form>
    </div>
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
