# AIVerse Code Style Guide

---

## TypeScript Configuration

Strict mode is enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "incremental": true
  }
}
```

### Path Alias

```typescript
// Use @/ for src/ imports
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
```

### Type Definitions

- Shared types go in `src/types/index.ts`
- Prisma types are auto-generated (import from `@prisma/client`)
- Zod inferred types for form/API data: `z.infer<typeof mySchema>`
- Avoid `any` — ESLint warns on it

---

## ESLint Configuration

Uses `eslint-config-next` with TypeScript rules:

```javascript
// eslint.config.mjs
{
  rules: {
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

Run: `npm run lint`

---

## Component Conventions

### Server Components (Default)

All components are Server Components by default in Next.js App Router. Use them for:

- Data fetching (direct Prisma queries)
- SEO metadata
- Static/read-only content
- Layout and page structure

```typescript
// Server Component — no "use client" directive
import { prisma } from "@/lib/prisma"

export default async function ToolList() {
  const tools = await prisma.aiTool.findMany({ where: { isPublished: true } })
  return <div>{/* render */}</div>
}
```

### Client Components

Add `"use client"` directive only when needed for:

- Interactivity (onClick, onChange, etc.)
- React hooks (useState, useEffect, useContext)
- Browser-only APIs
- Custom event listeners

```typescript
"use client"
import { useState } from "react"

export function SearchBar() {
  const [query, setQuery] = useState("")
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

### Component File Organization

```
components/
├── ui/           # Design system primitives (Button, Card, Input, etc.)
├── layout/       # Navigation, footer, sidebar
├── home/         # Homepage-specific sections
├── shared/       # Reusable across features
├── ai-tool/      # Tool-related components
├── trading/      # Trading/market components
├── prompts/      # Prompt-related components
├── blog/         # Blog-related components
├── news/         # News-related components
├── ai-assistant/ # AI Copilot components
├── compare/      # Comparison components
├── collections/  # Collection components
├── admin/        # Admin dashboard components
├── discover/     # GitHub discovery components
├── repo/         # Repository detail components
├── search/       # Search components
├── recommend/    # Recommendation components
├── notifications/# Notification components
├── toast/        # Toast notification system
├── categories/   # Category components
├── client-dynamic.tsx  # Lazy-loaded client components
├── command-palette.tsx  # Command palette
├── mode-toggle.tsx     # Theme toggle
├── mobile-bottom-nav.tsx  # Mobile navigation
├── page-transition.tsx    # Page transition wrapper
├── theme-provider.tsx     # next-themes provider
└── toast.tsx             # Toast context provider
```

---

## Naming Conventions

### Files & Folders

- **Components**: PascalCase (`ToolCard.tsx`, `SearchBar.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUser.ts`, `useDebounce.ts`)
- **Utilities**: camelCase (`api-utils.ts`, `auth-helpers.ts`)
- **API routes**: kebab-case (`route.ts` inside feature folders)
- **Pages**: kebab-case for folders (`ai-tool/`, `use-cases/`)

### Variables & Functions

- **Variables**: camelCase (`const toolCount = 0`)
- **Functions**: camelCase (`function formatDate()`)
- **Constants**: SCREAMING_SNAKE_CASE for env vars and config
- **Classes**: PascalCase (rarely used)

### React Components

- **Component names**: PascalCase (`export function ToolCard()`)
- **Props interface**: `{ComponentName}Props` (`interface ToolCardProps`)
- **Event handlers**: `handle{Action}` (`handleSubmit`, `handleClick`)
- **Boolean props**: `is...`, `has...`, `show...` (`isOpen`, `hasError`, `showDetails`)

---

## Import Ordering

```typescript
// 1. External dependencies (npm packages)
import { NextRequest } from "next/server"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

// 2. Internal library modules (@/lib/*)
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess } from "@/lib/api-utils"
import { cn } from "@/lib/utils"

// 3. Components (@/components/*)
import { Button } from "@/components/ui/button"
import { ToolCard } from "@/components/ai-tool/tool-card"

// 4. Types (@/types/*)
import type { ToolCardData } from "@/types"

// 5. Styles (imported last)
import "./styles.css"
```

---

## CSS / Tailwind Conventions

### Tailwind v4 Syntax

```css
/* globals.css */
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));
```

### Design Tokens

Use CSS variables via `@theme inline`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --radius-lg: var(--radius);
}

:root {
  --background: oklch(1 0 0);
  --primary: oklch(0.205 0.042 265.755);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --primary: oklch(0.985 0 0);
}
```

### Class Merging

Use the `cn()` utility for conditional classes:

```typescript
import { cn } from "@/lib/utils"

<div className={cn("px-4 py-2 bg-background", isActive && "bg-primary", className)} />
```

### Component Styles

- Use Tailwind utility classes directly
- Avoid custom CSS files for components
- Use `@layer base` for base styles
- Use `@layer utilities` for custom utilities

### Common Patterns

```typescript
// Card with shadow
<div className="rounded-lg border bg-card text-card-foreground shadow-sm">

// Flex layout
<div className="flex items-center gap-2">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">

// Dark mode variant
<div className="bg-white dark:bg-gray-800">
```

---

## React Patterns

### Custom Hooks

Place in `src/hooks/`:

```typescript
// src/hooks/use-user.ts
"use client"
import { useState, useEffect } from "react"

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/user")
      .then((r) => r.json())
      .then((data) => { setUser(data.user || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { user, loading, isAuthenticated: !!user }
}
```

### State Management

- **Local state**: `useState` for component-level state
- **URL state**: `useSearchParams` for shareable state (filters, pagination)
- **Server state**: Direct Prisma queries in Server Components
- **No global store**: Avoid Redux, Zustand, etc.

### Dynamic Imports

Heavy components use `next/dynamic`:

```typescript
// src/components/client-dynamic.tsx
import dynamic from "next/dynamic"

export const FloatingChat = dynamic(
  () => import("@/components/ai-assistant/floating-chat"),
  { ssr: false }
)
```

### Error Boundaries

- Global error boundary at `src/app/error.tsx`
- Per-page error boundaries as needed
- API routes use `handleApiError()` for consistent error handling

---

## API Route Conventions

### Structure

```typescript
// src/app/api/feature/route.ts
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"
import { mySchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiAuth()
    const { searchParams } = new URL(request.url)
    const data = await prisma.myModel.findMany({ /* ... */ })
    return apiSuccess(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiAdmin()
    const body = await request.json()
    const parsed = mySchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)
    const created = await prisma.myModel.create({ data: parsed.data })
    return apiSuccess(created, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Response Helpers

```typescript
import { apiError, apiSuccess, handleApiError } from "@/lib/api-utils"

apiSuccess(data)             // 200
apiSuccess(data, 201)        // 201 Created
apiError("message")          // 400
apiError("message", 401)     // Custom status
handleApiError(error)        // Catches ApiAuthError, ApiRateLimitError, defaults to 500
```

### Auth Guards

```typescript
await requireApiAuth()   // Returns User (throws 401)
await requireApiAdmin()  // Returns User (throws 401/403)
```

### Rate Limiting

```typescript
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit"

const { allowed } = rateLimit(`my-key:${ip}`, 10, 60000)
if (!allowed) return rateLimitResponse()
```

### Page Parameters (Next.js 16)

```typescript
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params  // Must await params in Next.js 16
  // ...
}
```

---

## Database Conventions

### Prisma Queries

- Use Prisma's generated types for type safety
- Use `select` to limit fields (avoid `include` when not needed)
- Use transactions for multi-step operations

### Seed Files

- Each seed file is self-contained
- Use `upsert` to avoid duplicates on re-running
- Check `existingUserCount === 0` for first-user admin logic

### Mock Client

When `DATABASE_URL` is not set (e.g., during build), Prisma falls back to a mock client that returns empty results safely.
