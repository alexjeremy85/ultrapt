import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnamnesisForm } from "./AnamnesisForm";

export default async function AnamnesisPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { locale, slug } = await params;
  const { success } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, full_name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!trainer) {
    notFound();
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-5xl">✓</div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {t("Anamnesis.success_title")}
            </h1>
            <p className="mt-2 text-slate-600">
              {t("Anamnesis.success_message", { trainerName: trainer.full_name })}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">
              {t("Anamnesis.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {t("Anamnesis.subtitle", { trainerName: trainer.full_name })}
            </p>
          </div>
          <AnamnesisForm trainerId={trainer.id} slug={trainer.slug} />
        </div>
      </div>
    </main>
  );
}
