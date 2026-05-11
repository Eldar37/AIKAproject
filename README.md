# AIKA

AIKA is an AI business operating system for entrepreneurs in Central Asia. It combines an AI mentor, daily execution tasks, business journey tracking, content generation, progress analytics, and gamification in one Next.js 15 monolith.

## Tech Stack

- Next.js 15 App Router, React, TypeScript
- TailwindCSS with local shadcn-style UI primitives
- Next.js API Routes under `app/api`
- PostgreSQL with Prisma ORM
- JWT auth in httpOnly cookies
- Hugging Face Inference API with model fallback
- Zustand, Framer Motion, Recharts, Jest

## Quick Start

```bash
cp .env.example .env
npm install
npm run build && npm run start
```

`npm run build` runs `prisma generate && prisma migrate deploy && next build`, so `DATABASE_URL` must point to a running PostgreSQL database before building.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Secret for signing auth cookies. Use a strong production value. |
| `NEXTAUTH_SECRET` | Reserved app auth secret for compatible deployments. |
| `NEXTAUTH_URL` | Public app URL for local or deployed runtime. |
| `HF_API_KEY` | Hugging Face API token. Never hardcode this in source. |
| `HF_MODEL_PRIMARY` | Primary Hugging Face model. |
| `HF_MODEL_FALLBACK_1` | First fallback model. |
| `HF_MODEL_FALLBACK_2` | Second fallback model. |
| `NEXT_PUBLIC_APP_URL` | Allowed app origin for CORS and client links. |

`.env.example` and `.env.local` contain placeholders only.

## Docker

```bash
docker compose up --build
```

The included Dockerfile follows the same app contract and runs `npm run build`. Because that build runs migrations, Docker image builds need a reachable database URL. For CI/CD, either provide a build-time database or run `npm run build` in an environment where Postgres is available.

## API Overview

### Auth

- `POST /api/auth/register` with `{ email, password, name }`
- `POST /api/auth/login` with `{ email, password }`
- `POST /api/auth/logout`

### User and Onboarding

- `GET /api/user`
- `PATCH /api/user`
- `POST /api/onboarding`

### AI and Content

- `POST /api/chat` with `{ message, mode?, conversationId? }`
- `GET /api/chat/history`
- `POST /api/content/generate` with `{ type, platform, prompt }`
- `GET /api/content/history`

### Tasks, Progress, Analytics

- `GET /api/tasks`
- `POST /api/tasks`
- `POST /api/tasks/generate`
- `PATCH /api/tasks/[id]`
- `GET /api/tasks/streak`
- `GET /api/progress`
- `POST /api/progress/update`
- `GET /api/recommendations`
- `GET /api/analytics`

Chat and content generation are rate-limited to 10 requests per minute per user/IP.

## Project Structure

```text
app/                 Next.js App Router pages and API routes
components/          UI, landing, dashboard, chat, journey, and task components
lib/ai/              Hugging Face provider, prompts, modes, and memory injection
lib/auth/            JWT, password, and server auth helpers
lib/business/        Gamification, stages, task generation, and progress rules
lib/db/              Prisma client singleton
prisma/              Schema, migration, and seed script
store/               Zustand state
types/               Shared TypeScript types
__tests__/           Jest unit and API route tests
```

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run db:migrate
npm run db:seed
npm run db:studio
npm run lint
npm run test
```

Demo seed account:

- Email: `demo@aika.local`
- Password: `AikaDemo2026!`
