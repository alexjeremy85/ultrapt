-- =====================================================================
-- Tabela de series individuais por exercicio do template.
-- Permite fidelidade total ao GymDay: warm-up, drop set, to failure
-- e variacao de min/max reps + descanso por serie.
-- =====================================================================

create table if not exists public.workout_template_exercise_sets (
  id uuid primary key default gen_random_uuid(),
  template_exercise_id uuid not null
    references public.workout_template_exercises(id) on delete cascade,
  set_number int not null,
  min_reps int,
  max_reps int,
  rest_seconds int,
  warm_up boolean not null default false,
  drop_set boolean not null default false,
  to_failure boolean not null default false
);

create index if not exists workout_template_exercise_sets_te_idx
  on public.workout_template_exercise_sets (template_exercise_id, set_number);

alter table public.workout_template_exercise_sets enable row level security;

drop policy if exists "Trainers read template exercise sets"
  on public.workout_template_exercise_sets;
create policy "Trainers read template exercise sets"
  on public.workout_template_exercise_sets for select
  to authenticated
  using (true);
