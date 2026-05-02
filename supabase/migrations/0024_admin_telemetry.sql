-- 0024_admin_telemetry.sql
-- Adiciona colunas de telemetria de cadastro pra area administrativa.

alter table public.trainers
  add column if not exists signup_referer text,
  add column if not exists signup_user_agent text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text;

comment on column public.trainers.signup_referer is 'Header Referer no momento do cadastro (origem do trafego).';
comment on column public.trainers.signup_user_agent is 'Header User-Agent no momento do cadastro.';
comment on column public.trainers.terms_accepted_at is 'Timestamp do aceite dos termos de uso no signup.';
comment on column public.trainers.terms_version is 'Versao dos termos aceitos no signup.';
