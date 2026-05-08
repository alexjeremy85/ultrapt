-- 0029_blocs_b_c_d.sql
-- Bloco B (tags), Bloco C (cobranca, anamnese rica, origem), Bloco D (periodizacao,
-- notificacoes, frequencia). Migration consolidada por escopo de feature.

-- ===== BLOCO B =====

-- B.3 Tags em alunos: array de strings livres
alter table public.students
  add column if not exists tags text[] not null default '{}';

create index if not exists students_tags_idx on public.students using gin (tags);

-- ===== BLOCO C =====

-- C.1 Cobranca recorrente (manual): trainer registra valor mensal e dia de
-- vencimento por aluno; marca como pago quando recebe (sem integracao Asaas
-- aluno-side por enquanto).
alter table public.students
  add column if not exists monthly_value numeric(8,2),
  add column if not exists payment_due_day smallint check (payment_due_day between 1 and 31),
  add column if not exists last_payment_at timestamptz;

create table if not exists public.student_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  amount numeric(8,2) not null,
  paid_at timestamptz not null default now(),
  reference_month date not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists student_payments_trainer_idx
  on public.student_payments (trainer_id, paid_at desc);

alter table public.student_payments enable row level security;

drop policy if exists "Trainers manage own student payments" on public.student_payments;
create policy "Trainers manage own student payments"
  on public.student_payments for all
  to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

-- C.3 Anamnese rica: campos extras
alter table public.students
  add column if not exists health_conditions text,
  add column if not exists current_medications text,
  add column if not exists previous_injuries text,
  add column if not exists sleep_hours_avg smallint,
  add column if not exists water_liters_per_day numeric(3,1),
  add column if not exists training_frequency_target smallint,
  add column if not exists nutritionist_followup boolean,
  add column if not exists motivation_text text;

-- C.5 Origem dos acessos da landing publica do PT
alter table public.students
  add column if not exists acquisition_source text,
  add column if not exists acquisition_campaign text,
  add column if not exists acquisition_referrer text;

-- ===== BLOCO D =====

-- D.2 Plano periodizado: week_index nos workouts pra criar sequencia de
-- semanas. Trainer monta workout 1 (semana 1), workout 2 (semana 2), etc.
alter table public.workouts
  add column if not exists week_index smallint default 1;

alter table public.workout_assignments
  add column if not exists current_week smallint default 1;

-- D.3 Notificacoes inbox
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_trainer_unread_idx
  on public.notifications (trainer_id, read_at, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Trainers see own notifications" on public.notifications;
create policy "Trainers see own notifications"
  on public.notifications for all
  to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

-- D.4 Frequencia (sessoes por semana) no workout
alter table public.workouts
  add column if not exists weekly_frequency smallint check (weekly_frequency between 1 and 7);
