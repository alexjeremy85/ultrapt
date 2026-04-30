"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  HomeIcon,
  UsersIcon,
  DumbbellIcon,
  BadgeIcon,
} from "@/components/icons";

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badgeKey?: "students";
};

const items: Item[] = [
  { href: "/dashboard", label: "Início", icon: <HomeIcon className="h-5 w-5" /> },
  {
    href: "/dashboard/students",
    label: "Alunos",
    icon: <UsersIcon className="h-5 w-5" />,
    badgeKey: "students",
  },
  { href: "/dashboard/workouts", label: "Treinos", icon: <DumbbellIcon className="h-5 w-5" /> },
  { href: "/dashboard/profile", label: "Perfil", icon: <BadgeIcon className="h-5 w-5" /> },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileBottomNav({
  unreadStudents = 0,
}: {
  unreadStudents?: number;
}) {
  const pathname = usePathname();

  function getBadge(key: Item["badgeKey"]): number {
    if (key === "students") return unreadStudents;
    return 0;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-surface/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegação principal"
    >
      <ul className="flex items-stretch justify-around">
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          const badge = getBadge(it.badgeKey);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-[9px] font-medium transition ${
                  active ? "text-accent" : "text-ink-dim hover:text-ink"
                }`}
              >
                <span
                  className={`relative flex h-5 w-5 items-center justify-center ${
                    active ? "" : "opacity-80"
                  }`}
                >
                  {it.icon}
                  {badge > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-black">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
