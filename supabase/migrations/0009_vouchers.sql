-- =====================================================================
-- Vouchers / cupons de desconto
-- =====================================================================

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('fixed_price', 'percent', 'fixed_discount')),
  -- fixed_price: cobra exatamente este valor (ignora preco do plano)
  -- percent: aplica X% de desconto (value entre 0-100)
  -- fixed_discount: subtrai X reais do preco do plano
  value numeric(10, 2) not null,
  max_uses int,
  uses_count int not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  active boolean not null default true,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists vouchers_code_active_idx
  on public.vouchers (code) where active = true;

alter table public.vouchers enable row level security;
-- Sem policy SELECT publica: validacao acontece via service_role no server action
-- (impede que alguem liste todos os cupons existentes consultando a tabela)

-- ----------------------------------------------------------------------
-- Trainers: registra qual voucher foi usado (audit + impede reuso)
-- ----------------------------------------------------------------------
alter table public.trainers
  add column if not exists voucher_used text,
  add column if not exists voucher_used_at timestamptz;

-- ----------------------------------------------------------------------
-- Seed: BEMVINDO2804 - paga R$ 1,00 na primeira assinatura
--   Valido apenas ate o final do dia atual (UTC)
-- ----------------------------------------------------------------------
insert into public.vouchers (
  code, type, value, max_uses, valid_until, description
) values (
  'BEMVINDO2804',
  'fixed_price',
  1.00,
  null,
  date_trunc('day', now() at time zone 'America/Sao_Paulo')
    + interval '1 day' - interval '1 second',
  'Bem-vindo! Pague R$ 1,00 na sua primeira mensalidade. Valido apenas hoje.'
)
on conflict (code) do update
  set valid_until = excluded.valid_until,
      active = true;
