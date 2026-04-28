import { Link } from "@/i18n/navigation";
import { ensureReadableOnLight, contrastingTextColor } from "@/lib/colorContrast";
import type { TemplateProps } from "./types";

export function MinimalTemplate({ trainer, ctaUrl }: TemplateProps) {
  const rawAccent = trainer.accent_color ?? "#0f172a";
  const accent = ensureReadableOnLight(rawAccent);
  const ctaTextColor = contrastingTextColor(accent);
  const headline = trainer.headline ?? trainer.full_name;
  const sub = trainer.subheadline ?? trainer.bio;
  const cta = trainer.cta_text ?? "Agendar conversa";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-slate-200 pb-8">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100 ring-4 ring-slate-50">
            {trainer.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={trainer.photo_url}
                alt={trainer.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">
                {trainer.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {trainer.full_name}
            </h1>
            <div className="text-sm text-slate-600">
              {trainer.cref && <span>CREF {trainer.cref}</span>}
              {trainer.cref && (trainer.city || trainer.state) && (
                <span className="mx-2">·</span>
              )}
              {(trainer.city || trainer.state) && (
                <span>
                  {[trainer.city, trainer.state].filter(Boolean).join(" / ")}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-10">
          <h2 className="text-3xl font-bold leading-tight md:text-4xl">
            {headline}
          </h2>
          {sub && <p className="mt-4 text-lg text-slate-600">{sub}</p>}

          <div className="mt-6 flex gap-3">
            <Link
              href={ctaUrl}
              className="inline-flex items-center rounded-md px-5 py-3 font-semibold transition hover:opacity-90"
              style={{ background: accent, color: ctaTextColor }}
            >
              {cta} →
            </Link>
            {trainer.whatsapp_phone && (
              <a
                href={`https://wa.me/55${trainer.whatsapp_phone}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center rounded-md border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50"
              >
                WhatsApp
              </a>
            )}
          </div>
        </section>

        {/* Stats */}
        {(trainer.years_experience || trainer.students_helped) && (
          <section className="mt-12 grid grid-cols-2 gap-6 border-y border-slate-200 py-8">
            {trainer.years_experience != null && trainer.years_experience > 0 && (
              <div>
                <div className="text-4xl font-black" style={{ color: accent }}>
                  {trainer.years_experience}+
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  anos de experiência
                </div>
              </div>
            )}
            {trainer.students_helped != null && trainer.students_helped > 0 && (
              <div>
                <div className="text-4xl font-black" style={{ color: accent }}>
                  {trainer.students_helped}+
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  alunos atendidos
                </div>
              </div>
            )}
          </section>
        )}

        {/* Specialties */}
        {trainer.specialties && trainer.specialties.length > 0 && (
          <section className="mt-12">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Áreas de atuação
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {trainer.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-slate-200 px-3 py-1 text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Highlights */}
        {trainer.highlights && trainer.highlights.length > 0 && (
          <section className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {trainer.highlights.map((h, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 bg-slate-50 p-5"
              >
                {h.icon && <div className="mb-2 text-2xl">{h.icon}</div>}
                <div className="font-semibold">{h.title}</div>
                {h.description && (
                  <div className="mt-1 text-sm text-slate-600">
                    {h.description}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Services */}
        {trainer.services_description && (
          <section className="mt-12">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Como funciona
            </h3>
            <p className="mt-3 whitespace-pre-line text-slate-700 leading-relaxed">
              {trainer.services_description}
            </p>
          </section>
        )}

        {/* Pricing */}
        {trainer.pricing_summary && (
          <section className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Investimento
            </h3>
            <p
              className="mt-2 text-2xl font-bold"
              style={{ color: accent }}
            >
              {trainer.pricing_summary}
            </p>
          </section>
        )}

        {/* Testimonials */}
        {trainer.testimonials && trainer.testimonials.length > 0 && (
          <section className="mt-12">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Depoimentos
            </h3>
            <div className="mt-4 space-y-4">
              {trainer.testimonials.map((tt, i) => (
                <blockquote
                  key={i}
                  className="border-l-4 pl-4"
                  style={{ borderColor: accent }}
                >
                  <p className="italic text-slate-700">"{tt.text}"</p>
                  <footer className="mt-2 text-sm text-slate-500">
                    — <strong>{tt.name}</strong>
                    {tt.role && <span>, {tt.role}</span>}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="mt-16 rounded-xl border border-slate-200 p-8 text-center">
          <h3 className="text-xl font-bold">Pronto para começar?</h3>
          <p className="mt-2 text-slate-600">
            Preencha seus dados e dê o primeiro passo.
          </p>
          <Link
            href={ctaUrl}
            className="mt-6 inline-flex items-center rounded-md px-6 py-3 font-semibold transition hover:opacity-90"
            style={{ background: accent, color: ctaTextColor }}
          >
            {cta} →
          </Link>
          {trainer.instagram_handle && (
            <div className="mt-4 text-sm">
              <a
                href={`https://instagram.com/${trainer.instagram_handle}`}
                target="_blank"
                rel="noopener"
                className="text-slate-500 hover:text-slate-900"
              >
                @{trainer.instagram_handle}
              </a>
            </div>
          )}
        </section>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          Powered by{" "}
          <Link href="/" className="hover:text-slate-700">
            Ultra Personal Trainer
          </Link>
        </footer>
      </div>
    </main>
  );
}
