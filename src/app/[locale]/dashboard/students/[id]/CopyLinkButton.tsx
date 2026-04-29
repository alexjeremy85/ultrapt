"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("[copy-link] clipboard write failed", e);
      // Fallback: seleciona o texto pra usuario copiar manual
      window.prompt("Copie o link abaixo:", link);
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      className="btn-secondary inline-flex items-center gap-1.5 text-sm"
      aria-label="Copiar link do aluno"
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4" /> Copiado
        </>
      ) : (
        <>
          <CopyIcon className="h-4 w-4" /> Copiar link
        </>
      )}
    </button>
  );
}
