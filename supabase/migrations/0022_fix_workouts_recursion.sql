-- =====================================================================
-- Hotfix: infinite recursion entre policies de workouts e
-- workout_assignments.
--
-- Causa: a policy "Student reads assigned workouts" em workouts
-- consulta workout_assignments, e a policy "Trainer manages assignments"
-- em workout_assignments consulta workouts. Quando o Postgres precisa
-- avaliar SELECT em workouts (depois de INSERT, por exemplo), o loop
-- bate o limite.
--
-- Solucao: extrair os EXISTS das policies em funcoes SECURITY DEFINER
-- que bypassam RLS, quebrando a recursao na raiz.
-- =====================================================================

-- 1. funcoes helper -------------------------------------------------------

create or replace function public.user_owns_workout(p_workout_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.workouts
    where id = p_workout_id and trainer_id = p_user_id
  );
$$;

create or replace function public.user_assigned_to_workout(p_workout_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.workout_assignments wa
    join public.students s on s.id = wa.student_id
    where wa.workout_id = p_workout_id and s.user_id = p_user_id
  );
$$;

-- 2. recria policies sem EXISTS aninhado ---------------------------------

drop policy if exists "Student reads assigned workouts" on public.workouts;
create policy "Student reads assigned workouts"
  on public.workouts for select
  to authenticated
  using (public.user_assigned_to_workout(id, auth.uid()));

drop policy if exists "Trainer manages assignments" on public.workout_assignments;
create policy "Trainer manages assignments"
  on public.workout_assignments for all
  to authenticated
  using (public.user_owns_workout(workout_id, auth.uid()))
  with check (public.user_owns_workout(workout_id, auth.uid()));
