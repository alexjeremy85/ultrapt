"use client";

import { useState } from "react";
import { HIGHLIGHT_ICONS, HighlightIcon } from "@/lib/highlight-icons";

type Highlight = {
  icon?: string;
  title: string;
  description?: string;
};

export function HighlightsEditor({ initial }: { initial: Highlight[] }) {
  const [items, setItems] = useState<Highlight[]>(initial);

  const add = () => {
    if (items.length >= 6) return;
    setItems([...items, { icon: "dumbbell", title: "", description: "" }]);
  };

  const remove = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const update = (idx: number, field: keyof Highlight, value: string) =>
    setItems(items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name="highlights"
        value={JSON.stringify(items.filter((h) => h.title))}
      />

      {items.length === 0 && (
        <p className="text-sm text-ink-muted">
          Nenhum diferencial adicionado. Ex.: &quot;Acompanhamento personalizado&quot;,
          &quot;Avaliação a cada 3 meses&quot;...
        </p>
      )}

      {items.map((it, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-border bg-bg-surface p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
              Diferencial #{idx + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-xs text-danger hover:underline"
            >
              Remover
            </button>
          </div>

          <div className="mt-3">
            <span className="text-xs text-ink-dim">Ícone</span>
            <div className="mt-1.5 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
              {HIGHLIGHT_ICONS.map(({ name, label }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => update(idx, "icon", name)}
                  title={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                    it.icon === name
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border bg-bg-card text-ink-muted hover:border-border-strong hover:text-ink"
                  }`}
                >
                  <HighlightIcon name={name} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <input
            placeholder="Título (ex.: Treino renovado a cada 4 semanas)"
            value={it.title}
            onChange={(e) => update(idx, "title", e.target.value)}
            className="input mt-3"
          />
          <input
            placeholder="Descrição opcional (ex.: Periodização científica)"
            value={it.description ?? ""}
            onChange={(e) => update(idx, "description", e.target.value)}
            className="input mt-2"
          />
        </div>
      ))}

      {items.length < 6 && (
        <button
          type="button"
          onClick={add}
          className="btn-secondary w-full text-sm"
        >
          + Adicionar diferencial
        </button>
      )}
    </div>
  );
}
