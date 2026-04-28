-- =====================================================================
-- Vuln 6: bucket student-photos permitia anon upload arbitrario e
-- qualquer trainer apagava qualquer foto. Como o upload acontece
-- via server action com admin client, podemos REVOGAR o upload anon
-- direto e restringir delete ao dono da pasta.
-- =====================================================================

-- Remove policy de upload anon (server action faz via service_role)
drop policy if exists "Public can upload student photos" on storage.objects;

-- Remove policy de delete sem ownership
drop policy if exists "Trainer manages student photos" on storage.objects;

-- Trainer so deleta fotos de alunos NA SUA PROPRIA pasta
-- (path comeca com o trainer_id como primeiro segmento)
create policy "Trainer deletes own students photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'student-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read continua publico (necessario pra exibir fotos na landing
-- e no dashboard sem signed URLs).
-- A policy "Public can read student photos" permanece como esta.
