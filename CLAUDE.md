# DOE Studio

## Project Overview

DOE Studio is a full-stack web application for designing, optimizing, and fabricating Diffractive Optical Elements (DOEs). Users can create custom optical designs, preview results, run optimizations, and order physical fabrication through integrated Stripe payments.

**Core Features**:
- DOE design creation with multiple modes (diffuser, splitter, lens, prism, etc.)
- Parameter input and tolerance simulation
- Optimization engine with credit-based usage
- Template library for common designs
- Stripe-integrated payment for credits and fabrication services
- Multi-language support (English, Chinese, Korean)

## Tech Stack

**Frontend**: React 19 + TypeScript, Wouter (routing), TailwindCSS 4, shadcn/ui, TanStack Query, Plotly.js, Three.js, Vite
**Backend**: Node.js + Express, tRPC, MySQL + Drizzle ORM, OAuth (Manus), Stripe, AWS S3
**Dev Tools**: TypeScript (strict), pnpm, Vitest, Drizzle Kit

## Directory Structure

```
client/src/          # React frontend
  ├── pages/         # Route components (Home, Studio, etc.)
  ├── components/    # Reusable UI (including ui/ for shadcn)
  ├── contexts/      # React Context (Theme, Language)
  ├── hooks/         # Custom hooks
  ├── lib/           # Client utils (trpc.ts)
  ├── _core/         # Framework code
  ├── App.tsx        # Router (client/src/App.tsx:14-28)
  └── main.tsx       # Entry point (client/src/main.tsx:1-62)

server/              # Express + tRPC backend
  ├── _core/         # Framework infrastructure (rarely modify)
  ├── stripe/        # Payment integration
  ├── routers.ts     # API endpoints (server/routers.ts:39-260)
  └── db.ts          # Database operations

shared/              # Client + server shared code
  ├── const.ts       # Constants (shared/const.ts:1-6)
  └── types.ts       # Shared types

drizzle/             # Database
  ├── schema.ts      # Tables (drizzle/schema.ts:8-149)
  └── migrations/    # SQL migrations

.claude/docs/        # Claude documentation
  └── architectural_patterns.md
```

## Core Commands

```bash
pnpm dev          # Start dev server (client + server)
pnpm check        # TypeScript type checking
pnpm test         # Run tests
pnpm db:push      # Generate and run DB migrations
pnpm build        # Build for production
pnpm start        # Start production server
pnpm format       # Format code
```

## Key Files

**Entry**: client/src/main.tsx:1-62, server/_core/index.ts, client/src/App.tsx:14-28
**API**: server/routers.ts:39-260, server/_core/trpc.ts:6-45, client/src/lib/trpc.ts:1-5
**Database**: drizzle/schema.ts:8-149, server/db.ts, drizzle.config.ts
**Config**: vite.config.ts:12-44, tsconfig.json, .env

## Path Aliases

`@/` → client/src/, `@shared/` → shared/, `@assets/` → attached_assets/ (vite.config.ts:14-19)

Always use aliases: `import { Button } from '@/components/ui/button'`

## Additional Documentation

**.claude/docs/architectural_patterns.md** - Design patterns and conventions. **READ BEFORE making changes.**

**docs/** - Detailed guides (may be outdated, verify with code):
PROJECT_STRUCTURE_GUIDE.md, DATABASE_GUIDE.md, DEVELOPMENT_GUIDE.md, AUTH_AND_USER_GUIDE.md, PAYMENT_SYSTEM_GUIDE.md, PYTHON_BACKEND_GUIDE.md, TEMPLATES_AND_PARAMS_GUIDE.md, PLOTLY_CHARTS_GUIDE.md

## Development Notes

**Authentication**: OAuth via Manus (server/_core/oauth.ts), three access levels (public, protected, admin at server/_core/trpc.ts:11-45), auto-redirect on unauthorized (client/src/main.tsx:13-38)

**Database**: Lazy connection (server/db.ts:6-19), all queries via server/db.ts functions, schema-first with inference, sync with `pnpm db:push`

**API Development**: (1) Define Zod schema (server/routers.ts:22-37), (2) Add endpoint in server/routers.ts, (3) Add DB function in server/db.ts, (4) Use tRPC hooks in components

**Frontend**: Pages in pages/, components in components/, global state via Context (contexts/), server state via tRPC + React Query, error boundary at root (App.tsx:32)

**Code Organization**: `_core/` = framework (rarely modify), business logic outside `_core/`, shared code in shared/, constants in shared/const.ts

## Common Tasks

**New API**: Edit server/routers.ts + server/db.ts
**New page**: Create in pages/, add route in App.tsx:14-28
**DB change**: Edit drizzle/schema.ts, run `pnpm db:push`
**UI component**: Use shadcn/ui or add to components/
**Translation**: Edit contexts/LanguageContext.tsx

See .claude/docs/architectural_patterns.md for detailed patterns.
