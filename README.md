# Doutiva

Plataforma de educação médica: cursos, tutores de IA, biblioteca científica, caso do dia, revisão espaçada, certificados e economia de créditos.

## Stack

- TanStack Start + React 19 + Vite
- Supabase (Auth, Postgres, RLS)
- Drizzle SQL migrations
- AI SDK (gateway configurável via env)

## Setup

```bash
cp .env.example .env
# Preencha SUPABASE_* e LOVABLE_API_KEY (ou providers próprios)
npm ci
npm run dev
```

## Qualidade

```bash
npm test          # vitest
npm run lint
```

Critérios de aceite da fundação: [`docs/ACCEPTANCE_P0.md`](docs/ACCEPTANCE_P0.md)  
Arquitetura-alvo: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Princípio

Só conta como pronto o que funciona de ponta a ponta (UI + server + DB + teste). Telas mockadas não entram no menu principal.
