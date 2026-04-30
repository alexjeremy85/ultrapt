"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { assignWorkoutToStudent } from "./actions";

export function AssignWorkoutForm({
  studentId,
  workouts,
}: {
  studentId: string;
  workouts: Array<{ id: string; name: string; goal: string | null }>;
}) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (workouts.length === 0) {
    return (
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-center">
        <p className="text-sm text-ink">
          Você ainda não criou nenhum treino.
        </p>
        <a
          href="/dashboard/workouts/new"
          className="btn-primary mt-3 inline-flex w-full justify-center sm:w-auto"
        >
          + Criar treino agora
        </a>
      </div>
    );
  }

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null);
          const r = await assignWorkoutToStudent(fd);
          if (!r?.ok && r?.error) setError(r.error);
        })
      }
      className="space-y-3"
    >
      <input type="hidden" name="student_id" value={studentId} />

      <div>
        <label className="label">{t("Assign.select_workout")}</label>
        <select
          name="workout_id"
          required
          className="input h-12 text-base"
          defaultValue=""
        >
          <option value="" disabled>
            Escolha um treino…
          </option>
          {workouts.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
              {w.goal ? ` · ${w.goal}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">{t("Assign.start_date")}</label>
        <input
          name="start_date"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="input h-12 text-base"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary h-12 w-full text-base"
      >
        {isPending ? "Atribuindo..." : t("Assign.btn_assign")}
      </button>

      <a
        href="/dashboard/workouts/new"
        className="block text-center text-sm text-ink-muted hover:text-accent"
      >
        + Criar novo treino
      </a>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}
    </form>
  );
}
