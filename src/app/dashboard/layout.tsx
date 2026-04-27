import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../(auth)/login/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: trainer } = await supabase
    .from("trainers")
    .select("full_name, slug")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 border-r border-slate-200 bg-white p-6">
        <div className="mb-8">
          <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
            Ultra PT
          </Link>
        </div>
        <nav className="space-y-1 text-sm">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/students"
            className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Alunos
          </Link>
          <Link
            href="/dashboard/profile"
            className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Meu perfil
          </Link>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="text-sm text-slate-600">
            Ola, <span className="font-medium">{trainer?.full_name ?? user.email}</span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Sair
            </button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
