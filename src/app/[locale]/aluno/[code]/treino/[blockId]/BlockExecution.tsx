"use client";

import { useState, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { finishBlockExecution, logSet } from "./actions";

type Exercise = {
  id: string;
  position: number;
  sets: number;
  reps: string;
  weight: string | null;
  rest_seconds: number | null;
  tempo: string | null;
  notes: string | null;
  custom_name: string | null;
  custom_youtube_id: string | null;
  exercise: {
    id: string;
    name: string;
    muscle_group: string;
    youtube_id: string | null;
  } | null;
};

export function BlockExecution({
  accessCode,
  blockId,
  exercises,
  backCode,
}: {
  accessCode: string;
  blockId: string;
  exercises: Exercise[];
  backCode: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [done, setDone] = useState<Record<string, Set<number>>>({});
  const [restEnd, setRestEnd] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [perceived, setPerceived] = useState<number>(7);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining =
    restEnd !== null ? Math.max(0, Math.ceil((restEnd - Date.now()) / 1000)) : 0;

  const totalSets = exercises.reduce((acc, e) => acc + e.sets, 0);
  const completedSets = Object.values(done).reduce(
    (acc, set) => acc + set.size,
    0
  );

  const onMarkSet = (exId: string, setNumber: number, restSeconds: number) => {
    setDone((prev) => {
      const newSet = new Set(prev[exId] ?? []);
      newSet.add(setNumber);
      return { ...prev, [exId]: newSet };
    });
    setRestEnd(Date.now() + restSeconds * 1000);
    startTransition(async () => {
      await logSet({
        accessCode,
        workoutExerciseId: exId,
        setNumber,
      });
    });
  };

  const onFinish = async () => {
    setSubmitting(true);
    await finishBlockExecution({
      accessCode,
      blockId,
      perceivedEffort: perceived,
    });
    router.push(`/aluno/${backCode}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-4">
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="text-ink-muted">
          {t("StudentApp.exercise_progress", {
            done: completedSets,
            total: totalSets,
          })}
        </div>
        <div className="text-accent font-bold">
          {Math.round((completedSets / Math.max(1, totalSets)) * 100)}%
        </div>
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${(completedSets / Math.max(1, totalSets)) * 100}%` }}
        />
      </div>

      {restEnd !== null && remaining > 0 && (
        <div className="mb-4 sticky top-20 z-10 rounded-xl border border-accent bg-accent/15 p-4 text-center backdrop-blur animate-pulse-glow">
          <div className="text-xs uppercase tracking-wider text-accent">
            {t("StudentApp.rest_timer")}
          </div>
          <div className="mt-1 text-4xl font-black tabular-nums text-accent">
            {Math.floor(remaining / 60)
              .toString()
              .padStart(2, "0")}
            :
            {(remaining % 60).toString().padStart(2, "0")}
          </div>
          <button
            onClick={() => setRestEnd(null)}
            className="mt-2 text-xs text-ink-dim hover:text-ink"
          >
            pular
          </button>
        </div>
      )}

      <div className="space-y-3">
        {exercises.map((e, idx) => {
          const name = e.exercise?.name ?? e.custom_name ?? "—";
          const ytId = e.exercise?.youtube_id ?? e.custom_youtube_id;
          const exDone = done[e.id] ?? new Set();
          return (
            <div key={e.id} className="card">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-sm font-bold text-accent">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{name}</div>
                  <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-ink-dim">
                    <span>
                      {e.sets} séries × {e.reps} reps
                    </span>
                    {e.weight && <span>· {e.weight}</span>}
                    {e.rest_seconds && <span>· {e.rest_seconds}s descanso</span>}
                    {e.tempo && <span>· {e.tempo}</span>}
                  </div>
                  {ytId && (
                    <a
                      href={`https://youtube.com/watch?v=${ytId}`}
                      target="_blank"
                      rel="noopener"
                      className="mt-1 inline-block text-xs text-accent hover:underline"
                    >
                      ▶ {t("StudentApp.watch_video")}
                    </a>
                  )}
                  {e.notes && (
                    <div className="mt-2 rounded bg-bg-surface px-2 py-1 text-xs text-ink-muted">
                      💡 {e.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from({ length: e.sets }, (_, i) => i + 1).map((n) => {
                  const isDone = exDone.has(n);
                  return (
                    <button
                      key={n}
                      onClick={() =>
                        !isDone &&
                        onMarkSet(e.id, n, e.rest_seconds ?? 60)
                      }
                      disabled={isDone}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold transition ${
                        isDone
                          ? "bg-success text-black"
                          : "border border-border-strong bg-bg-elevated hover:border-accent hover:text-accent"
                      }`}
                    >
                      {isDone ? "✓" : n}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 card">
        <div className="text-sm font-medium">
          {t("StudentApp.perceived_effort")}
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={perceived}
          onChange={(e) => setPerceived(Number(e.target.value))}
          className="mt-3 w-full accent-accent"
        />
        <div className="mt-1 flex justify-between text-xs text-ink-dim">
          <span>1 · {t("StudentApp.perceived_low")}</span>
          <span className="text-2xl font-black text-accent">{perceived}</span>
          <span>10 · {t("StudentApp.perceived_high")}</span>
        </div>
      </div>

      <button
        onClick={onFinish}
        disabled={submitting}
        className="btn-primary mt-6 w-full text-base shadow-glow"
      >
        {submitting ? "..." : t("StudentApp.btn_finish_block")}
      </button>
    </div>
  );
}
