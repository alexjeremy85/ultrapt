-- 0031_lgpd_account_deletion.sql
-- LGPD Art. 18 IV — direito ao apagamento. Quando o trainer pede exclusao da
-- conta, NAO fazemos hard delete (perderia historico fiscal de pagamentos).
-- Em vez disso: anonimiza dados pessoais, mantem registros minimos pra
-- obrigacao legal (CTN guarda fiscal 5 anos).

-- 1. Coluna pra marcar conta excluida (soft tombstone)
alter table public.trainers
  add column if not exists deleted_at timestamptz;

create index if not exists trainers_deleted_idx on public.trainers (deleted_at)
  where deleted_at is not null;

-- 2. Funcao que anonimiza um trainer e tudo dele (cascade logico).
-- Retorna jsonb com resumo do que foi anonimizado.
-- SECURITY DEFINER pra rodar com permissoes elevadas (a chamada e gated
-- via server action que verifica auth.uid() = target_id).
create or replace function public.anonymize_trainer_account(target_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anon_email text;
  v_student_count int;
  v_workout_count int;
begin
  v_anon_email := 'deleted-' || target_id::text || '@anonymized.ultrapt.local';

  -- Conta linhas pra log
  select count(*) into v_student_count from public.students where trainer_id = target_id;
  select count(*) into v_workout_count from public.workouts where trainer_id = target_id;

  -- Anonimiza alunos (sao dados pessoais cujo controlador era o PT;
  -- quando o PT vai embora, os dados perdem finalidade — anonimiza tudo)
  update public.students
    set full_name = 'Aluno removido',
        email = null,
        phone = null,
        photo_url = null,
        birth_date = null,
        cpf = null,
        objective = null,
        anamnesis_data = null,
        notes = null,
        tags = '{}',
        acquisition_source = null,
        acquisition_campaign = null,
        acquisition_referrer = null
    where trainer_id = target_id;

  -- Anonimiza mensagens de chat (mantem estrutura, remove conteudo)
  update public.chat_messages
    set body = '[mensagem removida]'
    where trainer_id = target_id;

  -- Anonimiza dados pessoais do trainer; mantem id, subscription_status,
  -- subscription_plan, asaas_customer_id, asaas_subscription_id, payment
  -- history (obrigacao fiscal CTN 5 anos).
  update public.trainers
    set full_name = 'Conta removida',
        slug = 'deleted-' || substring(target_id::text from 1 for 8),
        photo_url = null,
        bio = null,
        cref = null,
        instagram_handle = null,
        whatsapp = null,
        cpf = null,
        services_description = null,
        deleted_at = now()
    where id = target_id;

  -- Marca usuario do auth como deletado (Supabase ban via metadata)
  -- O proprio supabase.auth.admin.deleteUser e chamado no server action.

  return jsonb_build_object(
    'trainer_id', target_id,
    'students_anonymized', v_student_count,
    'workouts_kept', v_workout_count,
    'deleted_at', now()
  );
end;
$$;

revoke all on function public.anonymize_trainer_account(uuid) from public, anon, authenticated;
-- Apenas service_role (server action) pode chamar.

comment on function public.anonymize_trainer_account(uuid) is
  'LGPD Art. 18 IV — anonimiza dados pessoais do trainer e cascade (alunos, chat).
  Mantem registros fiscais (pagamentos, asaas_*) por 5 anos (CTN).
  Chamada apenas via server action autenticada que verifica auth.uid()=target_id.';
