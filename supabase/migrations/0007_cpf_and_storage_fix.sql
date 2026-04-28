-- =====================================================================
-- Adiciona CPF do PT (usado para Asaas) e garante bucket de storage
-- =====================================================================

alter table public.trainers
  add column if not exists cpf text;

-- Re-cria bucket de storage caso 0002 nao tenha aplicado por algum motivo
insert into storage.buckets (id, name, public)
values ('trainer-photos', 'trainer-photos', true)
on conflict (id) do update set public = excluded.public;

-- Re-cria policies de storage de forma idempotente
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
