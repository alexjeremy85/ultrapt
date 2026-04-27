-- =====================================================================
-- Templates de landing + personalizacao avancada da pagina publica
-- =====================================================================

alter table public.trainers
  add column if not exists template_id text not null default 'bold'
    check (template_id in ('bold', 'minimal', 'energy')),
  add column if not exists accent_color text default '#ff6b00',
  add column if not exists cover_image_url text,
  add column if not exists headline text,
  add column if not exists subheadline text,
  add column if not exists cta_text text,
  add column if not exists years_experience int,
  add column if not exists students_helped int,
  add column if not exists testimonials jsonb default '[]'::jsonb,
  add column if not exists highlights jsonb default '[]'::jsonb;

-- Indice para query por template (analitica)
create index if not exists trainers_template_id_idx on public.trainers (template_id);
