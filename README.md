# AIVerse — The AI Productivity Ecosystem

Discover, learn, build, and master AI tools with workspaces, prompts, stacks, learning paths, and a context-aware copilot.

**AIVerse** is a comprehensive AI tools directory and productivity platform. It helps users discover AI tools, learn how to use them, build workflows, share stacks, save prompts, compare alternatives, and stay updated with AI news and market intelligence.

---

## Features

### Discover
- **AI Tools Directory** — Browse 1400+ AI tools across 15 categories
- **Search & Filter** — Full-text search with category, pricing, and sorting filters
- **Compare** — Side-by-side comparison of up to 3 tools
- **Categories** — Browse by category (Chat AI, Coding, Image, Video, etc.)
- **Trending** — Trending AI tools and GitHub projects
- **GitHub Discovery** — Auto-discovered open-source AI projects

### Learn
- **Learning Center** — Guided learning paths (AI for Developers, Designers, Business, etc.)
- **Prompt Library** — Official and community prompts per tool (copy, save, rate)
- **Use Case Explorer** — Browse by goal (Build a Website, Write a Thesis, Edit Videos, etc.)
- **Blog** — AI guides, tutorials, comparisons
- **AI News** — Live Hacker News feed with article extraction

### Build
- **Workspaces** — Personal workspaces with tools, notes, prompts, collections, workflows
- **AI Stacks** — Drag-and-drop tool stacks (YouTube Creator Pipeline, AI Writing Studio, etc.)
- **Collections** — Curated tool collections
- **Recommendations** — AI-powered tool recommendations

### Intelligence
- **AI Trading Hub** — Live crypto market data, candlestick charts, AI analysis
- **Free Deals** — Curated and verified free AI tool deals
- **AI Copilot** — Context-aware floating AI assistant

### Community
- **Reviews & Ratings** — Rate and review AI tools
- **Favorites & Bookmarks** — Save tools for later
- **User Profiles** — Public profiles with activity
- **Admin Dashboard** — Full admin panel for content management

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7 |
| **Auth** | Supabase SSR + bcryptjs fallback |
| **UI** | Tailwind CSS v4, Radix UI, Lucide Icons |
| **Charts** | lightweight-charts (TradingView) |
| **Animation** | Framer Motion |
| **AI** | OpenAI API |
| **Misc** | Zod (validation), next-sitemap, next-themes |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm 9+

### Installation

```bash
git clone https://github.com/your-org/aiverse.git
cd aiverse
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

Optional variables:

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Enable AI Copilot features |
| `NEXT_PUBLIC_APP_URL` | Custom app URL (default: localhost:3000) |

### Database Setup

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed demo data
npm run seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
aiverse/
├── prisma/              # Database schema and seeds
│   ├── schema.prisma    # Models, enums, relations
│   ├── seed.ts          # Basic seed data
│   ├── seed-blog.ts     # Blog posts seed
│   ├── seed-deals.ts    # Free deals seed
│   ├── seed-reviews.ts  # User reviews seed
│   ├── seed-new.ts      # New models seed (learning, prompts, use cases, stacks)
│   └── seed-complete.ts # Complete comprehensive seed
├── src/
│   ├── app/             # Next.js App Router pages + API routes
│   │   ├── (marketing)/ # Public marketing pages (home, about, contact)
│   │   ├── (auth)/      # Auth pages (login, register, forgot-password)
│   │   ├── (dashboard)/ # Admin dashboard
│   │   ├── api/         # All API routes (~45 endpoints)
│   │   ├── ai-tool/     # Tool detail pages
│   │   ├── blog/        # Blog system
│   │   ├── news/        # News system
│   │   ├── search/      # Search functionality
│   │   ├── trading/     # AI Trading Hub
│   │   ├── workspaces/  # AI Workspace
│   │   ├── stacks/      # AI Stack Builder
│   │   ├── prompts/     # Prompt Library
│   │   ├── learn/       # Learning Center
│   │   ├── usecases/    # Use Case Explorer
│   │   └── ...          # Additional pages
│   ├── components/      # Reusable React components
│   │   ├── ui/          # Design system primitives (Button, Card, Input, etc.)
│   │   ├── layout/      # Navbar, Footer
│   │   ├── home/        # Homepage sections
│   │   ├── shared/      # Reusable shared components
│   │   ├── trading/     # Trading chart components
│   │   ├── prompts/     # Prompt card components
│   │   └── ...          # Additional component groups
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities, API helpers, Prisma client
│   ├── config/          # Site configuration
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── scripts/             # CLI scripts (admin management)
└── tests/               # Test files
```

---

## API Overview

The application exposes ~45 API endpoints under `/api/`. All endpoints return a consistent response format:

```typescript
{
  data: T          // Response payload
  error?: string   // Error message (if applicable)
}
```

Key API groups:

| Group | Prefix | Description |
|-------|--------|-------------|
| Auth | `/api/auth/*` | Login, register, logout, user info |
| Tools | `/api/tools/*` | CRUD, search, suggest |
| Workspaces | `/api/workspaces/*` | CRUD with items |
| Stacks | `/api/stacks/*` | CRUD with items, likes, comments, clone |
| Prompts | `/api/prompts/*` | CRUD, rate, favorite, use count |
| Learning | `/api/learning/*` | Learning paths |
| Use Cases | `/api/usecases/*` | Use cases with tools |
| Trading | `/api/trading/*` | Market data, analysis |
| Recommendations | `/api/recommendations` | Personalized recommendations |
| Blog | `/api/blog/*` | Blog CRUD |
| News | `/api/news/*` | HN news feed, article content |
| Deals | `/api/deals` | Free deals |
| GitHub | `/api/github/*` | GitHub trending, repo details, search |

See [API.md](./API.md) for full documentation.

---

## Database

Uses PostgreSQL with Prisma ORM. Schema has **26 models** covering users, tools, categories, reviews, favorites, bookmarks, workspaces, stacks, prompts, learning paths, use cases, blog posts, news, deals, and more.

See [DATABASE.md](./DATABASE.md) for schema overview.

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm start           # Production start
npm run lint         # ESLint check
npm run typecheck    # TypeScript check
npm test            # Run tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Run main seed
npm run seed:new     # Seed new models
npm run seed:all     # Run all seeds
npm run seed:complete # Complete comprehensive seed
```

---

## License

MIT — see [LICENSE](./LICENSE)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.
