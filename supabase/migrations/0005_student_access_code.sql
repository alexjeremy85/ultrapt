-- =====================================================================
-- Ultra Personal Trainer - Student access via codigo unico (sem login)
-- O aluno recebe um link /aluno/[code] do PT pelo WhatsApp e acessa
-- o app sem precisar criar conta na primeira versao.
-- =====================================================================

alter table public.students
  add column if not exists access_code text unique default replace(gen_random_uuid()::text, '-', '');

-- Garante codigo para registros existentes
update public.students
  set access_code = replace(gen_random_uuid()::text, '-', '')
  where access_code is null;

create index if not exists students_access_code_idx
  on public.students (access_code);

-- Funcao para resolver student por codigo (usada via service_role no API)
-- (RLS continua intacta; apenas service_role acessa essa funcao)
