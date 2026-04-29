# Como funcionam os links no Ultra PT

O sistema tem **3 tipos de links** com finalidades distintas. Saber qual usar em cada momento é essencial para captar e atender alunos.

---

## Resumo rápido

| Link | Para quem | Quando usar | Login? |
|---|---|---|---|
| **Página pública do PT** `/pt/[slug]` | Qualquer pessoa | Divulgação (Instagram, WhatsApp Status, bio) | Não |
| **Anamnese pública** `/pt/[slug]/anamnese` | Lead/prospect | Captação direta (atalho na bio) | Não |
| **App do aluno** `/aluno/[code]` | Aluno aprovado | Acessar treinos | Não (autenticado pelo código único) |

---

## 1. Página pública do PT — `/pt/[slug]`

### O que é
A **vitrine pública** do personal trainer. Funciona como uma landing page personalizada com a marca do PT.

### Quem acessa
Qualquer pessoa, sem login. É o link que você divulga em **redes sociais, bio do Instagram, anúncios**.

### Como obter
1. Faça login no Ultra PT
2. Vá em **Dashboard** → o card "Sua página de captação" mostra o link completo
3. Ou em **Meu perfil** → botão "Ver página pública"

### Formato do link
```
https://seudominio.com/pt/[seu-slug]
```

Exemplo:
```
https://ultrapt.com.br/pt/alex-guimaraes-dos-santos
```

### Onde divulgar
- ✅ **Bio do Instagram** (link único na biografia)
- ✅ **Status do WhatsApp**
- ✅ **Linktree** ou agregador de links
- ✅ **Stories** com sticker de link
- ✅ **Anúncios** (Meta Ads, Google Ads) apontando para essa URL
- ✅ **Email signature** ("Treine comigo: [link]")

### O que o visitante vê
- Sua **foto, nome e CREF**
- Sua **bio** (história, formação, diferenciais)
- **Especialidades** (chips: hipertrofia, emagrecimento, etc.)
- **Serviços oferecidos** (modalidade online/presencial)
- **Investimento** (faixa de preço)
- Links para seu **WhatsApp** e **Instagram**
- **Botão "Quero treinar com você"** → leva para a anamnese

### Como personalizar
Vá em **Dashboard → Meu perfil** e preencha:
- Foto de perfil (Storage do Supabase, foto pública)
- Nome, CREF, bio
- URL pública (`slug` — pode mudar para `meunome`)
- Especialidades (separadas por vírgula)
- Serviços oferecidos (texto livre)
- Resumo de preços (ex.: "A partir de R$ 250/mês")
- WhatsApp, Instagram, cidade/estado

> **Dica**: o slug (parte final da URL) precisa ser único. Se "joao-silva" estiver em uso, escolha outro como "joaosilvapt".

---

## 2. Anamnese pública — `/pt/[slug]/anamnese`

### O que é
Formulário público que o **lead preenche** para se candidatar a aluno. Coleta dados pessoais, objetivo, experiência e PAR-Q (saúde).

### Quem acessa
Qualquer pessoa, sem login. Geralmente chega aqui clicando em **"Quero treinar com você"** na sua página pública.

### Formato do link
```
https://seudominio.com/pt/[seu-slug]/anamnese
```

### Quando usar diretamente
- Quando o lead chegar pelo WhatsApp e você quiser pular a página de venda
- Em campanhas onde a venda já foi feita e falta só captar dados

### O que o lead preenche
1. **Dados pessoais**: nome, e-mail, WhatsApp, data de nascimento, sexo, peso, altura
2. **Objetivo**: hipertrofia, emagrecimento, condicionamento, saúde, performance
3. **Experiência**: iniciante / intermediário / avançado
4. **Saúde** (PAR-Q): condições cardíacas, pressão, diabetes, lesões, dor nas costas
5. **Liberação médica**
6. **Consentimento LGPD**

### O que acontece após o envio
1. O lead vê uma tela de "Anamnese enviada!"
2. Você recebe o lead em **Dashboard → Leads pendentes**
3. Você clica em "Ver detalhes" → revisa as respostas
4. **Aprovar como aluno** → vira aluno ativo e ganha um link `/aluno/[code]`
5. **Rejeitar** → fica como inativo

> **Dica**: depois de aprovar o lead, mande o link `/aluno/[code]` pelo WhatsApp para o aluno.

---

## 3. App do aluno — `/aluno/[code]`

### O que é
O **app pessoal e exclusivo de cada aluno**. Aqui o aluno acessa os treinos que você prescreveu, executa exercícios, marca séries concluídas e cronometra descansos.

### Quem acessa
**Apenas aquele aluno específico**, via código único (UUID) gerado quando ele vira aluno ativo.

### Formato do link
```
https://seudominio.com/aluno/[code-unico-de-32-caracteres]
```

Exemplo:
```
https://ultrapt.com.br/aluno/a1b2c3d4e5f6...
```

### Como obter
1. **Dashboard → Alunos** → clique no aluno
2. Na página de detalhe do aluno, você vê o card **"Link do app do aluno"**
3. Botão **"Enviar WhatsApp"** abre o WhatsApp já com a mensagem pronta:
   > "Oi [Nome], aqui está o link do seu app de treino: [link]"

### Por que é assim (sem login)
Decisão de design para **V1**: sem fricção. O aluno **não precisa criar conta nem lembrar senha**. Só clica no link e usa.

**Segurança**: o código tem 32 caracteres aleatórios (UUID), o que torna **impossível adivinhar**. Cada aluno tem um código único e exclusivo. Mesmo que alguém compartilhe o link de outro, o conteúdo é restrito ao aluno em questão.

> **Importante**: oriente o aluno a **não compartilhar o link**. É como uma senha. Se ele compartilhar, qualquer pessoa com o link verá o treino dele.

### O que o aluno faz lá
1. **Tela inicial** — vê seu personal, treino atual, lista de blocos (Treino A, B, C…)
2. **Clica num bloco** — abre a tela de execução
3. **Para cada exercício** vê: nome, séries × reps, carga, vídeo do YouTube
4. **Marca cada série** clicando no número (1, 2, 3…)
5. **Cronômetro de descanso** dispara automaticamente após cada série
6. **Slider de esforço** (RPE 1-10) ao final
7. **Botão "Concluir treino"** → registra a sessão

### Você (PT) acessa o histórico
- Tudo que o aluno faz é registrado em `workout_executions` e `exercise_logs`
- Em **V2** virá uma página `/dashboard/students/[id]/historico` com gráficos de progresso
- Por enquanto, dá pra ver o último treino executado consultando o banco diretamente

---

## Fluxo completo (passo a passo de uma venda real)

```
1. Você cria sua conta no Ultra PT          (signup)
2. Configura perfil completo                 (Meu perfil)
3. Pega a URL /pt/[slug]                     (Dashboard)
4. Coloca na bio do Instagram                ───────────────┐
                                                            │
5. Lead vê seu Instagram → clica na bio                     │
6. Cai em /pt/[slug] (sua landing)                          │
7. Clica "Quero treinar com você"                           │
8. Preenche anamnese em /pt/[slug]/anamnese                 │
9. Vê "Anamnese enviada!"                                   │
                                                            │
10. Você recebe notificação (badge no dashboard)            │
11. Vai em Leads pendentes → revisa anamnese                │
12. Aprova como aluno                                       │
                                                            │
13. (Opcional) Cria treino se ainda não tem                 │
14. Atribui treino ao aluno                                 │
                                                            │
15. Copia link /aluno/[code]                                │
16. Manda no WhatsApp do aluno (botão automatiza)           │
                                                            │
17. Aluno clica no link, vê o treino, executa, marca séries │
18. Você acompanha pelo dashboard                ───────────┘
```

---

## Tabela de URLs (referência rápida)

Substitua os placeholders por valores reais:

| Finalidade | URL |
|---|---|
| Sua landing pública | `/pt/{seu-slug}` |
| Anamnese (atalho) | `/pt/{seu-slug}/anamnese` |
| App de cada aluno | `/aluno/{code-do-aluno}` |
| Seu dashboard | `/dashboard` |
| Cadastrar aluno manual | `/dashboard/students/new` |
| Criar treino | `/dashboard/workouts/new` |
| Editar treino | `/dashboard/workouts/{id}` |
| Atribuir treino a aluno | `/dashboard/students/{id}` |
| Pagar / trocar plano | `/dashboard/billing` |

---

## FAQ

**Posso mudar meu slug depois?**
Sim. Em **Meu perfil**, edite o campo **URL pública**. ⚠️ Atenção: links antigos param de funcionar quando o slug muda. Avise quem já tem o link antigo.

**O que acontece se um aluno perder o link?**
Você abre o aluno em **Alunos**, copia o link do card "Link do app do aluno" e reenvia. O código não muda quando você reenvia.

**Quero invalidar o link de um aluno (ex.: alguém compartilhou)**
Não tem botão de "regenerar código" ainda — fica para V2. Por agora, dá para alterar manualmente o `access_code` no Supabase SQL Editor:
```sql
update students
set access_code = replace(gen_random_uuid()::text, '-', '')
where id = '<id-do-aluno>';
```

**Posso ter mais de uma página pública?**
Não — cada PT tem 1 slug e 1 página. Se você tem múltiplas marcas/personas, V2 trará suporte a múltiplos perfis.

**Funciona offline?**
Não. Como o app do aluno é web, precisa de conexão. PWA com offline está no roadmap V2.
