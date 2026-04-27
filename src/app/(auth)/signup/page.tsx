import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Criar conta de Personal Trainer
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          14 dias gratis. Sem cartao de credito.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {decodeURIComponent(success)}
        </div>
      )}

      <form action={signup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nome completo
          </label>
          <input
            name="full_name"
            type="text"
            required
            minLength={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            E-mail profissional
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Senha
          </label>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <p className="mt-1 text-xs text-slate-500">Minimo de 8 caracteres.</p>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
        >
          Criar conta
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Ja tem conta?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Fazer login
        </Link>
      </p>
    </>
  );
}
