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
};

const items: Item[] = [
  { href: "/dashboard", label: "Início", icon: <HomeIcon className="h-5 w-5" /> },
  { href: "/dashboard/students", label: "Alunos", icon: <UsersIcon className="h-5 w-5" /> },
  { href: "/dashboard/workouts", label: "Treinos", icon: <DumbbellIcon className="h-5 w-5" /> },
  { href: "/dashboard/profile", label: "Perfil", icon: <BadgeIcon className="h-5 w-5" /> },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-surface/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegação principal"
    >
      <ul className="flex items-stretch justify-around">
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2.5 text-[10px] font-medium transition ${
                  active ? "text-accent" : "text-ink-dim hover:text-ink"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center ${
                    active ? "" : "opacity-80"
                  }`}
                >
                  {it.icon}
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
