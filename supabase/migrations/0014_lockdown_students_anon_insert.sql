-- =====================================================================
-- Vuln 3: anon podia INSERT em students com colunas arbitrarias
-- (incluindo user_id, access_code, status). A acao de servidor
-- ja foi atualizada pra usar admin client com whitelist explicita,
-- entao podemos revogar o INSERT direto de anon.
-- =====================================================================

-- Remove a policy permissiva
drop policy if exists "Public can submit anamnesis" on public.students;

-- Revoga insert de anon em students (caso PostgREST ainda permitisse)
revoke insert on public.students from anon;

-- Garante que admin (service_role) continua podendo inserir
-- (service_role bypassa RLS por padrao, mas tornamos explicito)
grant insert, select, update, delete on public.students to service_role;
