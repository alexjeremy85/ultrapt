import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { FileTextIcon } from "@/components/icons";
import { FileUploadForm, FileRow } from "./FilesClient";

export default async function FilesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: files } = await supabase
    .from("trainer_files")
    .select("id, filename, storage_path, mime_type, size_bytes, created_at")
    .eq("trainer_id", user!.id)
    .order("created_at", { ascending: false });

  const rows = (files ?? []).map((f) => {
    const { data } = supabase.storage.from("trainer-files").getPublicUrl(f.storage_path);
    return { ...f, public_url: data.publicUrl };
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Drive de arquivos</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Suba PDFs, planilhas, fotos e copie o link pra mandar direto pro aluno.
        </p>
      </div>

      <FileUploadForm />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-bg-card p-8 text-center">
          <FileTextIcon className="mx-auto h-8 w-8 text-ink-dim" />
          <p className="mt-2 text-sm text-ink-muted">Nenhum arquivo ainda.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((f) => (
            <FileRow
              key={f.id}
              id={f.id}
              filename={f.filename}
              mimeType={f.mime_type}
              sizeBytes={f.size_bytes}
              publicUrl={f.public_url}
              createdAt={f.created_at}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
