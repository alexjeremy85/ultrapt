-- 0028_trainer_files_drive.sql
-- Drive de arquivos do trainer: bucket de storage privado + tabela de metadados.
-- Trainer faz upload (PDF, imagem, doc) e copia link pra mandar pro aluno.

-- 1. Bucket privado pra arquivos do trainer
insert into storage.buckets (id, name, public)
values ('trainer-files', 'trainer-files', true)
on conflict (id) do update set public = excluded.public;

-- 2. Policies de storage — cada trainer mexe so na sua pasta (uid/<arquivo>)
drop policy if exists "Trainers upload own files" on storage.objects;
create policy "Trainers upload own files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'trainer-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Trainers update own files" on storage.objects;
create policy "Trainers update own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'trainer-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Trainers delete own files" on storage.objects;
create policy "Trainers delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'trainer-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Public can read trainer files" on storage.objects;
create policy "Public can read trainer files"
  on storage.objects for select
  using (bucket_id = 'trainer-files');

-- 3. Tabela de metadados
create table if not exists public.trainer_files (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists trainer_files_trainer_idx on public.trainer_files (trainer_id);

alter table public.trainer_files enable row level security;

drop policy if exists "Trainers manage own files" on public.trainer_files;
create policy "Trainers manage own files"
  on public.trainer_files for all
  to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());
