-- =====================================================================
-- CORRECAO da migration 0003
-- Problema: workout_blocks e workout_exercises tinham policies referenciando
-- workout_assignments antes desta tabela existir. Aqui criamos tudo
-- na ordem correta e (re)aplicamos as policies de forma idempotente.
--
-- Esta migration eh segura para rodar mesmo que 0003 tenha aplicado
-- parcialmente (usa "if not exists" e "drop policy if exists").
--
-- Rode esta migration. Depois rode 0004_exercises_seed.sql.
-- =====================================================================

-- ----------------------------------------------------------------------
-- TRAINERS - garante colunas de billing (caso 0003 nao tenha aplicado)
-- ----------------------------------------------------------------------
alter table public.trainers
  add column if not exists asaas_customer_id text,
  add column if not exists asaas_subscription_id text,
  add column if not exists subscription_status text default 'trialing'
    check (subscription_status in ('trialing','active','past_due','canceled','trial_expired')),
  add column if not exists subscription_plan text default 'starter'
    check (subscription_plan in ('starter','pro','scale')),
  add column if not exists trial_ends_at timestamptz default (now() + interval '14 days');

create index if not exists trainers_asaas_customer_idx on public.trainers (asaas_customer_id);

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

  while exists (select 1 from public.trainers where slug = v_slug) loop
    v_counter := v_counter + 1;
    v_slug := v_base_slug || '-' || v_counter::text;
  end loop;

  insert into public.trainers (id, full_name, slug, subscription_status, trial_ends_at)
  values (new.id, v_full_name, v_slug, 'trialing', now() + interval '14 days');

  return new;
end;
$$;

-- ----------------------------------------------------------------------
-- ETAPA 1: criar todas as TABELAS na ordem correta (sem policies ainda)
-- ----------------------------------------------------------------------

-- 1.1 EXERCISES
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.trainers(id) on delete cascade,
  name text not null,
  muscle_group text not null,
  equipment text,
  level text check (level in ('iniciante','intermediario','avancado')),
  modality text default 'musculacao'
    check (modality in ('musculacao','funcional','aerobico','alongamento','mobilidade')),
  description text,
  technique_tips text,
  youtube_id text,
  thumbnail_url text,
  is_global boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists exercises_trainer_id_idx on public.exercises (trainer_id);
create index if not exists exercises_muscle_group_idx on public.exercises (muscle_group);
create index if not exists exercises_global_idx on public.exercises (is_global) where is_global = true;
create index if not exists exercises_search_idx on public.exercises using gin (to_tsvector('portuguese', name || ' ' || coalesce(muscle_group,'')));

alter table public.exercises enable row level security;

-- 1.2 WORKOUTS
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  name text not null,
  description text,
  goal text,
  level text check (level in ('iniciante','intermediario','avancado')),
  duration_weeks int default 4,
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workouts_trainer_id_idx on public.workouts (trainer_id);

drop trigger if exists workouts_set_updated_at on public.workouts;
create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

alter table public.workouts enable row level security;

-- 1.3 WORKOUT_ASSIGNMENTS - criar antes de blocks/exercises porque eles referenciam
create table if not exists public.workout_assignments (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  start_date date not null default current_date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (workout_id, student_id)
);

create index if not exists workout_assignments_student_idx
  on public.workout_assignments (student_id, is_active);

alter table public.workout_assignments enable row level security;

-- 1.4 WORKOUT_BLOCKS
create table if not exists public.workout_blocks (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  position int not null,
  name text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists workout_blocks_workout_idx
  on public.workout_blocks (workout_id, position);

alter table public.workout_blocks enable row level security;

-- 1.5 WORKOUT_EXERCISES
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.workout_blocks(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  position int not null,
  sets int not null default 3,
  reps text not null default '10-12',
  weight text,
  rest_seconds int default 60,
  tempo text,
  notes text,
  custom_name text,
  custom_youtube_id text
);

create index if not exists workout_exercises_block_idx
  on public.workout_exercises (block_id, position);

alter table public.workout_exercises enable row level security;

-- 1.6 WORKOUT_EXECUTIONS
create table if not exists public.workout_executions (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.workout_blocks(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  executed_at timestamptz not null default now(),
  duration_seconds int,
  notes text,
  perceived_effort int check (perceived_effort between 1 and 10)
);

create index if not exists workout_executions_student_idx
  on public.workout_executions (student_id, executed_at desc);

alter table public.workout_executions enable row level security;

-- 1.7 EXERCISE_LOGS
create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  executed_at timestamptz not null default now(),
  set_number int not null,
  reps_done int,
  weight_used numeric(6,2),
  notes text
);

create index if not exists exercise_logs_student_idx
  on public.exercise_logs (student_id, executed_at desc);

alter table public.exercise_logs enable row level security;

-- 1.8 BILLING_EVENTS
create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists billing_events_processed_idx
  on public.billing_events (processed, created_at);

alter table public.billing_events enable row level security;

-- ----------------------------------------------------------------------
-- ETAPA 2: aplicar todas as POLICIES (todas as tabelas ja existem)
-- ----------------------------------------------------------------------

-- 2.1 EXERCISES
drop policy if exists "Anyone authenticated reads exercises" on public.exercises;
create policy "Anyone authenticated reads exercises"
  on public.exercises for select
  to authenticated
  using (is_global = true or trainer_id = auth.uid());

drop policy if exists "Trainer creates own exercises" on public.exercises;
create policy "Trainer creates own exercises"
  on public.exercises for insert
  to authenticated
  with check (trainer_id = auth.uid() and is_global = false);

drop policy if exists "Trainer updates own exercises" on public.exercises;
create policy "Trainer updates own exercises"
  on public.exercises for update
  to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

drop policy if exists "Trainer deletes own exercises" on public.exercises;
create policy "Trainer deletes own exercises"
  on public.exercises for delete
  to authenticated
  using (trainer_id = auth.uid());

-- 2.2 WORKOUTS
drop policy if exists "Trainer manages own workouts" on public.workouts;
create policy "Trainer manages own workouts"
  on public.workouts for all
  to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

drop policy if exists "Student reads assigned workouts" on public.workouts;
create policy "Student reads assigned workouts"
  on public.workouts for select
  to authenticated
  using (
    exists (
      select 1 from public.workout_assignments wa
      join public.students s on s.id = wa.student_id
      where wa.workout_id = workouts.id
      and s.user_id = auth.uid()
    )
  );

-- 2.3 WORKOUT_ASSIGNMENTS
drop policy if exists "Trainer manages assignments" on public.workout_assignments;
create policy "Trainer manages assignments"
  on public.workout_assignments for all
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.trainer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.trainer_id = auth.uid()
    )
  );

drop policy if exists "Student reads own assignments" on public.workout_assignments;
create policy "Student reads own assignments"
  on public.workout_assignments for select
  to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.id = student_id and s.user_id = auth.uid()
    )
  );

-- 2.4 WORKOUT_BLOCKS
drop policy if exists "Workout blocks via workout" on public.workout_blocks;
create policy "Workout blocks via workout"
  on public.workout_blocks for all
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and (
        w.trainer_id = auth.uid()
        or exists (
          select 1 from public.workout_assignments wa
          join public.students s on s.id = wa.student_id
          where wa.workout_id = w.id and s.user_id = auth.uid()
        )
      )
    )
  )
  with check (
    exists (select 1 from public.workouts w where w.id = workout_id and w.trainer_id = auth.uid())
  );

-- 2.5 WORKOUT_EXERCISES
drop policy if exists "Workout exercises via block" on public.workout_exercises;
create policy "Workout exercises via block"
  on public.workout_exercises for all
  to authenticated
  using (
    exists (
      select 1 from public.workout_blocks b
      join public.workouts w on w.id = b.workout_id
      where b.id = block_id and (
        w.trainer_id = auth.uid()
        or exists (
          select 1 from public.workout_assignments wa
          join public.students s on s.id = wa.student_id
          where wa.workout_id = w.id and s.user_id = auth.uid()
        )
      )
    )
  )
  with check (
    exists (
      select 1 from public.workout_blocks b
      join public.workouts w on w.id = b.workout_id
      where b.id = block_id and w.trainer_id = auth.uid()
    )
  );

-- 2.6 WORKOUT_EXECUTIONS
drop policy if exists "Student manages own executions" on public.workout_executions;
create policy "Student manages own executions"
  on public.workout_executions for all
  to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.id = student_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.students s
      where s.id = student_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Trainer reads student executions" on public.workout_executions;
create policy "Trainer reads student executions"
  on public.workout_executions for select
  to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.id = student_id and s.trainer_id = auth.uid()
    )
  );

-- 2.7 EXERCISE_LOGS
drop policy if exists "Student manages own logs" on public.exercise_logs;
create policy "Student manages own logs"
  on public.exercise_logs for all
  to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.id = student_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.students s
      where s.id = student_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Trainer reads student logs" on public.exercise_logs;
create policy "Trainer reads student logs"
  on public.exercise_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.id = student_id and s.trainer_id = auth.uid()
    )
  );

-- 2.8 BILLING_EVENTS - sem policies, apenas service_role acessa
