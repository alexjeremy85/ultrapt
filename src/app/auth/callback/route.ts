import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(raw: string | null): string {
  const fallback = "/dashboard";
  if (!raw) return fallback;
  // Apenas paths same-origin sao permitidos. Bloqueia // (protocol-relative),
  // /\\ (backslash), e qualquer URL absoluta.
  if (
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.startsWith("/\\") ||
    /^\/[a-z]+:/i.test(raw)
  ) {
    return fallback;
  }
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
