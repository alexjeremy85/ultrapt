-- =====================================================================
-- Vuln 11: claim de voucher era nao-atomico (select + update separados).
-- Substituimos por uma funcao SECURITY DEFINER que:
--   1. Verifica que o trainer ainda nao usou voucher
--   2. Verifica que o voucher esta ativo + valido + dentro do limite
--   3. Atomic: marca trainer.voucher_used + incrementa vouchers.uses_count
-- Tudo em uma unica transacao com row locks.
-- =====================================================================

create or replace function public.claim_voucher(
  p_trainer_id uuid,
  p_code text
) returns table (
  ok boolean,
  reason text,
  voucher_id uuid,
  voucher_code text,
  voucher_value numeric,
  voucher_type text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_voucher record;
  v_trainer record;
begin
  -- Lock no trainer pra evitar dupla aplicacao
  select id, voucher_used into v_trainer
  from public.trainers
  where id = p_trainer_id
  for update;

  if v_trainer is null then
    return query select false, 'Trainer nao encontrado'::text, null::uuid, null::text, null::numeric, null::text;
    return;
  end if;

  if v_trainer.voucher_used is not null then
    return query select false, 'Voce ja usou um cupom anteriormente.'::text, null::uuid, null::text, null::numeric, null::text;
    return;
  end if;

  -- Lock no voucher pra serializar uses_count
  select id, code, type, value, max_uses, uses_count, valid_from, valid_until, active
  into v_voucher
  from public.vouchers
  where upper(code) = upper(trim(p_code))
  for update;

  if v_voucher is null then
    return query select false, 'Cupom nao encontrado'::text, null::uuid, null::text, null::numeric, null::text;
    return;
  end if;

  if not v_voucher.active then
    return query select false, 'Cupom inativo'::text, null::uuid, null::text, null::numeric, null::text;
    return;
  end if;

  if v_voucher.valid_from is not null and v_voucher.valid_from > now() then
    return query select false, 'Cupom ainda nao esta valido'::text, null::uuid, null::text, null::numeric, null::text;
    return;
  end if;

  if v_voucher.valid_until is not null and v_voucher.valid_until < now() then
    return query select false, 'Cupom expirado'::text, null::uuid, null::text, null::numeric, null::text;
    return;
  end if;

  if v_voucher.max_uses is not null and v_voucher.uses_count >= v_voucher.max_uses then
    return query select false, 'Cupom atingiu limite de usos'::text, null::uuid, null::text, null::numeric, null::text;
    return;
  end if;

  -- Atomic: marca uso no trainer + incrementa uses_count
  update public.trainers
     set voucher_used = v_voucher.code,
         voucher_used_at = now()
   where id = p_trainer_id;

  update public.vouchers
     set uses_count = uses_count + 1
   where id = v_voucher.id;

  return query select true, null::text, v_voucher.id, v_voucher.code, v_voucher.value, v_voucher.type;
end;
$$;

revoke execute on function public.claim_voucher(uuid, text) from public, anon;
grant execute on function public.claim_voucher(uuid, text) to authenticated, service_role;
