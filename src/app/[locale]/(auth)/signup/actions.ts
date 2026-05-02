"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const termsAccepted = formData.get("terms_accepted") === "1";
  const locale = await getLocale();
  const t = await getTranslations({ locale });

  if (!email || !password || !fullName) {
    redirect({
      href: `/signup?error=${encodeURIComponent(t("Auth.error_required"))}`,
      locale,
    });
  }

  if (password.length < 8) {
    redirect({
      href: `/signup?error=${encodeURIComponent(t("Auth.error_password_short"))}`,
      locale,
    });
  }

  if (!termsAccepted) {
    redirect({
      href: `/signup?error=${encodeURIComponent("Voce precisa aceitar os termos de uso para criar a conta.")}`,
      locale,
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "trainer",
        locale,
        terms_accepted_at: new Date().toISOString(),
        terms_version: "2026-05-01",
      },
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    console.error("[signup] supabase signUp failed", {
      email,
      code: error.code,
      message: error.message,
      status: error.status,
    });
    redirect({
      href: `/signup?error=${encodeURIComponent(error.message)}`,
      locale,
    });
  }

  // Captura origem do trafego e grava no trainer (criado pelo trigger).
  // Usa service_role pra funcionar mesmo antes da confirmacao de email.
  if (data.user?.id) {
    try {
      const h = await headers();
      const referer = h.get("referer") ?? null;
      const userAgent = h.get("user-agent") ?? null;
      const admin = createAdminClient();
      await admin
        .from("trainers")
        .update({
          signup_referer: referer,
          signup_user_agent: userAgent,
          terms_accepted_at: new Date().toISOString(),
          terms_version: "2026-05-01",
        })
        .eq("id", data.user.id);
    } catch (e) {
      console.error("[signup] failed to persist signup telemetry", e);
    }
  }

  if (data.session) {
    console.log("[signup] success with active session", {
      userId: data.user?.id,
      email,
    });
    revalidatePath("/", "layout");
    redirect({ href: "/dashboard", locale });
  }

  console.log("[signup] success awaiting email confirmation", {
    userId: data.user?.id,
    email,
  });
  redirect({
    href: `/login?error=${encodeURIComponent(t("Auth.confirm_email_message"))}`,
    locale,
  });
}
