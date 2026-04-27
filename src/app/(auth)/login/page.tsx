import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Entrar no Ultra PT
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Use o e-mail e senha cadastrados.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={login} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            E-mail
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
            autoComplete="current-password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
        >
          Entrar
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Ainda nao tem conta?{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          Criar conta gratis
        </Link>
      </p>
    </>
  );
}
