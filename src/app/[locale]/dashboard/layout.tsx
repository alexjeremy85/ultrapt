import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Logomark,
  HomeIcon,
  UsersIcon,
  UserIcon,
  DumbbellIcon,
  CardIcon,
  BadgeIcon,
} from "@/components/icons";
import { logout } from "../(auth)/login/actions";
import { trainerUnreadCounts } from "@/lib/chat";
import { SidebarLink } from "./SidebarLink";
import { UpgradePulseBanner } from "./UpgradePulseBanner";
import { MobileBottomNav } from "./MobileBottomNav";
import { CommunityInviteModal } from "./CommunityInviteModal";
import { type PlanId } from "@/lib/plans";

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

  const [{ data: trainer }, { count: studentCount }, unread] = await Promise.all([
    supabase
      .from("trainers")
      .select("full_name, slug, photo_url, subscription_status, subscription_plan, community_invite_seen_at")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("trainer_id", user!.id),
    trainerUnreadCounts(),
  ]);

  const planId = (trainer?.subscription_plan ?? "free") as PlanId;
  const studentLimit =
    planId === "free" ? 2 :
    planId === "solo" ? 5 :
    planId === "pro" ? 30 : null;

  return (
    <div className="flex min-h-dvh bg-bg">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-bg-surface md:flex md:flex-col">
        <div className="border-b border-border p-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold"
          >
            <Logomark />
            Ultra PT
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3 text-sm">
          <SidebarLink
            href="/dashboard"
            icon={<HomeIcon className="h-4 w-4" />}
            label={t("Nav.dashboard")}
          />
          <SidebarLink
            href="/dashboard/leads"
            icon={<UserIcon className="h-4 w-4" />}
            label={t("Nav.leads")}
          />
          <SidebarLink
            href="/dashboard/students"
            icon={<UsersIcon className="h-4 w-4" />}
            label={t("Nav.students")}
          />
          <SidebarLink
            href="/dashboard/workouts"
            icon={<DumbbellIcon className="h-4 w-4" />}
            label={t("Nav.workouts")}
          />
          <SidebarLink
            href="/dashboard/profile"
            icon={<BadgeIcon className="h-4 w-4" />}
            label={t("Nav.profile")}
          />
          <SidebarLink
            href="/dashboard/billing"
            icon={<CardIcon className="h-4 w-4" />}
            label={t("Nav.billing")}
          />
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
        {/* pt-safe: respeita notch/dynamic island ja que nao ha TopBar.
            pb-20 mobile: espaco pra MobileBottomNav. */}
        <main className="pt-safe flex-1 px-4 pb-20 md:px-8 md:pb-8">
          <div className="mb-4 mt-4 md:mt-6">
            <UpgradePulseBanner
              status={trainer?.subscription_status ?? null}
              planId={planId}
              studentCount={studentCount ?? 0}
              studentLimit={studentLimit}
            />
          </div>
          {children}
        </main>
      </div>
      <MobileBottomNav unreadStudents={unread.total} />
      <CommunityInviteModal open={!trainer?.community_invite_seen_at} />
    </div>
  );
}
