"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ChatMessage } from "@/lib/chat-types";

const MAX_LEN = 4000;

// ----- LADO TRAINER -------------------------------------------------------

export async function trainerSendMessage(
  studentId: string,
  content: string
): Promise<{ ok: true; message: ChatMessage } | { ok: false; reason: string }> {
  const text = content.trim();
  if (!text) return { ok: false, reason: "Mensagem vazia" };
  if (text.length > MAX_LEN) return { ok: false, reason: "Mensagem muito longa" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "Nao autenticado" };

  // Verifica que o aluno pertence ao PT (RLS ja faria, mas pego o trainer_id)
  const { data: student } = await supabase
    .from("students")
    .select("id, trainer_id")
    .eq("id", studentId)
    .eq("trainer_id", user.id)
    .maybeSingle();

  if (!student) return { ok: false, reason: "Aluno nao encontrado" };

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      trainer_id: user.id,
      student_id: studentId,
      sender_role: "trainer",
      content: text,
    })
    .select("*")
    .single();

  if (error) return { ok: false, reason: error.message };
  return { ok: true, message: data as ChatMessage };
}

export async function trainerLoadMessages(
  studentId: string
): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("trainer_id", user.id)
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });

  // Marca mensagens do aluno como lidas
  await supabase
    .from("chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("trainer_id", user.id)
    .eq("student_id", studentId)
    .eq("sender_role", "student")
    .is("read_at", null);

  return (data ?? []) as ChatMessage[];
}

// ----- LADO ALUNO ---------------------------------------------------------
// Usa admin client porque o aluno e anonimo (sem auth.uid).

async function resolveStudentByCode(accessCode: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("students")
    .select("id, trainer_id")
    .eq("access_code", accessCode)
    .maybeSingle();
  return data as { id: string; trainer_id: string } | null;
}

export async function studentSendMessage(
  accessCode: string,
  content: string
): Promise<{ ok: true; message: ChatMessage } | { ok: false; reason: string }> {
  const text = content.trim();
  if (!text) return { ok: false, reason: "Mensagem vazia" };
  if (text.length > MAX_LEN) return { ok: false, reason: "Mensagem muito longa" };

  const student = await resolveStudentByCode(accessCode);
  if (!student) return { ok: false, reason: "Codigo invalido" };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("chat_messages")
    .insert({
      trainer_id: student.trainer_id,
      student_id: student.id,
      sender_role: "student",
      content: text,
    })
    .select("*")
    .single();

  if (error) return { ok: false, reason: error.message };
  return { ok: true, message: data as ChatMessage };
}

export async function studentLoadMessages(
  accessCode: string
): Promise<ChatMessage[]> {
  const student = await resolveStudentByCode(accessCode);
  if (!student) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("chat_messages")
    .select("*")
    .eq("trainer_id", student.trainer_id)
    .eq("student_id", student.id)
    .order("created_at", { ascending: true });

  return (data ?? []) as ChatMessage[];
}
