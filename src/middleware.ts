import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // OAuth callback nao passa por i18n nem por auth-redirect
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  // 1) Supabase: refresh da sessao + protecao das rotas /dashboard
  const authResponse = await updateSession(request);
  if (authResponse.headers.get("location")) {
    return authResponse;
  }

  // 2) next-intl: handling de locale (prefix, redirect, etc.)
  const intlResponse = intlMiddleware(request);

  // copia cookies setados pelo Supabase para a resposta final
  authResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
