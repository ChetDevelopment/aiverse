# AIVerse Architecture

## Overview

AIVerse is a Next.js 16 application using the App Router pattern, combining React Server Components (RSC) with Client Components. It follows a layered architecture where data flows from the database through server components and API routes to client components.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                     │
├─────────────────────────────────────────────────────────┤
│  RSC Pages     Client Components     Service Workers    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / RSC Stream
┌───────────────────────┴─────────────────────────────────┐
│              Next.js 16 App Router (Server)              │
├─────────────────────────────────────────────────────────┤
│  Server Components    Server Actions    API Routes       │
│  Middleware           Route Handlers    Layouts          │
└───────────────────────┬─────────────────────────────────┘
                        │ Prisma / Supabase
┌───────────────────────┴─────────────────────────────────┐
│                  Data Layer                              │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL (via Prisma ORM)    Supabase Auth            │
│  Redis (rate limiting, in-memory)  OpenAI API            │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
aiverse/
├── prisma/                       # Database layer
│   ├── schema.prisma             # 26 models, enums, indexes
│   ├── seed.ts                   # Base seed data
│   ├── seed-new.ts               # New feature seeds
│   ├── seed-complete.ts          # Comprehensive seed
│   └── seed-*.ts                 # Feature-specific seeds
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (marketing)/          # Public pages (home, about, contact)
│   │   ├── (auth)/               # Auth pages (login, register)
│   │   ├── (dashboard)/          # Admin dashboard pages
│   │   ├── api/                  # ~50 REST API route handlers
│   │   ├── ai-tool/              # Tool detail pages [slug]
│   │   ├── blog/                 # Blog system pages
│   │   ├── news/                 # AI News / HN feed pages
│   │   ├── trading/              # AI Trading Hub pages
│   │   ├── workspaces/           # Workspace management pages
│   │   ├── stacks/               # Stack builder pages
│   │   ├── prompts/              # Prompt library pages
│   │   ├── learn/                # Learning center pages
│   │   ├── usecases/             # Use case explorer pages
│   │   ├── search/               # Search results pages
│   │   ├── collections/          # Collection pages
│   │   ├── deals/                # Free deals pages
│   │   ├── discover/             # GitHub discovery pages
│   │   ├── compare/              # Tool comparison pages
│   │   ├── globals.css           # Tailwind v4 + CSS variables
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── error.tsx             # Global error boundary
│   │   ├── loading.tsx           # Global loading state
│   │   └── not-found.tsx         # 404 page
│   ├── components/               # Reusable React components
│   │   ├── ui/                   # Design system primitives
│   │   ├── layout/               # Navbar, Footer, Sidebar
│   │   ├── home/                 # Homepage section components
│   │   ├── shared/               # Shared utility components
│   │   ├── ai-tool/              # Tool card, detail components
│   │   ├── trading/              # Chart, market components
│   │   ├── prompts/              # Prompt card components
│   │   ├── blog/                 # Blog card, article components
│   │   ├── news/                 # News feed components
│   │   ├── ai-assistant/         # Floating chat components
│   │   ├── compare/              # Comparison components
│   │   ├── collections/          # Collection components
│   │   └── admin/                # Admin panel components
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-user.ts           # Current user hook
│   │   ├── use-compare.ts        # Tool comparison state
│   │   └── use-debounce.ts       # Debounce hook
│   ├── lib/                      # Server utilities
│   │   ├── api-utils.ts          # API response helpers, auth guards
│   │   ├── auth-helpers.ts       # Server-side auth functions
│   │   ├── validations.ts        # Zod schemas for all inputs
│   │   ├── prisma.ts             # Singleton Prisma client
│   │   ├── csrf.ts               # CSRF token generation/validation
│   │   ├── rate-limit.ts         # In-memory rate limiter
│   │   ├── relationships.ts      # Content relationship queries
│   │   ├── utils.ts              # Shared utilities (cn, slugify, etc.)
│   │   ├── supabase/             # Supabase client factories
│   │   │   ├── server.ts         # Server-side Supabase client
│   │   │   └── client.ts         # Browser-side Supabase client
│   │   └── discovery/            # GitHub discovery engine
│   │       ├── github.ts         # GitHub API search
│   │       ├── github-fetch.ts   # Repository metadata fetch
│   │       └── repo-files.ts     # File content extraction
│   ├── config/
│   │   └── site.ts               # Site configuration constants
│   ├── types/
│   │   └── index.ts              # Shared TypeScript types
│   └── middleware.ts             # Supabase SSR + admin guard
├── public/                       # Static assets
├── scripts/                      # CLI tools
│   ├── create-admin.ts           # Admin user creation
│   ├── upgrade-admin.ts          # Role upgrade
│   └── run-discovery.ts          # GitHub discovery runner
└── tests/                        # Test files
```

---

## Component Hierarchy

```
RootLayout
├── ThemeProvider (next-themes)
│   ├── ToastProvider (custom toast system)
│   ├── [Page Content]
│   │   ├── Marketing Pages (Server Components)
│   │   │   ├── HeroSection
│   │   │   ├── FeaturedTools
│   │   │   ├── CategoryGrid
│   │   │   └── NewsletterSignup (Client Component)
│   │   ├── Tool Detail Pages (Server Components)
│   │   │   ├── ToolHeader
│   │   │   ├── ToolContent
│   │   │   ├── ReviewSection (Client Component)
│   │   │   └── RelatedTools
│   │   ├── Dashboard Pages (Client Components)
│   │   │   ├── WorkspaceList
│   │   │   ├── StackBuilder
│   │   │   └── PromptLibrary
│   │   └── Trading Pages (Client Components)
│   │       ├── MarketOverview
│   │       ├── CandlestickChart
│   │       └── AISignalAnalysis
│   ├── FloatingChat (dynamic import, client)
│   ├── CommandPalette (dynamic import, client)
│   └── MobileBottomNav (client)
```

---

## Data Flow

### Server Components → Data

```
Server Component
  └─> getCurrentUser() / prisma query
       └─> Prisma Client (singleton)
            └─> PostgreSQL
```

### Client Components → Data

```
Client Component
  └─> fetch("/api/...")
       └─> Route Handler (server)
            ├─> requireApiAuth() / requireApiAdmin()
            ├─> Zod validation
            ├─> rateLimit()
            └─> Prisma query
                 └─> PostgreSQL
```

### Auth Flow

```
Request → middleware.ts
  ├─> Supabase SSR cookies → getUser()
  ├─> Check local auth cookie (fallback)
  ├─> Admin route protection
  └─> Redirect to /login if unauthorized

API Route
  └─> requireApiAuth()
       ├─> Supabase getUser()
       └─> Prisma user lookup
```

### AI Copilot Flow

```
Client Component
  └─> POST /api/ai/chat
       └─> getUserContext() (favorites, bookmarks, history)
       └─> buildPersonalizedPrompt()
       └─> OpenAI API (gpt-4o-mini)
       └─> Response → Client
```

---

## Authentication Flow

AIVerse supports dual authentication:

1. **Supabase SSR (Primary)**: Uses `@supabase/ssr` for cookie-based session management. The middleware automatically refreshes sessions and protects admin routes.

2. **bcryptjs Fallback (Local)**: When Supabase is unavailable, users can authenticate via email/password with bcryptjs hashing. Sessions are stored in a signed `aiverse_local_session` cookie.

```
Login Attempt
  ├─> Supabase signInWithPassword()
  │    ├─> Success → syncOAuthUser() → response
  │    └─> Failure → fallback to local auth
  └─> bcrypt.compare() → local cookie session
```

---

## Recommendation Engine

The recommendation engine (`/api/recommendations`) provides personalized content:

| Type | Logic |
|------|-------|
| `trending-tools` | Sort by `viewCount` desc |
| `personalized-tools` | By category interests from user activity |
| `continue-learning` | Recent workspaces + stacks + learning paths |
| `tool-relationships` | Cross-content relationships (prompts, stacks, deals, etc.) |
| `prompts` | By `useCount` desc, official prompts first |
| `stacks` | By `likeCount` desc, public only |
| `learning-paths` | By `updatedAt` desc, published only |
| `workspace-suggestions` | Related prompts + stacks based on user's tool IDs |
| `home` (default) | Composite: trending tools + popular prompts + learning paths + stacks |

Category interests are derived from:
- Favorited tools' categories
- Bookmarked tools' categories
- Browsing history categories

---

## Trading Module

The trading module (`/api/trading/market` and `/api/trading/analysis`) provides:

1. **Market Data**: Real crypto prices from CoinGecko API with mock data fallback
2. **AI Analysis**: Simulated technical analysis (RSI, MACD, MA, Bollinger Bands, Volume)
3. **Market Overview**: Fear & Greed index, market cap, volume, BTC dominance
4. **News Feed**: Curated crypto news with sentiment classification
5. **Community Posts**: Simulated social sentiment data

Frontend uses `lightweight-charts` (TradingView) for candlestick chart rendering.

---

## State Management

AIVerse does **not** use a global state management library. Instead:

- **React hooks**: Custom hooks (`useUser`, `useCompare`, `useDebounce`) encapsulate state
- **URL state**: Search params (`useSearchParams`) for filters, pagination, compare
- **Server state**: React Server Components fetch data directly via Prisma
- **Client state**: `useState` / `useReducer` in Client Components
- **Cache**: Next.js `fetch` cache with `revalidate` for HN news and GitHub data

---

## Code Splitting Strategy

Heavy client components are lazy-loaded using `next/dynamic`:

```typescript
// src/components/client-dynamic.tsx
export const FloatingChat = dynamic(
  () => import("@/components/ai-assistant/floating-chat"),
  { ssr: false }
)
export const CommandPalette = dynamic(
  () => import("@/components/command-palette"),
  { ssr: false }
)
```

This ensures:
- Heavy AI chat component loads only on interaction
- Command palette loads on-demand
- Trading charts load asynchronously
- Admin dashboard components are code-split by route

---

## Styling Approach

- **Tailwind CSS v4**: Utility-first framework using `@import "tailwindcss"` syntax
- **CSS Variables**: Full design token system via `@theme inline` directive
- **Dark mode**: `next-themes` with class-based dark mode (`.dark` class)
- **Component library**: Radix UI primitives (unstyled, accessible) + custom styles
- **Icon library**: Lucide React icons
- **Class merging**: `tailwind-merge` + `clsx` via `cn()` utility
- **Design tokens**: Colors (background, foreground, primary, secondary, muted, accent, destructive, card, popover, border, input, ring, sidebar)
- **Typography**: Geist Sans + Geist Mono fonts (variable fonts via next/font)
- **Animation**: Framer Motion for page transitions and micro-interactions
- **Responsive**: Mobile-first with bottom navigation on small screens
- **Accessibility**: Skip-to-content link, proper ARIA labels, reduced motion support

---

## API Layer Conventions

Every API route follows a consistent pattern:

```typescript
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiAuth()
    // ... business logic ...
    return apiSuccess({ data: result })
  } catch (error) {
    return handleApiError(error)
  }
}
```

Response format:
```typescript
// Success
{ data: T }  // or any shape passed to apiSuccess()

// Error
{ error: string }  // status 400-500
```
