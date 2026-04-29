import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { createWorkout } from "./actions";

export default async function NewWorkoutPage({
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
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard/workouts"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-accent"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t("Common.back")}
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{t("Workouts.new_title")}</h1>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createWorkout} className="card space-y-4">
        <div>
          <label className="label">{t("Workouts.field_name")}</label>
          <input
            name="name"
            required
            placeholder={t("Workouts.field_name_hint")}
            className="input"
          />
        </div>

        <div>
          <label className="label">{t("Workouts.field_description")}</label>
          <textarea name="description" rows={2} className="input" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t("Workouts.field_goal")}</label>
            <input name="goal" className="input" />
          </div>
          <div>
            <label className="label">{t("Workouts.field_level")}</label>
            <select name="level" defaultValue="" className="input">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t("Workouts.field_duration_weeks")}</label>
            <input
              name="duration_weeks"
              type="number"
              min="1"
              max="52"
              defaultValue="4"
              className="input"
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              name="is_template"
              value="1"
              className="rounded border-border accent-accent"
            />
            {t("Workouts.field_is_template")}
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/dashboard/workouts" className="btn-ghost">
            {t("Common.cancel")}
          </Link>
          <button type="submit" className="btn-primary">
            {t("Workouts.btn_save_continue")}
          </button>
        </div>
      </form>
    </div>
  );
}
