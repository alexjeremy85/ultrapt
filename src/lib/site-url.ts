/**
 * URL canonica do app. Sempre que precisar montar links absolutos
 * (compartilhar com aluno, redirect de OAuth, e-mail), use isso.
 *
 * Prioriza NEXT_PUBLIC_APP_URL pra permitir override em preview/local.
 * Fallback fixo em https://ultrapt.com.br pra garantir que nenhum
 * link interno mostre vercel.app caso a env nao esteja configurada.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/$/, "");
  return "https://ultrapt.com.br";
}
