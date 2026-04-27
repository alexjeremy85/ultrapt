import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
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

  if (!trainer) notFound();

  return (
    <main className="min-h-screen bg-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-[600px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-5 py-10">
        <div className="overflow-hidden rounded-3xl border border-border bg-bg-card shadow-2xl">
          <div className="bg-gradient-hype px-6 pt-12 pb-16 text-center">
            <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-black/30 bg-bg-surface shadow-2xl">
              {trainer.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trainer.photo_url}
                  alt={trainer.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-accent">
                  {trainer.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-black text-black">
              {trainer.full_name}
            </h1>
            <div className="mt-1 text-sm font-semibold text-black/70">
              {trainer.cref && <span>CREF {trainer.cref}</span>}
              {trainer.cref && (trainer.city || trainer.state) && (
                <span> · </span>
              )}
              {(trainer.city || trainer.state) && (
                <span>
                  {[trainer.city, trainer.state].filter(Boolean).join(" / ")}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6 px-6 py-8">
            {trainer.bio && (
              <p className="text-center text-ink leading-relaxed">{trainer.bio}</p>
            )}

            {trainer.specialties && trainer.specialties.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {trainer.specialties.map((s: string) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {trainer.services_description && (
              <Block title={t("PublicPage.services_label")}>
                <p className="whitespace-pre-line text-ink-muted">
                  {trainer.services_description}
                </p>
              </Block>
            )}

            {trainer.pricing_summary && (
              <Block title={t("PublicPage.pricing_label")}>
                <p className="text-2xl font-bold text-accent">
                  {trainer.pricing_summary}
                </p>
              </Block>
            )}

            <div className="rounded-2xl border border-accent/40 bg-accent/5 p-6 text-center">
              <p className="mb-4 text-sm text-ink-muted">
                {t("PublicPage.cta_subtitle")}
              </p>
              <Link
                href={`/pt/${slug}/anamnese`}
                className="btn-primary w-full text-base shadow-glow"
              >
                {t("PublicPage.cta_quero_treinar")} →
              </Link>

              {(trainer.whatsapp_phone || trainer.instagram_handle) && (
                <div className="mt-4 flex justify-center gap-4 text-xs">
                  {trainer.whatsapp_phone && (
                    <a
                      href={`https://wa.me/55${trainer.whatsapp_phone}`}
                      target="_blank"
                      rel="noopener"
                      className="text-ink-muted hover:text-accent"
                    >
                      📱 WhatsApp
                    </a>
                  )}
                  {trainer.instagram_handle && (
                    <a
                      href={`https://instagram.com/${trainer.instagram_handle}`}
                      target="_blank"
                      rel="noopener"
                      className="text-ink-muted hover:text-accent"
                    >
                      📷 @{trainer.instagram_handle}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-ink-dim">
          Powered by{" "}
          <Link href="/" className="text-accent hover:underline">
            Ultra Personal Trainer
          </Link>
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
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
        {title}
      </h2>
      {children}
    </div>
  );
}
