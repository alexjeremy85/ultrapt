"use client";

import { useRef, useState } from "react";
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

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

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
  const accent = ensureReadableOnLight(trainer.accent_color);
  const accentText = contrastingTextColor(accent);
  const contentRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);

  async function downloadPdf() {
    if (!contentRef.current || generating) return;
    setGenerating(true);
    setProgressMsg("Renderizando…");

    try {
      // Lazy load das libs pra nao inflar bundle dos outros routes.
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      setProgressMsg("Capturando layout…");
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // resolucao alta
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      setProgressMsg("Montando PDF…");
      // A4 paisagem: 297 x 210 mm
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 8;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

      // Primeira pagina
      let heightRendered = 0;
      let position = margin;
      pdf.addImage(dataUrl, "JPEG", margin, position, usableWidth, imgHeight);
      heightRendered = pageHeight - margin * 2;

      // Paginas adicionais (auto)
      while (imgHeight - heightRendered > 0) {
        pdf.addPage();
        position = margin - heightRendered;
        pdf.addImage(dataUrl, "JPEG", margin, position, usableWidth, imgHeight);
        heightRendered += pageHeight - margin * 2;
      }

      const filename = `Treino-${slugify(student.full_name)}-${slugify(workout.name)}.pdf`;
      pdf.save(filename);

      setProgressMsg(null);
    } catch (e) {
      console.error("[pdf] geracao falhou", e);
      setProgressMsg("Erro ao gerar PDF. Tente de novo.");
      setTimeout(() => setProgressMsg(null), 3000);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Toolbar superior */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {generating ? (
              <span className="text-slate-700">{progressMsg}</span>
            ) : (
              <>Pré-visualização · A4 paisagem</>
            )}
          </p>
          <button
            onClick={downloadPdf}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
            style={{ background: accent, color: accentText }}
          >
            {generating ? (
              <Spinner />
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            {generating ? "Gerando..." : "Baixar PDF"}
          </button>
        </div>
      </div>

      {/* Wrapper que vira o PDF — fundo branco fixo */}
      <div className="mx-auto max-w-5xl p-4">
        <div
          ref={contentRef}
          className="bg-white p-8 text-slate-900 shadow-lg"
          style={{ minHeight: "210mm" }}
        >
          {/* Cabecalho */}
          <header
            className="rounded-2xl p-6"
            style={{ background: accent, color: accentText }}
          >
            <div className="flex items-center gap-5">
              {trainer.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trainer.photo_url}
                  alt=""
                  crossOrigin="anonymous"
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
          <section className="mt-6 grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-xl border border-slate-200 p-4">
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
                      crossOrigin="anonymous"
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
            <section
              className="mt-4 rounded-xl border-l-4 bg-slate-50 p-4 text-sm text-slate-700"
              style={{ borderColor: accent }}
            >
              {workout.description}
            </section>
          )}

          {/* Blocos */}
          <section className="mt-8 space-y-8">
            {blocks.map((block) => (
              <div key={block.id}>
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
                      <th
                        className="border-b-2 py-2 pr-2"
                        style={{ borderColor: accent }}
                      >
                        #
                      </th>
                      <th
                        className="border-b-2 py-2 pr-2"
                        style={{ borderColor: accent }}
                      >
                        Exercício
                      </th>
                      <th
                        className="border-b-2 py-2 pr-2 text-center"
                        style={{ borderColor: accent }}
                      >
                        Séries
                      </th>
                      <th
                        className="border-b-2 py-2 pr-2 text-center"
                        style={{ borderColor: accent }}
                      >
                        Reps
                      </th>
                      <th
                        className="border-b-2 py-2 pr-2 text-center"
                        style={{ borderColor: accent }}
                      >
                        Carga
                      </th>
                      <th
                        className="border-b-2 py-2 pr-2 text-center"
                        style={{ borderColor: accent }}
                      >
                        Descanso
                      </th>
                      <th
                        className="border-b-2 py-2 pr-2 text-center"
                        style={{ borderColor: accent }}
                      >
                        Tempo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.workout_exercises.map((ex, idx) => (
                      <tr
                        key={ex.id}
                        className="border-b border-slate-200 align-top"
                      >
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
          <footer
            className="mt-12 border-t-2 pt-4 text-xs text-slate-500"
            style={{ borderColor: accent }}
          >
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
              Plano gerado em {new Date().toLocaleDateString("pt-BR")} · Ultra
              Personal Trainer
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
