-- 0025_student_assessments.sql
-- Avaliacoes fisicas (Pollock 7 dobras) + medidas basicas.

create table if not exists public.student_assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  trainer_id uuid not null references public.trainers(id) on delete cascade,

  -- Dados base
  assessment_date date not null default current_date,
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  age int,
  sex text check (sex in ('M', 'F')),

  -- Dobras cutaneas (mm) - Pollock 7 dobras
  skinfold_chest numeric(5,2),
  skinfold_axillary numeric(5,2),
  skinfold_tricep numeric(5,2),
  skinfold_subscapular numeric(5,2),
  skinfold_abdominal numeric(5,2),
  skinfold_suprailiac numeric(5,2),
  skinfold_thigh numeric(5,2),

  -- Resultados calculados (gravados pra historico mesmo se mudar formula)
  body_density numeric(6,5),
  body_fat_pct numeric(5,2),
  fat_mass_kg numeric(5,2),
  lean_mass_kg numeric(5,2),
  bmi numeric(5,2),

  -- Perimetros opcionais (cm)
  circumference_chest numeric(5,2),
  circumference_waist numeric(5,2),
  circumference_hip numeric(5,2),
  circumference_arm_right numeric(5,2),
  circumference_arm_left numeric(5,2),
  circumference_thigh_right numeric(5,2),
  circumference_thigh_left numeric(5,2),
  circumference_calf_right numeric(5,2),
  circumference_calf_left numeric(5,2),

  notes text,
  protocol text not null default 'pollock_7' check (protocol in ('pollock_7', 'manual')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_assessments_student_idx
  on public.student_assessments (student_id, assessment_date desc);

create index if not exists student_assessments_trainer_idx
  on public.student_assessments (trainer_id);

drop trigger if exists student_assessments_set_updated_at on public.student_assessments;
create trigger student_assessments_set_updated_at
  before update on public.student_assessments
  for each row execute function public.set_updated_at();

alter table public.student_assessments enable row level security;

drop policy if exists "Trainer manages own assessments" on public.student_assessments;
create policy "Trainer manages own assessments"
  on public.student_assessments
  for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

comment on table public.student_assessments is 'Avaliacoes fisicas dos alunos (Pollock 7 dobras + perimetros).';
