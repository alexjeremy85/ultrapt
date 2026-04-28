-- =====================================================================
-- Persiste o invoiceUrl da ultima cobranca pendente do trainer
-- Permite mostrar "Pagar agora" caso o redirect direto pro Asaas falhe.
-- =====================================================================

alter table public.trainers
  add column if not exists asaas_invoice_url text;
