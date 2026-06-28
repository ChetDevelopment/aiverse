# AIVerse Security Policy

---

## Authentication

### Dual Auth System

AIVerse supports two authentication methods, with Supabase SSR as primary:

#### 1. Supabase SSR (Primary)

Uses `@supabase/ssr` for secure, cookie-based session management:

- **Server-side**: `createServerClient` with cookie store access via `next/headers`
- **Client-side**: `createBrowserClient` with automatic cookie handling
- **Middleware**: Automatic session refresh via `supabase.auth.getUser()` on every request
- **OAuth**: Supports Google and GitHub social login via Supabase Auth

#### 2. bcryptjs Fallback (Local)

When Supabase is unavailable, local auth is used:

- Passwords hashed with **bcryptjs** (10 salt rounds)
- Session stored in `aiverse_local_session` cookie
- Cookie value: Base64-encoded JSON `{ id, email, role }`
- Cookie attributes: `HttpOnly; SameSite=Lax; Max-Age=604800` (7 days)

### Password Requirements

Validated via Zod schema (`registerSchema`):

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

---

## Authorization

### Role-Based Access

Two roles: `USER` and `ADMIN`

### API Auth Guards

```typescript
// src/lib/api-utils.ts

// Requires authenticated user
await requireApiAuth()
// Returns User from database, throws ApiAuthError (401) if unauthorized

// Requires admin role
await requireApiAdmin()
// Throws ApiAuthError (403) if user is not ADMIN
```

### Server Component Auth

```typescript
// src/lib/auth-helpers.ts
getCurrentUser()  // Returns user or null
requireAuth()     // Redirects to /login if unauthenticated
requireAdmin()    // Redirects to /login or / if not admin
```

### Route Protection

- **Middleware** (`src/middleware.ts`): Protects all `/admin/*` routes
- Checks Supabase session first, then local auth cookie
- Redirects unauthenticated users to `/login` with original path as `redirect` parameter
- Bypasses `_next/static`, `_next/image`, favicon, and static file requests

---

## CSRF Protection

Custom CSRF token implementation in `src/lib/csrf.ts`:

```typescript
generateCsrfToken(sessionId: string): string
validateCsrfToken(token: string, sessionId: string): boolean
```

- Token format: `{timestamp}.{sha256_hash}`
- SHA-256 hash combines: `sessionId + ":" + timestamp + ":" + CSRF_SECRET`
- Tokens expire after 1 hour
- `CSRF_SECRET` from environment variable or auto-generated on startup
- CSRF token is passed via `X-CSRF-Token` header (CORS allows this header)

---

## Content Security Policy

Configured in `next.config.ts`:

```
default-src 'self'
script-src 'self' 'unsafe-eval' 'unsafe-inline' https:
style-src 'self' 'unsafe-inline' https:
img-src 'self' blob: data: https:
font-src 'self' https:
connect-src 'self' https: http://localhost:* ws://localhost:*
frame-src 'self' https://*.supabase.co
object-src 'none'
base-uri 'self'
form-action 'self'
```

Notes:
- `'unsafe-eval'` required by Next.js for development
- `'unsafe-inline'` required for Next.js and Tailwind
- `frame-src` restricted to Supabase for OAuth popups
- `connect-src` allows localhost WebSocket for hot reloading

---

## HTTP Security Headers

Applied in `next.config.ts` for all routes (`/(.*)`):

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-DNS-Prefetch-Control` | `on` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | (see above) |

### CORS Headers (API routes only)

| Header | Value |
|--------|-------|
| `Access-Control-Allow-Origin` | `NEXT_PUBLIC_APP_URL` |
| `Access-Control-Allow-Methods` | `GET,POST,PUT,DELETE,OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization, X-CSRF-Token` |
| `Access-Control-Max-Age` | `86400` |

---

## Rate Limiting

In-memory rate limiting in `src/lib/rate-limit.ts`:

```typescript
rateLimit(key: string, limit?: number, windowMs?: number)
```

Default limits:

| Key | Limit | Window | Applied To |
|-----|-------|--------|------------|
| `login` | 5 | 60s | `POST /api/auth/login` |
| `register` | 3 | 60s | `POST /api/auth/register` |
| `newsletter` | 3 | 60s | `POST /api/newsletter` |
| `review` | 10 | 60s | `POST /api/reviews` |
| `tool:create` | 20 | 60s | `POST /api/tools` |
| `tool:update` | 30 | 60s | `PUT /api/tools/*` |
| `api` | 100 | 60s | General API fallback |
| `contact` | 3 | 60s | `POST /api/contact` |

Rate limiting is **in-memory only** — resets on server restart. For production with multiple instances, use a Redis-backed solution.

---

## Input Validation

All user inputs are validated using **Zod** schemas:

| Schema | Validates |
|--------|-----------|
| `loginSchema` | Email + password |
| `registerSchema` | Name, email, password strength, password match |
| `toolSchema` | Tool fields, category/tag IDs, pros/cons, screenshots, FAQs |
| `reviewSchema` | Rating (1-5), comment (10-2000) |
| `newsletterSchema` | Email format |
| `searchSchema` | Query, category, pricing, sort, page |
| `dealSchema` | Deal fields, URLs, deal type enum |
| `blogSchema` | Title, slug, content, metadata |

Validation errors return `400` with the first Zod issue message.

---

## Session Management

### Supabase Sessions

- Managed by `@supabase/ssr`
- Cookies are automatically refreshed by middleware
- Session cookie prefix: `sb-` (Supabase default)
- OAuth tokens: Supabase handles refresh tokens internally

### Local Sessions

- Cookie name: `aiverse_local_session`
- Format: Base64 JSON `{ id, email, role }`
- Expiry: 7 days (`Max-Age=604800`)
- Flags: `HttpOnly; SameSite=Lax; Path=/`

### Logout

```typescript
POST /api/auth/logout
// Calls supabase.auth.signOut()
```

---

## Cookie Security

| Cookie | Type | HttpOnly | SameSite | Secure | Max-Age |
|--------|------|----------|----------|--------|---------|
| `sb-*` | Supabase session | Yes | Lax | In production | Session |
| `aiverse_local_session` | Local auth | Yes | Lax | In production | 7 days |
| `next-auth.*` | CSRF tokens (if used) | Yes | Lax | In production | - |

---

## Admin Route Protection

### Middleware Level

```typescript
// src/middleware.ts
if (pathname.startsWith("/admin") && !pathname.startsWith("/api/admin") && pathname !== "/login") {
  if (!user && !isLocalAdmin) {
    // Redirect to /login
  }
}
```

### API Level

```typescript
// All admin CRUD operations require:
await requireApiAdmin()

// This validates:
// 1. User is authenticated (Supabase or local)
// 2. User has ADMIN role
// 3. Returns 401 or 403 if validation fails
```

### Scripts

Admin management scripts in `scripts/`:

| Script | Description |
|--------|-------------|
| `create-admin.ts` | Create a new admin user |
| `create-local-admin.ts` | Create local (non-Supabase) admin |
| `upgrade-admin.ts` | Upgrade a user to ADMIN role |
| `check-admin.ts` | Check admin status |
| `reset-admin.ts` | Reset admin role |

The first registered user is automatically granted ADMIN role.

---

## Database Security

- Prisma uses parameterized queries (no SQL injection)
- Connection string stored in environment variable (not in code)
- `@prisma/adapter-pg` for native PostgreSQL connection
- Mock client fallback prevents crashes when DB is unavailable

### Cascade Deletes

All foreign key relations use `onDelete: Cascade` to prevent orphaned records.

---

## Security Checklist for Contributors

- [ ] All user inputs validated with Zod schemas
- [ ] API routes use `requireApiAuth()` or `requireApiAdmin()` as appropriate
- [ ] No sensitive data in client components (use Server Components for data fetching)
- [ ] Environment variables never exposed to client (except `NEXT_PUBLIC_*` prefix)
- [ ] No secrets or tokens in code or commit history
- [ ] Rate limiting applied to auth and submission endpoints
- [ ] CSRF protection for state-changing operations
- [ ] Cookies set with `HttpOnly` and `SameSite` attributes
- [ ] Third-party URLs whitelisted in `next.config.ts` images config
- [ ] Admin-only operations check `role === "ADMIN"` server-side
- [ ] Owner-only operations check `userId === user.id`
- [ ] No `eval()` or `Function()` constructor usage
- [ ] No hardcoded passwords or API keys
- [ ] Error messages don't leak implementation details
- [ ] File paths sanitized from user input
- [ ] Mutating operations use HTTP verbs (POST/PUT/DELETE), never GET
