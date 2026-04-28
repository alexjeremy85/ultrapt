"use client";

import { ChatThread } from "@/components/ChatThread";
import { trainerLoadMessages, trainerSendMessage } from "@/lib/chat";
import type { ChatMessage } from "@/lib/chat-types";

export function TrainerChatClient({
  studentId,
  studentName,
  studentPhoto,
  initialMessages,
}: {
  studentId: string;
  studentName: string;
  studentPhoto: string | null;
  initialMessages: ChatMessage[];
}) {
  return (
    <ChatThread
      initialMessages={initialMessages}
      myRole="trainer"
      myLabel="Personal"
      otherLabel={studentName}
      otherPhoto={studentPhoto}
      onLoadMessages={() => trainerLoadMessages(studentId)}
      onSendMessage={(content) => trainerSendMessage(studentId, content)}
    />
  );
}
