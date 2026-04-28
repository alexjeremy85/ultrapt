"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/chat-types";

type Props = {
  initialMessages: ChatMessage[];
  myRole: "trainer" | "student";
  myLabel: string;
  otherLabel: string;
  otherPhoto: string | null;
  onLoadMessages: () => Promise<ChatMessage[]>;
  onSendMessage: (
    content: string
  ) => Promise<{ ok: true; message: ChatMessage } | { ok: false; reason: string }>;
};

const POLL_MS = 6000;

export function ChatThread({
  initialMessages,
  myRole,
  myLabel,
  otherLabel,
  otherPhoto,
  onLoadMessages,
  onSendMessage,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Polling
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const fresh = await onLoadMessages();
        setMessages((prev) => {
          if (fresh.length === prev.length) return prev;
          if (
            fresh.length > 0 &&
            prev.length > 0 &&
            fresh[fresh.length - 1].id === prev[prev.length - 1].id
          ) {
            return prev;
          }
          return fresh;
        });
      } catch {
        // silencioso
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [onLoadMessages]);

  // Auto-scroll pra ultima mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    setText("");
    // Otimista
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      trainer_id: "",
      student_id: "",
      sender_role: myRole,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((m) => [...m, optimistic]);

    try {
      const res = await onSendMessage(content);
      if (!res.ok) {
        setError(res.reason);
        setMessages((m) => m.filter((x) => x.id !== optimistic.id));
        setText(content);
      } else {
        setMessages((m) =>
          m.map((x) => (x.id === optimistic.id ? res.message : x))
        );
      }
    } catch {
      setError("Falha ao enviar");
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setText(content);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[70vh] min-h-[500px] flex-col rounded-xl border border-border bg-bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-bg-elevated">
          {otherPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={otherPhoto}
              alt={otherLabel}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-accent">
              {otherLabel.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="font-semibold">{otherLabel}</div>
          <div className="text-xs text-ink-dim">Conversa direta</div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="text-3xl">💬</div>
            <p className="mt-2 text-sm text-ink-muted">
              Nenhuma mensagem ainda. Diga oi!
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_role === myRole;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    mine
                      ? "bg-accent text-black"
                      : "bg-bg-surface text-ink"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {m.content}
                  </div>
                  <div
                    className={`mt-1 text-[10px] ${mine ? "text-black/60" : "text-ink-dim"}`}
                  >
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 border-t border-border px-3 py-3"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as unknown as React.FormEvent);
            }
          }}
          rows={1}
          placeholder={`Mensagem para ${otherLabel}...`}
          className="input max-h-32 resize-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="btn-primary shrink-0"
        >
          {sending ? "..." : "Enviar"}
        </button>
      </form>
      {error && <p className="px-4 pb-2 text-xs text-danger">{error}</p>}
      <p className="px-4 pb-3 text-[10px] text-ink-dim">
        Você está conectado como <strong>{myLabel}</strong>. Atualiza a cada {POLL_MS / 1000}s.
      </p>
    </div>
  );
}
