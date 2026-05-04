/**
 * Calculos de composicao corporal — protocolo Jackson & Pollock 7 dobras.
 *
 * Referencias:
 * - Jackson, A.S., Pollock, M.L. (1978). Generalized equations for predicting
 *   body density of men.
 * - Jackson, A.S., Pollock, M.L., Ward, A. (1980). Generalized equations for
 *   predicting body density of women.
 * - Conversao densidade -> %gordura: equacao de Siri (1961).
 *
 * Pontos de pele utilizados (7): peitoral, axilar media, triceps,
 * subescapular, abdominal, supra-iliaca, coxa.
 */

export type Sex = "M" | "F";

export type Skinfolds = {
  chest: number;
  axillary: number;
  tricep: number;
  subscapular: number;
  abdominal: number;
  suprailiac: number;
  thigh: number;
};

export type AssessmentInput = {
  sex: Sex;
  age: number;
  weight_kg: number;
  height_cm?: number;
  skinfolds: Skinfolds;
};

export type AssessmentResult = {
  sumOfFolds: number;
  bodyDensity: number;
  bodyFatPct: number;
  fatMassKg: number;
  leanMassKg: number;
  bmi: number | null;
};

function sumFolds(s: Skinfolds): number {
  return (
    s.chest + s.axillary + s.tricep + s.subscapular + s.abdominal + s.suprailiac + s.thigh
  );
}

function bodyDensityMen(sum: number, age: number): number {
  // Jackson & Pollock 1978
  return (
    1.112 -
    0.00043499 * sum +
    0.00000055 * sum * sum -
    0.00028826 * age
  );
}

function bodyDensityWomen(sum: number, age: number): number {
  // Jackson, Pollock & Ward 1980
  return (
    1.097 -
    0.00046971 * sum +
    0.00000056 * sum * sum -
    0.00012828 * age
  );
}

function siri(density: number): number {
  // Siri 1961 — % gordura = (495 / densidade) - 450
  return (495 / density) - 450;
}

export function calculateAssessment(input: AssessmentInput): AssessmentResult {
  const sum = sumFolds(input.skinfolds);
  const density =
    input.sex === "M"
      ? bodyDensityMen(sum, input.age)
      : bodyDensityWomen(sum, input.age);
  const fatPct = siri(density);
  const fatMass = (fatPct / 100) * input.weight_kg;
  const leanMass = input.weight_kg - fatMass;
  const bmi =
    input.height_cm && input.height_cm > 0
      ? input.weight_kg / Math.pow(input.height_cm / 100, 2)
      : null;
  return {
    sumOfFolds: round(sum, 1),
    bodyDensity: round(density, 5),
    bodyFatPct: round(fatPct, 2),
    fatMassKg: round(fatMass, 2),
    leanMassKg: round(leanMass, 2),
    bmi: bmi !== null ? round(bmi, 2) : null,
  };
}

function round(n: number, digits: number): number {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

export function classifyBodyFat(pct: number, sex: Sex): string {
  // Faixas referenciais ACSM (American College of Sports Medicine).
  if (sex === "M") {
    if (pct < 6) return "Essencial";
    if (pct < 14) return "Atletico";
    if (pct < 18) return "Bom";
    if (pct < 25) return "Aceitavel";
    return "Acima do recomendado";
  }
  if (pct < 14) return "Essencial";
  if (pct < 21) return "Atletico";
  if (pct < 25) return "Bom";
  if (pct < 32) return "Aceitavel";
  return "Acima do recomendado";
}

export function classifyBmi(bmi: number): string {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi < 25) return "Peso normal";
  if (bmi < 30) return "Sobrepeso";
  if (bmi < 35) return "Obesidade I";
  if (bmi < 40) return "Obesidade II";
  return "Obesidade III";
}
