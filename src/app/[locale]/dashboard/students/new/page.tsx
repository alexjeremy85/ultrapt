import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { createStudent } from "./actions";

export default async function NewStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { error } = await searchParams;

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
