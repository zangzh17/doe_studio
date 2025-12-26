# Architectural Patterns and Conventions

This document describes the recurring architectural patterns, design decisions, and conventions used throughout the DOE Studio codebase.

## 1. tRPC API Architecture

**Pattern**: Type-safe API communication using tRPC with middleware-based authentication.

**Key Files**:
- server/_core/trpc.ts:1-46 - tRPC configuration and procedure definitions
- server/routers.ts:1-215 - API router with all endpoints
- client/src/lib/trpc.ts:1-5 - Client-side tRPC setup
- client/src/main.tsx - tRPC client initialization

**Implementation**:
- Three procedure types with different access levels:
  - `publicProcedure` - No authentication required
  - `protectedProcedure` - Requires authenticated user (server/_core/trpc.ts:28)
  - `adminProcedure` - Requires admin role (server/_core/trpc.ts:30-45)
- Middleware chains for authentication checks (server/_core/trpc.ts:13-26)
- Router composition pattern (server/routers.ts:36-212)
- SuperJSON for data transformation
- Zod schemas for input validation (server/routers.ts:19-34)

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
- drizzle/schema.ts:1-120 - Table schema definitions
- server/db.ts:1-180 - Database operations
- server/_core/context.ts - Database injection into request context

**Implementation**:
- Schema-first approach with TypeScript inference
- Lazy database connection (server/db.ts:8-18)
- Repository functions encapsulate all queries
- CamelCase column naming convention
- Type exports for Insert/Select operations

**Conventions**:
- All database access goes through server/db.ts functions
- Never write raw SQL queries in routers or business logic
- Use Drizzle's type-safe query builder
- Handle null database gracefully with warnings

## 3. Lucia Authentication Pattern

**Pattern**: Session-based authentication using Lucia Auth with OAuth providers (Google, WeChat).

**Key Files**:
- server/_core/lucia.ts:1-77 - Lucia configuration and adapter setup
- server/_core/oauth-providers.ts:1-90 - OAuth provider implementations
- server/_core/auth.ts:1-275 - OAuth routes and callbacks
- server/_core/context.ts:1-55 - Session validation in request context
- drizzle/schema.ts:31-64 - Sessions and OAuth accounts tables

**Implementation**:
- Lucia Auth with Drizzle MySQL adapter (server/_core/lucia.ts:16-25)
- Session cookies with configurable attributes (server/_core/lucia.ts:30-38)
- User attributes mapping from database (server/_core/lucia.ts:39-48)
- Google OAuth via Arctic library (server/_core/oauth-providers.ts:10-14)
- Custom WeChat OAuth implementation (server/_core/oauth-providers.ts:21-87)

**OAuth Flow**:
```
1. User clicks login button → /api/auth/google or /api/auth/wechat
2. Generate state and redirect to OAuth provider
3. Provider callback → /api/auth/{provider}/callback
4. Exchange code for tokens, fetch user info
5. Create/update user and OAuth account in database
6. Create Lucia session and set cookie
7. Redirect to /studio
```

**Session Validation** (server/_core/context.ts:16-42):
```
1. Extract session ID from cookie (doe_session)
2. Validate session with Lucia
3. Inject user into tRPC context
4. Refresh session if needed
```

**Key Tables**:
- `users` - User accounts with string ID (varchar)
- `sessions` - Lucia sessions with expiration
- `oauthAccounts` - Links OAuth providers to users

## 4. React Context + Custom Hooks Pattern

**Pattern**: Context providers with companion custom hooks for type-safe global state access.

**Key Files**:
- client/src/contexts/ThemeContext.tsx
- client/src/contexts/LanguageContext.tsx
- client/src/App.tsx:32-42 - Provider composition

**Implementation**:
- Context definition with TypeScript interface
- Provider component with props
- Custom hook enforces provider usage
- LocalStorage persistence for client preferences
- Provider composition in App root

**Pattern Structure**:
```
1. Define context type interface
2. Create context with undefined default
3. Provider component manages state
4. Custom hook validates context availability
5. Throw error if hook used outside provider
```

## 5. Path Alias Configuration

**Pattern**: Consistent use of path aliases for cleaner imports across the codebase.

**Key Files**:
- vite.config.ts:14-19 - Vite alias configuration
- tsconfig.json - TypeScript path mapping

**Aliases**:
- `@/` → `client/src/` (vite.config.ts:16)
- `@shared/` → `shared/` (vite.config.ts:17)
- `@assets/` → `attached_assets/` (vite.config.ts:18)

**Usage Convention**:
- Always use aliases for cross-directory imports
- Never use relative paths like `../../../`
- Examples:
  - `import { Button } from '@/components/ui/button'`
  - `import { UNAUTHED_ERR_MSG } from '@shared/const'`

## 6. Zod Schema Validation Pattern

**Pattern**: Request validation using Zod schemas colocated with routers.

**Key Files**:
- server/routers.ts:19-34 - DOE parameters schema
- server/routers.ts:65-100 - Input validation in procedures

**Implementation**:
- Define schemas at top of router file (server/routers.ts:19-34)
- Use `.input()` on procedures for validation
- Reuse schemas across multiple endpoints
- Optional fields with `.optional()`
- Enum validation for restricted values

**Benefits**:
- Type inference from schema to TypeScript
- Runtime validation at API boundary
- Self-documenting API contracts

## 7. Error Boundary Pattern

**Pattern**: React error boundaries to catch and handle component errors gracefully.

**Key Files**:
- client/src/components/ErrorBoundary.tsx
- client/src/App.tsx:32 - Root-level error boundary

**Convention**:
- Wrap entire app in ErrorBoundary
- Can nest boundaries for granular error handling
- Prevents entire app crash from component errors

## 8. Code Organization - _core Convention

**Pattern**: Framework and infrastructure code isolated in `_core/` directories.

**Locations**:
- server/_core/ - Server infrastructure (tRPC, auth, context, Lucia)
- client/src/_core/ - Client infrastructure (hooks)
- shared/_core/ - Shared utilities and errors

**Convention**:
- _core directories contain framework-level code
- Application business logic stays outside _core
- _core files should rarely need modification
- Examples:
  - server/_core/trpc.ts - tRPC setup
  - server/_core/lucia.ts - Auth configuration
  - server/_core/context.ts - Request context

## 9. Database Schema Patterns

**Pattern**: Consistent table design with common columns and naming conventions.

**Key Files**:
- drizzle/schema.ts:1-120

**Key Tables**:
- `users` - User accounts (string ID for Lucia compatibility)
- `sessions` - Lucia session storage
- `oauthAccounts` - OAuth provider links (composite key: provider + providerUserId)
- `doeDesigns` - User's DOE designs (int ID, string userId FK)
- `doeTemplates` - Pre-configured templates

**Conventions**:
- User ID is varchar (string) for Lucia compatibility (schema.ts:9)
- Auto-increment int ID for other entities (schema.ts:69, 97)
- Timestamp columns: `createdAt`, `updatedAt` (schema.ts:20-22)
- Foreign keys use `userId` naming (schema.ts:35, 53, 72)
- Enums for restricted values (schema.ts:17, 78)
- JSON columns for flexible data (schema.ts:80-84)
- CamelCase column names matching TypeScript

**Standard Fields**:
```
id: varchar("id", { length: 255 }).primaryKey()  // for users
id: int("id").autoincrement().primaryKey()       // for other tables
createdAt: timestamp("createdAt").defaultNow().notNull()
updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
```

## 10. React Query Integration Pattern

**Pattern**: TanStack Query (React Query) integrated with tRPC for server state management.

**Key Files**:
- client/src/main.tsx - QueryClient setup
- client/src/lib/trpc.ts - tRPC React integration

**Implementation**:
- Single QueryClient instance
- Global error subscriptions
- Query and mutation cache monitoring
- Automatic error logging
- Provider wrapping

**Pattern**:
```
1. Create QueryClient
2. Subscribe to cache events
3. Handle errors globally
4. Wrap app in providers (tRPC + QueryClient)
```

## 11. Monorepo Structure Pattern

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
- Unified build process

## 12. Environment Variable Pattern

**Pattern**: Type-safe environment variable access with centralized configuration.

**Key Files**:
- server/_core/env.ts - Environment variable definitions

**Required Variables**:
```
DATABASE_URL          # MySQL connection string
BASE_URL              # App base URL (http://localhost:3000)
GOOGLE_CLIENT_ID      # Google OAuth client ID
GOOGLE_CLIENT_SECRET  # Google OAuth client secret
WECHAT_APP_ID         # WeChat OAuth app ID
WECHAT_APP_SECRET     # WeChat OAuth app secret
ADMIN_EMAIL           # Admin user email
JWT_SECRET            # Cookie secret for sessions
```

**Convention**:
- All env vars accessed through ENV object (server/_core/env.ts)
- Type definitions for required variables
- Never access process.env directly in business logic

## Additional Conventions

### File Naming
- React components: PascalCase (DOEParameters.tsx)
- Utility files: camelCase (db.ts, const.ts)
- Pages: PascalCase (Home.tsx, Studio.tsx, Login.tsx)
- Test files: *.test.ts suffix

### Import Order (observed pattern)
1. External packages (@trpc, react, lucia, etc.)
2. Internal aliases (@/, @shared/)
3. Relative imports (./components)
4. CSS imports (./index.css)

### Comments
- JSDoc for table schemas (drizzle/schema.ts)
- Inline comments for complex logic
- Type annotations preferred over comments

### Authentication Patterns
- User ID is always string (varchar) throughout the codebase
- Session cookie name: `doe_session`
- OAuth state cookies: `google_oauth_state`, `wechat_oauth_state`
- Admin check via `user.role === "admin"`
