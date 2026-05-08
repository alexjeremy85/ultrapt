"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { BellIcon } from "@/components/icons-bell";
import { markNotificationsRead } from "./notifications-actions";

type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsBell({
  notifications,
}: {
  notifications: Notification[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  function toggle() {
    if (!open && unreadCount > 0) {
      const ids = notifications.filter((n) => !n.read_at).map((n) => n.id);
      startTransition(() => {
        markNotificationsRead(ids).catch(() => {});
      });
    }
    setOpen((v) => !v);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative rounded-lg p-2 text-ink-muted transition hover:bg-bg-elevated hover:text-ink"
        aria-label="Notificações"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40"
            aria-label="Fechar"
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-bg-card shadow-2xl">
            <div className="border-b border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
                Notificações
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-ink-dim">
                  Nada por aqui ainda.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((n) => {
                    const Item = (
                      <div className="p-3 transition hover:bg-bg-elevated">
                        <div className="flex items-start gap-2">
                          {!n.read_at && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{n.title}</p>
                            {n.body && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">
                                {n.body}
                              </p>
                            )}
                            <p className="mt-1 text-[10px] text-ink-dim">
                              {new Date(n.created_at).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                    return (
                      <li key={n.id}>
                        {n.link ? (
                          <Link href={n.link} onClick={() => setOpen(false)}>
                            {Item}
                          </Link>
                        ) : (
                          Item
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
