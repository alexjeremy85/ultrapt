import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-dark via-brand to-brand-light text-white">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <header className="mb-16 flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">
            Ultra Personal Trainer
          </span>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 hover:bg-white/10"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-white px-4 py-2 font-medium text-brand-dark hover:bg-white/90"
            >
              Criar conta
            </Link>
          </nav>
        </header>

        <section className="max-w-3xl">
          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            A plataforma feita para o personal que quer escalar.
          </h1>
          <p className="mt-6 text-lg text-white/80">
            Capte alunos, faça anamneses, prescreva treinos com IA, cobre
            mensalidades automaticamente e acompanhe a evolução de cada cliente
            em um só lugar.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-white px-6 py-3 font-medium text-brand-dark hover:bg-white/90"
            >
              Começar grátis por 14 dias
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-white/30 px-6 py-3 hover:bg-white/10"
            >
              Já tenho conta
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
