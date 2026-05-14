"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = await getLocale();
  const t = await getTranslations({ locale });

  if (!email || !password) {
    redirect({
      href: `/login?error=${encodeURIComponent(t("Auth.error_credentials"))}`,
      locale,
    });
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // LGPD: nao logamos email em texto. emailHash = ofuscacao simples
    // (primeiras 3 letras + dominio) so pra correlacionar suporte.
    const emailHash = `${email.slice(0, 3)}***@${email.split("@")[1] ?? "?"}`;
    console.warn("[login] failed", {
      emailHash,
      code: error.code,
      message: error.message,
      status: error.status,
    });
    redirect({
      href: `/login?error=${encodeURIComponent(error.message)}`,
      locale,
    });
  }

  console.log("[login] success", { userId: data.user?.id });
  revalidatePath("/", "layout");
  redirect({ href: "/dashboard", locale });
}

export async function logout() {
  const locale = await getLocale();
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect({ href: "/login", locale });
}
