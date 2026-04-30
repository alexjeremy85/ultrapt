-- =====================================================================
-- Cupons de parceiro: estendem o trial em N dias ao inves de descontar
-- valor monetario.
--
-- Tipo novo: extend_trial_days. value = numero de dias a estender.
-- O cupom e aplicado pelo trainer durante o trial, sem envolver Asaas.
-- =====================================================================

-- 1. atualiza check do tipo pra incluir extend_trial_days
alter table public.vouchers
  drop constraint if exists vouchers_type_check;

alter table public.vouchers
  add constraint vouchers_type_check
  check (type in (
    'fixed_price',
    'percent',
    'fixed_discount',
    'extend_trial_days'
  ));

-- 2. cupons individuais pra parceiros (single-use)
insert into public.vouchers (
  code, type, value, max_uses, valid_until, description
) values
  (
    'GUILHERME90',
    'extend_trial_days',
    90,
    1,
    null,
    'Parceiro Guilherme: 90 dias de trial estendido'
  ),
  (
    'KAPPS90',
    'extend_trial_days',
    90,
    1,
    null,
    'Parceiro Kapps: 90 dias de trial estendido'
  )
on conflict (code) do update
  set type = excluded.type,
      value = excluded.value,
      max_uses = excluded.max_uses,
      description = excluded.description,
      active = true;
