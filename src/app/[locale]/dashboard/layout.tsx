import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../(auth)/login/actions";
import { SidebarLink } from "./SidebarLink";
import { TrialBanner } from "./TrialBanner";

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
    .select("full_name, slug, photo_url, subscription_status, trial_ends_at")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-bg-surface md:flex md:flex-col">
        <div className="border-b border-border p-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hype text-black">
              ⚡
            </span>
            Ultra PT
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3 text-sm">
          <SidebarLink href="/dashboard" icon="📊" label={t("Nav.dashboard")} />
          <SidebarLink href="/dashboard/leads" icon="👋" label={t("Nav.leads")} />
          <SidebarLink href="/dashboard/students" icon="👥" label={t("Nav.students")} />
          <SidebarLink href="/dashboard/workouts" icon="💪" label={t("Nav.workouts")} />
          <SidebarLink href="/dashboard/profile" icon="🪪" label={t("Nav.profile")} />
          <SidebarLink href="/dashboard/billing" icon="💳" label={t("Nav.billing")} />
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-bg-card p-3">
            <div className="h-9 w-9 overflow-hidden rounded-full bg-bg-elevated">
              {trainer?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trainer.photo_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-accent">
                  {(trainer?.full_name ?? user!.email ?? "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {trainer?.full_name ?? user!.email}
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-xs text-ink-dim hover:text-accent"
                >
                  {t("Auth.btn_logout")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <TrialBanner
          status={trainer?.subscription_status ?? null}
          trialEndsAt={trainer?.trial_ends_at ?? null}
        />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
