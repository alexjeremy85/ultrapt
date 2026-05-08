"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadFile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Arquivo vazio" };
  if (file.size > 25 * 1024 * 1024) return { error: "Arquivo maior que 25MB" };

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.id}/${Date.now()}-${safe}`;

  const { error: uploadError } = await supabase.storage
    .from("trainer-files")
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("trainer_files").insert({
    trainer_id: user.id,
    storage_path: storagePath,
    filename: file.name,
    mime_type: file.type || null,
    size_bytes: file.size,
  });
  if (insertError) {
    await supabase.storage.from("trainer-files").remove([storagePath]);
    return { error: insertError.message };
  }

  revalidatePath("/dashboard/files");
  return { ok: true };
}

export async function deleteFile(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: file } = await supabase
    .from("trainer_files")
    .select("storage_path")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .maybeSingle();
  if (!file) return { error: "Arquivo não encontrado" };

  await supabase.storage.from("trainer-files").remove([file.storage_path]);
  await supabase.from("trainer_files").delete().eq("id", id);

  revalidatePath("/dashboard/files");
  return { ok: true };
}
