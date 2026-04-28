-- =====================================================================
-- Persiste o ID do pagamento Pix atual da assinatura, pra permitir
-- polling de status direto do client (Pix embutido nativo).
-- =====================================================================

alter table public.trainers
  add column if not exists asaas_payment_id text;
