import { setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowRightIcon, UsersIcon } from "@/components/icons";
import { computeStudentLimit } from "@/lib/student-limit";
import { type PlanId, PLANS } from "@/lib/plans";
import { quickStart } from "./actions";

export default async function OnboardingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; limit?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error, limit: limitFlag } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });

  const [{ data: trainer }, { count: studentCount }] = await Promise.all([
    supabase
      .from("trainers")
      .select("subscription_plan")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("trainer_id", user!.id),
  ]);
  const planId = (trainer?.subscription_plan ?? "free") as PlanId;
  const limitInfo = computeStudentLimit(planId, studentCount ?? 0);

  if (limitInfo.atLimit) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-2xl border-2 border-accent bg-gradient-to-br from-accent/10 to-transparent p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
            <UsersIcon className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold">
            Limite do plano {PLANS[planId].name} atingido
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Você já cadastrou{" "}
            <strong className="text-ink">
              {studentCount} de {limitInfo.studentLimit}
            </strong>{" "}
            alunos. Faz upgrade pra continuar.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/dashboard/billing" className="btn-primary">
              Fazer upgrade
            </Link>
            <Link href="/dashboard" className="btn-ghost">
              Voltar pro painel
            </Link>
          </div>
          {limitFlag === "1" && (
            <p className="mt-4 text-xs text-ink-dim">
              Você tentou cadastrar mais um aluno, mas precisa de plano maior.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Bem-vindo
        </p>
        <h1 className="mt-1 text-2xl font-bold">
          Vamos do zero ao primeiro PDF em 5 minutos
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Cadastre o primeiro aluno e o primeiro treino aqui. Na próxima tela você
          adiciona exercícios e gera o PDF pra mandar pelo WhatsApp.
        </p>
      </div>

      <ol className="space-y-1 text-xs text-ink-muted">
        <li>1. Aluno e treino básico (agora)</li>
        <li>2. Adicionar exercícios no construtor (próxima tela)</li>
        <li>3. Gerar PDF e enviar via WhatsApp</li>
      </ol>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={quickStart} className="card space-y-4">
        <div>
          <label className="label">Nome do aluno</label>
          <input
            name="student_name"
            type="text"
            required
            minLength={2}
            className="input"
            placeholder="Ex: João Silva"
            autoFocus
          />
        </div>

        <div>
          <label className="label">WhatsApp do aluno (opcional)</label>
          <input
            name="student_phone"
            type="tel"
            className="input"
            placeholder="11999998888"
          />
          <p className="hint">Sem +55. Só DDD + número.</p>
        </div>

        <div>
          <label className="label">Nome do primeiro treino</label>
          <input
            name="workout_name"
            type="text"
            defaultValue="Treino A"
            className="input"
          />
        </div>

        <button
          type="submit"
          className="btn-primary inline-flex w-full items-center justify-center gap-2"
        >
          Continuar pro construtor
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </form>

      <div className="text-center text-xs">
        <Link
          href="/dashboard"
          className="text-ink-dim hover:text-accent"
        >
          Pular e ir direto pro painel
        </Link>
      </div>
    </div>
  );
}
