import { Link } from "@/i18n/navigation";
import { Logomark } from "@/components/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-xl font-bold"
        >
          <Logomark />
          Ultra PT
        </Link>
        <div className="rounded-2xl border border-border bg-bg-card p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
