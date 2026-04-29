import { Link } from "@/i18n/navigation";
import { ensureReadableOnDark, contrastingTextColor } from "@/lib/colorContrast";
import {
  WhatsappIcon,
  InstagramIcon,
  StarRating,
  ArrowRightIcon,
} from "@/components/icons";
import { HighlightIcon } from "@/lib/highlight-icons";
import type { TemplateProps } from "./types";

export function BoldTemplate({ trainer, ctaUrl, studentLoginSlot }: TemplateProps) {
  const rawAccent = trainer.accent_color ?? "#ff6b00";
  const accent = ensureReadableOnDark(rawAccent);
  const ctaTextColor = contrastingTextColor(accent);
  const headline = trainer.headline ?? trainer.full_name;
  const sub = trainer.subheadline ?? trainer.bio;
  const cta = trainer.cta_text ?? "Quero treinar com você";

  return (
    <main
      className="min-h-screen bg-bg text-ink"
      style={{ ["--brand" as const]: accent } as React.CSSProperties}
    >
      {studentLoginSlot && (
        <div className="absolute right-4 top-4 z-20">{studentLoginSlot}</div>
      )}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: `${accent}33` }}
        />
      </div>

      <div className="relative mx-auto max-w-2xl px-5 py-10">
        <div className="overflow-hidden rounded-3xl border border-border bg-bg-card shadow-2xl">
          {/* Hero com cover ou gradiente */}
          <div
            className="relative px-6 pt-16 pb-20 text-center"
            style={{
              background: trainer.cover_image_url
                ? `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%), url(${trainer.cover_image_url}) center/cover`
                : `linear-gradient(135deg, ${accent} 0%, ${shade(accent, 20)} 50%, ${shade(accent, 50)} 100%)`,
            }}
          >
            <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 bg-bg-surface shadow-2xl">
              {trainer.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trainer.photo_url}
                  alt={trainer.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-5xl font-black"
                  style={{ color: accent }}
                >
                  {trainer.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h1 className="mt-5 text-4xl font-black text-white tracking-tight md:text-5xl">
              {headline}
            </h1>
            {trainer.cref && (
              <div className="mt-2 text-sm font-semibold text-white/80">
                CREF {trainer.cref}
                {(trainer.city || trainer.state) && (
                  <span> · {[trainer.city, trainer.state].filter(Boolean).join(" / ")}</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-7 px-6 py-8">
            {/* Stats */}
            {(trainer.years_experience || trainer.students_helped) && (
              <div className="grid grid-cols-2 gap-3">
                {trainer.years_experience != null && trainer.years_experience > 0 && (
                  <Stat
                    value={`${trainer.years_experience}+`}
                    label="anos de experiência"
                    accent={accent}
                  />
                )}
                {trainer.students_helped != null && trainer.students_helped > 0 && (
                  <Stat
                    value={`${trainer.students_helped}+`}
                    label="alunos atendidos"
                    accent={accent}
                  />
                )}
              </div>
            )}

            {sub && (
              <p className="text-center text-ink leading-relaxed">{sub}</p>
            )}

            {trainer.specialties && trainer.specialties.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {trainer.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: `${accent}26`, color: accent }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Highlights */}
            {trainer.highlights && trainer.highlights.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {trainer.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-border bg-bg-surface p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-elevated text-accent">
                      <HighlightIcon name={h.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="font-semibold">{h.title}</div>
                      {h.description && (
                        <div className="mt-0.5 text-sm text-ink-muted">
                          {h.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {trainer.services_description && (
              <Block title="Serviços">
                <p className="whitespace-pre-line text-ink-muted">
                  {trainer.services_description}
                </p>
              </Block>
            )}

            {trainer.pricing_summary && (
              <Block title="Investimento">
                <p
                  className="text-3xl font-black"
                  style={{ color: accent }}
                >
                  {trainer.pricing_summary}
                </p>
              </Block>
            )}

            {/* Testimonials */}
            {trainer.testimonials && trainer.testimonials.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
                  Depoimentos de alunos
                </h2>
                {trainer.testimonials.map((tt, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-bg-surface p-4"
                  >
                    {tt.rating && (
                      <div className="mb-2" style={{ color: accent }}>
                        <StarRating
                          value={tt.rating}
                          filledClassName=""
                          emptyClassName="opacity-30"
                        />
                      </div>
                    )}
                    <p className="text-sm italic text-ink">"{tt.text}"</p>
                    <div className="mt-2 text-xs text-ink-muted">
                      — <strong>{tt.name}</strong>
                      {tt.role && <span>, {tt.role}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div
              className="rounded-2xl border p-6 text-center"
              style={{ borderColor: `${accent}66`, background: `${accent}0d` }}
            >
              <p className="mb-4 text-sm text-ink-muted">
                Preencha seus dados e comece sua jornada
              </p>
              <Link
                href={ctaUrl}
                className="inline-flex w-full items-center justify-center rounded-lg px-6 py-3.5 font-semibold transition active:translate-y-px"
                style={{
                  background: accent,
                  color: ctaTextColor,
                  boxShadow: `0 0 30px 0 ${accent}66`,
                }}
              >
                <span className="inline-flex items-center gap-2">
                  {cta}
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Link>

              {(trainer.whatsapp_phone || trainer.instagram_handle) && (
                <div className="mt-4 flex justify-center gap-5 text-xs">
                  {trainer.whatsapp_phone && (
                    <a
                      href={`https://wa.me/55${trainer.whatsapp_phone}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 text-ink-muted hover:text-ink"
                    >
                      <WhatsappIcon className="h-4 w-4" />
                      WhatsApp
                    </a>
                  )}
                  {trainer.instagram_handle && (
                    <a
                      href={`https://instagram.com/${trainer.instagram_handle}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 text-ink-muted hover:text-ink"
                    >
                      <InstagramIcon className="h-4 w-4" />
                      @{trainer.instagram_handle}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-ink-dim">
          Powered by{" "}
          <Link href="/" className="text-ink-muted hover:underline">
            Ultra Personal Trainer
          </Link>
        </div>
      </div>
    </main>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4 text-center">
      <div className="text-3xl font-black" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-wider text-ink-dim">
        {label}
      </div>
    </div>
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

// helper para variar tom da cor
function shade(hex: string, percent: number): string {
  const f = parseInt(hex.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  return (
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}
