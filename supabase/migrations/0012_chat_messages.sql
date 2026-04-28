-- =====================================================================
-- Chat 1:1 entre Personal Trainer e aluno
--   Conversa identificada pelo par (trainer_id, student_id)
--   - PT envia/le via auth (RLS)
--   - Aluno envia/le via service_role na server action (e anonimo)
-- =====================================================================

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  sender_role text not null check (sender_role in ('trainer', 'student')),
  content text not null check (length(content) > 0 and length(content) <= 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_thread_idx
  on public.chat_messages (trainer_id, student_id, created_at desc);

create index if not exists chat_messages_unread_idx
  on public.chat_messages (trainer_id, student_id)
  where read_at is null;

alter table public.chat_messages enable row level security;

-- Trainer ve toda a conversa com seus alunos
drop policy if exists "Trainer reads own chat" on public.chat_messages;
create policy "Trainer reads own chat"
  on public.chat_messages for select
  to authenticated
  using (trainer_id = auth.uid());

-- Trainer envia mensagem (sender_role='trainer')
drop policy if exists "Trainer sends chat" on public.chat_messages;
create policy "Trainer sends chat"
  on public.chat_messages for insert
  to authenticated
  with check (
    trainer_id = auth.uid()
    and sender_role = 'trainer'
    and exists (
      select 1 from public.students s
      where s.id = student_id and s.trainer_id = auth.uid()
    )
  );

-- Trainer atualiza read_at (marcar como lida)
drop policy if exists "Trainer updates own chat" on public.chat_messages;
create policy "Trainer updates own chat"
  on public.chat_messages for update
  to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());
