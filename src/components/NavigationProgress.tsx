"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Barra de progresso fininha no topo durante navegacao client.
 *
 * Detecta tap em <a> que muda de rota e mostra a barra animada ate
 * a navegacao terminar (pathname ou searchParams mudarem). Sem
 * dependencia externa.
 *
 * Nao afeta forms server-side (que usam <form action>): pra esses,
 * usar useFormStatus + SubmitButton.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }

  // Comeca: vai pra 80% rapido, depois fica esperando
  function start() {
    clearTimers();
    setVisible(true);
    setProgress(15);
    timersRef.current.push(
      setTimeout(() => setProgress(45), 100),
      setTimeout(() => setProgress(75), 350),
      setTimeout(() => setProgress(85), 800)
    );
  }

  // Termina: pula pra 100%, fade out
  function complete() {
    clearTimers();
    setProgress(100);
    timersRef.current.push(
      setTimeout(() => setVisible(false), 200),
      setTimeout(() => setProgress(0), 400)
    );
  }

  // Quando pathname/searchParams mudam, navegacao terminou
  useEffect(() => {
    if (visible) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Intercepta cliques em links pra disparar start
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;
      // Ignora links externos, _blank, com download, ou modificadores
      if (
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
      ) {
        return;
      }
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      try {
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }
      start();
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }}
    >
      <div
        className="h-full bg-accent"
        style={{
          width: `${progress}%`,
          transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 0 8px rgba(255, 107, 0, 0.6)",
        }}
      />
    </div>
  );
}
