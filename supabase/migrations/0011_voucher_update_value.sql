-- =====================================================================
-- Atualiza valor do voucher BEMVINDO2804 para R$ 5,00 e estende validade
-- ate o fim do dia atual (caso ja tenha rodado em outra data)
-- =====================================================================

update public.vouchers
   set value = 5.00,
       active = true,
       valid_until = date_trunc('day', now() at time zone 'America/Sao_Paulo')
                     + interval '1 day' - interval '1 second',
       description = 'Bem-vindo! Pague R$ 5,00 na sua primeira mensalidade. Valido apenas hoje.'
 where code = 'BEMVINDO2804';
