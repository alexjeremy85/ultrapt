import { Link } from "@/i18n/navigation";
import type { TemplateProps } from "./types";

export function EnergyTemplate({ trainer, ctaUrl }: TemplateProps) {
  const accent = trainer.accent_color ?? "#10b981";
  const headline = trainer.headline ?? trainer.full_name;
  const sub = trainer.subheadline ?? trainer.bio;
  const cta = trainer.cta_text ?? "QUERO COMEÇAR AGORA";

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero full-bleed */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: trainer.cover_image_url
              ? `linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.95) 100%), url(${trainer.cover_image_url}) center/cover`
              : `radial-gradient(ellipse at top, ${accent}40 0%, transparent 60%), #000`,
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-12 md:pt-24">
          <div className="flex flex-col items-center text-center">
            {trainer.photo_url && (
              <div
                className="h-24 w-24 overflow-hidden rounded-full ring-4 mb-6"
                style={{ borderColor: accent }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trainer.photo_url}
                  alt={trainer.full_name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{ borderColor: `${accent}66`, color: accent }}
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: accent }}
              />
              Vamos treinar
            </div>

            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              {headline.toUpperCase()}
            </h1>

            {sub && (
              <p className="mt-6 max-w-2xl text-lg text-white/80">{sub}</p>
            )}

            <div className="mt-10">
              <Link
                href={ctaUrl}
                className="inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-black uppercase tracking-wider text-black transition active:translate-y-px"
                style={{
                  background: accent,
                  boxShadow: `0 0 50px 0 ${accent}66`,
                }}
              >
                {cta} →
              </Link>
            </div>

            <div className="mt-4 flex gap-4 text-xs text-white/60">
              {trainer.cref && <span>CREF {trainer.cref}</span>}
              {(trainer.city || trainer.state) && (
                <span>
                  {[trainer.city, trainer.state].filter(Boolean).join(" / ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      {(trainer.years_experience || trainer.students_helped) && (
        <section
          className="border-y"
          style={{ borderColor: `${accent}33`, background: `${accent}0d` }}
        >
          <div className="mx-auto max-w-4xl grid grid-cols-2 px-6">
            {trainer.years_experience != null && trainer.years_experience > 0 && (
              <div className="border-r border-white/10 py-6 text-center md:py-8">
                <div
                  className="text-5xl font-black md:text-6xl"
                  style={{ color: accent }}
                >
                  {trainer.years_experience}+
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/60">
                  Anos de experiência
                </div>
              </div>
            )}
            {trainer.students_helped != null && trainer.students_helped > 0 && (
              <div className="py-6 text-center md:py-8">
                <div
                  className="text-5xl font-black md:text-6xl"
                  style={{ color: accent }}
                >
                  {trainer.students_helped}+
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/60">
                  Alunos transformados
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Specialties */}
        {trainer.specialties && trainer.specialties.length > 0 && (
          <section className="mb-16 text-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-white/60">
              ○ Foco do meu trabalho ○
            </h2>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {trainer.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-wider"
                  style={{ borderColor: `${accent}66`, color: accent }}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Highlights as cards */}
        {trainer.highlights && trainer.highlights.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-center text-xs font-black uppercase tracking-widest text-white/60">
              ○ O que você ganha ○
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trainer.highlights.map((h, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/30"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${accent}10, transparent)`,
                  }}
                >
                  {h.icon && (
                    <div
                      className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                      style={{ background: `${accent}26`, color: accent }}
                    >
                      {h.icon}
                    </div>
                  )}
                  <div className="text-lg font-bold">{h.title}</div>
                  {h.description && (
                    <div className="mt-1 text-sm text-white/70">
                      {h.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {trainer.services_description && (
          <section className="mb-16">
            <h2 className="mb-4 text-center text-xs font-black uppercase tracking-widest text-white/60">
              ○ Como funciona ○
            </h2>
            <p className="mx-auto max-w-2xl whitespace-pre-line text-center text-white/80 leading-relaxed">
              {trainer.services_description}
            </p>
          </section>
        )}

        {/* Testimonials */}
        {trainer.testimonials && trainer.testimonials.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-center text-xs font-black uppercase tracking-widest text-white/60">
              ○ Quem já mudou ○
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {trainer.testimonials.map((tt, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  {tt.rating && (
                    <div
                      className="mb-3 text-lg"
                      style={{ color: accent }}
                    >
                      {"★".repeat(tt.rating)}
                      <span className="text-white/20">
                        {"★".repeat(5 - tt.rating)}
                      </span>
                    </div>
                  )}
                  <p className="text-white leading-relaxed">"{tt.text}"</p>
                  <div className="mt-4 text-sm">
                    <strong style={{ color: accent }}>{tt.name}</strong>
                    {tt.role && (
                      <span className="text-white/60"> · {tt.role}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing + Final CTA */}
        <section
          className="rounded-3xl border p-8 md:p-12 text-center"
          style={{
            borderColor: `${accent}66`,
            background: `radial-gradient(ellipse at center, ${accent}1a, transparent)`,
          }}
        >
          {trainer.pricing_summary && (
            <>
              <div className="text-xs font-black uppercase tracking-widest text-white/60">
                Investimento
              </div>
              <div
                className="mt-2 text-5xl font-black md:text-6xl"
                style={{ color: accent }}
              >
                {trainer.pricing_summary}
              </div>
            </>
          )}

          <div className="mt-8">
            <Link
              href={ctaUrl}
              className="inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-black uppercase tracking-wider text-black transition active:translate-y-px"
              style={{
                background: accent,
                boxShadow: `0 0 50px 0 ${accent}66`,
              }}
            >
              {cta} →
            </Link>
          </div>

          {(trainer.whatsapp_phone || trainer.instagram_handle) && (
            <div className="mt-6 flex justify-center gap-6 text-sm">
              {trainer.whatsapp_phone && (
                <a
                  href={`https://wa.me/55${trainer.whatsapp_phone}`}
                  target="_blank"
                  rel="noopener"
                  className="text-white/60 hover:text-white"
                >
                  📱 WhatsApp
                </a>
              )}
              {trainer.instagram_handle && (
                <a
                  href={`https://instagram.com/${trainer.instagram_handle}`}
                  target="_blank"
                  rel="noopener"
                  className="text-white/60 hover:text-white"
                >
                  📷 @{trainer.instagram_handle}
                </a>
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/40">
        Powered by{" "}
        <Link href="/" className="hover:text-white">
          Ultra Personal Trainer
        </Link>
      </footer>
    </main>
  );
}
