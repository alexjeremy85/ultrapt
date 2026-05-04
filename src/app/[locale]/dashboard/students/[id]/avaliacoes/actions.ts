"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  calculateAssessment,
  type Sex,
  type Skinfolds,
} from "@/lib/assessment";

function num(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).replace(",", ".").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function numRequired(v: FormDataEntryValue | null): number | null {
  return num(v);
}

export async function createAssessment(
  studentId: string,
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { data: student } = await supabase
    .from("students")
    .select("id, trainer_id")
    .eq("id", studentId)
    .eq("trainer_id", user.id)
    .maybeSingle();
  if (!student) return { ok: false, error: "Aluno nao encontrado" };

  const sexRaw = String(formData.get("sex") ?? "");
  const sex: Sex | null = sexRaw === "M" || sexRaw === "F" ? sexRaw : null;
  const age = numRequired(formData.get("age"));
  const weight = numRequired(formData.get("weight_kg"));
  const height = num(formData.get("height_cm"));

  const folds: Skinfolds = {
    chest: numRequired(formData.get("skinfold_chest")) ?? 0,
    axillary: numRequired(formData.get("skinfold_axillary")) ?? 0,
    tricep: numRequired(formData.get("skinfold_tricep")) ?? 0,
    subscapular: numRequired(formData.get("skinfold_subscapular")) ?? 0,
    abdominal: numRequired(formData.get("skinfold_abdominal")) ?? 0,
    suprailiac: numRequired(formData.get("skinfold_suprailiac")) ?? 0,
    thigh: numRequired(formData.get("skinfold_thigh")) ?? 0,
  };

  const requiredFolds = Object.values(folds).every((v) => v > 0);
  if (!sex || !age || !weight || !requiredFolds) {
    return { ok: false, error: "Preencha sexo, idade, peso e as 7 dobras." };
  }

  const result = calculateAssessment({
    sex,
    age,
    weight_kg: weight,
    height_cm: height ?? undefined,
    skinfolds: folds,
  });

  const dateStr = String(formData.get("assessment_date") ?? "").trim();
  const date = dateStr || new Date().toISOString().slice(0, 10);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { data, error } = await supabase
    .from("student_assessments")
    .insert({
      student_id: studentId,
      trainer_id: user.id,
      assessment_date: date,
      sex,
      age,
      weight_kg: weight,
      height_cm: height,
      skinfold_chest: folds.chest,
      skinfold_axillary: folds.axillary,
      skinfold_tricep: folds.tricep,
      skinfold_subscapular: folds.subscapular,
      skinfold_abdominal: folds.abdominal,
      skinfold_suprailiac: folds.suprailiac,
      skinfold_thigh: folds.thigh,
      body_density: result.bodyDensity,
      body_fat_pct: result.bodyFatPct,
      fat_mass_kg: result.fatMassKg,
      lean_mass_kg: result.leanMassKg,
      bmi: result.bmi,
      circumference_chest: num(formData.get("circumference_chest")),
      circumference_waist: num(formData.get("circumference_waist")),
      circumference_hip: num(formData.get("circumference_hip")),
      circumference_arm_right: num(formData.get("circumference_arm_right")),
      circumference_arm_left: num(formData.get("circumference_arm_left")),
      circumference_thigh_right: num(formData.get("circumference_thigh_right")),
      circumference_thigh_left: num(formData.get("circumference_thigh_left")),
      circumference_calf_right: num(formData.get("circumference_calf_right")),
      circumference_calf_left: num(formData.get("circumference_calf_left")),
      notes,
      protocol: "pollock_7",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/[locale]/dashboard/students/${studentId}`, "page");
  return { ok: true, id: data.id };
}

export async function deleteAssessment(
  assessmentId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { error } = await supabase
    .from("student_assessments")
    .delete()
    .eq("id", assessmentId)
    .eq("trainer_id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
