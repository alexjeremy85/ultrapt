"use client";

import { useFormStatus } from "react-dom";

/**
 * Botao de submit com spinner automatico durante a server action.
 *
 * Detecta pending por dois caminhos:
 *  1. `useFormStatus()` — funciona em <form action={serverAction}>
 *  2. prop `pending` explicita — pra forms que usam startTransition
 *     manual ou actions client-side
 */
export function SubmitButton({
  children,
  pendingText,
  pending: pendingProp,
  className = "btn-primary",
  disabled,
  ...rest
}: {
  children: React.ReactNode;
  pendingText?: string;
  pending?: boolean;
  className?: string;
  disabled?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled">) {
  const { pending: formPending } = useFormStatus();
  const pending = pendingProp ?? formPending;
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`${className} ${pending ? "opacity-80" : ""} disabled:cursor-not-allowed`}
      {...rest}
    >
      {pending && <Spinner />}
      <span>{pending && pendingText ? pendingText : children}</span>
    </button>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
