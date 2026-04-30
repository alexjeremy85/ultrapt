"use client";

import { useState } from "react";
import { studentLogin } from "./student-login-action";

export function StudentLoginButton({
  trainerSlug,
  className,
  label,
}: {
  trainerSlug: string;
  className?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pasteOk, setPasteOk] = useState(false);

  async function onPaste() {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text.trim());
      setError(null);
      setPasteOk(true);
      setTimeout(() => setPasteOk(false), 1500);
    } catch {
      setError("Não consegui acessar o clipboard. Cole manualmente.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (trimmed.length < 16) {
      setError("Código incompleto. Cole o código completo que seu personal mandou.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await studentLogin(trainerSlug, trimmed);
      if (!res.ok) {
        setError(res.reason);
        setSubmitting(false);
        return;
      }
      window.location.href = res.redirect;
    } catch {
      setError("Não foi possível validar agora. Tente de novo.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold">Já sou aluno</h2>
            <p className="mt-1 text-sm text-slate-600">
              Cole abaixo o código de acesso que seu personal compartilhou com você.
            </p>

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError(null);
                    }}
                    placeholder="Cole o código aqui"
                    className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono text-slate-900 outline-none focus:border-slate-500"
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={64}
                  />
                  <button
                    type="button"
                    onClick={onPaste}
                    className="shrink-0 rounded-md border border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {pasteOk ? "✓ Colado" : "Colar"}
                  </button>
                </div>
                {code.length > 0 && code.length < 16 && (
                  <p className="mt-1 text-xs text-amber-700">
                    O código completo tem 32 caracteres. Você digitou {code.length}.
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !code.trim()}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Validando..." : "Entrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
