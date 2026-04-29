# Jornadas do Ultra PT

Documento que descreve passo-a-passo as 3 jornadas críticas do produto.
Use isto como **fonte de verdade** ao testar e debugar.

---

## 1. Jornada do Personal Trainer (PT)

### 1.1 Cadastro (signup)

1. PT acessa `https://ultrapt.com.br`
2. Clica em **"Começar grátis por 14 dias"** ou **"Criar conta"**
3. Preenche **nome completo, e-mail, senha** (mínimo 8 caracteres)
4. Clica em **"Criar conta grátis"**

**O que acontece no backend:**
- `supabase.auth.signUp()` cria usuário em `auth.users`
- Trigger `handle_new_trainer` cria registro em `public.trainers` automaticamente com `id = auth.uid()`, slug derivado do nome
- Se Supabase está configurado pra exigir confirmação de e-mail → PT vai pra `/login` com aviso "Verifique seu e-mail"
- Se não exige → sessão criada, redirect direto pra `/dashboard`

**Possíveis erros:**
- `User already registered` — e-mail já cadastrado
- `Password too weak` — Supabase pode ter Leaked Password Protection ativada
- Trigger `handle_new_trainer` falhou → trainer não tem registro em `trainers`. Sintoma: dashboard mostra "Erro ao carregar perfil"

**Logs:** `[signup]` no Vercel Logs.

### 1.2 Primeira vez no dashboard

1. PT entra em `/dashboard` → vê home com 4 cards (alunos ativos, total, leads, treinos) + URL pública dele + ações rápidas
2. PT clica **"Editar perfil"** → preenche foto, CREF, cidade, bio, especialidades, WhatsApp, Instagram, escolhe template e cor
3. Salva → URL pública (`ultrapt.com.br/pt/<slug>`) já fica viva

### 1.3 Captação automática

1. PT compartilha `ultrapt.com.br/pt/<slug>` no Instagram bio, WhatsApp, e-mail
2. Lead clica → vê página personalizada (template Bold/Minimal/Energy)
3. Lead clica **"Quero treinar com você"** → vai pra `/pt/<slug>/anamnese`
4. Lead preenche anamnese (treino, médico, ciclo, sono, alimentação, foto opcional)
5. Submete → registro criado em `students` com `status='pending'`
6. PT vê o lead em `/dashboard/leads`
7. PT pode aprovar ou rejeitar

### 1.4 Cadastro manual de aluno (sem captação)

1. Em `/dashboard/students`, clica **"+ Novo aluno"**
2. Preenche nome, e-mail (opcional), telefone (opcional), objetivo, nível, data de nascimento
3. Salva → registro criado em `students` com `status='active'`, `access_code` gerado automaticamente
4. Redirect pra `/dashboard/students/<id>` (página de detalhes)

**Logs:** `[students-create]` no Vercel Logs.

### 1.5 Compartilhar acesso com aluno

1. Na página do aluno, PT vê:
   - **Código de acesso** (UUID sem dashes)
   - **Link** `ultrapt.com.br/aluno/<code>`
   - **Botão "Copiar link"** (clipboard)
   - **Botão "Enviar WhatsApp"** (se PT preencheu phone do aluno) — abre wa.me com mensagem pré-pronta
2. Aluno recebe o link → abre direto, sem cadastro nem senha

### 1.6 Criação e atribuição de treino

1. `/dashboard/workouts` → **"+ Novo treino"** → preenche nome, objetivo, nível, duração
2. Em `/dashboard/workouts/<id>`, monta **blocos** (Aquecimento / A-Inferiores / B-Cardio etc.)
3. Em cada bloco adiciona exercícios da biblioteca (pesquisa) + define séries, reps, carga, descanso, tempo, notas
4. Volta na página do aluno → atribui o treino via formulário "Atribuir treino"
5. PT pode imprimir em PDF (`/dashboard/students/<id>/treino/<assignmentId>/imprimir`)

### 1.7 Cobrança / assinatura

1. PT entra em `/dashboard/billing`
2. Vê plano atual (Starter por padrão), badge de status (em trial / aguardando pagamento / ativo)
3. Preenche CPF (obrigatório p/ Asaas)
4. Opcional: insere cupom (ex: BEMVINDO2804)
5. Clica em "Pagar com Pix" no plano escolhido
6. Modal abre com **QR Code Pix + copia e cola**
7. Aluno paga no app do banco → polling detecta pagamento em ~4s → modal mostra "Pagamento confirmado!" → recarrega
8. Status vira **Ativo** → painel mostra plano, valor, próxima cobrança, histórico de pagamentos, botão "Cancelar"

**Logs Pix/Webhook:** `[asaas-webhook]` no Vercel Logs.

### 1.8 Chat com aluno

1. Em `/dashboard/students/<id>`, clica **"Conversar"**
2. Polling 6s busca mensagens novas
3. Aluno também tem `/aluno/<code>/chat` com a mesma thread

---

## 2. Jornada do Aluno

### 2.1 Lead que veio pela página pública

1. Acessa `ultrapt.com.br/pt/<slug>` (recebeu link do PT)
2. Vê página personalizada com foto, nome, CREF do PT
3. Clica **"Quero treinar com você"**
4. Preenche anamnese (~30 campos opcionais + nome obrigatório)
5. Envia → mensagem "Anamnese enviada com sucesso"
6. **Aguarda PT entrar em contato** (PT precisa aprovar e mandar o link de acesso)

### 2.2 Aluno cadastrado pelo PT

1. Recebe link `ultrapt.com.br/aluno/<código>` por WhatsApp do PT
2. Abre direto no celular — sem cadastro, sem senha
3. Vê home com:
   - Foto + nome do PT (header)
   - Botão **"Conversar"** (chat com PT)
   - Lista de treinos atribuídos (cards)

### 2.3 Executar um bloco de treino

1. Na home, clica em um treino → expande blocos
2. Clica em um bloco → vai pra `/aluno/<code>/treino/<blockId>`
3. Vê lista de exercícios (séries × reps, carga, descanso, vídeo opcional do YouTube, notas)
4. Pra cada série: clica no número → marca como feita (vira ✓)
5. Cronômetro de descanso dispara automaticamente
6. Ao final clica "Finalizar bloco" → registro em `workout_executions`

### 2.4 Chat com PT

1. Em `/aluno/<code>/chat` digita mensagem → envia
2. Polling 6s busca respostas do PT

### 2.5 Risco conhecido (modelo atual)

⚠️ **Quem tiver o link entra.** Não há segunda autenticação. Se o aluno perder o link, ele depende do PT reenviar. Login com e-mail + senha pro aluno está no roadmap (4-6h de trabalho).

---

## 3. Jornada do Desenvolvedor (você)

### 3.1 Estrutura do projeto

```
src/
  app/
    [locale]/
      page.tsx                      # Landing
      (auth)/                       # Login/signup
      dashboard/                    # Área do PT (protegida)
        page.tsx                    # Home
        layout.tsx                  # Sidebar + trial banner
        students/                   # CRUD alunos
        workouts/                   # CRUD treinos
        leads/                      # Anamneses recebidas
        billing/                    # Assinatura
        profile/                    # Perfil + página pública
      pt/[slug]/                    # Página pública do PT (anon)
        page.tsx                    # Hero/template
        anamnese/                   # Form de captação
        templates/                  # Bold, Minimal, Energy
      aluno/[code]/                 # App do aluno (anon via access_code)
        page.tsx                    # Lista treinos
        chat/
        treino/[blockId]/           # Execução
    api/
      webhooks/asaas/               # Webhook de cobrança
      auth/callback/                # OAuth/email confirm
  components/
    icons.tsx                       # Biblioteca SVG
    ChatThread.tsx                  # Chat compartilhado
  lib/
    supabase/                       # createClient (RLS) + admin (service role)
    plans.ts                        # PLANS (Starter/Pro/Scale)
    asaas.ts                        # Cliente Asaas
    chat.ts                         # Server actions chat
    site-url.ts                     # getSiteUrl() canônico
    highlight-icons.tsx             # Mapper nome→SVG
supabase/migrations/                # SQL versionado
docs/                               # Documentação
messages/                           # i18n (pt-BR, en, es)
```

### 3.2 Como rodar localmente

```bash
# 1. Variáveis de ambiente
cp .env.example .env.local
# Preencha: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, ASAAS_API_KEY (sandbox), ASAAS_ENV=sandbox,
# ASAAS_WEBHOOK_TOKEN (qualquer string), NEXT_PUBLIC_APP_URL=http://localhost:3000

# 2. Rodar
npm install
npm run dev
# → http://localhost:3000
```

### 3.3 Como ver logs em produção

1. Acesse https://vercel.com/dashboard → projeto **ultrapt**
2. Menu lateral → **Logs**
3. Filtra por timestamp do erro
4. Procura prefixos `[contexto]` (ex: `[students-create]`, `[asaas-webhook]`, `[anamnesis]`)
5. Cada log estruturado tem: `code`, `message`, `details`, `hint`, IDs envolvidos

### 3.4 Lista de prefixos de log atualmente em uso

| Prefixo | Onde |
|---|---|
| `[signup]` | Cadastro de PT |
| `[login]` | Login de PT |
| `[students-create]` | Criar aluno manual |
| `[students-detail]` | Carregar página do aluno |
| `[workouts-create]` | Criar treino |
| `[anamnesis]` | Submissão de anamnese pública |
| `[asaas-webhook]` | Webhook de pagamento |
| `[copy-link]` | Botão copiar link (client-side) |
| `[billing]` | Server actions de billing |

### 3.5 Como debugar erro reportado por usuário

1. Pegue o **horário aproximado** + **e-mail/ID do usuário** + **passos** que ele fez
2. Vercel Logs → filtra por timestamp ±5min
3. Procura linhas com `error` e prefixo da operação
4. Verifica:
   - `code` Postgres (ex: `23505` = unique violation, `42501` = RLS bloqueou)
   - `message` literal
   - IDs envolvidos pra reproduzir
5. Se for RLS: confirma que migration mais recente está aplicada no Supabase
6. Se for FK: confirma que registros relacionados existem

### 3.6 Como reverter um deploy

1. Vercel → Deployments → encontra o deploy anterior funcional
2. Menu `...` → **"Promote to Production"**
3. (Opcional) `git revert <sha>` no main pra alinhar código com prod

### 3.7 Branches & deploy

- `main` → produção (`ultrapt.com.br`)
- `dev` → preview (cada push gera URL `<projeto>-git-dev-<owner>.vercel.app`)
- Fluxo: trabalha em `dev` → merge em `main` → Vercel faz auto-deploy

### 3.8 Migrations

Migrations vivem em `supabase/migrations/00XX_nome.sql`. Pra aplicar:

1. Supabase Dashboard → SQL Editor
2. Cola o conteúdo do .sql novo
3. Run
4. **Sempre** confirma qual a última aplicada antes de rodar nova

Migrations atuais (até 0018):

- 0001 Schema inicial (trainers, students)
- 0002 Profile + anamnesis_data
- 0003 → 0006 Workouts e billing (0006 substitui 0003)
- 0004 Exercises seed (~80 exercícios)
- 0005 student.access_code
- 0007 CPF + storage fix
- 0008 Landing templates
- 0009 Vouchers
- 0010 Anamnesis extra + student photos
- 0011 Voucher value update
- 0012 Chat messages
- 0013 Lockdown trainers columns (segurança)
- 0014 Lockdown students anon insert (segurança)
- 0015 Lockdown student photos storage (segurança)
- 0016 Voucher atomic claim
- 0017 trainer.asaas_invoice_url
- 0018 trainer.asaas_payment_id

### 3.9 Operações destrutivas — lista de proteção

Antes de rodar, **sempre confirma com user**:
- `git push --force` em main
- `drop table` em produção
- `truncate` em qualquer tabela com dados reais
- `vercel rm` ou apagar projeto
- Apagar bucket de storage
- Reset de senha de service_role
