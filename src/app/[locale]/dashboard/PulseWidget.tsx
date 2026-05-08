import { Link } from "@/i18n/navigation";
import { ChartIcon } from "@/components/icons";

type StudentPulse = {
  id: string;
  full_name: string;
  photo_url: string | null;
  lastActivityAt: string | null;
};

function timeAgo(iso: string | null): { label: string; tone: "green" | "yellow" | "red" } {
  if (!iso) return { label: "Sem atividade ainda", tone: "red" };
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return { label: "Hoje", tone: "green" };
  if (days === 1) return { label: "Ontem", tone: "green" };
  if (days < 4) return { label: `${days} dias atrás`, tone: "green" };
  if (days < 8) return { label: `${days} dias atrás`, tone: "yellow" };
  if (days < 15) return { label: `${days} dias atrás`, tone: "yellow" };
  return { label: `${days} dias atrás`, tone: "red" };
}

const toneClasses = {
  green: "text-success",
  yellow: "text-warning",
  red: "text-danger",
};

export function PulseWidget({ students }: { students: StudentPulse[] }) {
  if (students.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-dim">
        <ChartIcon className="h-3.5 w-3.5" />
        Pulso dos alunos
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {students.slice(0, 6).map((s) => {
          const ago = timeAgo(s.lastActivityAt);
          return (
            <Link
              key={s.id}
              href={`/dashboard/students/${s.id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-bg-card p-2.5 transition active:scale-[0.99] hover:border-accent/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-elevated">
                {s.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.photo_url}
                    alt={s.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-accent">
                    {s.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.full_name}</div>
                <div className={`text-xs font-medium ${toneClasses[ago.tone]}`}>
                  {ago.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
