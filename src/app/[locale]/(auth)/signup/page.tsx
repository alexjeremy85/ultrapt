import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon } from "@/components/icons";
import { signup } from "./actions";

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { error, success } = await searchParams;

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{t("Auth.signup_title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {t("Auth.signup_subtitle")}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          {decodeURIComponent(success)}
        </div>
      )}

      <form action={signup} className="space-y-4">
        <div>
          <label className="label">{t("Auth.field_full_name")}</label>
          <input
            name="full_name"
            type="text"
            required
            minLength={3}
            className="input"
          />
        </div>
        <div>
          <label className="label">{t("Auth.field_email_pro")}</label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input"
          />
        </div>
        <div>
          <label className="label">{t("Auth.field_password")}</label>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="input"
          />
          <p className="hint">{t("Auth.field_password_hint")}</p>
        </div>
        <button
          type="submit"
          className="btn-primary inline-flex w-full items-center justify-center gap-2"
        >
          {t("Auth.btn_signup")}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        {t("Auth.has_account")}{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:text-accent-hover"
        >
          {t("Auth.link_login")}
        </Link>
      </p>
    </>
  );
}
