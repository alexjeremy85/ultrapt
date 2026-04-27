"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !password || !fullName) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("Preencha nome, e-mail e senha.")
    );
  }

  if (password.length < 8) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("A senha precisa ter pelo menos 8 caracteres.")
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "trainer",
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
    },
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  redirect(
    "/login?error=" +
      encodeURIComponent(
        "Conta criada. Verifique seu e-mail para confirmar e entao faca login."
      )
  );
}
