import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { approveLead, rejectLead } from "./actions";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lead } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .eq("trainer_id", user!.id)
    .maybeSingle();

  if (!lead) notFound();

  const data = (lead.anamnesis_data ?? {}) as Record<string, unknown>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/leads"
        className="text-sm text-ink-muted hover:text-accent"
      >
        ← {t("Leads.back_to_list")}
      </Link>

      <div className="card">
        <h1 className="text-2xl font-bold">{lead.full_name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
          {lead.email && <span>{lead.email}</span>}
          {lead.phone && <span>WhatsApp: {lead.phone}</span>}
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(data)
            .filter(
              ([k]) =>
                !["full_name", "email", "phone", "trainer_id", "slug"].includes(k)
            )
            .map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-bg-surface p-3">
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-dim">
                  {k}
                </dt>
                <dd className="mt-1 text-sm">
                  {Array.isArray(v) ? v.join(", ") : String(v)}
                </dd>
              </div>
            ))}
        </dl>

        <div className="mt-6 flex gap-3">
          <form action={approveLead}>
            <input type="hidden" name="id" value={lead.id} />
            <button type="submit" className="btn-primary">
              {t("Leads.btn_approve")}
            </button>
          </form>
          <form action={rejectLead}>
            <input type="hidden" name="id" value={lead.id} />
            <button type="submit" className="btn-secondary">
              {t("Leads.btn_reject")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
