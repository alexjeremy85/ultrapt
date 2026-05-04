"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { createAssessment } from "./actions";

export function NewAssessmentForm({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createAssessment(studentId, formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="label">Data</label>
          <input
            name="assessment_date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Sexo</label>
          <select name="sex" required className="input">
            <option value="">—</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>
        <div>
          <label className="label">Idade</label>
          <input name="age" type="number" min="10" max="100" required className="input" />
        </div>
        <div>
          <label className="label">Peso (kg)</label>
          <input
            name="weight_kg"
            type="number"
            step="0.01"
            min="20"
            required
            className="input"
          />
        </div>
        <div>
          <label className="label">Altura (cm)</label>
          <input name="height_cm" type="number" step="0.1" className="input" />
        </div>
      </div>

      <fieldset className="rounded-lg border border-border p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-ink-dim">
          Dobras cutâneas (mm) — Pollock 7
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field name="skinfold_chest" label="Peitoral" />
          <Field name="skinfold_axillary" label="Axilar média" />
          <Field name="skinfold_tricep" label="Tríceps" />
          <Field name="skinfold_subscapular" label="Subescapular" />
          <Field name="skinfold_abdominal" label="Abdominal" />
          <Field name="skinfold_suprailiac" label="Supra-ilíaca" />
          <Field name="skinfold_thigh" label="Coxa" />
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-ink-dim">
          Perímetros (cm) — opcional
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field name="circumference_chest" label="Tórax" required={false} />
          <Field name="circumference_waist" label="Cintura" required={false} />
          <Field name="circumference_hip" label="Quadril" required={false} />
          <Field name="circumference_arm_right" label="Braço D" required={false} />
          <Field name="circumference_arm_left" label="Braço E" required={false} />
          <Field name="circumference_thigh_right" label="Coxa D" required={false} />
          <Field name="circumference_thigh_left" label="Coxa E" required={false} />
          <Field name="circumference_calf_right" label="Pant. D" required={false} />
          <Field name="circumference_calf_left" label="Pant. E" required={false} />
        </div>
      </fieldset>

      <div>
        <label className="label">Observações</label>
        <textarea
          name="notes"
          rows={2}
          className="input"
          placeholder="Notas da avaliação"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full"
      >
        {pending ? "Calculando…" : "Salvar avaliação"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  required = true,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        name={name}
        type="number"
        step="0.1"
        min="0"
        required={required}
        className="input"
      />
    </div>
  );
}
