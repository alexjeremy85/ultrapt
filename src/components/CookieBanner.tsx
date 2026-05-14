"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "ultrapt_cookie_consent_v1";

type Choice = "accepted" | "rejected";

function readChoice(): Choice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "rejected") return v;
    return null;
  } catch {
    return null;
  }
}

function writeChoice(choice: Choice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // ignore — usuario com storage bloqueado vera o banner sempre. Aceitavel.
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Aparece somente se ainda nao tem escolha registrada.
    if (readChoice() === null) {
      // Pequeno delay pra nao competir com o load inicial
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    writeChoice("accepted");
    setVisible(false);
    // Hoje nao temos cookies de tracking. Quando integrar GA/Pixel/etc,
    // checar readChoice() === "accepted" antes de carregar o script.
  }

  function reject() {
    writeChoice("rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg-card/95 px-4 py-4 backdrop-blur-sm shadow-2xl"
      role="dialog"
      aria-label="Aviso de cookies"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="flex-1 text-xs text-ink-muted sm:text-sm">
          Usamos cookies <strong className="text-ink">essenciais</strong> pra
          autenticação e funcionamento do app (sempre ativos). Você pode
          autorizar cookies <strong className="text-ink">analíticos</strong>{" "}
          opcionais que nos ajudam a melhorar o produto. Sua escolha pode ser
          revogada a qualquer momento.{" "}
          <Link
            href="/privacidade"
            className="text-accent hover:underline"
          >
            Saiba mais
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={reject}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink-muted transition hover:text-ink"
          >
            Só essenciais
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-accent px-3 py-2 text-xs font-bold text-black transition hover:opacity-90"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}
