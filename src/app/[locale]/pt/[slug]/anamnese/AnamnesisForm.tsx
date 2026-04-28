"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitAnamnesis } from "./actions";

export function AnamnesisForm({
  trainerId,
  slug,
}: {
  trainerId: string;
  slug: string;
}) {
  const t = useTranslations();
  const [gender, setGender] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <form action={submitAnamnesis} encType="multipart/form-data" className="space-y-10">
      <input type="hidden" name="trainer_id" value={trainerId} />
      <input type="hidden" name="slug" value={slug} />

      {/* PHOTO */}
      <div>
        <label className="block text-sm font-semibold text-ink">
          {t("Anamnesis.field_photo")}
        </label>
        <p className="mt-1 text-xs text-ink-muted">
          {t("Anamnesis.photo_helper")}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-bg-elevated">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-ink-dim">
                ＋
              </div>
            )}
          </div>
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-bg-elevated file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-bg-card"
          />
        </div>
      </div>

      <Section title={t("Anamnesis.section_personal")}>
        <Field label={t("Anamnesis.field_full_name")} required>
          <input name="full_name" type="text" required className="input" />
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("Anamnesis.field_email")}>
            <input name="email" type="email" className="input" />
          </Field>
          <Field label={t("Anamnesis.field_phone")} required>
            <input name="phone" type="tel" required className="input" />
          </Field>
          <Field label={t("Anamnesis.field_birth_date")}>
            <input name="birth_date" type="date" className="input" />
          </Field>
          <Field label={t("Anamnesis.field_gender")}>
            <select
              name="gender"
              className="input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">—</option>
              <option value="male">{t("Anamnesis.gender_male")}</option>
              <option value="female">{t("Anamnesis.gender_female")}</option>
              <option value="other">{t("Anamnesis.gender_other")}</option>
            </select>
          </Field>
          <Field label={t("Anamnesis.field_weight")}>
            <input
              name="weight"
              type="number"
              step="0.1"
              min="20"
              max="300"
              className="input"
            />
          </Field>
          <Field label={t("Anamnesis.field_height")}>
            <input
              name="height"
              type="number"
              step="1"
              min="80"
              max="250"
              className="input"
            />
          </Field>
        </div>
      </Section>

      <Section title={t("Anamnesis.section_objective")}>
        <Field label={t("Anamnesis.field_objective")} required>
          <select name="objective" required className="input" defaultValue="">
            <option value="" disabled>—</option>
            <option value="hypertrophy">{t("Anamnesis.objective_hypertrophy")}</option>
            <option value="weight_loss">{t("Anamnesis.objective_weight_loss")}</option>
            <option value="conditioning">{t("Anamnesis.objective_conditioning")}</option>
            <option value="health">{t("Anamnesis.objective_health")}</option>
            <option value="performance">{t("Anamnesis.objective_performance")}</option>
            <option value="other">{t("Anamnesis.objective_other")}</option>
          </select>
        </Field>
        <Field label={t("Anamnesis.field_objective_detail")}>
          <textarea name="objective_detail" rows={3} className="input" />
        </Field>
      </Section>

      <Section title={t("Anamnesis.section_training")}>
        <Field label={t("Anamnesis.field_training_practiced")}>
          <select name="training_practiced" className="input" defaultValue="">
            <option value="">—</option>
            <option value="yes">{t("Anamnesis.yes")}</option>
            <option value="no">{t("Anamnesis.no")}</option>
          </select>
        </Field>
        <Field label={t("Anamnesis.field_training_detail")}>
          <textarea name="training_detail" rows={2} className="input" />
        </Field>
        <Field label={t("Anamnesis.field_experience")}>
          <select name="experience" className="input" defaultValue="">
            <option value="">—</option>
            <option value="iniciante">{t("Anamnesis.experience_beginner")}</option>
            <option value="intermediario">{t("Anamnesis.experience_intermediate")}</option>
            <option value="avancado">{t("Anamnesis.experience_advanced")}</option>
          </select>
        </Field>
        <Field label={t("Anamnesis.field_where_train")}>
          <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
            {[
              { v: "home", k: "Anamnesis.where_home" },
              { v: "gym", k: "Anamnesis.where_gym" },
              { v: "condo", k: "Anamnesis.where_condo" },
              { v: "outdoors", k: "Anamnesis.where_outdoors" },
            ].map((opt) => (
              <label
                key={opt.v}
                className="flex items-center gap-2 rounded-md border border-border bg-bg-surface px-3 py-2 text-ink"
              >
                <input
                  type="checkbox"
                  name="where_train"
                  value={opt.v}
                  className="rounded border-border"
                />
                {t(opt.k as Parameters<typeof t>[0])}
              </label>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("Anamnesis.field_days_available")}>
            <input
              name="days_available"
              type="number"
              min="1"
              max="7"
              className="input"
            />
          </Field>
          <Field label={t("Anamnesis.field_time_per_session")}>
            <input
              name="time_per_session"
              type="number"
              min="15"
              max="240"
              step="5"
              className="input"
            />
          </Field>
        </div>
        <Field label={t("Anamnesis.field_exercises_likes")}>
          <textarea name="exercises_likes" rows={2} className="input" />
        </Field>
        <Field label={t("Anamnesis.field_exercises_dislikes")}>
          <textarea name="exercises_dislikes" rows={2} className="input" />
        </Field>
      </Section>

      <Section title={t("Anamnesis.section_health_extra")}>
        <Field label={t("Anamnesis.field_health_conditions")}>
          <div className="mt-1 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            {[
              { v: "heart", k: "Anamnesis.health_heart" },
              { v: "pressure", k: "Anamnesis.health_pressure" },
              { v: "diabetes", k: "Anamnesis.health_diabetes" },
              { v: "joint", k: "Anamnesis.health_joint" },
              { v: "back", k: "Anamnesis.health_back" },
              { v: "none", k: "Anamnesis.health_none" },
            ].map((opt) => (
              <label
                key={opt.v}
                className="flex items-center gap-2 rounded-md border border-border bg-bg-surface px-3 py-2 text-ink"
              >
                <input
                  type="checkbox"
                  name="health_conditions"
                  value={opt.v}
                  className="rounded border-border"
                />
                {t(opt.k as Parameters<typeof t>[0])}
              </label>
            ))}
          </div>
        </Field>
        <Field label={t("Anamnesis.field_health_detail")}>
          <textarea name="health_detail" rows={2} className="input" />
        </Field>
        <Field label={t("Anamnesis.field_medications")}>
          <textarea name="medications" rows={2} className="input" />
        </Field>
        <Field label={t("Anamnesis.field_injuries")}>
          <textarea name="injuries" rows={2} className="input" />
        </Field>
        <Field label={t("Anamnesis.field_recent_surgery")}>
          <textarea name="recent_surgery" rows={2} className="input" />
        </Field>
        <Field label={t("Anamnesis.field_nutritionist")}>
          <select name="nutritionist" className="input" defaultValue="">
            <option value="">—</option>
            <option value="yes">{t("Anamnesis.yes")}</option>
            <option value="no">{t("Anamnesis.no")}</option>
          </select>
        </Field>
        <Field label={t("Anamnesis.field_medical_clearance")}>
          <select name="medical_clearance" className="input" defaultValue="">
            <option value="">—</option>
            <option value="yes">{t("Anamnesis.yes")}</option>
            <option value="no">{t("Anamnesis.no")}</option>
          </select>
        </Field>
        <Field label={t("Anamnesis.field_stress_level")}>
          <select name="stress_level" className="input" defaultValue="">
            <option value="">—</option>
            <option value="low">{t("Anamnesis.stress_low")}</option>
            <option value="moderate">{t("Anamnesis.stress_moderate")}</option>
            <option value="high">{t("Anamnesis.stress_high")}</option>
          </select>
        </Field>
      </Section>

      {gender === "female" && (
        <Section title={t("Anamnesis.section_female")}>
          <p className="-mt-1 mb-3 text-xs text-ink-muted">
            {t("Anamnesis.section_female_helper")}
          </p>
          <Field label={t("Anamnesis.field_birth_control")}>
            <input name="birth_control" type="text" className="input" />
          </Field>
          <Field label={t("Anamnesis.field_menopause")}>
            <select name="menopause" className="input" defaultValue="">
              <option value="">—</option>
              <option value="yes">{t("Anamnesis.yes")}</option>
              <option value="no">{t("Anamnesis.no")}</option>
            </select>
          </Field>
          <Field label={t("Anamnesis.field_cycle_variation")}>
            <textarea name="cycle_variation" rows={2} className="input" />
          </Field>
          <Field label={t("Anamnesis.field_pcos")}>
            <textarea name="pcos" rows={2} className="input" />
          </Field>
        </Section>
      )}

      <Section title={t("Anamnesis.section_habits")}>
        <Field label={t("Anamnesis.field_diet")}>
          <select name="diet" className="input" defaultValue="">
            <option value="">—</option>
            <option value="balanced">{t("Anamnesis.diet_balanced")}</option>
            <option value="irregular">{t("Anamnesis.diet_irregular")}</option>
            <option value="restrictive">{t("Anamnesis.diet_restrictive")}</option>
            <option value="other">{t("Anamnesis.diet_other")}</option>
          </select>
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("Anamnesis.field_meals_per_day")}>
            <input name="meals_per_day" type="number" min="1" max="10" className="input" />
          </Field>
          <Field label={t("Anamnesis.field_water_liters")}>
            <input name="water_liters" type="number" step="0.1" min="0" max="10" className="input" />
          </Field>
          <Field label={t("Anamnesis.field_sleep_hours")}>
            <input name="sleep_hours" type="number" step="0.5" min="0" max="16" className="input" />
          </Field>
          <Field label={t("Anamnesis.field_sleep_quality")}>
            <select name="sleep_quality" className="input" defaultValue="">
              <option value="">—</option>
              <option value="good">{t("Anamnesis.sleep_good")}</option>
              <option value="regular">{t("Anamnesis.sleep_regular")}</option>
              <option value="bad">{t("Anamnesis.sleep_bad")}</option>
            </select>
          </Field>
        </div>
        <Field label={t("Anamnesis.field_alcohol")}>
          <input name="alcohol" type="text" className="input" />
        </Field>
        <Field label={t("Anamnesis.field_smoking")}>
          <select name="smoking" className="input" defaultValue="">
            <option value="">—</option>
            <option value="yes">{t("Anamnesis.yes")}</option>
            <option value="no">{t("Anamnesis.no")}</option>
          </select>
        </Field>
        <Field label={t("Anamnesis.field_extra_info")}>
          <textarea name="extra_info" rows={3} className="input" />
        </Field>
        <Field label={t("Anamnesis.field_commitment")}>
          <select name="commitment" className="input" defaultValue="">
            <option value="">—</option>
            <option value="yes">{t("Anamnesis.yes")}</option>
            <option value="no">{t("Anamnesis.no")}</option>
          </select>
        </Field>
      </Section>

      <label className="flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 rounded border-border"
        />
        <span>{t("Anamnesis.field_consent")}</span>
      </label>

      <button type="submit" className="btn-primary w-full">
        {t("Anamnesis.btn_submit")}
      </button>
    </form>
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
    <div>
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
