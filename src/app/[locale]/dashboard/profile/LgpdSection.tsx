"use client";

import { useState, useTransition } from "react";
import { AlertIcon, FileTextIcon } from "@/components/icons";
import { exportMyData, deleteMyAccount } from "./lgpd-actions";

export function LgpdSection({ deleteError }: { deleteError: string | null }) {
  const [exporting, startExport] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleExport() {
    startExport(async () => {
      const res = await exportMyData();
      if (!res.ok) {
        alert(`Erro: ${res.error}`);
        return;
      }
      const blob = new Blob([res.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <section className="card space-y-5">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
          Dados e privacidade (LGPD)
        </h2>
        <p className="mt-1 text-xs text-ink-muted">
          Direitos do titular conforme Art. 18 da LGPD.
        </p>
      </div>

      <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FileTextIcon className="h-4 w-4 text-accent" />
            Exportar meus dados
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Baixa um arquivo JSON com todos os seus dados pessoais e dos seus
            alunos (perfil, alunos, anamneses, treinos, pagamentos).
            Portabilidade — Art. 18 V.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="btn-secondary shrink-0 text-sm"
        >
          {exporting ? "Gerando..." : "Exportar JSON"}
        </button>
      </div>

      <div className="rounded-lg border border-danger/30 bg-danger/5 p-3">
        <div className="flex items-start gap-2">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-danger">
              Excluir minha conta
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Anonimiza imediatamente seus dados pessoais e os dos seus alunos.
              Histórico fiscal de pagamentos é mantido por 5 anos (obrigação
              legal CTN). Ação <strong>irreversível</strong>.
            </p>

            {deleteError && (
              <p className="mt-2 text-xs text-danger">{deleteError}</p>
            )}

            {!confirmOpen ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10"
              >
                Excluir minha conta
              </button>
            ) : (
              <form action={deleteMyAccount} className="mt-3 space-y-2">
                <label className="block text-xs">
                  Pra confirmar, digite <code className="rounded bg-bg-elevated px-1 font-mono">EXCLUIR</code>:
                </label>
                <input
                  name="confirmation"
                  type="text"
                  required
                  autoComplete="off"
                  className="input w-full"
                  placeholder="EXCLUIR"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-danger px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                  >
                    Confirmar exclusão
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-dim">
        Para outros direitos (acesso, correção, revogação), contate{" "}
        <a
          href="mailto:privacidade@ultrapt.com.br"
          className="text-accent hover:underline"
        >
          privacidade@ultrapt.com.br
        </a>
        .
      </p>
    </section>
  );
}
