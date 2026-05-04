"use client";

import { useState, useTransition } from "react";
import { generateWorkoutWhatsAppMessage } from "./actions";

type Props = {
  assignmentId: string;
  phone: string | null;
  studentName: string;
};

export function WhatsAppWorkoutButton({ assignmentId, phone, studentName }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!phone) return null;

  function handleClick() {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    setError(null);
    startTransition(async () => {
      const res = await generateWorkoutWhatsAppMessage(assignmentId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const text = `Oi ${studentName}, segue teu treino:\n\n${res.message}`;
      const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="btn-secondary text-sm inline-flex items-center gap-1.5"
      >
        {pending ? "Gerando…" : "WhatsApp"}
      </button>
      {error && (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
