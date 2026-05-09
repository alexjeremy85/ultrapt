"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export async function recordStudentPayment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const studentId = String(formData.get("student_id") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const referenceMonthRaw = String(formData.get("reference_month") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!studentId || !amountRaw || !referenceMonthRaw) {
    return { ok: false, error: "Preencha valor e mes de referencia" };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Valor deve ser maior que zero" };
  }
  if (amount > 100000) {
    return { ok: false, error: "Valor acima do limite permitido" };
  }

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("trainer_id", user.id)
    .maybeSingle();
  if (!student) return { ok: false, error: "Aluno nao encontrado" };

  const referenceMonth = referenceMonthRaw.length === 7
    ? `${referenceMonthRaw}-01`
    : referenceMonthRaw;

  const { error } = await supabase.from("student_payments").insert({
    student_id: studentId,
    trainer_id: user.id,
    amount,
    reference_month: referenceMonth,
    notes,
  });
  if (error) return { ok: false, error: error.message };

  await supabase
    .from("students")
    .update({ last_payment_at: new Date().toISOString() })
    .eq("id", studentId);

  revalidatePath(`/[locale]/dashboard/students/${studentId}`, "page");
  return { ok: true };
}

export async function assignWorkoutToStudent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const studentId = String(formData.get("student_id") ?? "");
  const workoutId = String(formData.get("workout_id") ?? "");
  const startDate = String(formData.get("start_date") ?? "");

  if (!studentId || !workoutId) {
    return { ok: false, error: "Selecione um treino" };
  }

  // Garante que ambos pertencem ao trainer
  const [{ data: student }, { data: workout }] = await Promise.all([
    supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .eq("trainer_id", user.id)
      .maybeSingle(),
    supabase
      .from("workouts")
      .select("id")
      .eq("id", workoutId)
      .eq("trainer_id", user.id)
      .maybeSingle(),
  ]);

  if (!student || !workout) {
    return { ok: false, error: "Recurso nao encontrado" };
  }

  const { error } = await supabase.from("workout_assignments").insert({
    workout_id: workoutId,
    student_id: studentId,
    start_date: startDate || new Date().toISOString().slice(0, 10),
    is_active: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Esse aluno ja tem esse treino atribuido." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/[locale]/dashboard", "layout");
  return { ok: true };
}

type WhatsAppExercise = {
  position: number;
  sets: number | null;
  reps: string | null;
  weight: string | null;
  rest_seconds: number | null;
  tempo: string | null;
  notes: string | null;
  custom_name: string | null;
  exercise: { name: string } | { name: string }[] | null;
};

type WhatsAppBlock = {
  id: string;
  name: string;
  position: number;
  notes: string | null;
  workout_exercises: WhatsAppExercise[];
};

function exerciseLabel(ex: WhatsAppExercise): string {
  if (ex.custom_name) return ex.custom_name;
  const e = Array.isArray(ex.exercise) ? ex.exercise[0] : ex.exercise;
  return e?.name ?? "Exercicio";
}

function formatExerciseLine(ex: WhatsAppExercise, idx: number): string {
  const parts: string[] = [];
  parts.push(`${idx + 1}. ${exerciseLabel(ex)}`);
  const cfg: string[] = [];
  if (ex.sets) cfg.push(`${ex.sets}x${ex.reps ?? "?"}`);
  else if (ex.reps) cfg.push(ex.reps);
  if (ex.weight) cfg.push(ex.weight);
  if (ex.rest_seconds) cfg.push(`${ex.rest_seconds}s descanso`);
  if (ex.tempo) cfg.push(`tempo ${ex.tempo}`);
  if (cfg.length > 0) parts.push(`   ${cfg.join(" - ")}`);
  if (ex.notes) parts.push(`   _${ex.notes}_`);
  return parts.join("\n");
}

export async function generateWorkoutWhatsAppMessage(assignmentId: string): Promise<
  { ok: true; message: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const { data: assignment } = await supabase
    .from("workout_assignments")
    .select(
      "id, student:students(id, full_name, access_code, trainer_id), workout:workouts(id, name, trainer_id, goal, level)"
    )
    .eq("id", assignmentId)
    .maybeSingle();

  type Joined = {
    id: string;
    student:
      | { id: string; full_name: string; access_code: string; trainer_id: string }
      | { id: string; full_name: string; access_code: string; trainer_id: string }[]
      | null;
    workout:
      | { id: string; name: string; trainer_id: string; goal: string | null; level: string | null }
      | { id: string; name: string; trainer_id: string; goal: string | null; level: string | null }[]
      | null;
  };

  const a = assignment as Joined | null;
  if (!a) return { ok: false, error: "Assignment nao encontrado" };

  const stu = Array.isArray(a.student) ? a.student[0] : a.student;
  const wk = Array.isArray(a.workout) ? a.workout[0] : a.workout;
  if (!stu || !wk) return { ok: false, error: "Dados incompletos" };
  if (stu.trainer_id !== user.id || wk.trainer_id !== user.id) {
    return { ok: false, error: "Sem permissao" };
  }

  const { data: blocks } = await supabase
    .from("workout_blocks")
    .select(
      "id, name, position, notes, workout_exercises(position, sets, reps, weight, rest_seconds, tempo, notes, custom_name, exercise:exercises(name))"
    )
    .eq("workout_id", wk.id)
    .order("position", { ascending: true });

  const blocksList = (blocks ?? []) as unknown as WhatsAppBlock[];

  const lines: string[] = [];
  lines.push(`*${wk.name}* — para ${stu.full_name}`);
  if (wk.goal || wk.level) {
    const meta = [wk.goal, wk.level].filter(Boolean).join(" - ");
    lines.push(`_${meta}_`);
  }
  lines.push("");

  for (const block of blocksList) {
    lines.push(`*${block.name}*`);
    const exs = (block.workout_exercises ?? []).slice().sort(
      (a, b) => a.position - b.position
    );
    exs.forEach((ex, idx) => {
      lines.push(formatExerciseLine(ex, idx));
    });
    if (block.notes) lines.push(`_Obs: ${block.notes}_`);
    lines.push("");
  }

  const link = `${getSiteUrl()}/aluno/${stu.access_code}`;
  lines.push(`Treino completo no app: ${link}`);
  lines.push("");
  lines.push("Marca aqui o que tu fez 👊");

  return { ok: true, message: lines.join("\n") };
}
