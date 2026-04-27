import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-dark via-brand to-brand-light text-white">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <header className="mb-16 flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">
            {t("Brand.name")}
          </span>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 hover:bg-white/10"
            >
              {t("Landing.nav_login")}
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-white px-4 py-2 font-medium text-brand-dark hover:bg-white/90"
            >
              {t("Landing.nav_signup")}
            </Link>
          </nav>
        </header>

        <section className="max-w-3xl">
          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            {t("Brand.tagline")}
          </h1>
          <p className="mt-6 text-lg text-white/80">{t("Landing.subtitle")}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-white px-6 py-3 font-medium text-brand-dark hover:bg-white/90"
            >
              {t("Landing.cta_signup")}
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-white/30 px-6 py-3 hover:bg-white/10"
            >
              {t("Landing.cta_login")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
