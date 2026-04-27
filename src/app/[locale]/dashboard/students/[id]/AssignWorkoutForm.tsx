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
      <p className="text-sm text-ink-muted">
        Você ainda não criou nenhum treino.{" "}
        <a href="/dashboard/workouts/new" className="text-accent hover:underline">
          Criar agora
        </a>
        .
      </p>
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
      className="flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="student_id" value={studentId} />
      <div className="flex-1 min-w-[200px]">
        <label className="label">{t("Assign.select_workout")}</label>
        <select name="workout_id" required className="input" defaultValue="">
          <option value="" disabled>—</option>
          {workouts.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
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
          className="input"
        />
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "..." : t("Assign.btn_assign")}
      </button>
      {error && (
        <div className="basis-full text-sm text-danger">{error}</div>
      )}
    </form>
  );
}
