# Smoke Test — Ultra PT

Checklist completo pra rodar **antes de cada divulgação** (lançamento,
mídia paga, parceria, post no Instagram). Tempo estimado: **8-12 minutos**.

> **Princípio:** Se um passo falhar, **não divulgue**. Investigue logs no
> Vercel (`[contexto]`) e corrija antes.

## Pré-requisitos

- [ ] DNS de `ultrapt.com.br` resolvendo (testar `dig ultrapt.com.br`)
- [ ] Último deploy em produção (`main` branch) tem status **Ready** na Vercel
- [ ] Migrations 0001-0018 todas aplicadas no Supabase
- [ ] Env vars setadas em produção:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ASAAS_API_KEY`, `ASAAS_ENV=production` (ou `sandbox`)
  - `ASAAS_WEBHOOK_TOKEN`
  - `NEXT_PUBLIC_APP_URL=https://ultrapt.com.br`
- [ ] Webhook do Asaas configurado pra `https://ultrapt.com.br/api/webhooks/asaas`
- [ ] Aba do Vercel Logs aberta em outra janela pra acompanhar

---

## Fase 1 — Landing pública (1min)

- [ ] **1.1** Abrir `https://ultrapt.com.br` em janela anônima
  - Esperado: hero "Trate seus alunos como clientes premium" + mockup
  - Sinais ruins: emoji visível, layout quebrado, JS error no console
- [ ] **1.2** Rolar até a seção **Pricing** → 3 planos (Starter R$59, Pro R$119, Scale R$179) visíveis
- [ ] **1.3** Verificar bloco do **fundador** (R$ 119 → R$ 59 nos 3 primeiros meses)
- [ ] **1.4** Botão "Criar conta grátis" leva pra `/signup`

## Fase 2 — Cadastro de PT (2min)

- [ ] **2.1** Em `/signup`, criar conta com **e-mail novo** (use Gmail+alias: `seuemail+teste1@gmail.com`)
  - Senha mínimo 8 caracteres
- [ ] **2.2** Receber e-mail de confirmação (se Supabase exige)
  - Se não receber em 1min: checar pasta spam, ou Supabase Auth pode estar com URL Configuration incorreta
- [ ] **2.3** Confirmar e-mail → redirect pra `/dashboard`
  - Esperado: Vercel Logs `[signup] success` e `[signup] success awaiting email confirmation`
- [ ] **2.4** Dashboard carrega com 4 cards (todos com 0) + URL pública do PT visível

## Fase 3 — Perfil + página pública (1.5min)

- [ ] **3.1** `/dashboard/profile` → preencher: foto, CREF, cidade, bio curta, escolher template Bold
- [ ] **3.2** Salvar → ver mensagem de sucesso
- [ ] **3.3** Clicar **"Ver pública"** → abrir página do PT em nova aba
  - Esperado: hero com nome, foto, especialidades, botão "Quero treinar com você"
  - Sinais ruins: nome em branco, foto não carrega, 404

## Fase 4 — Captação via anamnese (1.5min)

- [ ] **4.1** Em janela anônima, abrir a URL pública do PT (`/pt/<slug>`)
- [ ] **4.2** Clicar **"Quero treinar com você"** → vai pra `/pt/<slug>/anamnese`
- [ ] **4.3** Preencher form **mínimo**: nome, e-mail, telefone, objetivo
- [ ] **4.4** Submit → ver tela "Anamnese enviada com sucesso"
  - Esperado nos logs: `[anamnesis] success` com `studentId`
- [ ] **4.5** Voltar como PT em `/dashboard/leads` → lead aparece na lista

## Fase 5 — Cadastro manual de aluno (1min)

- [ ] **5.1** `/dashboard/students/new` → preencher nome (obrigatório), e-mail, telefone, objetivo
- [ ] **5.2** Submit → redirect pra `/dashboard/students/<id>`
  - Esperado nos logs: `[students-create] success` com `studentId`
  - Sinais ruins: 404 → ver `[students-detail]` log
- [ ] **5.3** Ver código de acesso + link gerado
- [ ] **5.4** Clicar **"Copiar link"** → confirma "Copiado"

## Fase 6 — Treino e atribuição (2min)

- [ ] **6.1** `/dashboard/workouts/new` → criar treino "Treino A"
  - Logs: `[workouts-create] success`
- [ ] **6.2** Adicionar 1 bloco "Inferiores" → adicionar 2 exercícios da biblioteca → ajustar séries/reps
- [ ] **6.3** Voltar em `/dashboard/students/<id>` → atribuir o treino criado
- [ ] **6.4** Treino aparece na lista de "Treinos atribuídos"
- [ ] **6.5** Clicar **"Imprimir / PDF"** → abre nova aba com layout de impressão

## Fase 7 — App do aluno (1.5min)

- [ ] **7.1** Abrir o **link do aluno** copiado em janela anônima (`/aluno/<code>`)
- [ ] **7.2** Carrega home com nome do PT + treino "Treino A"
- [ ] **7.3** Clicar no treino → expande blocos
- [ ] **7.4** Clicar no bloco → vai pra execução
- [ ] **7.5** Marcar 1 série como feita → confirma cronômetro
- [ ] **7.6** Voltar pra home com seta ←

## Fase 8 — Chat aluno ↔ PT (1min)

- [ ] **8.1** Como aluno, em `/aluno/<code>/chat` → mandar "Oi PT, teste"
- [ ] **8.2** Como PT, em `/dashboard/students/<id>/chat` → ver mensagem chegar (até 6s)
- [ ] **8.3** Como PT, mandar "Recebido!" → aluno vê resposta

## Fase 9 — Cobrança Pix embutida (2min)

- [ ] **9.1** Como PT, ir em `/dashboard/billing`
- [ ] **9.2** Preencher CPF válido (se em sandbox, qualquer CPF gerador)
- [ ] **9.3** Clicar "Pagar com Pix" no plano Pro
- [ ] **9.4** Modal Pix abre com QR Code + Copia e Cola + timer
  - Sinais ruins: erro vermelho, modal não abre, "Asaas demorou pra gerar a cobrança"
  - Logs: `[billing]` em caso de erro
- [ ] **9.5** Copiar código → pagar via app do banco (em sandbox, simular no painel Asaas)
- [ ] **9.6** Aguardar até 8s → modal vira "Pagamento confirmado!" → redirect
- [ ] **9.7** Status no painel vira **Ativo** → aparece "Próxima cobrança", "Histórico"
  - Logs do webhook: `[asaas-webhook] received` + `[asaas-webhook] trainer status updated`

## Fase 10 — Cancelar (30s)

- [ ] **10.1** No painel ativo, clicar **"Cancelar assinatura"** → confirmação
- [ ] **10.2** Confirmar → status vira "Cancelado", subscription cancelada na Asaas
  - Logs: `[billing]` cancel action

---

## Pós-teste — Limpeza

- [ ] Apagar a conta de teste no Supabase (`auth.users` → cascade limpa trainer e students)
- [ ] Cancelar a subscription de teste no Asaas (se em produção)

---

## Quando NÃO divulgar

🚫 Qualquer dos itens acima falhou e ainda não foi corrigido com novo deploy verificado.

🚫 Vercel Logs mostram errors recentes não-resolvidos.

🚫 Migrations pendentes no Supabase.

🚫 Webhook Asaas não configurado / token errado.

---

## Cobertura de teste — gap conhecido

Este smoke test **não cobre**:

- Edge cases de e-mail (domínios bloqueados pelo Supabase)
- Recuperação de senha do PT (fluxo existe via Supabase mas não testado aqui)
- Expiração de trial automática (precisa esperar 14 dias)
- Webhook do Asaas com payload malformado
- Múltiplos trainers atendendo mesmo aluno (não suportado por design)
- Aluno perdendo o link / segunda autenticação (limitação atual conhecida)

Pra cobertura mais ampla, ver `docs/JORNADAS.md`.
