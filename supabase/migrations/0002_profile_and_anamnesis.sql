-- =====================================================================
-- Ultra Personal Trainer - Sprint 2 (M1)
-- - Adiciona campos para anamnese em students
-- - Adiciona campos publicos em trainers (whatsapp, instagram, services)
-- - Cria bucket de Storage para fotos de perfil
-- - RLS no bucket (PT escreve so na propria pasta, leitura publica)
-- =====================================================================

-- ----------------------------------------------------------------------
-- Trainers - campos publicos extras
-- ----------------------------------------------------------------------
alter table public.trainers
  add column if not exists whatsapp_phone text,
  add column if not exists instagram_handle text,
  add column if not exists services_description text,
  add column if not exists pricing_summary text;

-- ----------------------------------------------------------------------
-- Students - dados da anamnese e objetivo
-- ----------------------------------------------------------------------
alter table public.students
  add column if not exists objective text,
  add column if not exists experience_level text
    check (experience_level in ('iniciante', 'intermediario', 'avancado')),
  add column if not exists anamnesis_data jsonb,
  add column if not exists anamnesis_submitted_at timestamptz;

create index if not exists students_anamnesis_submitted_idx
  on public.students (trainer_id, status)
  where status = 'pending';

-- ----------------------------------------------------------------------
-- Permitir cadastro publico de aluno via /pt/[slug]/anamnese
-- (usuario anonimo cria registro com status=pending)
-- ----------------------------------------------------------------------
drop policy if exists "Public can submit anamnesis" on public.students;
create policy "Public can submit anamnesis"
  on public.students for insert
  to anon
  with check (
    status = 'pending'
    and trainer_id is not null
    and exists (select 1 from public.trainers where id = trainer_id)
  );

-- ----------------------------------------------------------------------
-- Storage - bucket para fotos de perfil dos PTs
-- ----------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('trainer-photos', 'trainer-photos', true)
on conflict (id) do update set public = excluded.public;

-- Politicas do bucket: PT escreve so na propria pasta {trainer_id}/...
drop policy if exists "Trainers upload own photos" on storage.objects;
create policy "Trainers upload own photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'trainer-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Trainers update own photos" on storage.objects;
create policy "Trainers update own photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'trainer-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Trainers delete own photos" on storage.objects;
create policy "Trainers delete own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'trainer-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Public can read trainer photos" on storage.objects;
create policy "Public can read trainer photos"
  on storage.objects for select
  using (bucket_id = 'trainer-photos');
