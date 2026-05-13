import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeftIcon, UsersIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { computeStudentLimit } from "@/lib/student-limit";
import { type PlanId, PLANS } from "@/lib/plans";
import { createStudent } from "./actions";

export default async function NewStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; limit?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { error, limit: limitFlag } = await searchParams;

  // Pre-checa limite. Se estiver no limite, mostra card de upgrade em vez
  // do form. Evita o ciclo de submeter e tomar erro.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-accent"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("Common.back")}
        </Link>

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
            alunos permitidos no seu plano. Faz upgrade pra continuar crescendo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/dashboard/billing" className="btn-primary">
              Fazer upgrade
            </Link>
            <Link href="/dashboard/students" className="btn-ghost">
              Voltar pra lista
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
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-accent"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("Common.back")}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{t("Students.new_title")}</h1>
        <p className="text-sm text-ink-muted">{t("Students.new_subtitle")}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createStudent} className="card space-y-4">
        <div>
          <label className="label">{t("Students.field_name")}</label>
          <input name="full_name" type="text" required className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t("Students.field_email")}</label>
            <input name="email" type="email" className="input" />
          </div>
          <div>
            <label className="label">{t("Students.field_phone")}</label>
            <input name="phone" type="tel" className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t("Students.field_objective")}</label>
            <input name="objective" type="text" className="input" />
          </div>
          <div>
            <label className="label">{t("Students.field_level")}</label>
            <select name="experience_level" defaultValue="" className="input">
              <option value="">—</option>
              <option value="iniciante">
                {t("Anamnesis.experience_beginner")}
              </option>
              <option value="intermediario">
                {t("Anamnesis.experience_intermediate")}
              </option>
              <option value="avancado">
                {t("Anamnesis.experience_advanced")}
              </option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">{t("Students.field_birth_date")}</label>
          <input name="birth_date" type="date" className="input" />
        </div>

        <div>
          <label className="label">Tags (separe por vírgula)</label>
          <input
            name="tags"
            type="text"
            placeholder="emagrecimento, online, manhã"
            className="input"
          />
          <p className="mt-1 text-xs text-ink-dim">
            Use pra agrupar alunos (perfil, turno, objetivo, plano).
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-dim">
            Cobrança (opcional)
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Você cobra fora do app. Aqui só registra valor + dia pra acompanhar.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className="label">Mensalidade (R$)</label>
              <input
                name="monthly_value"
                type="number"
                step="0.01"
                min="0"
                className="input"
              />
            </div>
            <div>
              <label className="label">Dia do vencimento</label>
              <input
                name="payment_due_day"
                type="number"
                min="1"
                max="31"
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/dashboard/students" className="btn-ghost">
            {t("Common.cancel")}
          </Link>
          <button type="submit" className="btn-primary">
            {t("Students.btn_create")}
          </button>
        </div>
      </form>
    </div>
  );
}
