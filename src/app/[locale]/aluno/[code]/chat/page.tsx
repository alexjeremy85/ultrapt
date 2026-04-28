import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { studentLoadMessages } from "@/lib/chat";
import type { ChatMessage } from "@/lib/chat-types";
import { StudentChatClient } from "./StudentChatClient";

export default async function StudentChatPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);

  const supabase = createAdminClient();

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, trainer:trainers(full_name, photo_url)"
    )
    .eq("access_code", code)
    .maybeSingle();

  if (!student) notFound();

  const trainer = student.trainer as unknown as {
    full_name: string;
    photo_url: string | null;
  };

  const initialMessages: ChatMessage[] = await studentLoadMessages(code);

  return (
    <main className="min-h-screen bg-bg pb-20">
      <header className="border-b border-border bg-bg-surface px-5 py-4">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/aluno/${code}`}
            className="text-sm text-ink-muted hover:text-accent"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-6">
        <h1 className="mb-4 text-xl font-bold">
          Conversa com {trainer.full_name}
        </h1>
        <StudentChatClient
          accessCode={code}
          trainerName={trainer.full_name}
          trainerPhoto={trainer.photo_url}
          initialMessages={initialMessages}
        />
      </div>
    </main>
  );
}
