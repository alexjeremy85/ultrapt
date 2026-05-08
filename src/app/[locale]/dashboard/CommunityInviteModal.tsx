"use client";

import { useState, useTransition } from "react";
import { CheckIcon, WhatsappIcon } from "@/components/icons";
import { markCommunityInviteSeen } from "./community-invite-actions";

const COMMUNITY_URL = "https://chat.whatsapp.com/FsQw0JB5y4u4iajsAyIUjJ?mode=gi_t";

export function CommunityInviteModal({ open: initialOpen }: { open: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [pending, startTransition] = useTransition();

  if (!open) return null;

  function dismiss() {
    setOpen(false);
    startTransition(() => {
      markCommunityInviteSeen().catch(() => {});
    });
  }

  function joinCommunity() {
    window.open(COMMUNITY_URL, "_blank", "noopener,noreferrer");
    dismiss();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-bg-card p-6 shadow-2xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          <WhatsappIcon className="h-3.5 w-3.5" />
          Comunidade
        </div>

        <h2 className="text-xl font-bold leading-tight">
          Comunidade UltraPT
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          O ponto de encontro dos personal trainers que estão crescendo no online.
          Estratégias do que está funcionando, bastidores do mercado e atualizações
          do app em primeira mão.
        </p>

        <ul className="mt-4 space-y-2.5 text-sm">
          <li className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>Estratégias de captação e impulsionamento testadas</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>Network direto com outros PTs profissionais</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>Novidades e funções novas do UltraPT antes de todo mundo</span>
          </li>
        </ul>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={joinCommunity}
            disabled={pending}
            className="btn-primary inline-flex w-full items-center justify-center gap-2"
          >
            <WhatsappIcon className="h-4 w-4" />
            Entrar na comunidade
          </button>
          <button
            type="button"
            onClick={dismiss}
            disabled={pending}
            className="w-full rounded-lg px-4 py-2 text-sm text-ink-dim transition hover:text-ink"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
