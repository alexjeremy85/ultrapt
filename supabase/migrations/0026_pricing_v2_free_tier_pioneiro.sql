-- 0026_pricing_v2_free_tier_pioneiro.sql
-- Substitui trial de 14 dias por Free Tier (ate 2 alunos).
-- Adiciona Pioneiro (preco travado) e ciclo (mensal/anual).
-- Renomeia tiers: starter -> solo, pro -> pro, scale -> escala. Adiciona free.

-- 1. Drop constraints antigas
alter table public.trainers
  drop constraint if exists trainers_subscription_status_check;
alter table public.trainers
  drop constraint if exists trainers_subscription_plan_check;

-- 2. Adiciona colunas novas
alter table public.trainers
  add column if not exists is_pioneiro boolean not null default false,
  add column if not exists subscription_cycle text,
  add column if not exists subscription_value numeric(8,2),
  add column if not exists subscription_started_at timestamptz;

-- 3. Migra dados existentes
-- Tudo que era 'trialing' vira 'free'
update public.trainers
  set subscription_status = 'free',
      trial_ends_at = null
  where subscription_status in ('trialing', 'trial_expired');

-- Tudo que era plano antigo (starter/pro/scale) que ainda existe — converte
-- starter -> solo, scale -> escala, pro fica pro
update public.trainers
  set subscription_plan = 'solo'
  where subscription_plan = 'starter';
update public.trainers
  set subscription_plan = 'escala'
  where subscription_plan = 'scale';

-- Default plan vira 'free'
alter table public.trainers
  alter column subscription_plan set default 'free';

-- 4. Recria constraints com novos valores
alter table public.trainers
  add constraint trainers_subscription_status_check
  check (subscription_status in ('free','pending_payment','active','past_due','canceled'));

alter table public.trainers
  add constraint trainers_subscription_plan_check
  check (subscription_plan in ('free','solo','pro','escala'));

alter table public.trainers
  add constraint trainers_subscription_cycle_check
  check (subscription_cycle is null or subscription_cycle in ('monthly','annual'));

-- 5. Atualiza default de subscription_status pra 'free'
alter table public.trainers
  alter column subscription_status set default 'free';

-- 6. Atualiza trigger handle_new_user_trainer pra criar com status='free' sem trial_ends_at
create or replace function public.handle_new_user_trainer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_base_slug text;
  v_slug text;
  v_counter int := 0;
begin
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  v_base_slug := lower(regexp_replace(unaccent(v_full_name), '[^a-zA-Z0-9]+', '-', 'g'));
  v_base_slug := trim(both '-' from v_base_slug);
  if length(v_base_slug) = 0 then v_base_slug := 'trainer'; end if;

  v_slug := v_base_slug;
  while exists (select 1 from public.trainers where slug = v_slug) loop
    v_counter := v_counter + 1;
    v_slug := v_base_slug || '-' || v_counter::text;
  end loop;

  insert into public.trainers (id, full_name, slug, subscription_status, subscription_plan)
  values (new.id, v_full_name, v_slug, 'free', 'free');

  return new;
end;
$$;

-- 7. Indice pra contar pioneiros por plano (pra limitar 10 vagas)
create index if not exists trainers_pioneiro_plan_idx
  on public.trainers (subscription_plan)
  where is_pioneiro = true;

comment on column public.trainers.is_pioneiro is 'Founder Pioneiro: preco travado (10 vagas por plano).';
comment on column public.trainers.subscription_cycle is 'monthly ou annual (mensal recorrente / anual pagamento unico).';
comment on column public.trainers.subscription_value is 'Valor real pago (R$). Pioneiro tem valor menor que o cheio.';
comment on column public.trainers.subscription_started_at is 'Quando iniciou o plano pago atual (pra calculo de elegibilidade Pioneiro vitalicio).';
