import { Link } from "@/i18n/navigation";
import { Logomark } from "@/components/icons";
import { logout } from "../(auth)/login/actions";

export function MobileTopBar({
  fullName,
  photoUrl,
}: {
  fullName: string | null;
  photoUrl: string | null;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2 text-base font-bold">
        <Logomark />
        Ultra PT
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/profile"
          className="h-8 w-8 overflow-hidden rounded-full bg-bg-elevated"
          aria-label="Meu perfil"
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-accent">
              {(fullName ?? "U").charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg px-2 py-1 text-xs text-ink-dim hover:text-accent"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
