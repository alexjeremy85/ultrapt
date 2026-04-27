import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="min-h-screen bg-bg">
      {/* Background grid + glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hype text-black">
              ⚡
            </span>
            <span>Ultra PT</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/login" className="btn-ghost">
              {t("Landing.nav_login")}
            </Link>
            <Link href="/signup" className="btn-primary">
              {t("Landing.nav_signup")}
            </Link>
          </nav>
        </header>

        <section className="relative mt-24 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Para personais que querem escalar
            </div>

            <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
              Trate seus alunos como{" "}
              <span className="bg-gradient-hype bg-clip-text text-transparent">
                clientes premium.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-ink-muted">
              {t("Landing.subtitle")}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/signup" className="btn-primary text-base shadow-glow">
                {t("Landing.cta_signup")} →
              </Link>
              <Link href="/login" className="btn-secondary text-base">
                {t("Landing.cta_login")}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat value="14d" label="grátis" />
              <Stat value="0%" label="taxa setup" />
              <Stat value="∞" label="alunos" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -m-4 rounded-2xl bg-gradient-hype opacity-30 blur-2xl" />
            <div className="relative space-y-3 rounded-2xl border border-border bg-bg-card p-6 shadow-2xl">
              <FeatureRow icon="📋" title="Anamnese inteligente" sub="PAR-Q + objetivos automáticos" />
              <FeatureRow icon="💪" title="Workout builder" sub="Biblioteca com 80+ exercícios em vídeo" />
              <FeatureRow icon="📱" title="App do aluno" sub="Cronômetro, registro de cargas, histórico" />
              <FeatureRow icon="📈" title="Dashboard de receita" sub="MRR, alunos ativos, inadimplência" />
              <FeatureRow icon="🌎" title="Multi-idioma" sub="Português, inglês, espanhol" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card p-3 text-center">
      <div className="text-2xl font-black text-accent">{value}</div>
      <div className="text-xs uppercase tracking-wider text-ink-dim">{label}</div>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-bg-surface p-4 transition hover:border-accent/40">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated text-xl">
        {icon}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-ink-muted">{sub}</div>
      </div>
    </div>
  );
}
