import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {t("Profile.title")}
          </h1>
          <p className="text-sm text-slate-500">{t("Profile.subtitle")}</p>
        </div>
        <Link
          href={`/pt/${trainer!.slug}`}
          target="_blank"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          {t("Profile.btn_view_public")}
        </Link>
      </div>

      <ProfileForm trainer={trainer!} publicUrl={publicUrl} />
    </div>
  );
}
