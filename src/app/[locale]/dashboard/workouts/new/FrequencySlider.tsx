"use client";

import { useState } from "react";

const labels = ["1x", "2x", "3x", "4x", "5x", "6x", "7x"];
const intensity = [
  "Leve",
  "Iniciante",
  "Equilibrado",
  "Constante",
  "Forte",
  "Atleta",
  "Diário",
];

export function FrequencySlider({ defaultValue = 3 }: { defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <label className="label flex items-center justify-between">
        <span>Frequência semanal</span>
        <span className="text-sm font-bold text-accent">
          {labels[value - 1]} / sem · {intensity[value - 1]}
        </span>
      </label>
      <input
        type="range"
        name="weekly_frequency"
        min="1"
        max="7"
        step="1"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-bg-elevated accent-accent"
      />
      <div className="mt-1 flex justify-between text-[10px] text-ink-dim">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}
