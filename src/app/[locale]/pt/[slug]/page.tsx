import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function PublicTrainerPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainers")
    .select(
      "full_name, slug, cref, bio, photo_url, specialties, services_description, pricing_summary, whatsapp_phone, instagram_handle, city, state"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!trainer) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="bg-gradient-to-br from-brand-dark via-brand to-brand-light px-6 py-12 text-white">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-100">
                {trainer.photo_url ? (
                  <Image
                    src={trainer.photo_url}
                    alt={trainer.full_name}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-slate-400">
                    {trainer.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{trainer.full_name}</h1>
                {trainer.cref && (
                  <p className="text-sm text-white/80">CREF {trainer.cref}</p>
                )}
                {(trainer.city || trainer.state) && (
                  <p className="text-sm text-white/70">
                    {[trainer.city, trainer.state].filter(Boolean).join(" / ")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6 md:p-8">
            {trainer.bio && (
              <p className="text-slate-700">{trainer.bio}</p>
            )}

            {trainer.specialties && trainer.specialties.length > 0 && (
              <Block title={t("PublicPage.specialties_label")}>
                <div className="flex flex-wrap gap-2">
                  {trainer.specialties.map((s: string) => (
                    <span
                      key={s}
                      className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand-dark"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Block>
            )}

            {trainer.services_description && (
              <Block title={t("PublicPage.services_label")}>
                <p className="whitespace-pre-line text-sm text-slate-700">
                  {trainer.services_description}
                </p>
              </Block>
            )}

            {trainer.pricing_summary && (
              <Block title={t("PublicPage.pricing_label")}>
                <p className="text-sm text-slate-700">
                  {trainer.pricing_summary}
                </p>
              </Block>
            )}

            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <p className="mb-4 text-sm text-slate-600">
                {t("PublicPage.cta_subtitle")}
              </p>
              <Link
                href={`/pt/${slug}/anamnese`}
                className="inline-block rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark"
              >
                {t("PublicPage.cta_quero_treinar")}
              </Link>

              {(trainer.whatsapp_phone || trainer.instagram_handle) && (
                <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
                  {trainer.whatsapp_phone && (
                    <a
                      href={`https://wa.me/55${trainer.whatsapp_phone}`}
                      target="_blank"
                      rel="noopener"
                      className="hover:text-brand"
                    >
                      WhatsApp
                    </a>
                  )}
                  {trainer.instagram_handle && (
                    <a
                      href={`https://instagram.com/${trainer.instagram_handle}`}
                      target="_blank"
                      rel="noopener"
                      className="hover:text-brand"
                    >
                      @{trainer.instagram_handle}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </div>
  );
}
