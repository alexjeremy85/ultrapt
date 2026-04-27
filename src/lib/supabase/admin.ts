import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service_role - bypassa RLS.
 * USE APENAS em server-side, com validacao manual de permissoes.
 * Nunca exponha em client components.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
