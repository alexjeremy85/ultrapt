"use client";

import { useRef, useState, useTransition } from "react";
import { CopyIcon, FileTextIcon, CloseIcon, CheckIcon } from "@/components/icons";
import { uploadFile, deleteFile } from "./actions";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadFile(fd);
      if (res?.error) setError(res.error);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <label className="block">
        <input
          ref={inputRef}
          type="file"
          onChange={onChange}
          disabled={pending}
          className="hidden"
        />
        <span
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-accent/40 bg-accent/5 px-4 py-6 text-sm font-medium text-accent transition hover:border-accent/70 ${
            pending ? "opacity-60" : ""
          }`}
        >
          <FileTextIcon className="h-5 w-5" />
          {pending ? "Subindo arquivo..." : "Subir novo arquivo (max 25MB)"}
        </span>
      </label>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function FileRow({
  id,
  filename,
  mimeType,
  sizeBytes,
  publicUrl,
  createdAt,
}: {
  id: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number | null;
  publicUrl: string;
  createdAt: string;
}) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function copy() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function remove() {
    if (!confirm(`Excluir "${filename}"?`)) return;
    startTransition(() => {
      deleteFile(id).catch(() => {});
    });
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-bg-card p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <FileTextIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-sm font-medium hover:text-accent"
        >
          {filename}
        </a>
        <p className="text-xs text-ink-dim">
          {formatSize(sizeBytes)}{" "}
          {mimeType ? `· ${mimeType.split("/")[1]?.toUpperCase()}` : ""} ·{" "}
          {new Date(createdAt).toLocaleDateString("pt-BR")}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-ink-muted transition hover:border-accent/40 hover:text-ink"
      >
        {copied ? (
          <>
            <CheckIcon className="h-3.5 w-3.5 text-success" /> Copiado
          </>
        ) : (
          <>
            <CopyIcon className="h-3.5 w-3.5" /> Copiar link
          </>
        )}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="rounded-lg p-1.5 text-ink-dim transition hover:bg-danger/10 hover:text-danger"
        aria-label="Excluir"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </li>
  );
}
