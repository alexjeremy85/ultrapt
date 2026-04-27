import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: studentsCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("trainer_id", user!.id);

  const { count: activeStudents } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("trainer_id", user!.id)
    .eq("status", "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Visao geral do seu negocio.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Alunos ativos" value={activeStudents ?? 0} />
        <Card title="Total de alunos" value={studentsCount ?? 0} />
        <Card title="MRR" value="R$ 0,00" hint="Em breve" />
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-slate-600">
          Bem-vindo ao Ultra PT. As proximas funcionalidades chegam em breve:
        </p>
        <ul className="mt-3 inline-block text-left text-sm text-slate-500">
          <li>- Captacao de alunos via link publico</li>
          <li>- Anamnese e avaliacao fisica</li>
          <li>- Workout builder com biblioteca de exercicios</li>
          <li>- Cobranca recorrente via Pix e cartao</li>
        </ul>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
