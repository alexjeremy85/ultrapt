import "server-only";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type TrainerRow = {
  id: string;
  full_name: string | null;
  slug: string | null;
  city: string | null;
  state: string | null;
  subscription_status: string | null;
  signup_referer: string | null;
  signup_user_agent: string | null;
  terms_accepted_at: string | null;
  terms_version: string | null;
  created_at: string;
};

type AuthUserRow = {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
};

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function shortRef(s: string | null): string {
  if (!s) return "—";
  try {
    const u = new URL(s);
    return u.host + (u.pathname !== "/" ? u.pathname : "");
  } catch {
    return s.length > 40 ? s.slice(0, 40) + "…" : s;
  }
}

function shortUA(ua: string | null): string {
  if (!ua) return "—";
  if (/iPhone|iPad/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Linux/i.test(ua)) return "Linux";
  return ua.slice(0, 20);
}

function withinHours(iso: string | null | undefined, hours: number): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Date.now() - t < hours * 3600_000;
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Defesa em profundidade: re-checa o usuario mesmo apos guard do layout.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminId = process.env.ADMIN_USER_ID;
  if (!user || !adminId || user.id !== adminId) {
    redirect({ href: "/dashboard", locale });
  }

  const admin = createAdminClient();

  const [{ data: trainers }, authList, { count: studentsCount }, { count: leadsCount }] =
    await Promise.all([
      admin
        .from("trainers")
        .select(
          "id, full_name, slug, city, state, subscription_status, signup_referer, signup_user_agent, terms_accepted_at, terms_version, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(500),
      admin.auth.admin.listUsers({ page: 1, perPage: 500 }),
      admin.from("students").select("id", { count: "exact", head: true }),
      admin.from("leads").select("id", { count: "exact", head: true }),
    ]);

  const usersById = new Map<string, AuthUserRow>();
  authList.data?.users.forEach((u) =>
    usersById.set(u.id, {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
    })
  );

  const trainersList: TrainerRow[] = (trainers ?? []) as TrainerRow[];

  const totalTrainers = trainersList.length;
  const signups24h = trainersList.filter((t) => withinHours(t.created_at, 24)).length;
  const signups7d = trainersList.filter((t) => withinHours(t.created_at, 24 * 7)).length;
  const logins24h = Array.from(usersById.values()).filter((u) =>
    withinHours(u.last_sign_in_at, 24)
  ).length;
  const logins7d = Array.from(usersById.values()).filter((u) =>
    withinHours(u.last_sign_in_at, 24 * 7)
  ).length;

  const recentLogins = Array.from(usersById.values())
    .filter((u) => u.last_sign_in_at)
    .sort(
      (a, b) =>
        new Date(b.last_sign_in_at!).getTime() -
        new Date(a.last_sign_in_at!).getTime()
    )
    .slice(0, 30);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Admin</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Painel restrito. Não linkado em lugar nenhum.
      </p>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Trainers (total)" value={totalTrainers} />
        <Stat label="Cadastros 24h" value={signups24h} />
        <Stat label="Cadastros 7d" value={signups7d} />
        <Stat label="Logins 24h" value={logins24h} />
        <Stat label="Logins 7d" value={logins7d} />
        <Stat label="Alunos (total)" value={studentsCount ?? 0} />
        <Stat label="Leads (total)" value={leadsCount ?? 0} />
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">Cadastros</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-bg-elevated text-ink-muted">
              <tr>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Cidade/UF</th>
                <th className="p-2 text-left">Plano</th>
                <th className="p-2 text-left">Cadastro</th>
                <th className="p-2 text-left">Último login</th>
                <th className="p-2 text-left">Confirmado</th>
                <th className="p-2 text-left">Origem</th>
                <th className="p-2 text-left">Device</th>
                <th className="p-2 text-left">Termos</th>
              </tr>
            </thead>
            <tbody>
              {trainersList.map((t) => {
                const u = usersById.get(t.id);
                return (
                  <tr key={t.id} className="border-t border-border align-top">
                    <td className="p-2">{t.full_name ?? "—"}</td>
                    <td className="p-2 break-all">{u?.email ?? "—"}</td>
                    <td className="p-2">
                      {[t.city, t.state].filter(Boolean).join("/") || "—"}
                    </td>
                    <td className="p-2">{t.subscription_status ?? "—"}</td>
                    <td className="p-2 whitespace-nowrap">{fmt(t.created_at)}</td>
                    <td className="p-2 whitespace-nowrap">
                      {fmt(u?.last_sign_in_at)}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      {u?.email_confirmed_at ? "sim" : "não"}
                    </td>
                    <td className="p-2" title={t.signup_referer ?? ""}>
                      {shortRef(t.signup_referer)}
                    </td>
                    <td className="p-2" title={t.signup_user_agent ?? ""}>
                      {shortUA(t.signup_user_agent)}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      {t.terms_accepted_at
                        ? `${fmt(t.terms_accepted_at)}${t.terms_version ? ` (${t.terms_version})` : ""}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
              {trainersList.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-ink-muted">
                    Sem cadastros ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Logins recentes (top 30)</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-bg-elevated text-ink-muted">
              <tr>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Último login</th>
                <th className="p-2 text-left">Conta criada</th>
              </tr>
            </thead>
            <tbody>
              {recentLogins.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-2 break-all">{u.email ?? u.id}</td>
                  <td className="p-2 whitespace-nowrap">{fmt(u.last_sign_in_at)}</td>
                  <td className="p-2 whitespace-nowrap">{fmt(u.created_at)}</td>
                </tr>
              ))}
              {recentLogins.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-ink-muted">
                    Sem logins registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface px-3 py-2">
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
