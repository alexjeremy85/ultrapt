"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

async function updateLeadStatus(
  id: string,
  status: "active" | "inactive"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauth" };

  const { error } = await supabase
    .from("students")
    .update({ status })
    .eq("id", id)
    .eq("trainer_id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function approveLead(formData: FormData) {
  const locale = await getLocale();
  const id = String(formData.get("id") ?? "");
  await updateLeadStatus(id, "active");
  revalidatePath("/[locale]/dashboard", "layout");
  redirect({ href: "/dashboard/students", locale });
}

export async function rejectLead(formData: FormData) {
  const locale = await getLocale();
  const id = String(formData.get("id") ?? "");
  await updateLeadStatus(id, "inactive");
  revalidatePath("/[locale]/dashboard", "layout");
  redirect({ href: "/dashboard/leads", locale });
}
