# Checklist para receber pagamento de verdade

Este documento lista o que precisa estar configurado para o Ultra PT processar pagamentos reais (dinheiro entrar na sua conta).

> ⚠️ **Estado atual:** o sistema está rodando com chave **sandbox** do Asaas. Cobranças funcionam tecnicamente, mas o dinheiro **não cai na sua conta** — é ambiente de testes.

---

## 1. Conta Asaas em produção

Você precisa de uma conta Asaas com KYC aprovado.

1. Acesse https://www.asaas.com (sem `/sandbox`)
2. Cadastre conta com seu CPF ou CNPJ
3. Complete a verificação de identidade (envia foto do documento, comprovante de endereço)
4. **Aprovação leva de minutos a algumas horas** dependendo do dia
5. Após aprovado, vá em **Configurações → Integrações → API**
6. Gere uma nova **API Key de produção** — geralmente começa com `$aact_prod_` ou prefixo diferente do sandbox `$aact_hmlg_`

> **Importante:** Asaas sandbox e produção são contas separadas. Verificar no sandbox não vale para produção.

---

## 2. Atualizar variáveis na Vercel

No painel Vercel → Settings → Environment Variables, atualize:

| Variável | Valor |
|---|---|
| `ASAAS_API_KEY` | Sua API key de produção |
| `ASAAS_ENV` | `production` |

Aplique nos 3 ambientes: **Production**, **Preview**, **Development** (ou pelo menos Production + Preview).

Depois disso, **redeploy** para aplicar as variáveis.

---

## 3. Configurar webhook na Asaas produção

1. No painel Asaas (produção), vá em **Configurações → Integrações → Webhooks**
2. **Novo Webhook**:
   - **Nome:** Pagamento Ultra PT
   - **URL:** `https://project-pwzai.vercel.app/api/webhooks/asaas`
     - (ou seu domínio próprio se já tiver)
   - **Versão da API:** v3
   - **Token de autenticação:** gere um novo token aleatório (`openssl rand -hex 32`) e use o MESMO valor em:
     - **Asaas** → campo "Token de autenticação" deste webhook
     - **Vercel** → env var `ASAAS_WEBHOOK_TOKEN` (Production/Preview/Development)
     - **Não comitar este valor em arquivo nenhum.**
   - **Tipo de envio:** Não sequencial
   - **Fila ativada:** sim
3. **Eventos** — marque pelo menos:
   - PAYMENT_CONFIRMED
   - PAYMENT_RECEIVED
   - PAYMENT_OVERDUE
   - PAYMENT_DELETED
   - SUBSCRIPTION_DELETED
   - SUBSCRIPTION_INACTIVATED
4. Salvar

---

## 4. Garantir que produção tem a versão atualizada

A URL de produção (`project-pwzai.vercel.app`) deploya da branch `main`. Se você desenvolveu em `dev`, faça merge:

```bash
git checkout main
git merge dev
git push origin main
```

Vercel detecta o push e deploya automaticamente.

> O Claude Code já fez esse merge se autorizou na conversa.

---

## 5. Migrations aplicadas

Confirme que as **9 migrations** estão aplicadas no Supabase. Em ordem:

- 0001_initial_schema.sql
- 0002_profile_and_anamnesis.sql
- 0003_workouts_and_billing.sql ← (use 0006 no lugar dela)
- 0004_exercises_seed.sql
- 0005_student_access_code.sql
- 0006_fix_workouts_order.sql ← substitui a 0003
- 0007_cpf_and_storage_fix.sql
- 0008_landing_templates.sql
- 0009_vouchers.sql

Como verificar: SQL Editor → `select count(*) from public.exercises;` deve retornar ~80. `select * from public.vouchers;` deve mostrar `BEMVINDO2804`.

---

## 6. Domínio próprio (recomendado)

URL atual `project-pwzai.vercel.app` é longa e quebra confiança.

1. Compre `ultrapt.com.br` ou similar (registro.br ~R$40/ano)
2. Vercel: **Project → Settings → Domains → Add**
3. Configure os DNS records que a Vercel mostrar (CNAME ou A)
4. Aguarde propagação (~10 min a 2h)
5. Atualize na Vercel a variável `NEXT_PUBLIC_APP_URL` para o novo domínio
6. Atualize a URL do webhook no Asaas

---

## 7. Teste real antes de divulgar

1. Crie sua própria conta no app (com email novo)
2. Vá em **Assinatura**
3. Use um plano + CPF real + opcionalmente um cupom
4. Confirme que recebeu o boleto/QR Pix por e-mail (Asaas envia)
5. Pague com seu próprio cartão/Pix
6. Confirme que o status no painel mudou de "trialing" para "active"
7. Confirme o dinheiro caiu no seu Asaas (vai pra sua conta bancária no D+1)

---

## Estado atual (29/04/2026)

| Item | Status |
|---|---|
| Conta Asaas sandbox | ✅ Configurada |
| API key sandbox | ✅ Em uso |
| Conta Asaas produção | ❌ **Pendente** |
| API key produção | ❌ **Pendente** |
| Webhook sandbox | ✅ Configurado |
| Webhook produção | ❌ **Pendente** |
| Migrations 0001–0009 | ✅ Aplicadas |
| Branch `main` atualizada | (verificar após merge) |
| Domínio próprio | ❌ Opcional |
| Voucher BEMVINDO2804 | ✅ Ativo (R$ 1,00, válido só hoje) |

---

## Cupons disponíveis

| Código | Tipo | Valor | Validade | Status |
|---|---|---|---|---|
| `BEMVINDO2804` | fixed_price | R$ 1,00 | Apenas hoje (timezone São Paulo) | ✅ Ativo |

Para criar novos cupons via SQL Editor:

```sql
insert into public.vouchers (code, type, value, max_uses, valid_until, description)
values (
  'CODIGO',         -- código (será comparado em maiúsculas)
  'fixed_price',    -- ou 'percent' (0-100) ou 'fixed_discount'
  29.90,            -- valor
  100,              -- max usos (null = ilimitado)
  '2026-12-31 23:59:59',  -- validade
  'Descrição visível ao usuário'
);
```

---

## Suporte

Em caso de dúvida ou bug, me avise no Claude Code. Tudo que foi feito está versionado em `git log`.
