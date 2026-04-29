"use client";

import { useEffect, useState } from "react";
import { CloseIcon, SparkleIcon } from "@/components/icons";

/**
 * Banner one-time mostrado na primeira visita do aluno.
 * Usa localStorage por access_code (cada aluno tem seu próprio).
 * Some quando dispensado e não volta a aparecer.
 */
export function FirstVisitWelcome({
  studentCode,
  studentName,
  trainerName,
}: {
  studentCode: string;
  studentName: string;
  trainerName: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const key = `ultrapt:welcomed:${studentCode}`;
      const seen = window.localStorage.getItem(key);
      if (!seen) setShow(true);
    } catch {
      // localStorage indisponivel (modo privado, etc) — nao mostra pra evitar flash
    }
  }, [studentCode]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(
        `ultrapt:welcomed:${studentCode}`,
        new Date().toISOString()
      );
    } catch {
      // ignore
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mb-5 rounded-2xl border border-accent/40 bg-accent/5 p-4 shadow-glow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <SparkleIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold">
            Olá, {studentName}!
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            Seu personal <strong className="text-ink">{trainerName}</strong> te
            convidou pra usar este app de treino.{" "}
            <strong className="text-ink">
              Salve este link nos seus favoritos
            </strong>{" "}
            — é assim que você acessa seus treinos sempre que precisar.
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-3 text-xs font-semibold text-accent hover:underline"
          >
            Entendi, vamos começar
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-ink-dim hover:text-ink"
          aria-label="Fechar boas-vindas"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
