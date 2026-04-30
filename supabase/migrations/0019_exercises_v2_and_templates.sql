-- =====================================================================
-- Enriquece a biblioteca de exercicios e adiciona templates de treino.
--
-- Mudancas em public.exercises:
--   - mechanics_type: 'compound' | 'isolation'
--   - category: weight_and_reps | reps | time | distance_and_time |
--               weight_and_time | assisted_bodyweight_and_reps
--   - level_numeric (1-5) — escala granular de dificuldade
--   - primary_muscle (texto, sobrepoe muscle_group quando setado)
--   - secondary_muscles, regions, equipment_list (text[]) pra filtros
--   - instructions (texto longo) — sobrepoe description
--   - gymday_id — chave pra lookup durante seed de templates
--
-- Novas tabelas:
--   - workout_templates — programas pre-montados (PPL, Madcow, etc)
--   - workout_template_blocks — dias do programa
--   - workout_template_exercises — exercicios em cada dia
--
-- RLS: leitura permitida pra qualquer trainer autenticado.
-- Trainers nao podem editar templates (so usar como base).
-- =====================================================================

-- ----------------------------------------------------------------------
-- 1. Enriquece exercises
-- ----------------------------------------------------------------------
alter table public.exercises
  add column if not exists mechanics_type text
    check (mechanics_type in ('compound','isolation')),
  add column if not exists category text
    check (category in (
      'weight_and_reps',
      'reps',
      'time',
      'distance_and_time',
      'weight_and_time',
      'assisted_bodyweight_and_reps'
    )),
  add column if not exists level_numeric int
    check (level_numeric between 1 and 5),
  add column if not exists primary_muscle text,
  add column if not exists secondary_muscles text[] not null default '{}',
  add column if not exists regions text[] not null default '{}',
  add column if not exists equipment_list text[] not null default '{}',
  add column if not exists instructions text,
  add column if not exists gymday_id uuid;

create unique index if not exists exercises_gymday_id_idx
  on public.exercises (gymday_id)
  where gymday_id is not null;

create index if not exists exercises_primary_muscle_idx
  on public.exercises (primary_muscle);

create index if not exists exercises_category_idx
  on public.exercises (category);

create index if not exists exercises_equipment_list_idx
  on public.exercises using gin (equipment_list);

create index if not exists exercises_secondary_muscles_idx
  on public.exercises using gin (secondary_muscles);

-- ----------------------------------------------------------------------
-- 2. workout_templates
-- ----------------------------------------------------------------------
create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  main_goal text check (main_goal in (
    'Ganhar Força',
    'Hipertrofia',
    'Perder Gordura'
  )),
  level text check (level in ('Iniciante','Intermediário','Avançado')),
  days_per_week int,
  num_workouts int,
  description text,
  is_premium boolean not null default false,
  is_featured boolean not null default false,
  source text not null default 'gymday',
  created_at timestamptz not null default now()
);

create index if not exists workout_templates_goal_idx
  on public.workout_templates (main_goal);
create index if not exists workout_templates_level_idx
  on public.workout_templates (level);

alter table public.workout_templates enable row level security;

drop policy if exists "Trainers read templates" on public.workout_templates;
create policy "Trainers read templates"
  on public.workout_templates for select
  to authenticated
  using (true);

-- ----------------------------------------------------------------------
-- 3. workout_template_blocks
-- ----------------------------------------------------------------------
create table if not exists public.workout_template_blocks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workout_templates(id)
    on delete cascade,
  name text not null,
  position int not null default 1,
  is_single_day boolean not null default false,
  notes text
);

create index if not exists workout_template_blocks_template_idx
  on public.workout_template_blocks (template_id, position);

alter table public.workout_template_blocks enable row level security;

drop policy if exists "Trainers read template blocks" on public.workout_template_blocks;
create policy "Trainers read template blocks"
  on public.workout_template_blocks for select
  to authenticated
  using (true);

-- ----------------------------------------------------------------------
-- 4. workout_template_exercises
-- ----------------------------------------------------------------------
create table if not exists public.workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.workout_template_blocks(id)
    on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  position int not null,
  num_sets int not null default 3,
  min_reps int,
  max_reps int,
  rest_seconds int,
  is_warmup boolean not null default false,
  is_drop_set boolean not null default false,
  to_failure boolean not null default false,
  is_superset_marker boolean not null default false,
  notes text
);

create index if not exists workout_template_exercises_block_idx
  on public.workout_template_exercises (block_id, position);

alter table public.workout_template_exercises enable row level security;

drop policy if exists "Trainers read template exercises" on public.workout_template_exercises;
create policy "Trainers read template exercises"
  on public.workout_template_exercises for select
  to authenticated
  using (true);
