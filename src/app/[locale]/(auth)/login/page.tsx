import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { login } from "./actions";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { error, message } = await searchParams;

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{t("Auth.login_title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("Auth.login_subtitle")}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
          {decodeURIComponent(message)}
        </div>
      )}

      <form action={login} className="space-y-4">
        <div>
          <label className="label">{t("Auth.field_email")}</label>
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
            autoComplete="current-password"
            required
            minLength={8}
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          {t("Auth.btn_login")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        {t("Auth.no_account")}{" "}
        <Link
          href="/signup"
          className="font-medium text-accent hover:text-accent-hover"
        >
          {t("Auth.link_signup")}
        </Link>
      </p>
    </>
  );
}
