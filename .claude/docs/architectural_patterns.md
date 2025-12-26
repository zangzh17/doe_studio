# Architectural Patterns and Conventions

This document describes the recurring architectural patterns, design decisions, and conventions used throughout the DOE Studio codebase.

## 1. tRPC API Architecture

**Pattern**: Type-safe API communication using tRPC with middleware-based authentication.

**Key Files**:
- server/_core/trpc.ts:1-46 - tRPC configuration and procedure definitions
- server/routers.ts:1-263 - API router with all endpoints
- client/src/lib/trpc.ts:1-5 - Client-side tRPC setup
- client/src/main.tsx:40-53 - tRPC client initialization

**Implementation**:
- Three procedure types with different access levels:
  - `publicProcedure` - No authentication required
  - `protectedProcedure` - Requires authenticated user (server/_core/trpc.ts:28)
  - `adminProcedure` - Requires admin role (server/_core/trpc.ts:30-45)
- Middleware chains for authentication checks (server/_core/trpc.ts:13-26)
- Router composition pattern (server/routers.ts:39-260)
- SuperJSON for data transformation (server/_core/trpc.ts:7, client/src/main.tsx:44)
- Zod schemas for input validation (server/routers.ts:22-37)

**Usage Pattern**:
```
// Server: Define endpoint with typed input/output
router({
  feature: router({
    action: protectedProcedure
      .input(z.object({ ... }))
      .mutation(async ({ ctx, input }) => { ... })
  })
})

// Client: Type-safe consumption
const { data } = trpc.feature.action.useMutation();
```

## 2. Database Repository Pattern

**Pattern**: Centralized data access layer using Drizzle ORM with lazy connection initialization.

**Key Files**:
- drizzle/schema.ts:1-149 - Table schema definitions
- server/db.ts:1-100+ - Database operations
- server/_core/context.ts - Database injection into request context

**Implementation**:
- Schema-first approach with TypeScript inference (drizzle/schema.ts:29-30, 57-58)
- Lazy database connection (server/db.ts:6-19)
- Repository functions encapsulate all queries (server/db.ts:21-100+)
- Camelcase column naming convention (drizzle/schema.ts:6)
- Type exports for Insert/Select operations (drizzle/schema.ts:30-31)

**Conventions**:
- All database access goes through server/db.ts functions
- Never write raw SQL queries in routers or business logic
- Use Drizzle's type-safe query builder (server/db.ts:87)
- Handle null database gracefully with warnings (server/db.ts:28-30)

## 3. React Context + Custom Hooks Pattern

**Pattern**: Context providers with companion custom hooks for type-safe global state access.

**Key Files**:
- client/src/contexts/ThemeContext.tsx:1-65
- client/src/contexts/LanguageContext.tsx
- client/src/App.tsx:32-41 - Provider composition

**Implementation**:
- Context definition with TypeScript interface (ThemeContext.tsx:3-9)
- Provider component with props (ThemeContext.tsx:13-23)
- Custom hook enforces provider usage (ThemeContext.tsx:58-64)
- LocalStorage persistence for client preferences (ThemeContext.tsx:26-27, 41-42)
- Provider composition in App root (client/src/App.tsx:32-41)

**Pattern Structure**:
```
1. Define context type interface
2. Create context with undefined default
3. Provider component manages state
4. Custom hook validates context availability
5. Throw error if hook used outside provider
```

## 4. Path Alias Configuration

**Pattern**: Consistent use of path aliases for cleaner imports across the codebase.

**Key Files**:
- vite.config.ts:14-19 - Vite alias configuration
- tsconfig.json - TypeScript path mapping
- All import statements using @ prefix

**Aliases**:
- `@/` → `client/src/` (vite.config.ts:16)
- `@shared/` → `shared/` (vite.config.ts:17)
- `@assets/` → `attached_assets/` (vite.config.ts:18)

**Usage Convention**:
- Always use aliases for cross-directory imports
- Never use relative paths like `../../../`
- Examples:
  - `import { Button } from '@/components/ui/button'`
  - `import { COOKIE_NAME } from '@shared/const'`

## 5. Authentication Middleware Pattern

**Pattern**: Middleware-based request authentication with automatic unauthorized handling.

**Key Files**:
- server/_core/trpc.ts:13-26 - requireUser middleware
- server/_core/context.ts - User context injection
- client/src/main.tsx:13-38 - Client-side error handling
- shared/const.ts:4-5 - Centralized error messages

**Implementation**:
- Middleware extracts user from context (server/_core/trpc.ts:14-25)
- Throws TRPCError with specific code (server/_core/trpc.ts:17)
- Client subscribes to query/mutation errors (client/src/main.tsx:24-38)
- Automatic redirect to login on UNAUTHED_ERR_MSG (client/src/main.tsx:13-22)
- Consistent error messages in shared/const.ts (shared/const.ts:4-5)

**Flow**:
```
1. Request hits tRPC endpoint
2. Middleware checks ctx.user
3. If no user → throw UNAUTHORIZED
4. Client catches error via QueryClient subscription
5. Error message matches UNAUTHED_ERR_MSG
6. Redirect to login page
```

## 6. Centralized Constants Pattern

**Pattern**: Shared constants in a single location accessible to both client and server.

**Key Files**:
- shared/const.ts:1-6
- shared/_core/errors.ts - Error utilities

**Convention**:
- All magic strings/numbers go in shared/const.ts
- Use SCREAMING_SNAKE_CASE for constants (shared/const.ts:1-5)
- Import from @shared/const throughout codebase
- Examples:
  - Cookie names (shared/const.ts:1)
  - Timeout values (shared/const.ts:2-3)
  - Error messages (shared/const.ts:4-5)

## 7. Zod Schema Validation Pattern

**Pattern**: Request validation using Zod schemas colocated with routers.

**Key Files**:
- server/routers.ts:22-37 - DOE parameters schema
- server/routers.ts:69, 75-90 - Input validation in procedures

**Implementation**:
- Define schemas at top of router file (server/routers.ts:22-37)
- Use `.input()` on procedures for validation (server/routers.ts:69)
- Reuse schemas across multiple endpoints (server/routers.ts:79, 99, 163)
- Optional fields with `.optional()` (server/routers.ts:24-25)
- Enum validation for restricted values (server/routers.ts:28-29)

**Benefits**:
- Type inference from schema to TypeScript
- Runtime validation at API boundary
- Self-documenting API contracts

## 8. Error Boundary Pattern

**Pattern**: React error boundaries to catch and handle component errors gracefully.

**Key Files**:
- client/src/components/ErrorBoundary.tsx
- client/src/App.tsx:32 - Root-level error boundary

**Convention**:
- Wrap entire app in ErrorBoundary (client/src/App.tsx:32)
- Can nest boundaries for granular error handling
- Prevents entire app crash from component errors

## 9. Code Organization - _core Convention

**Pattern**: Framework and infrastructure code isolated in `_core/` directories.

**Locations**:
- server/_core/ - Server infrastructure (tRPC, auth, context)
- shared/_core/ - Shared utilities and errors

**Convention**:
- _core directories contain framework-level code
- Application business logic stays outside _core
- _core files should rarely need modification
- Examples:
  - server/_core/trpc.ts - tRPC setup
  - server/_core/context.ts - Request context
  - server/_core/env.ts - Environment config

## 10. Database Schema Patterns

**Pattern**: Consistent table design with common columns and naming conventions.

**Key Files**:
- drizzle/schema.ts:1-149

**Conventions**:
- All tables have auto-increment `id` primary key (schema.ts:13, 36, 64, 92)
- Timestamp columns: `createdAt`, `updatedAt` (schema.ts:24-25)
- Foreign keys use `userId`, `designId` naming (schema.ts:38, 94, 124)
- Enums for restricted values (schema.ts:19, 44, 100-102, 134)
- JSON columns for flexible data (schema.ts:46-50)
- Text columns for URLs (schema.ts:52, 76)
- CamelCase column names matching TypeScript (schema.ts:6)

**Standard Fields**:
```
id: int().autoincrement().primaryKey()
createdAt: timestamp().defaultNow().notNull()
updatedAt: timestamp().defaultNow().onUpdateNow().notNull()
```

## 11. React Query Integration Pattern

**Pattern**: TanStack Query (React Query) integrated with tRPC for server state management.

**Key Files**:
- client/src/main.tsx:11-53 - QueryClient setup
- client/src/lib/trpc.ts:1-5 - tRPC React integration

**Implementation**:
- Single QueryClient instance (client/src/main.tsx:11)
- Global error subscriptions (client/src/main.tsx:24-38)
- Query and mutation cache monitoring
- Automatic error logging (client/src/main.tsx:28, 36)
- Provider wrapping (client/src/main.tsx:56-60)

**Pattern**:
```
1. Create QueryClient
2. Subscribe to cache events
3. Handle errors globally
4. Wrap app in providers (tRPC + QueryClient)
```

## 12. Monorepo Structure Pattern

**Pattern**: Client, server, and shared code in a single repository with clear boundaries.

**Structure**:
- `client/` - React frontend (vite.config.ts:22)
- `server/` - Express + tRPC backend
- `shared/` - Code used by both client and server
- `drizzle/` - Database schema and migrations
- Root-level configuration files

**Benefits**:
- Shared types between client and server
- Single dependency management (package.json)
- Unified build process (package.json:6-13)

## 13. Environment Variable Pattern

**Pattern**: Type-safe environment variable access with validation.

**Key Files**:
- server/_core/env.ts - Environment variable definitions
- .env file (not in repo)

**Convention**:
- All env vars accessed through ENV object
- Type definitions for required variables
- Validation on startup
- Never access process.env directly in business logic

## Additional Conventions

### File Naming
- React components: PascalCase (DOEParameters.tsx)
- Utility files: camelCase (db.ts, const.ts)
- Pages: PascalCase (Home.tsx, Studio.tsx)
- Test files: *.test.ts suffix

### Import Order (observed pattern)
1. External packages (@trpc, react, etc.)
2. Internal aliases (@/, @shared/)
3. Relative imports (./components)
4. CSS imports (./index.css)

### Comments
- JSDoc for table schemas (drizzle/schema.ts:3-11)
- Inline comments for complex logic
- Type annotations preferred over comments
