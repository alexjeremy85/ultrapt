"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CloseIcon, PlayIcon } from "@/components/icons";
import {
  addBlock,
  updateBlock,
  deleteBlock,
  addExerciseToBlock,
  updateWorkoutExercise,
  deleteWorkoutExercise,
} from "./actions";

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string | null;
  level: string | null;
  modality: string;
  youtube_id: string | null;
};

type WorkoutExercise = {
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
  exercise: { id: string; name: string; muscle_group: string; youtube_id: string | null } | null;
};

type Block = {
  id: string;
  position: number;
  name: string;
  notes: string | null;
  workout_exercises: WorkoutExercise[];
};

export function WorkoutBuilder({
  workoutId,
  initialBlocks,
  exerciseLibrary,
}: {
  workoutId: string;
  initialBlocks: Block[];
  exerciseLibrary: Exercise[];
}) {
  const t = useTranslations();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [pickerForBlock, setPickerForBlock] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const onAddBlock = () =>
    startTransition(async () => {
      const r = await addBlock(workoutId, "");
      if (r.ok && r.block)
        setBlocks((prev) => [
          ...prev,
          { ...r.block, workout_exercises: [] } as Block,
        ]);
    });

  const onDeleteBlock = (blockId: string) =>
    startTransition(async () => {
      if (!confirm("Excluir este bloco?")) return;
      await deleteBlock(blockId);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    });

  const onUpdateBlock = (
    blockId: string,
    fields: { name?: string; notes?: string }
  ) =>
    startTransition(async () => {
      await updateBlock(blockId, fields);
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, ...fields } : b))
      );
    });

  const onAddExercise = (blockId: string, exerciseId: string) =>
    startTransition(async () => {
      const r = await addExerciseToBlock(blockId, exerciseId);
      if (r.ok && r.exercise) {
        const newEx = r.exercise as unknown as WorkoutExercise;
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === blockId
              ? { ...b, workout_exercises: [...b.workout_exercises, newEx] }
              : b
          )
        );
      }
      setPickerForBlock(null);
    });

  const onRemoveExercise = (blockId: string, exId: string) =>
    startTransition(async () => {
      await deleteWorkoutExercise(exId);
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? {
                ...b,
                workout_exercises: b.workout_exercises.filter(
                  (e) => e.id !== exId
                ),
              }
            : b
        )
      );
    });

  const onUpdateExercise = (
    exId: string,
    fields: Partial<WorkoutExercise>
  ) => {
    setBlocks((prev) =>
      prev.map((b) => ({
        ...b,
        workout_exercises: b.workout_exercises.map((e) =>
          e.id === exId ? { ...e, ...fields } : e
        ),
      }))
    );
  };

  const onCommitExerciseField = (exId: string, field: string, value: string | number) =>
    startTransition(async () => {
      await updateWorkoutExercise(exId, { [field]: value });
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
          {t("Workouts.blocks_title")}
        </h2>
        <button onClick={onAddBlock} className="btn-primary text-sm">
          {t("Workouts.btn_add_block")}
        </button>
      </div>

      {blocks.length === 0 && (
        <div className="card text-center py-10 text-sm text-ink-muted">
          {t("Workouts.blocks_hint")}
        </div>
      )}

      <div className="space-y-3">
        {blocks.map((block) => (
          <div key={block.id} className="card space-y-3">
            <div className="flex items-start gap-2">
              <input
                defaultValue={block.name}
                placeholder={t("Workouts.block_name_placeholder")}
                onBlur={(e) =>
                  e.target.value !== block.name &&
                  onUpdateBlock(block.id, { name: e.target.value })
                }
                className="input flex-1 font-semibold"
              />
              <button
                onClick={() => onDeleteBlock(block.id)}
                className="btn-danger inline-flex items-center justify-center text-sm"
                title={t("Workouts.btn_remove")}
                aria-label={t("Workouts.btn_remove")}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <textarea
              defaultValue={block.notes ?? ""}
              placeholder={t("Workouts.block_notes_placeholder")}
              onBlur={(e) =>
                e.target.value !== (block.notes ?? "") &&
                onUpdateBlock(block.id, { notes: e.target.value })
              }
              rows={1}
              className="input text-sm"
            />

            {block.workout_exercises.length > 0 && (
              <div className="space-y-2">
                {block.workout_exercises.map((we, idx) => {
                  const name = we.exercise?.name ?? we.custom_name ?? "—";
                  const ytId = we.exercise?.youtube_id ?? we.custom_youtube_id;
                  return (
                    <div
                      key={we.id}
                      className="rounded-lg border border-border bg-bg-surface p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-ink-dim">{idx + 1}.</span>
                            <span className="font-medium">{name}</span>
                            {we.exercise?.muscle_group && (
                              <span className="chip text-[10px]">
                                {we.exercise.muscle_group}
                              </span>
                            )}
                            {ytId && (
                              <a
                                href={`https://youtube.com/watch?v=${ytId}`}
                                target="_blank"
                                rel="noopener"
                                className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                              >
                                <PlayIcon className="h-3 w-3" />
                                vídeo
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveExercise(block.id, we.id)}
                          className="inline-flex items-center text-ink-dim hover:text-danger"
                          aria-label="Remover"
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                        <NumberField
                          label={t("Workouts.exercise_sets")}
                          value={we.sets}
                          onChange={(v) => {
                            onUpdateExercise(we.id, { sets: v });
                            onCommitExerciseField(we.id, "sets", v);
                          }}
                        />
                        <TextField
                          label={t("Workouts.exercise_reps")}
                          value={we.reps}
                          onChange={(v) => {
                            onUpdateExercise(we.id, { reps: v });
                            onCommitExerciseField(we.id, "reps", v);
                          }}
                        />
                        <TextField
                          label={t("Workouts.exercise_weight")}
                          value={we.weight ?? ""}
                          onChange={(v) => {
                            onUpdateExercise(we.id, { weight: v });
                            onCommitExerciseField(we.id, "weight", v);
                          }}
                        />
                        <NumberField
                          label={t("Workouts.exercise_rest")}
                          value={we.rest_seconds ?? 60}
                          onChange={(v) => {
                            onUpdateExercise(we.id, { rest_seconds: v });
                            onCommitExerciseField(we.id, "rest_seconds", v);
                          }}
                        />
                        <TextField
                          label={t("Workouts.exercise_tempo")}
                          value={we.tempo ?? ""}
                          onChange={(v) => {
                            onUpdateExercise(we.id, { tempo: v });
                            onCommitExerciseField(we.id, "tempo", v);
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setPickerForBlock(block.id)}
              className="btn-secondary text-sm w-full"
            >
              {t("Workouts.btn_add_exercise")}
            </button>
          </div>
        ))}
      </div>

      {pickerForBlock && (
        <ExercisePicker
          exercises={exerciseLibrary}
          onSelect={(exId) => onAddExercise(pickerForBlock, exId)}
          onClose={() => setPickerForBlock(null)}
        />
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-dim">
        {label}
      </div>
      <input
        type="number"
        defaultValue={value}
        onBlur={(e) => onChange(Number(e.target.value))}
        className="mt-0.5 w-full rounded-md border border-border bg-bg-elevated px-2 py-1 text-sm focus:border-accent focus:outline-none"
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-dim">
        {label}
      </div>
      <input
        type="text"
        defaultValue={value}
        onBlur={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded-md border border-border bg-bg-elevated px-2 py-1 text-sm focus:border-accent focus:outline-none"
      />
    </div>
  );
}

function ExercisePicker({
  exercises,
  onSelect,
  onClose,
}: {
  exercises: Exercise[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState<string>("");

  const muscles = Array.from(new Set(exercises.map((e) => e.muscle_group))).sort();

  const filtered = exercises.filter((e) => {
    const matchesSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscle_group.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !muscle || e.muscle_group === muscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {t("Workouts.exercise_picker_title")}
          </h3>
          <button
            onClick={onClose}
            className="inline-flex items-center text-ink-dim hover:text-ink"
            aria-label="Fechar"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 space-y-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Workouts.exercise_picker_search")}
            className="input"
            autoFocus
          />
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setMuscle("")}
              className={`rounded-full px-3 py-1 text-xs ${
                !muscle
                  ? "bg-accent text-black"
                  : "bg-bg-elevated text-ink-muted hover:text-ink"
              }`}
            >
              {t("Workouts.exercise_picker_filter_all")}
            </button>
            {muscles.map((m) => (
              <button
                key={m}
                onClick={() => setMuscle(m)}
                className={`rounded-full px-3 py-1 text-xs ${
                  muscle === m
                    ? "bg-accent text-black"
                    : "bg-bg-elevated text-ink-muted hover:text-ink"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-muted">
              {t("Workouts.exercise_picker_no_results")}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((ex) => (
                <li key={ex.id}>
                  <button
                    onClick={() => onSelect(ex.id)}
                    className="flex w-full items-center justify-between px-2 py-2.5 text-left hover:bg-bg-elevated"
                  >
                    <div>
                      <div className="font-medium">{ex.name}</div>
                      <div className="text-xs text-ink-dim">
                        {ex.muscle_group}
                        {ex.equipment && ` · ${ex.equipment}`}
                        {ex.level && ` · ${ex.level}`}
                      </div>
                    </div>
                    <span className="text-accent text-sm">+</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
