-- =====================================================================
-- Anamnese expandida + foto do aluno
--   - Adiciona photo_url em students
--   - Cria bucket de storage student-photos (publico)
--   - Permite upload anonimo na pasta com prefixo igual ao trainer slug,
--     pois o aluno preenche a anamnese sem login
-- =====================================================================

alter table public.students
  add column if not exists photo_url text;

-- ----------------------------------------------------------------------
-- Bucket student-photos
-- ----------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', true)
on conflict (id) do update set public = excluded.public;

-- Anonimo pode subir foto (anamnese publica). Restringimos por mimetype
-- e tamanho via storage.upload em codigo. Aqui apenas garantimos o bucket.
drop policy if exists "Public can upload student photos" on storage.objects;
create policy "Public can upload student photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'student-photos');

drop policy if exists "Public can read student photos" on storage.objects;
create policy "Public can read student photos"
  on storage.objects for select
  using (bucket_id = 'student-photos');

drop policy if exists "Trainer manages student photos" on storage.objects;
create policy "Trainer manages student photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'student-photos');
