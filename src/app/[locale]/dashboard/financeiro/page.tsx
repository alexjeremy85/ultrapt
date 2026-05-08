import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { MoneyIcon, TrendingUpIcon, AlertIcon } from "@/components/icons";

function fmtBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isOverdue(dueDay: number | null, lastPaymentAt: string | null): boolean {
  if (!dueDay) return false;
  const now = new Date();
  const due = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (due > now) return false;
  if (!lastPaymentAt) return true;
  return new Date(lastPaymentAt) < due;
}

export default async function FinanceiroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: students }, { data: payments }] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, full_name, monthly_value, payment_due_day, last_payment_at, status"
      )
      .eq("trainer_id", user!.id),
    supabase
      .from("student_payments")
      .select("amount, paid_at, reference_month, student_id")
      .eq("trainer_id", user!.id)
      .order("paid_at", { ascending: false })
      .limit(100),
  ]);

  const list = (students ?? []).filter((s) => s.monthly_value && s.monthly_value > 0);
  const expectedMonthly = list.reduce(
    (sum, s) => sum + (Number(s.monthly_value) ?? 0),
    0
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const receivedThisMonth = (payments ?? [])
    .filter((p) => new Date(p.paid_at) >= monthStart)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const overdue = list.filter((s) =>
    isOverdue(s.payment_due_day, s.last_payment_at)
  );
  const overdueValue = overdue.reduce(
    (sum, s) => sum + (Number(s.monthly_value) ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-sm text-ink-muted">
          Visão consolidada das mensalidades dos alunos.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
            <TrendingUpIcon className="h-3.5 w-3.5" />
            Esperado / mês
          </div>
          <p className="mt-2 text-2xl font-bold text-accent">
            {fmtBRL(expectedMonthly)}
          </p>
          <p className="mt-1 text-xs text-ink-dim">
            {list.length} aluno{list.length === 1 ? "" : "s"} ativo
            {list.length === 1 ? "" : "s"} cobrando
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
            <MoneyIcon className="h-3.5 w-3.5" />
            Recebido este mês
          </div>
          <p className="mt-2 text-2xl font-bold text-success">
            {fmtBRL(receivedThisMonth)}
          </p>
          <p className="mt-1 text-xs text-ink-dim">
            {expectedMonthly > 0
              ? `${Math.round((receivedThisMonth / expectedMonthly) * 100)}% do esperado`
              : "—"}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
            <AlertIcon className="h-3.5 w-3.5" />
            Em atraso
          </div>
          <p
            className={`mt-2 text-2xl font-bold ${
              overdue.length > 0 ? "text-danger" : "text-ink-dim"
            }`}
          >
            {fmtBRL(overdueValue)}
          </p>
          <p className="mt-1 text-xs text-ink-dim">
            {overdue.length} aluno{overdue.length === 1 ? "" : "s"} atrasado
            {overdue.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {overdue.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-danger">
            Cobrar agora
          </h2>
          <ul className="space-y-2">
            {overdue.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/students/${s.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/5 p-3 transition active:scale-[0.99] hover:border-danger/60"
                >
                  <span className="truncate text-sm font-medium">
                    {s.full_name}
                  </span>
                  <span className="text-sm font-bold text-danger">
                    {fmtBRL(Number(s.monthly_value))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {list.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-ink-muted">
            Você ainda não configurou cobrança em nenhum aluno.
          </p>
          <p className="mt-1 text-xs text-ink-dim">
            Edite o aluno e preencha mensalidade + dia do vencimento.
          </p>
        </div>
      ) : (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
            Todos os alunos cobrando
          </h2>
          <ul className="space-y-2">
            {list.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/students/${s.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-card p-3 transition hover:border-accent/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {s.full_name}
                    </div>
                    <div className="text-xs text-ink-dim">
                      {s.payment_due_day
                        ? `Vence dia ${s.payment_due_day}`
                        : "Sem dia configurado"}
                    </div>
                  </div>
                  <span className="text-sm font-bold">
                    {fmtBRL(Number(s.monthly_value))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
