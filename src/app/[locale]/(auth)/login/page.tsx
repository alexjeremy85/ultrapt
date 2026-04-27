import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { login } from "./actions";

export default async function LoginPage({
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
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("Auth.login_title")}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{t("Auth.login_subtitle")}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={login} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("Auth.field_email")}
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("Auth.field_password")}
          </label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
        >
          {t("Auth.btn_login")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {t("Auth.no_account")}{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          {t("Auth.link_signup")}
        </Link>
      </p>
    </>
  );
}
