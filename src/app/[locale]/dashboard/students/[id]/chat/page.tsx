import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeftIcon } from "@/components/icons";
import { TrainerChatClient } from "./TrainerChatClient";
import { trainerLoadMessages } from "@/lib/chat";
import type { ChatMessage } from "@/lib/chat-types";

export default async function TrainerChatPage({
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
    .select("id, full_name, photo_url")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .maybeSingle();

  if (!student) notFound();

  const initialMessages: ChatMessage[] = await trainerLoadMessages(id);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href={`/dashboard/students/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-accent"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar pro aluno
      </Link>

      <h1 className="text-2xl font-bold">Conversa com {student.full_name}</h1>

      <TrainerChatClient
        studentId={student.id}
        studentName={student.full_name}
        studentPhoto={student.photo_url}
        initialMessages={initialMessages}
      />
    </div>
  );
}
