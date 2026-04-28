-- =====================================================================
-- Vuln 2: trainers public SELECT vazava CPF, asaas_*, voucher_used etc.
-- Solucao: column-level grants + redefinir policy publica explicita.
--
-- Anon so pode ler colunas SAFE da tabela trainers (publicas na landing
-- page). Authenticated mantem o acesso completo via policy "Trainer le
-- propria linha".
-- =====================================================================

-- Remove a policy que dava SELECT pra anon em todas as colunas
drop policy if exists "Public can read trainer profile" on public.trainers;

-- Garante que o role authenticated continua tendo SELECT completo
-- (a policy de RLS ja restringe pra apenas a propria linha)
grant select on public.trainers to authenticated;

-- Revoga acesso amplo de anon
revoke all on public.trainers from anon;

-- Concede SELECT em colunas SAFE apenas (publicas na landing page)
grant select (
  id, full_name, slug, cref, bio, photo_url, cover_image_url,
  specialties, services_description, pricing_summary,
  whatsapp_phone, instagram_handle, city, state,
  template_id, accent_color, headline, subheadline, cta_text,
  years_experience, students_helped, testimonials, highlights
) on public.trainers to anon;

-- Recria a policy publica de SELECT (RLS ainda exige policy ativa)
create policy "Public can read public trainer cols"
  on public.trainers for select
  to anon
  using (true);
