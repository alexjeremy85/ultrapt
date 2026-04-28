"use client";

import { ChatThread } from "@/components/ChatThread";
import { studentLoadMessages, studentSendMessage } from "@/lib/chat";
import type { ChatMessage } from "@/lib/chat-types";

export function StudentChatClient({
  accessCode,
  trainerName,
  trainerPhoto,
  initialMessages,
}: {
  accessCode: string;
  trainerName: string;
  trainerPhoto: string | null;
  initialMessages: ChatMessage[];
}) {
  return (
    <ChatThread
      initialMessages={initialMessages}
      myRole="student"
      myLabel="Aluno"
      otherLabel={trainerName}
      otherPhoto={trainerPhoto}
      onLoadMessages={() => studentLoadMessages(accessCode)}
      onSendMessage={(content) => studentSendMessage(accessCode, content)}
    />
  );
}
