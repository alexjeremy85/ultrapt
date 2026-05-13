import { Link } from "@/i18n/navigation";
import { type PlanId } from "@/lib/plans";

/**
 * Banner pulsante exibido pra trainers em plano Free ou near-limit.
 * Some quando assinatura esta ativa.
 */
export function UpgradePulseBanner({
  status,
  planId,
  studentCount,
  studentLimit,
}: {
  status: string | null;
  planId: PlanId;
  studentCount: number;
  studentLimit: number | null;
}) {
  if (status === "active") return null;

  const atLimit = studentLimit !== null && studentCount >= studentLimit;
  const nearLimit =
    studentLimit !== null && studentCount === studentLimit - 1;

  // So mostra em 3 situacoes concretas: pagamento pendente, ja no limite,
  // ou faltando 1 aluno pro limite. Free user com folga (ex: 0/2 ou 1/2 com
  // limite=2 ja conta como nearLimit mas nao incomoda) NAO recebe banner sem
  // motivo. Sai do meio do caminho enquanto ele esta usando o produto.
  const shouldShow = status === "past_due" || atLimit || nearLimit;
  if (!shouldShow) return null;

  let title: string;
  let body: string;
  let cta: string;

  if (status === "past_due") {
    title = "Pagamento pendente";
    body = "Regulariza pra continuar usando todas as features.";
    cta = "Regularizar";
  } else if (atLimit) {
    title = `Limite atingido — ${studentCount}/${studentLimit} alunos`;
    body = "Faz upgrade pra cadastrar mais alunos agora.";
    cta = "Fazer upgrade";
  } else {
    title = `${studentCount}/${studentLimit} alunos — falta 1 pro limite`;
    body = "Trava preço Pioneiro antes das vagas esgotarem.";
    cta = "Ver planos";
  }

  return (
    <Link
      href="/dashboard/billing"
      className="relative block overflow-hidden rounded-xl border-2 border-accent bg-gradient-to-r from-accent/15 to-accent/5 p-3 transition active:scale-[0.99] hover:from-accent/20 hover:to-accent/10"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl border-2 border-accent animate-pulse opacity-60"
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent" />
            <strong className="text-sm font-bold text-accent">{title}</strong>
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">{body}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-black">
          {cta} →
        </span>
      </div>
    </Link>
  );
}
