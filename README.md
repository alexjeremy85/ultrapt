# Ultra Personal Trainer

SaaS para personal trainers que querem captar, atender e cobrar alunos online em um so lugar.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Storage + Realtime + RLS)
- Vercel (deploy)

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar e preencher variaveis de ambiente
cp .env.example .env.local
# Edite .env.local com as chaves do Supabase

# 3. Rodar migrations no Supabase
# Abra o Supabase SQL Editor e execute o conteudo de:
#   supabase/migrations/0001_initial_schema.sql

# 4. Rodar o dev server
npm run dev
```

## Estrutura

```
src/
  app/
    (auth)/           # login, signup
    auth/callback/    # OAuth callback
    dashboard/        # area autenticada do PT
  lib/
    supabase/         # clientes Supabase (browser, server, middleware)
  middleware.ts       # protecao de rotas
supabase/
  migrations/         # schema SQL versionado
```

## Branches

- `main` - producao
- `dev` - desenvolvimento (deploy de preview automatico)
