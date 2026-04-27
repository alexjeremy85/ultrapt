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

  if (!lead) {
    notFound();
  }

  const data = (lead.anamnesis_data ?? {}) as Record<string, unknown>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/leads"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← {t("Leads.back_to_list")}
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          {lead.full_name}
        </h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          {lead.email && <span>{lead.email}</span>}
          {lead.phone && <span>WhatsApp: {lead.phone}</span>}
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.entries(data)
            .filter(
              ([k]) =>
                !["full_name", "email", "phone", "trainer_id", "slug"].includes(k)
            )
            .map(([k, v]) => (
              <div key={k} className="rounded-md bg-slate-50 p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {k}
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {Array.isArray(v) ? v.join(", ") : String(v)}
                </dd>
              </div>
            ))}
        </dl>

        <div className="mt-6 flex gap-3">
          <form action={approveLead}>
            <input type="hidden" name="id" value={lead.id} />
            <button
              type="submit"
              className="rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
            >
              {t("Leads.btn_approve")}
            </button>
          </form>
          <form action={rejectLead}>
            <input type="hidden" name="id" value={lead.id} />
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
            >
              {t("Leads.btn_reject")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
