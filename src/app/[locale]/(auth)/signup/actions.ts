"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "trainer",
        locale,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
    },
  });

  if (error) {
    redirect({
      href: `/signup?error=${encodeURIComponent(error.message)}`,
      locale,
    });
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect({ href: "/dashboard", locale });
  }

  redirect({
    href: `/login?error=${encodeURIComponent(t("Auth.confirm_email_message"))}`,
    locale,
  });
}
