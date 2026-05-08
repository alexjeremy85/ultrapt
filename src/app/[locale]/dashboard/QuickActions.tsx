import { Link } from "@/i18n/navigation";
import {
  UsersIcon,
  DumbbellIcon,
  ClipboardIcon,
  FileTextIcon,
  CardIcon,
  WhatsappIcon,
} from "@/components/icons";

const COMMUNITY_URL = "https://chat.whatsapp.com/FsQw0JB5y4u4iajsAyIUjJ?mode=gi_t";

type Action = {
  href: string;
  external?: boolean;
  label: string;
  icon: React.ReactNode;
};

const actions: Action[] = [
  {
    href: "/dashboard/students",
    label: "Alunos",
    icon: <UsersIcon className="h-5 w-5" />,
  },
  {
    href: "/dashboard/workouts",
    label: "Treinos",
    icon: <DumbbellIcon className="h-5 w-5" />,
  },
  {
    href: "/dashboard/students?tab=avaliacoes",
    label: "Avaliações",
    icon: <ClipboardIcon className="h-5 w-5" />,
  },
  {
    href: "/dashboard/profile",
    label: "Arquivos",
    icon: <FileTextIcon className="h-5 w-5" />,
  },
  {
    href: "/dashboard/billing",
    label: "Financeiro",
    icon: <CardIcon className="h-5 w-5" />,
  },
  {
    href: COMMUNITY_URL,
    external: true,
    label: "Comunidade",
    icon: <WhatsappIcon className="h-5 w-5" />,
  },
];

export function QuickActions() {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
        Quadro de ações
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {actions.map((a) => {
          const className =
            "flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-bg-card p-3 text-xs font-medium text-ink-muted transition active:scale-[0.97] hover:border-accent/40 hover:text-ink";
          const inner = (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                {a.icon}
              </span>
              <span>{a.label}</span>
            </>
          );
          if (a.external) {
            return (
              <a
                key={a.label}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {inner}
              </a>
            );
          }
          return (
            <Link key={a.label} href={a.href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
