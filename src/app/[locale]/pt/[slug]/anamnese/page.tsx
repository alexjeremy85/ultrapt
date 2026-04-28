import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnamnesisForm } from "./AnamnesisForm";

export default async function AnamnesisPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale, slug } = await params;
  const { success, error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, full_name, slug, photo_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!trainer) notFound();

  if (success) {
    return (
      <main className="min-h-screen bg-bg">
        <div className="mx-auto max-w-xl px-5 py-16">
          <div className="card text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-3xl">
              ✓
            </div>
            <h1 className="text-2xl font-bold">
              {t("Anamnesis.success_title")}
            </h1>
            <p className="mt-2 text-ink-muted">
              {t("Anamnesis.success_message", { trainerName: trainer.full_name })}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="card">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-bg-elevated">
              {trainer.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trainer.photo_url}
                  alt={trainer.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-accent">
                  {trainer.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("Anamnesis.title")}</h1>
              <p className="text-sm text-ink-muted">
                {t("Anamnesis.subtitle", { trainerName: trainer.full_name })}
              </p>
            </div>
          </div>
          {error && (
            <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error === "photo_size"
                ? "A foto enviada e maior que 5MB. Reduza o tamanho e tente de novo."
                : error === "photo_type"
                ? "Formato invalido. Envie JPG, PNG ou WebP."
                : error === "name"
                ? "Preencha o nome completo."
                : "Nao foi possivel salvar. Tente novamente."}
            </div>
          )}
          <AnamnesisForm trainerId={trainer.id} slug={trainer.slug} />
        </div>
      </div>
    </main>
  );
}
