# DOE Studio

## Project Overview

DOE Studio is a web application for designing diffractive optical elements (DOEs) with GPU-accelerated optimization, real-time preview, and fabrication ordering.

**Core Features**:
- DOE design creation with multiple modes (diffuser, splitter, lens, prism, etc.)
- Parameter input and tolerance simulation
- Optimization engine with credit-based usage
- Template library for common designs
- Multi-language support (English, Chinese, Korean)

## Tech Stack

**Frontend**: React 19 + TypeScript, Wouter (routing), TailwindCSS 4, shadcn/ui, TanStack Query, Plotly.js, Three.js, Vite
**Backend**: Node.js + Express, tRPC, MySQL + Drizzle ORM, Lucia Auth (Google/WeChat OAuth), AWS S3
**Dev Tools**: TypeScript (strict), pnpm, Vitest, Drizzle Kit

## Directory Structure

```
client/src/          # React frontend
  ├── pages/         # Route components (Home, Login, Studio, etc.)
  ├── components/    # Reusable UI (including ui/ for shadcn)
  ├── contexts/      # React Context (Theme, Language)
  ├── hooks/         # Custom hooks
  ├── lib/           # Client utils (trpc.ts)
  ├── _core/         # Framework code
  ├── App.tsx        # Router (client/src/App.tsx:15-29)
  └── main.tsx       # Entry point

server/              # Express + tRPC backend
  ├── _core/         # Framework infrastructure
  │   ├── lucia.ts   # Lucia Auth configuration
  │   ├── oauth-providers.ts  # Google/WeChat OAuth
  │   ├── auth.ts    # OAuth routes
  │   └── context.ts # Session validation
  ├── routers.ts     # tRPC API endpoints (server/routers.ts:36-215)
  └── db.ts          # Database operations

shared/              # Client + server shared code
  └── const.ts       # Constants

drizzle/             # Database
  ├── schema.ts      # Tables (drizzle/schema.ts:7-120)
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

**Entry**: client/src/main.tsx, server/_core/index.ts, client/src/App.tsx:15-29
**API**: server/routers.ts:36-215, server/_core/trpc.ts, client/src/lib/trpc.ts
**Auth**: server/_core/lucia.ts, server/_core/auth.ts, server/_core/oauth-providers.ts
**Database**: drizzle/schema.ts:7-120, server/db.ts, drizzle.config.ts
**Config**: vite.config.ts, tsconfig.json, .env

## Path Aliases

`@/` → client/src/, `@shared/` → shared/, `@assets/` → attached_assets/ (vite.config.ts:14-19)

Always use aliases: `import { Button } from '@/components/ui/button'`

## Additional Documentation

**.claude/docs/architectural_patterns.md** - Design patterns and conventions. **READ BEFORE making changes.**

**docs/** - Detailed guides (may be outdated, verify with code):
PROJECT_STRUCTURE_GUIDE.md, DATABASE_GUIDE.md, DEVELOPMENT_GUIDE.md, AUTH_AND_USER_GUIDE.md

## Development Notes

**Authentication**: Lucia Auth with Google/WeChat OAuth (server/_core/lucia.ts, server/_core/auth.ts). Three access levels: public, protected, admin (server/_core/trpc.ts:11-45). OAuth routes at /api/auth/google and /api/auth/wechat.

**Database**: Lazy connection (server/db.ts:8-18), all queries via server/db.ts functions, schema-first with inference. User IDs are strings (varchar). Key tables: users, sessions, oauthAccounts, doeDesigns, doeTemplates.

**API Development**: (1) Define Zod schema, (2) Add endpoint in server/routers.ts, (3) Add DB function in server/db.ts, (4) Use tRPC hooks in components

**Frontend**: Pages in pages/, components in components/, global state via Context (contexts/), server state via tRPC + React Query, error boundary at root

**Code Organization**: `_core/` = framework (rarely modify), business logic outside `_core/`, shared code in shared/

## Common Tasks

**New API**: Edit server/routers.ts + server/db.ts
**New page**: Create in pages/, add route in App.tsx:18-28
**DB change**: Edit drizzle/schema.ts, run `pnpm db:push`
**UI component**: Use shadcn/ui or add to components/
**Translation**: Edit contexts/LanguageContext.tsx

## Environment Variables

Required for OAuth:
```
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
WECHAT_APP_ID, WECHAT_APP_SECRET
ADMIN_EMAIL, BASE_URL, DATABASE_URL
```

See .claude/docs/architectural_patterns.md for detailed patterns.
