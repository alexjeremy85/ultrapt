-- =====================================================================
-- Ultra Personal Trainer - Schema Inicial (Sprint 1 / M0)
-- Tabelas: trainers, students
-- Seguranca: RLS habilitada em todas as tabelas
-- Auth: integra com auth.users do Supabase (UUID)
-- =====================================================================

-- ----------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------

-- Funcao para gerar slug unico a partir de texto (usado para a pagina publica do PT)
create extension if not exists "unaccent";

create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(unaccent(coalesce(input, ''))),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

-- Trigger para atualizar updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------
-- TRAINERS - perfil profissional do personal trainer
-- ----------------------------------------------------------------------
create table if not exists public.trainers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  slug text unique not null,
  cref text,
  bio text,
  photo_url text,
  specialties text[] default '{}',
  phone text,
  city text,
  state text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trainers_slug_idx on public.trainers (slug);

drop trigger if exists trainers_set_updated_at on public.trainers;
create trigger trainers_set_updated_at
  before update on public.trainers
  for each row execute function public.set_updated_at();

alter table public.trainers enable row level security;

-- Trainer le e edita apenas seu proprio registro
drop policy if exists "Trainer reads own row" on public.trainers;
create policy "Trainer reads own row"
  on public.trainers for select
  using (id = auth.uid());

drop policy if exists "Trainer updates own row" on public.trainers;
create policy "Trainer updates own row"
  on public.trainers for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Trainer inserts own row" on public.trainers;
create policy "Trainer inserts own row"
  on public.trainers for insert
  with check (id = auth.uid());

-- Pagina publica: qualquer um pode ler dados publicos do PT pelo slug
-- (campos sensiveis nao estao nesta tabela; apenas o que e publico)
drop policy if exists "Public can read trainer profile" on public.trainers;
create policy "Public can read trainer profile"
  on public.trainers for select
  to anon
  using (true);

-- ----------------------------------------------------------------------
-- STUDENTS - alunos do personal trainer
-- ----------------------------------------------------------------------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  birth_date date,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'paused', 'inactive')),
  tags text[] default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_trainer_id_idx on public.students (trainer_id);
create index if not exists students_user_id_idx on public.students (user_id);
create index if not exists students_status_idx on public.students (status);

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

alter table public.students enable row level security;

-- Trainer ve apenas seus proprios alunos
drop policy if exists "Trainer reads own students" on public.students;
create policy "Trainer reads own students"
  on public.students for select
  using (trainer_id = auth.uid());

drop policy if exists "Trainer inserts own students" on public.students;
create policy "Trainer inserts own students"
  on public.students for insert
  with check (trainer_id = auth.uid());

drop policy if exists "Trainer updates own students" on public.students;
create policy "Trainer updates own students"
  on public.students for update
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

drop policy if exists "Trainer deletes own students" on public.students;
create policy "Trainer deletes own students"
  on public.students for delete
  using (trainer_id = auth.uid());

-- Aluno (quando logar) ve apenas seu proprio registro
drop policy if exists "Student reads own row" on public.students;
create policy "Student reads own row"
  on public.students for select
  using (user_id = auth.uid());

-- ----------------------------------------------------------------------
-- TRIGGER - cria registro em public.trainers automaticamente
-- quando um novo usuario se cadastra com role = 'trainer'
-- ----------------------------------------------------------------------
create or replace function public.handle_new_trainer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_slug text;
  v_base_slug text;
  v_counter int := 0;
begin
  -- Cria registro apenas se metadado role = 'trainer'
  if (new.raw_user_meta_data->>'role') is distinct from 'trainer' then
    return new;
  end if;

  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  v_base_slug := public.slugify(v_full_name);
  if v_base_slug = '' then
    v_base_slug := 'pt-' || substr(new.id::text, 1, 8);
  end if;
  v_slug := v_base_slug;

  -- Garante slug unico
  while exists (select 1 from public.trainers where slug = v_slug) loop
    v_counter := v_counter + 1;
    v_slug := v_base_slug || '-' || v_counter::text;
  end loop;

  insert into public.trainers (id, full_name, slug)
  values (new.id, v_full_name, v_slug);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_trainer();
