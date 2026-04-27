"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateProfile, uploadProfilePhoto } from "./actions";

type Trainer = {
  id: string;
  full_name: string;
  slug: string;
  cref: string | null;
  bio: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  services_description: string | null;
  pricing_summary: string | null;
  phone: string | null;
  whatsapp_phone: string | null;
  instagram_handle: string | null;
  city: string | null;
  state: string | null;
};

export function ProfileForm({
  trainer,
  publicUrl,
}: {
  trainer: Trainer;
  publicUrl: string;
}) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
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
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-dim">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
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
