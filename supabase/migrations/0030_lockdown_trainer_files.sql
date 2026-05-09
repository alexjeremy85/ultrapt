-- 0030_lockdown_trainer_files.sql
-- HOTFIX seguranca: a policy "Public can read trainer files" criada na 0028
-- permitia que qualquer usuario autenticado fizesse LIST/SELECT de arquivos
-- de outros trainers via API (storage.from('trainer-files').list(<outro-uid>)).
--
-- Correcao: dropa a policy publica e cria uma restrita ao dono. O bucket
-- continua public=true porque o caso de uso e o trainer copiar um link e
-- mandar pro aluno (sem autenticacao). O fluxo /object/public/<path> bypassa
-- RLS, entao downloads diretos por URL completa continuam funcionando.
-- O que muda: ninguem mais consegue ENUMERAR/LISTAR arquivos de outros
-- trainers via API autenticada.

drop policy if exists "Public can read trainer files" on storage.objects;

create policy "Trainers list own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'trainer-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Constraint: pagamentos so podem ser positivos. Bloqueia bypass de FormData
-- com valor negativo que inflaria credito artificial nos relatorios.
alter table public.student_payments
  drop constraint if exists student_payments_amount_positive;
alter table public.student_payments
  add constraint student_payments_amount_positive
  check (amount > 0);
