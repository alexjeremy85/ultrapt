"use client";

import { useState } from "react";

type Testimonial = {
  name: string;
  role?: string;
  text: string;
  rating?: number;
};

export function TestimonialsEditor({
  initial,
}: {
  initial: Testimonial[];
}) {
  const [items, setItems] = useState<Testimonial[]>(initial);

  const add = () => {
    if (items.length >= 6) return;
    setItems([...items, { name: "", text: "", rating: 5 }]);
  };

  const remove = (idx: number) =>
    setItems(items.filter((_, i) => i !== idx));

  const update = (idx: number, field: keyof Testimonial, value: string | number) =>
    setItems(items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name="testimonials"
        value={JSON.stringify(items.filter((t) => t.name && t.text))}
      />

      {items.length === 0 && (
        <p className="text-sm text-ink-muted">
          Nenhum depoimento adicionado.
        </p>
      )}

      {items.map((it, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-border bg-bg-surface p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
              Depoimento #{idx + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-xs text-danger hover:underline"
            >
              Remover
            </button>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            <input
              placeholder="Nome (ex.: Maria Silva)"
              value={it.name}
              onChange={(e) => update(idx, "name", e.target.value)}
              className="input"
            />
            <input
              placeholder="Cargo/situação (ex.: Mãe, 35 anos, perdeu 8kg)"
              value={it.role ?? ""}
              onChange={(e) => update(idx, "role", e.target.value)}
              className="input"
            />
          </div>
          <textarea
            placeholder="Depoimento... ex.: 'Em 3 meses transformei meu corpo. Acompanhamento incrível!'"
            value={it.text}
            onChange={(e) => update(idx, "text", e.target.value)}
            rows={2}
            className="input mt-2"
          />
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-ink-dim">Estrelas:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => update(idx, "rating", n)}
                className={`text-lg ${
                  (it.rating ?? 0) >= n ? "text-accent" : "text-ink-dim"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      ))}

      {items.length < 6 && (
        <button
          type="button"
          onClick={add}
          className="btn-secondary w-full text-sm"
        >
          + Adicionar depoimento
        </button>
      )}
    </div>
  );
}
