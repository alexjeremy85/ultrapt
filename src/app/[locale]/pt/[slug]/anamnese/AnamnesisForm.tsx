"use client";

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

  return (
    <form action={submitAnamnesis} className="space-y-8">
      <input type="hidden" name="trainer_id" value={trainerId} />
      <input type="hidden" name="slug" value={slug} />

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
            <select name="gender" className="input" defaultValue="">
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
            <option value="hypertrophy">
              {t("Anamnesis.objective_hypertrophy")}
            </option>
            <option value="weight_loss">
              {t("Anamnesis.objective_weight_loss")}
            </option>
            <option value="conditioning">
              {t("Anamnesis.objective_conditioning")}
            </option>
            <option value="health">{t("Anamnesis.objective_health")}</option>
            <option value="performance">
              {t("Anamnesis.objective_performance")}
            </option>
            <option value="other">{t("Anamnesis.objective_other")}</option>
          </select>
        </Field>
        <Field label={t("Anamnesis.field_objective_detail")}>
          <textarea name="objective_detail" rows={3} className="input" />
        </Field>
        <Field label={t("Anamnesis.field_experience")} required>
          <select name="experience" required className="input" defaultValue="">
            <option value="" disabled>—</option>
            <option value="iniciante">
              {t("Anamnesis.experience_beginner")}
            </option>
            <option value="intermediario">
              {t("Anamnesis.experience_intermediate")}
            </option>
            <option value="avancado">
              {t("Anamnesis.experience_advanced")}
            </option>
          </select>
        </Field>
        <Field label={t("Anamnesis.field_days_available")}>
          <input
            name="days_available"
            type="number"
            min="1"
            max="7"
            className="input"
          />
        </Field>
      </Section>

      <Section title={t("Anamnesis.section_health")}>
        <Field label={t("Anamnesis.field_health_conditions")}>
          <div className="mt-1 space-y-2 text-sm">
            {[
              { v: "heart", k: "Anamnesis.health_heart" },
              { v: "pressure", k: "Anamnesis.health_pressure" },
              { v: "diabetes", k: "Anamnesis.health_diabetes" },
              { v: "joint", k: "Anamnesis.health_joint" },
              { v: "back", k: "Anamnesis.health_back" },
              { v: "none", k: "Anamnesis.health_none" },
            ].map((opt) => (
              <label key={opt.v} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="health_conditions"
                  value={opt.v}
                  className="rounded border-slate-300"
                />
                {t(opt.k as Parameters<typeof t>[0])}
              </label>
            ))}
          </div>
        </Field>
        <Field label={t("Anamnesis.field_health_detail")}>
          <textarea name="health_detail" rows={3} className="input" />
        </Field>
        <Field label={t("Anamnesis.field_medical_clearance")}>
          <select name="medical_clearance" className="input" defaultValue="">
            <option value="">—</option>
            <option value="yes">{t("Anamnesis.yes")}</option>
            <option value="no">{t("Anamnesis.no")}</option>
          </select>
        </Field>
      </Section>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 rounded border-slate-300"
        />
        <span>{t("Anamnesis.field_consent")}</span>
      </label>

      <button
        type="submit"
        className="w-full rounded-md bg-brand px-5 py-3 font-medium text-white hover:bg-brand-dark"
      >
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
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
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
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
