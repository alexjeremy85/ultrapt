import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { error, success } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trainer } = await supabase
    .from("trainers")
    .select("*")
    .eq("id", user!.id)
    .single();

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/pt/${trainer!.slug}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("Profile.title")}</h1>
          <p className="text-sm text-ink-muted">{t("Profile.subtitle")}</p>
        </div>
        <Link
          href={`/pt/${trainer!.slug}`}
          target="_blank"
          className="btn-secondary text-sm"
        >
          {t("Profile.btn_view_public")} ↗
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          {decodeURIComponent(success)}
        </div>
      )}

      <ProfileForm trainer={trainer!} publicUrl={publicUrl} />
    </div>
  );
}
