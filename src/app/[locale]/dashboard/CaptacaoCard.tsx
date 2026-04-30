"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ExternalLinkIcon } from "@/components/icons";

export function CaptacaoCard({
  publicUrl,
  trainerSlug,
}: {
  publicUrl: string;
  trainerSlug: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  // WhatsApp deep link com mensagem pre-formatada
  const waMessage = `Oi! Aqui está minha página: ${publicUrl}

Você pode se cadastrar como meu aluno por aí. 💪`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  return (
    <section className="card">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
        Sua página de captação
      </h2>
      <p className="mt-1 text-xs text-ink-muted">
        Compartilhe pra captar novos alunos.
      </p>

      {/* URL legivel — quebra no slug se precisar */}
      <div className="mt-3 break-all rounded-lg bg-bg-surface px-3 py-2 text-xs text-accent">
        {publicUrl}
      </div>

      {/* Acoes em grid — 3 botoes iguais */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="btn-secondary justify-center text-xs"
        >
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener"
          className="btn-secondary justify-center text-xs"
        >
          WhatsApp
        </a>
        <Link
          href={`/pt/${trainerSlug}`}
          target="_blank"
          className="btn-secondary justify-center text-xs"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          Abrir
        </Link>
      </div>
    </section>
  );
}
