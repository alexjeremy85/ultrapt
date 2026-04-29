import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PLANS, type PlanId } from "@/lib/plans";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="min-h-screen bg-bg text-ink">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-6xl px-6 py-6">
        <Header
          loginLabel={t("Landing.nav_login")}
          signupLabel={t("Landing.nav_signup")}
        />

        <Hero
          ctaSignup={t("Landing.cta_signup")}
          ctaLogin={t("Landing.cta_login")}
        />

        <WhiteLabelSection />

        <HowItWorks />

        <BeforeAfter />

        <FeaturesGrid />

        <Pricing />

        <FinalCta ctaSignup={t("Landing.cta_signup")} />

        <Footer />
      </div>
    </main>
  );
}

/* =====================================================================
 * Sections
 * =================================================================== */

function Header({
  loginLabel,
  signupLabel,
}: {
  loginLabel: string;
  signupLabel: string;
}) {
  return (
    <header className="flex items-center justify-between">
      <Link
        href="/"
        className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
      >
        <Logomark />
        <span>Ultra PT</span>
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/login" className="btn-ghost">
          {loginLabel}
        </Link>
        <Link href="/signup" className="btn-primary">
          {signupLabel}
        </Link>
      </nav>
    </header>
  );
}

function Hero({
  ctaSignup,
  ctaLogin,
}: {
  ctaSignup: string;
  ctaLogin: string;
}) {
  return (
    <section className="relative mt-20 grid grid-cols-1 gap-16 lg:mt-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Para personais que querem escalar
        </div>

        <h1 className="mt-7 text-5xl font-black leading-[1.02] tracking-tight md:text-[64px]">
          Trate seus alunos como{" "}
          <span className="bg-gradient-hype bg-clip-text text-transparent">
            clientes premium.
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-xl font-semibold leading-snug text-ink">
          Eles entram no app{" "}
          <span className="text-accent">do João</span>, não no nosso.
        </p>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
          Capte alunos, faça anamneses, prescreva treinos e cobre
          mensalidades automaticamente.{" "}
          <strong className="text-ink">Tudo num só lugar.</strong>
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary text-base shadow-glow-sm">
            {ctaSignup}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/login" className="btn-secondary text-base">
            {ctaLogin}
          </Link>
        </div>

        <ul className="mt-9 grid grid-cols-1 gap-2 text-sm text-ink-muted sm:grid-cols-2 max-w-md">
          <li className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-accent" />
            14 dias grátis sem cartão
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-accent" />
            Cobrança automática Pix
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-accent" />
            Sem taxa de setup
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-accent" />
            Cancela quando quiser
          </li>
        </ul>
      </div>

      <ProductMockup />
    </section>
  );
}

function ProductMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-gradient-hype opacity-20 blur-3xl" />

      {/* Tela: Pagina publica do PT */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-bg-card shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-border bg-bg-surface px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-bg-elevated" />
          <span className="h-2.5 w-2.5 rounded-full bg-bg-elevated" />
          <span className="h-2.5 w-2.5 rounded-full bg-bg-elevated" />
          <div className="ml-3 flex-1 truncate rounded-md bg-bg px-3 py-1 text-[11px] text-ink-dim">
            ultrapt.com.br/pt/<span className="text-accent">joao-silva</span>
          </div>
        </div>

        {/* Conteudo da pagina publica */}
        <div className="bg-gradient-to-b from-accent/15 via-bg-card to-bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-hype text-2xl font-black text-black">
              JS
            </div>
            <div className="min-w-0">
              <div className="text-xl font-bold leading-tight">
                João Silva
              </div>
              <div className="mt-0.5 text-xs text-ink-muted">
                Personal Trainer · CREF 0123-G/SP
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-dim">
                <PinIcon className="h-3 w-3" />
                São Paulo · SP
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Treino personalizado em casa, na academia ou ao ar livre.
            Foco em emagrecimento e ganho de massa.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Pill>Hipertrofia</Pill>
            <Pill>Cardio</Pill>
            <Pill>Mobilidade</Pill>
          </div>

          <button
            disabled
            className="mt-5 w-full rounded-lg bg-gradient-hype px-4 py-3 text-sm font-bold text-black"
          >
            Quero treinar com o João
          </button>
        </div>
      </div>

      {/* Card flutuante: app do aluno */}
      <div className="absolute -bottom-8 -right-4 hidden w-56 rotate-[3deg] overflow-hidden rounded-xl border border-border bg-bg-card p-3 shadow-2xl sm:block">
        <div className="flex items-center justify-between text-[10px] text-ink-dim">
          <span>App do aluno</span>
          <span className="rounded bg-success/20 px-1.5 py-0.5 text-success">
            Ativo
          </span>
        </div>
        <div className="mt-2 text-sm font-bold">Treino A · Inferiores</div>
        <div className="mt-3 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-ink-muted">Agachamento livre</span>
            <span className="text-ink-dim">4×8</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Leg press 45°</span>
            <span className="text-ink-dim">4×10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Stiff</span>
            <span className="text-ink-dim">3×12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Cadeira flexora</span>
            <span className="text-ink-dim">3×15</span>
          </div>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-bg-elevated">
          <div className="h-full w-1/2 bg-accent" />
        </div>
      </div>
    </div>
  );
}

function WhiteLabelSection() {
  return (
    <section className="mt-32 lg:mt-40">
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>Sua marca, sempre</SectionEyebrow>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          O aluno conhece <em className="not-italic text-accent">você</em>,
          não a plataforma.
        </h2>
        <p className="mt-5 text-lg text-ink-muted">
          Uma URL com seu nome, sua foto, sua cidade, suas especialidades.
          O Ultra PT roda silenciosamente nos bastidores enquanto o aluno
          vive a sua marca.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ValueCard
          icon={<LinkIcon className="h-5 w-5" />}
          title="URL personalizada"
          desc="ultrapt.com.br/pt/seu-nome — fácil de compartilhar no Instagram, WhatsApp e redes."
        />
        <ValueCard
          icon={<UserIcon className="h-5 w-5" />}
          title="Sua identidade"
          desc="Foto, nome, CREF, cidade e especialidades aparecem antes de qualquer marca nossa."
        />
        <ValueCard
          icon={<MessageIcon className="h-5 w-5" />}
          title="Contato direto"
          desc="WhatsApp e Instagram aparecem na página. O lead fala com você, não com suporte."
        />
        <ValueCard
          icon={<ShieldIcon className="h-5 w-5" />}
          title="Você é dono dos dados"
          desc="Seus alunos, suas anamneses, seus treinos. Saída sem amarras a qualquer momento."
        />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mt-32 lg:mt-40">
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>Em 10 minutos</SectionEyebrow>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Comece a captar hoje.
        </h2>
      </div>

      <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Step
          n="01"
          title="Crie sua conta"
          desc="Preencha nome, CREF, cidade e suba sua foto. Sua URL pública nasce no mesmo passo."
        />
        <Step
          n="02"
          title="Compartilhe o link"
          desc="Coloque ultrapt.com.br/pt/seu-nome na bio do Instagram, WhatsApp e e-mail. Captação 24h."
        />
        <Step
          n="03"
          title="Receba, treine, cobre"
          desc="Cada lead vira aluno: anamnese automática, treino prescrito, cobrança Pix mensal."
        />
      </ol>
    </section>
  );
}

function FeaturesGrid() {
  return (
    <section className="mt-32 lg:mt-40">
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>Por que vale</SectionEyebrow>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Mais aluno. Menos planilha. Pix todo mês.
        </h2>
        <p className="mt-5 text-lg text-ink-muted">
          Cada item aqui é uma dor que personal trainer enfrenta toda
          semana. O Ultra PT resolve.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={<LinkIcon className="h-5 w-5" />}
          title="Captação 24 horas"
          desc="Sua página pública trabalha enquanto você treina. Lead chega pelo Instagram, faz anamnese sozinho e vira aluno antes de você responder no WhatsApp."
        />
        <FeatureCard
          icon={<CardIcon className="h-5 w-5" />}
          title="Pix automático todo mês"
          desc="Cobrança recorrente: o aluno recebe o QR Code, paga em segundos e o status atualiza sozinho. Adeus mensagem de “pode pagar amanhã”."
        />
        <FeatureCard
          icon={<ClipboardIcon className="h-5 w-5" />}
          title="Anamnese sem papel"
          desc="O lead preenche histórico, lesões, ciclo, sono e alimentação direto na sua página. Você abre o aluno já com a ficha pronta."
        />
        <FeatureCard
          icon={<DumbbellIcon className="h-5 w-5" />}
          title="Treinos em minutos"
          desc="Monte ficha por blocos com séries, reps, carga e descanso. Imprime em PDF com a sua marca pra entregar profissional."
        />
        <FeatureCard
          icon={<PhoneIcon className="h-5 w-5" />}
          title="Aluno treina no celular"
          desc="Cronômetro, registro de carga e checagem de série no celular do aluno. Sem app pra baixar — abre direto no navegador."
        />
        <FeatureCard
          icon={<ChartIcon className="h-5 w-5" />}
          title="Receita num painel"
          desc="MRR, alunos ativos, leads pendentes e quem está inadimplente. Você vê no que mexer pra crescer no mês que vem."
        />
      </div>
    </section>
  );
}

function BeforeAfter() {
  return (
    <section className="mt-32 lg:mt-40">
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>O que muda</SectionEyebrow>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Saia do caos do WhatsApp.
        </h2>
        <p className="mt-5 text-lg text-ink-muted">
          A maioria dos personais que ganham bem tem um problema em comum:
          metade do tempo é gasto em coisa que não treina ninguém.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-card p-6 opacity-80">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-ink-dim">
            Antes
          </div>
          <h3 className="mt-3 text-xl font-bold">Você no modo improviso</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <CrossLine>Lead chega no DM e some antes de você responder</CrossLine>
            <CrossLine>Anamnese mandada por áudio, perdida no histórico</CrossLine>
            <CrossLine>Treino em PDF feito no Word, enviado por e-mail</CrossLine>
            <CrossLine>Cobrança no Pix manual, dia 5 lembrando todo mundo</CrossLine>
            <CrossLine>Inadimplência crescendo sem você perceber</CrossLine>
            <CrossLine>Imagem de “primo que treina” em vez de profissional</CrossLine>
          </ul>
        </div>

        <div className="relative rounded-2xl border border-accent/40 bg-bg-card p-6 shadow-glow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Com o Ultra PT
          </div>
          <h3 className="mt-3 text-xl font-bold">Você no modo negócio</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <CheckLine>Página com seu nome capta lead 24h, sem você</CheckLine>
            <CheckLine>Anamnese estruturada, tudo num lugar só</CheckLine>
            <CheckLine>Treino prescrito e o aluno executa pelo celular</CheckLine>
            <CheckLine>Pix recorrente, cobra sozinho todo mês</CheckLine>
            <CheckLine>Painel mostra inadimplência antes de virar problema</CheckLine>
            <CheckLine>Aparência profissional desde o primeiro clique</CheckLine>
          </ul>
        </div>
      </div>
    </section>
  );
}

function CrossLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-ink-dim">
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </span>
      {children}
    </li>
  );
}

function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      <span className="text-ink">{children}</span>
    </li>
  );
}

function Pricing() {
  const order: PlanId[] = ["starter", "pro", "scale"];
  const descriptions: Record<PlanId, string> = {
    starter: "Pra quem está começando.",
    pro: "Pra PT em crescimento.",
    scale: "Pra PT consolidado.",
  };

  return (
    <section id="pricing" className="mt-32 lg:mt-40">
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>Preço transparente</SectionEyebrow>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Um plano que cabe no seu mês.
        </h2>
        <p className="mt-5 text-lg text-ink-muted">
          14 dias grátis sem cartão. Você só paga se quiser continuar.
          Cancela quando quiser.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
        {order.map((id) => {
          const p = PLANS[id];
          const isPro = id === "pro";
          return (
            <div
              key={id}
              className={`relative rounded-2xl border p-6 ${
                isPro
                  ? "border-accent bg-bg-card shadow-glow-sm"
                  : "border-border bg-bg-card"
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-hype px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
                  Mais escolhido
                </div>
              )}

              <div className="text-xs font-bold uppercase tracking-[0.2em] text-ink-dim">
                {p.name}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black">R$ {p.price}</span>
                <span className="text-sm text-ink-dim">/ mês</span>
              </div>

              <p className="mt-2 text-sm text-ink-muted">
                {descriptions[id]}
              </p>

              <ul className="mt-5 space-y-2 text-sm text-ink-muted">
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    {p.studentLimit
                      ? `Até ${p.studentLimit} alunos`
                      : "Alunos ilimitados"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>Página pública personalizada</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>Anamnese, treinos e chat</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>Cobrança Pix automática</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>Sem taxa de setup</span>
                </li>
              </ul>

              <Link
                href="/signup"
                className={`mt-6 block w-full text-center ${
                  isPro ? "btn-primary" : "btn-secondary"
                }`}
              >
                Começar grátis
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-sm text-ink-dim">
        Pix mensal recorrente · Sem fidelidade · Cancela a qualquer momento
      </p>
    </section>
  );
}

function FinalCta({ ctaSignup }: { ctaSignup: string }) {
  return (
    <section className="mt-32 lg:mt-40">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-bg-card p-10 text-center md:p-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="relative">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <StarIcon className="h-3.5 w-3.5" />
            Fundador · primeiros 50 PTs com preço vitalício
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight md:text-5xl">
            Pronto pra ter sua{" "}
            <span className="bg-gradient-hype bg-clip-text text-transparent">
              página de personal
            </span>
            ?
          </h2>
          <p className="mt-5 text-lg text-ink-muted">
            Entre cedo, garanta o preço de fundador pra sempre. 14 dias
            grátis, sem cartão.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="btn-primary text-base shadow-glow-sm"
            >
              {ctaSignup}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-border pt-8 pb-10 text-sm text-ink-dim">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Logomark />
          <span className="font-semibold text-ink">Ultra PT</span>
          <span>· feito para personal trainers</span>
        </div>
        <div className="flex gap-5 text-xs">
          <Link href="/login" className="hover:text-ink">
            Entrar
          </Link>
          <Link href="/signup" className="hover:text-ink">
            Criar conta
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* =====================================================================
 * Building blocks
 * =================================================================== */

function BackgroundGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-accent/15 blur-[120px]" />
      <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
      <span className="h-px w-6 bg-accent/60" />
      {children}
      <span className="h-px w-6 bg-accent/60" />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-bg-surface px-2.5 py-1 text-center text-[10px] font-medium uppercase tracking-wider text-ink-muted">
      {children}
    </span>
  );
}

function ValueCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5 transition hover:border-accent/40">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <div className="mt-4 font-semibold">{title}</div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{desc}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-xl border border-border bg-bg-card p-6 transition hover:border-accent/40 hover:bg-bg-surface">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated text-ink transition group-hover:bg-accent/10 group-hover:text-accent">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{desc}</p>
    </div>
  );
}

function Step({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <li className="relative rounded-xl border border-border bg-bg-card p-6">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
        Passo {n}
      </div>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{desc}</p>
    </li>
  );
}

/* =====================================================================
 * SVG icon set (inline, sem dependencias)
 * =================================================================== */

type IconProps = { className?: string };

function Logomark({ className }: IconProps = {}) {
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hype text-black ${className ?? ""}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M5 8v8M9 5v14M15 5v14M19 8v8M3 11h2M3 13h2M19 11h2M19 13h2"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function PinIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LinkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MessageIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function ClipboardIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function DumbbellIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 9v6M5 7v10M9 5v14M15 5v14M19 7v10M21 9v6M9 12h6" />
    </svg>
  );
}

function PhoneIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M11 18h2" />
    </svg>
  );
}

function ChatIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 11a8 8 0 0 1 16 0v4a3 3 0 0 1-3 3H7l-4 3z" />
    </svg>
  );
}

function CardIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h3" />
    </svg>
  );
}

function ChartIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </svg>
  );
}

function StarIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2.5l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 18.27l-6.18 3.23L7 14.63 2 9.76l6.91-1L12 2.5z" />
    </svg>
  );
}
