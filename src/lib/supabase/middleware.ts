import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return pathname;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = stripLocalePrefix(request.nextUrl.pathname);
  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  const isAppRoute = path.startsWith("/dashboard");
  const isBillingRoute = path.startsWith("/dashboard/billing");
  const isAdminRoute = path.startsWith("/admin");

  if (!user && (isAppRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Guard de admin no middleware (camada externa, antes do RSC).
  if (isAdminRoute) {
    const adminId = process.env.ADMIN_USER_ID;
    if (!user || !adminId || user.id !== adminId) {
      const url = request.nextUrl.clone();
      const localeMatch = request.nextUrl.pathname.match(
        /^\/([a-z]{2}(-[A-Z]{2})?)\//
      );
      const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
      url.pathname = `${localePrefix}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Subscription gate: 'free' e 'active' passam direto.
  // 'pending_payment' tambem pode usar (acabou de iniciar). 'past_due' e
  // 'canceled' caem em /billing pra regularizar.
  if (user && isAppRoute && !isBillingRoute) {
    const { data: trainer } = await supabase
      .from("trainers")
      .select("subscription_status")
      .eq("id", user.id)
      .maybeSingle();
    const status = trainer?.subscription_status ?? "free";
    const allowed = status === "free" || status === "active" || status === "pending_payment";
    if (!allowed) {
      const url = request.nextUrl.clone();
      const localeMatch = request.nextUrl.pathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)\//);
      const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
      url.pathname = `${localePrefix}/dashboard/billing`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
