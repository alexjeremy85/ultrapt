"use client";

import { useState, useTransition } from "react";
import { CheckIcon, CloseIcon, UsersIcon } from "@/components/icons";
import { bulkAssignWorkout } from "./actions";

type Student = {
  id: string;
  full_name: string;
  hasThisWorkout: boolean;
};

export function BulkAssignButton({
  workoutId,
  students,
}: {
  workoutId: string;
  students: Student[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    if (selected.size === 0) return;
    startTransition(async () => {
      const res = await bulkAssignWorkout({
        workoutId,
        studentIds: Array.from(selected),
      });
      if (res.ok) {
        setResult(
          `✓ Treino atribuído a ${res.applied} aluno${
            res.applied === 1 ? "" : "s"
          }${res.skipped ? ` (${res.skipped} já tinham)` : ""}.`
        );
        setSelected(new Set());
        setTimeout(() => {
          setOpen(false);
          setResult(null);
        }, 1500);
      } else {
        setResult(`Erro: ${res.error}`);
      }
    });
  }

  const selectable = students.filter((s) => !s.hasThisWorkout);
  const allSelected = selectable.length > 0 && selectable.every((s) => selected.has(s.id));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary inline-flex items-center gap-1.5 text-sm"
      >
        <UsersIcon className="h-4 w-4" />
        Aplicar a vários alunos
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-bg-card shadow-2xl ring-1 ring-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-base font-bold">
                Atribuir treino a alunos
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-ink-dim hover:bg-bg-elevated"
                aria-label="Fechar"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {students.length === 0 ? (
                <p className="text-sm text-ink-muted">Nenhum aluno cadastrado.</p>
              ) : (
                <>
                  {selectable.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (allSelected) setSelected(new Set());
                        else setSelected(new Set(selectable.map((s) => s.id)));
                      }}
                      className="mb-2 text-xs font-medium text-accent hover:underline"
                    >
                      {allSelected ? "Desmarcar todos" : "Marcar todos"}
                    </button>
                  )}
                  <ul className="space-y-1">
                    {students.map((s) => (
                      <li key={s.id}>
                        <label
                          className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition ${
                            s.hasThisWorkout
                              ? "opacity-50"
                              : "hover:bg-bg-elevated"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(s.id)}
                            disabled={s.hasThisWorkout}
                            onChange={() => toggle(s.id)}
                            className="h-4 w-4 rounded border-border accent-accent"
                          />
                          <span className="flex-1 text-sm">{s.full_name}</span>
                          {s.hasThisWorkout && (
                            <span className="text-[10px] text-success">
                              já tem
                            </span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="border-t border-border p-4">
              {result && (
                <p
                  className={`mb-2 text-xs ${
                    result.startsWith("Erro") ? "text-danger" : "text-success"
                  }`}
                >
                  {result}
                </p>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={pending || selected.size === 0}
                className="btn-primary inline-flex w-full items-center justify-center gap-1.5"
              >
                <CheckIcon className="h-4 w-4" />
                {pending
                  ? "Aplicando..."
                  : `Atribuir a ${selected.size} aluno${
                      selected.size === 1 ? "" : "s"
                    }`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
