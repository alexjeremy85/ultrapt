"use client";

import { useState } from "react";
import { PlayIcon, CloseIcon } from "@/components/icons";

const TUTORIAL_VIDEO_ID = "dQw4w9WgXcQ";
const TUTORIAL_TITLE = "Tutorial: do zero ao primeiro PDF de treino";

export function TutorialCard({ dismissed }: { dismissed: boolean }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(dismissed);

  if (hidden) return null;

  return (
    <>
      <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-black transition active:scale-95 hover:bg-accent/90"
            aria-label="Ver tutorial"
          >
            <PlayIcon className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Tutorial
            </p>
            <h3 className="mt-0.5 text-sm font-bold">{TUTORIAL_TITLE}</h3>
            <p className="mt-1 text-xs text-ink-muted">
              Vídeo de 4 min mostrando o fluxo completo: cadastro → treino → envio.
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="font-semibold text-accent hover:underline"
              >
                Assistir →
              </button>
              <button
                type="button"
                onClick={() => setHidden(true)}
                className="text-ink-dim hover:text-ink"
              >
                Esconder
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white"
              aria-label="Fechar"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${TUTORIAL_VIDEO_ID}?autoplay=1`}
                title={TUTORIAL_TITLE}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
