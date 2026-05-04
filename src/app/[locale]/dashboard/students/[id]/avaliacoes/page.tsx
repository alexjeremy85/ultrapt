import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeftIcon } from "@/components/icons";
import { classifyBodyFat, classifyBmi, type Sex } from "@/lib/assessment";
import { NewAssessmentForm } from "./NewAssessmentForm";
import { DeleteAssessmentButton } from "./DeleteAssessmentButton";

type Assessment = {
  id: string;
  assessment_date: string;
  sex: Sex | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
  fat_mass_kg: number | null;
  lean_mass_kg: number | null;
  bmi: number | null;
  notes: string | null;
};

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

function diff(a: number | null, b: number | null): string {
  if (a === null || b === null) return "—";
  const d = a - b;
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(2)}`;
}

export default async function StudentAssessmentsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .maybeSingle();
  if (!student) notFound();

  const { data: list } = await supabase
    .from("student_assessments")
    .select(
      "id, assessment_date, sex, age, weight_kg, height_cm, body_fat_pct, fat_mass_kg, lean_mass_kg, bmi, notes"
    )
    .eq("student_id", id)
    .order("assessment_date", { ascending: false });

  const assessments = (list ?? []) as Assessment[];
  const latest = assessments[0];
  const previous = assessments[1];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/dashboard/students/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-accent"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar pra ficha do aluno
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Avaliações físicas</h1>
        <p className="text-sm text-ink-muted">
          {student.full_name} — protocolo Pollock 7 dobras
        </p>
      </div>

      {latest && (
        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
            Última avaliação
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Data" value={fmtDate(latest.assessment_date)} />
            <Stat
              label="% Gordura"
              value={
                latest.body_fat_pct !== null
                  ? `${latest.body_fat_pct.toFixed(2)}%`
                  : "—"
              }
              hint={
                latest.sex && latest.body_fat_pct !== null
                  ? classifyBodyFat(latest.body_fat_pct, latest.sex)
                  : null
              }
            />
            <Stat
              label="Massa magra"
              value={
                latest.lean_mass_kg !== null
                  ? `${latest.lean_mass_kg.toFixed(2)} kg`
                  : "—"
              }
            />
            <Stat
              label="IMC"
              value={latest.bmi !== null ? latest.bmi.toFixed(2) : "—"}
              hint={latest.bmi !== null ? classifyBmi(latest.bmi) : null}
            />
          </div>

          {previous && (
            <div className="mt-5 border-t border-border pt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
                Comparativo com {fmtDate(previous.assessment_date)}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <DiffPill
                  label="Peso"
                  value={diff(latest.weight_kg, previous.weight_kg)}
                  unit="kg"
                  good="down"
                />
                <DiffPill
                  label="% Gordura"
                  value={diff(latest.body_fat_pct, previous.body_fat_pct)}
                  unit="%"
                  good="down"
                />
                <DiffPill
                  label="Massa magra"
                  value={diff(latest.lean_mass_kg, previous.lean_mass_kg)}
                  unit="kg"
                  good="up"
                />
                <DiffPill
                  label="Massa gorda"
                  value={diff(latest.fat_mass_kg, previous.fat_mass_kg)}
                  unit="kg"
                  good="down"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Link
              href={`/dashboard/students/${id}/avaliacoes/${latest.id}/imprimir`}
              target="_blank"
              className="btn-secondary text-sm"
            >
              Baixar PDF
            </Link>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
          Nova avaliação
        </h2>
        <p className="mt-1 text-xs text-ink-muted">
          Cálculo automático via fórmula Jackson &amp; Pollock + Siri.
        </p>
        <div className="mt-4">
          <NewAssessmentForm studentId={id} />
        </div>
      </div>

      {assessments.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
            Histórico
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-ink-muted">
                <tr>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Peso</th>
                  <th className="text-left p-2">% Gord.</th>
                  <th className="text-left p-2">Magra</th>
                  <th className="text-left p-2">IMC</th>
                  <th className="text-right p-2"></th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="p-2">{fmtDate(a.assessment_date)}</td>
                    <td className="p-2">
                      {a.weight_kg !== null ? `${a.weight_kg} kg` : "—"}
                    </td>
                    <td className="p-2">
                      {a.body_fat_pct !== null
                        ? `${a.body_fat_pct.toFixed(1)}%`
                        : "—"}
                    </td>
                    <td className="p-2">
                      {a.lean_mass_kg !== null
                        ? `${a.lean_mass_kg.toFixed(1)} kg`
                        : "—"}
                    </td>
                    <td className="p-2">
                      {a.bmi !== null ? a.bmi.toFixed(1) : "—"}
                    </td>
                    <td className="p-2 text-right">
                      <div className="inline-flex gap-1">
                        <Link
                          href={`/dashboard/students/${id}/avaliacoes/${a.id}/imprimir`}
                          target="_blank"
                          className="btn-ghost text-xs"
                        >
                          PDF
                        </Link>
                        <DeleteAssessmentButton assessmentId={a.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface px-3 py-2">
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      {hint && <div className="text-[10px] text-ink-dim">{hint}</div>}
    </div>
  );
}

function DiffPill({
  label,
  value,
  unit,
  good,
}: {
  label: string;
  value: string;
  unit: string;
  good: "up" | "down";
}) {
  let cls = "text-ink-dim";
  if (value.startsWith("+")) cls = good === "up" ? "text-success" : "text-warning";
  else if (value.startsWith("-")) cls = good === "down" ? "text-success" : "text-warning";
  return (
    <div className="rounded-lg border border-border bg-bg-surface px-3 py-2">
      <div className="text-xs text-ink-muted">{label}</div>
      <div className={`text-sm font-bold ${cls}`}>
        {value} {unit}
      </div>
    </div>
  );
}
