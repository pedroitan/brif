# BRIF

Plataforma SaaS white label para agências de publicidade. Esta fase do repositório contém o **MVP rascunho** para demo de venda.

## Escopo da demo

Fluxo vertical completo do primeiro workflow do produto:

1. **Login** do gerente de projetos
2. **Criação de projeto** (nome, cliente, e-mail)
3. **Upload de áudio** da reunião de briefing
4. **Transcrição automática** via OpenAI Whisper
5. **Geração de briefing estruturado** via Anthropic Claude
6. **Revisão/edição** pelo gerente
7. **Envio ao cliente** por e-mail (Resend) com Magic Link
8. **Aprovação do cliente** no portal branded

## Stack

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js 14 (App Router) + Tailwind + shadcn/ui
- **Banco**: Neon Postgres + Prisma
- **Storage**: Vercel Blob
- **IA**: OpenAI Whisper + Anthropic Claude
- **E-mail**: Resend
- **Deploy**: Vercel

## Estrutura

```
brif/
├── apps/
│   ├── web/         → App da agência (porta 3000)
│   └── portal/      → Portal do cliente (porta 3001)
├── packages/
│   ├── db/          → Prisma schema + client
│   ├── ui/          → Componentes shadcn compartilhados
│   └── config/      → tsconfig + tailwind base
├── files/           → Documentação de produto (PRD, wireframes)
└── turbo.json
```

## Setup local

### Pré-requisitos
- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)

### Primeira instalação

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local e preencha as chaves

# 3. Gerar Prisma client + aplicar schema no Neon
pnpm db:push
pnpm db:generate

# 4. Seed inicial (cria gerente demo)
pnpm -F @brif/db db:seed

# 5. Rodar em dev
pnpm dev
```

- App agência: http://localhost:3000
- Portal cliente: http://localhost:3001
- Prisma Studio: `pnpm db:studio`

### Credenciais de demo

- **E-mail**: `gerente@agenciademo.com.br`
- **Senha**: `brif2026`

## Scripts úteis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Roda ambos os apps em paralelo |
| `pnpm build` | Build de todos os apps |
| `pnpm lint` | Lint do monorepo |
| `pnpm typecheck` | Checagem de tipos |
| `pnpm db:push` | Aplica o schema Prisma no banco |
| `pnpm db:studio` | Abre Prisma Studio |
| `pnpm -F @brif/web dev` | Roda apenas o app da agência |
| `pnpm -F @brif/portal dev` | Roda apenas o portal |

## Sprints

| Sprint | Status | Entrega |
|---|---|---|
| S1 — Fundação | ✅ em progresso | Monorepo + Prisma + Next.js + shadcn |
| S2 — Auth + Projetos | ⏳ | Login gerente + CRUD de projetos |
| S3 — Upload + Whisper | ⏳ | Upload áudio + transcrição |
| S4 — Claude Briefing | ⏳ | Geração + edição do briefing |
| S5 — Envio + Portal | ⏳ | Resend + Magic Link + aprovação |
| S6 — Polimento | ⏳ | Wireframes aplicados, loading states |

## Segurança

- **Nunca** commite `.env.local` ou chaves de API
- Em produção, use variáveis de ambiente do Vercel
- Todas as chaves estão listadas em `.env.example` sem valores

## Documentação de produto

Ver pasta `files/`:
- `BRIF_contexto.md` — contexto geral do produto (v3.0)
- `BRIF_PRD.html` — PRD completo
- `BRIF_Wireframes.html` — wireframes das 4 telas principais
- `BRIF_Landing.html` — landing de marketing
- `BRIF_Viabilidade.xlsx` — modelo financeiro
