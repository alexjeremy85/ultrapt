-- 0027_community_invite_tracking.sql
-- Adiciona timestamp pra rastrear se o trainer ja viu o modal de convite
-- pra comunidade (WhatsApp). Modal aparece 1x na primeira visita ao dashboard.

alter table public.trainers
  add column if not exists community_invite_seen_at timestamptz;

comment on column public.trainers.community_invite_seen_at is
  'Quando o trainer fechou (entrou ou dispensou) o modal de convite pra comunidade do WhatsApp. NULL = ainda nao viu.';
