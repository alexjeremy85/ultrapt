"use client";

import { useRef, useState } from "react";
import { classifyBodyFat, classifyBmi, type Sex } from "@/lib/assessment";

type Assessment = {
  id: string;
  assessment_date: string;
  sex: Sex | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  skinfold_chest: number | null;
  skinfold_axillary: number | null;
  skinfold_tricep: number | null;
  skinfold_subscapular: number | null;
  skinfold_abdominal: number | null;
  skinfold_suprailiac: number | null;
  skinfold_thigh: number | null;
  body_density: number | null;
  body_fat_pct: number | null;
  fat_mass_kg: number | null;
  lean_mass_kg: number | null;
  bmi: number | null;
  circumference_chest: number | null;
  circumference_waist: number | null;
  circumference_hip: number | null;
  circumference_arm_right: number | null;
  circumference_arm_left: number | null;
  circumference_thigh_right: number | null;
  circumference_thigh_left: number | null;
  circumference_calf_right: number | null;
  circumference_calf_left: number | null;
  notes: string | null;
};

type Student = { id: string; full_name: string };
type Trainer = { full_name: string | null; cref: string | null; phone: string | null } | null;

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function AssessmentPdfClient({
  assessment,
  student,
  trainer,
}: {
  assessment: Assessment;
  student: Student;
  trainer: Trainer;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  async function downloadPdf() {
    if (!ref.current || generating) return;
    setGenerating(true);
    setProgress("Renderizando…");
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      setProgress("Capturando layout…");
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      setProgress("Montando PDF…");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

      let heightRendered = 0;
      let position = margin;
      pdf.addImage(dataUrl, "JPEG", margin, position, usableWidth, imgHeight);
      heightRendered = pageHeight - margin * 2;
      while (imgHeight - heightRendered > 0) {
        pdf.addPage();
        position = margin - heightRendered;
        pdf.addImage(dataUrl, "JPEG", margin, position, usableWidth, imgHeight);
        heightRendered += pageHeight - margin * 2;
      }
      const filename = `Avaliacao-${slug(student.full_name)}-${assessment.assessment_date}.pdf`;
      pdf.save(filename);
      setProgress(null);
    } catch (e) {
      console.error("[assessment-pdf] geracao falhou", e);
      setProgress("Erro ao gerar PDF.");
      setTimeout(() => setProgress(null), 3000);
    } finally {
      setGenerating(false);
    }
  }

  const fatClass =
    assessment.sex && assessment.body_fat_pct !== null
      ? classifyBodyFat(assessment.body_fat_pct, assessment.sex)
      : null;
  const bmiClass = assessment.bmi !== null ? classifyBmi(assessment.bmi) : null;

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex items-center justify-between gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-ghost text-sm"
          >
            ← Voltar
          </button>
          <div className="flex items-center gap-2">
            {progress && <span className="text-xs text-ink-muted">{progress}</span>}
            <button
              type="button"
              onClick={downloadPdf}
              disabled={generating}
              className="btn-primary text-sm"
            >
              {generating ? "Gerando…" : "Baixar PDF"}
            </button>
          </div>
        </div>

        <div
          ref={ref}
          className="rounded-lg bg-white p-8 text-black"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          <header className="mb-6 border-b-2 border-gray-300 pb-4">
            <h1 className="text-2xl font-bold">Avaliação Física</h1>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Aluno:</strong> {student.full_name}
              </div>
              <div className="text-right">
                <strong>Data:</strong> {fmtDate(assessment.assessment_date)}
              </div>
              {trainer?.full_name && (
                <div className="col-span-2 text-xs text-gray-600">
                  Avaliado por <strong>{trainer.full_name}</strong>
                  {trainer.cref ? ` — CREF ${trainer.cref}` : ""}
                </div>
              )}
            </div>
          </header>

          <section className="mb-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-600">
              Dados gerais
            </h2>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <Cell label="Sexo" value={assessment.sex === "M" ? "Masculino" : assessment.sex === "F" ? "Feminino" : "—"} />
              <Cell label="Idade" value={assessment.age !== null ? `${assessment.age} anos` : "—"} />
              <Cell label="Peso" value={assessment.weight_kg !== null ? `${assessment.weight_kg} kg` : "—"} />
              <Cell label="Altura" value={assessment.height_cm !== null ? `${assessment.height_cm} cm` : "—"} />
            </div>
          </section>

          <section className="mb-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-600">
              Composição corporal — Pollock 7 dobras
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded border border-gray-200 p-3">
                <div className="text-xs text-gray-500">Percentual de gordura</div>
                <div className="text-2xl font-bold">
                  {assessment.body_fat_pct !== null
                    ? `${assessment.body_fat_pct.toFixed(2)}%`
                    : "—"}
                </div>
                {fatClass && <div className="text-xs text-gray-600">{fatClass}</div>}
              </div>
              <div className="rounded border border-gray-200 p-3">
                <div className="text-xs text-gray-500">IMC</div>
                <div className="text-2xl font-bold">
                  {assessment.bmi !== null ? assessment.bmi.toFixed(2) : "—"}
                </div>
                {bmiClass && <div className="text-xs text-gray-600">{bmiClass}</div>}
              </div>
              <div className="rounded border border-gray-200 p-3">
                <div className="text-xs text-gray-500">Massa magra</div>
                <div className="text-xl font-bold">
                  {assessment.lean_mass_kg !== null
                    ? `${assessment.lean_mass_kg.toFixed(2)} kg`
                    : "—"}
                </div>
              </div>
              <div className="rounded border border-gray-200 p-3">
                <div className="text-xs text-gray-500">Massa gorda</div>
                <div className="text-xl font-bold">
                  {assessment.fat_mass_kg !== null
                    ? `${assessment.fat_mass_kg.toFixed(2)} kg`
                    : "—"}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-600">
              Dobras cutâneas (mm)
            </h2>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <Cell label="Peitoral" value={assessment.skinfold_chest} unit="mm" />
              <Cell label="Axilar média" value={assessment.skinfold_axillary} unit="mm" />
              <Cell label="Tríceps" value={assessment.skinfold_tricep} unit="mm" />
              <Cell label="Subescapular" value={assessment.skinfold_subscapular} unit="mm" />
              <Cell label="Abdominal" value={assessment.skinfold_abdominal} unit="mm" />
              <Cell label="Supra-ilíaca" value={assessment.skinfold_suprailiac} unit="mm" />
              <Cell label="Coxa" value={assessment.skinfold_thigh} unit="mm" />
              <Cell
                label="Densidade"
                value={
                  assessment.body_density !== null
                    ? assessment.body_density.toFixed(5)
                    : "—"
                }
              />
            </div>
          </section>

          {hasAnyCircumference(assessment) && (
            <section className="mb-5">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-600">
                Perímetros (cm)
              </h2>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <Cell label="Tórax" value={assessment.circumference_chest} unit="cm" />
                <Cell label="Cintura" value={assessment.circumference_waist} unit="cm" />
                <Cell label="Quadril" value={assessment.circumference_hip} unit="cm" />
                <Cell label="Braço D" value={assessment.circumference_arm_right} unit="cm" />
                <Cell label="Braço E" value={assessment.circumference_arm_left} unit="cm" />
                <Cell label="Coxa D" value={assessment.circumference_thigh_right} unit="cm" />
                <Cell label="Coxa E" value={assessment.circumference_thigh_left} unit="cm" />
                <Cell label="Pant. D" value={assessment.circumference_calf_right} unit="cm" />
                <Cell label="Pant. E" value={assessment.circumference_calf_left} unit="cm" />
              </div>
            </section>
          )}

          {assessment.notes && (
            <section className="mb-5">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-600">
                Observações
              </h2>
              <p className="text-sm whitespace-pre-wrap">{assessment.notes}</p>
            </section>
          )}

          <footer className="mt-8 border-t border-gray-200 pt-3 text-xs text-gray-500">
            <p>
              Protocolo Jackson &amp; Pollock (1978/1980) — 7 dobras cutâneas. Conversão
              de densidade para % de gordura via equação de Siri (1961).
            </p>
            <p className="mt-1">UltraPT — ultrapt.com.br</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
}) {
  const display = value === null || value === undefined || value === "" ? "—" : String(value);
  return (
    <div className="rounded border border-gray-200 p-2">
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className="font-semibold">
        {display}
        {unit && display !== "—" ? ` ${unit}` : ""}
      </div>
    </div>
  );
}

function hasAnyCircumference(a: Assessment): boolean {
  return [
    a.circumference_chest,
    a.circumference_waist,
    a.circumference_hip,
    a.circumference_arm_right,
    a.circumference_arm_left,
    a.circumference_thigh_right,
    a.circumference_thigh_left,
    a.circumference_calf_right,
    a.circumference_calf_left,
  ].some((v) => v !== null && v !== undefined);
}
