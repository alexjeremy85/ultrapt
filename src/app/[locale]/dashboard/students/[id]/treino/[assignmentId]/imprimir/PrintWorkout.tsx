"use client";

import { useEffect } from "react";
import { ensureReadableOnLight, contrastingTextColor } from "@/lib/colorContrast";

type Trainer = {
  full_name: string;
  photo_url: string | null;
  accent_color: string;
  cref: string | null;
  whatsapp_phone: string | null;
  instagram_handle: string | null;
};

type Student = {
  full_name: string;
  photo_url: string | null;
  objective: string | null;
  experience_level: string | null;
};

type Workout = {
  name: string;
  description: string | null;
  goal: string | null;
  level: string | null;
  duration_weeks: number | null;
};

type Exercise = {
  id: string;
  position: number;
  sets: number;
  reps: string;
  weight: string | null;
  rest_seconds: number | null;
  tempo: string | null;
  notes: string | null;
  display_name: string;
  muscle_group: string | null;
};

type Block = {
  id: string;
  position: number;
  name: string;
  notes: string | null;
  workout_exercises: Exercise[];
};

export function PrintWorkout({
  trainer,
  student,
  workout,
  blocks,
}: {
  trainer: Trainer;
  student: Student;
  workout: Workout;
  blocks: Block[];
}) {
  // Versao visivel = fundo claro (PDF imprimivel). Ajusta o accent pra
  // contrastar com fundo branco.
  const accent = ensureReadableOnLight(trainer.accent_color);
  const accentText = contrastingTextColor(accent);

  useEffect(() => {
    // Auto-abre o dialogo de impressao do navegador 600ms apos carregar.
    // Usuario salva como PDF.
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 print:bg-white">
      {/* Toolbar visivel apenas na tela */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-3 shadow-sm print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Use <kbd className="rounded border px-1.5 py-0.5 text-xs">Ctrl/Cmd + P</kbd>{" "}
            e escolha <strong>Salvar como PDF</strong>.
          </p>
          <button
            onClick={() => window.print()}
            className="rounded-md px-4 py-2 text-sm font-semibold"
            style={{ background: accent, color: accentText }}
          >
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-10 print:px-6 print:py-6">
        {/* Cabecalho */}
        <header
          className="rounded-2xl p-6 text-white print:rounded-lg"
          style={{ background: accent, color: accentText }}
        >
          <div className="flex items-center gap-5">
            {trainer.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={trainer.photo_url}
                alt=""
                className="h-20 w-20 rounded-full border-4 border-white/40 object-cover"
              />
            )}
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">
                Plano de treino
              </div>
              <h1 className="mt-1 text-3xl font-black tracking-tight">
                {workout.name}
              </h1>
              <div className="mt-1 text-sm opacity-90">
                Por <strong>{trainer.full_name}</strong>
                {trainer.cref && <span> · CREF {trainer.cref}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Aluno + meta */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4 md:col-span-2">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Aluno
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100">
                {student.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.photo_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-lg font-bold"
                    style={{ color: accent }}
                  >
                    {student.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="text-lg font-bold">{student.full_name}</div>
                <div className="text-sm text-slate-600">
                  {student.objective && <span>{student.objective}</span>}
                  {student.experience_level && (
                    <span> · Nível: {student.experience_level}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Detalhes
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {workout.goal && (
                <li>
                  <strong>Objetivo:</strong> {workout.goal}
                </li>
              )}
              {workout.level && (
                <li>
                  <strong>Nível:</strong> {workout.level}
                </li>
              )}
              {workout.duration_weeks && (
                <li>
                  <strong>Duração:</strong> {workout.duration_weeks} semanas
                </li>
              )}
            </ul>
          </div>
        </section>

        {workout.description && (
          <section className="mt-4 rounded-xl border-l-4 bg-slate-50 p-4 text-sm text-slate-700"
            style={{ borderColor: accent }}
          >
            {workout.description}
          </section>
        )}

        {/* Blocos */}
        <section className="mt-8 space-y-8">
          {blocks.map((block) => (
            <div key={block.id} className="break-inside-avoid">
              <h2
                className="rounded-lg px-4 py-2 text-lg font-black uppercase tracking-wide"
                style={{ background: `${accent}1a`, color: accent }}
              >
                {block.position}. {block.name}
              </h2>
              {block.notes && (
                <p className="mt-2 text-sm italic text-slate-600">
                  {block.notes}
                </p>
              )}
              <table className="mt-3 w-full border-collapse text-sm">
                <thead>
                  <tr
                    className="text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: accent }}
                  >
                    <th className="border-b-2 py-2 pr-2" style={{ borderColor: accent }}>
                      #
                    </th>
                    <th className="border-b-2 py-2 pr-2" style={{ borderColor: accent }}>
                      Exercício
                    </th>
                    <th className="border-b-2 py-2 pr-2 text-center" style={{ borderColor: accent }}>
                      Séries
                    </th>
                    <th className="border-b-2 py-2 pr-2 text-center" style={{ borderColor: accent }}>
                      Reps
                    </th>
                    <th className="border-b-2 py-2 pr-2 text-center" style={{ borderColor: accent }}>
                      Carga
                    </th>
                    <th className="border-b-2 py-2 pr-2 text-center" style={{ borderColor: accent }}>
                      Descanso
                    </th>
                    <th className="border-b-2 py-2 pr-2 text-center" style={{ borderColor: accent }}>
                      Tempo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {block.workout_exercises.map((ex, idx) => (
                    <tr key={ex.id} className="border-b border-slate-200 align-top">
                      <td className="py-2 pr-2 font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 pr-2">
                        <div className="font-semibold">{ex.display_name}</div>
                        {ex.muscle_group && (
                          <div className="text-xs text-slate-500">
                            {ex.muscle_group}
                          </div>
                        )}
                        {ex.notes && (
                          <div className="mt-1 text-xs italic text-slate-600">
                            {ex.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-2 pr-2 text-center font-bold">
                        {ex.sets}
                      </td>
                      <td className="py-2 pr-2 text-center font-bold">
                        {ex.reps}
                      </td>
                      <td className="py-2 pr-2 text-center">
                        {ex.weight ?? "—"}
                      </td>
                      <td className="py-2 pr-2 text-center">
                        {ex.rest_seconds ? `${ex.rest_seconds}s` : "—"}
                      </td>
                      <td className="py-2 pr-2 text-center">
                        {ex.tempo ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>

        {/* Rodape */}
        <footer className="mt-12 border-t-2 pt-4 text-xs text-slate-500" style={{ borderColor: accent }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong>{trainer.full_name}</strong>
              {trainer.cref && <span> · CREF {trainer.cref}</span>}
            </div>
            <div className="flex flex-wrap gap-3">
              {trainer.whatsapp_phone && (
                <span>WhatsApp: {trainer.whatsapp_phone}</span>
              )}
              {trainer.instagram_handle && (
                <span>@{trainer.instagram_handle}</span>
              )}
            </div>
          </div>
          <div className="mt-2 text-center text-[10px] text-slate-400">
            Plano gerado em {new Date().toLocaleDateString("pt-BR")} · Ultra Personal Trainer
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.2cm;
          }
          html,
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
