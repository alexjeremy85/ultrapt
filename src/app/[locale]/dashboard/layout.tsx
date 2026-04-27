import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../(auth)/login/actions";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const { data: trainer } = await supabase
    .from("trainers")
    .select("full_name, slug")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 border-r border-slate-200 bg-white p-6">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-slate-900"
          >
            {t("Brand.shortName")}
          </Link>
        </div>
        <nav className="space-y-1 text-sm">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            {t("Nav.dashboard")}
          </Link>
          <Link
            href="/dashboard/leads"
            className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            {t("Nav.leads")}
          </Link>
          <Link
            href="/dashboard/students"
            className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            {t("Nav.students")}
          </Link>
          <Link
            href="/dashboard/profile"
            className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            {t("Nav.profile")}
          </Link>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="text-sm text-slate-600">
            {t("Dashboard.welcome", {
              name: trainer?.full_name ?? user!.email ?? "",
            })}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {t("Auth.btn_logout")}
            </button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
