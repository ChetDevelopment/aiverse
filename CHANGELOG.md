# Changelog

All notable changes to AIVerse are documented in this file.

---

## v2.0.0 (Current)

### Major Features

#### AI Tools Directory
- Browse 1400+ AI tools across 15 categories with full-text search
- Advanced filtering by category, pricing model, and sort order
- Side-by-side comparison of up to 3 tools
- Autocomplete search suggestions
- View count tracking and trending sort
- GitHub fallback search when no local results match

#### Authentication & Accounts
- Dual auth: Supabase SSR (primary) + bcryptjs local fallback
- OAuth support (Google, GitHub) via Supabase
- Session management with cookie-based auth
- Admin role management with CLI scripts
- First-user auto-admin promotion
- Rate limiting on login/register endpoints

#### Workspaces
- Personal workspaces with tools, notes, prompts, collections, and workflows
- CRUD operations with archiving support
- Workspace duplication
- Public/private visibility controls
- Rich item types (tool, note, prompt, collection, workflow)
- Reorderable items

#### AI Stacks
- Drag-and-drop tool stack builder
- Public stack discovery with search
- Stack liking and cloning
- Comments on stacks
- Owner-only editing with auth checks

#### Prompt Library
- Official and community prompts per tool
- Prompt rating system (1-5 stars with computed averages)
- Prompt favoriting
- Usage count tracking
- Filtering by tool, category, difficulty, and official status
- Multilingual support

#### Learning Center
- Guided learning paths with step-by-step instructions
- Category grouping for easy browsing
- Difficulty levels (beginner, intermediate, advanced)
- Published/unpublished workflow

#### Use Case Explorer
- Goal-based tool discovery (Build a Website, Write a Thesis, etc.)
- Tool-to-use-case mapping with ordering
- Integration with prompt library per use case

#### Recommendations Engine
- Personalized tool recommendations based on user activity
- Category interest analysis from favorites, bookmarks, and history
- Content relationship system (tools → prompts → stacks → deals)
- Multiple recommendation types (trending, personalized, continue-learning)
- Workspace suggestions based on user tools

#### Trading Hub
- Live crypto market data (BTC, ETH, SOL) from CoinGecko API
- Mock data fallback when API unavailable
- Fear & Greed index, market sentiment
- Top gainers/losers tracking
- Crypto news feed with sentiment classification
- Simulated technical analysis (RSI, MACD, MA, Bollinger Bands)
- Community sentiment simulation
- TradingView lightweight-charts integration

#### Blog System
- Full CRUD for blog posts
- Published/featured management
- Read time calculation
- Tag-based categorization
- Pagination support

#### News System
- Live Hacker News feed with automatic fetching
- Tech topic classification (AI, Security, Dev, Hardware)
- Tech score ranking
- Article content extraction via Mozilla Readability
- In-memory caching (5 min TTL)

#### AI Copilot
- Context-aware floating AI assistant
- OpenAI GPT-4o-mini integration
- Personalized responses based on user favorites, history, and workspaces
- Page context awareness (tool details, search, categories)
- Dynamic import for performance

#### GitHub Discovery
- Automated GitHub project discovery across 15 categories
- Repository metadata fetching (tags, workflows, features)
- Code search within repositories
- Security policy detection
- Configuration file scanning (CODEOWNERS, SECURITY.md, etc.)
- Admin review workflow (pending/approved/rejected)

#### Curated Collections
- Auto-generated collections (Free Tools, Trending, New)
- User-created personal collections with items
- Collection management with notes

#### Free Deals
- Curated free AI tool deals with verification
- Deal types: free-tier, promo-code, lifetime-deal, open-source, student
- Expiration tracking

#### Reviews & Ratings
- User reviews for AI tools (1-5 rating + comment)
- Helpful vote system on reviews
- Upsert-based reviews (one per user per tool)

#### Favorites & Bookmarks
- Tool favoriting and bookmarking
- Browsing history tracking (last 50 items)

#### Notifications
- User notification system with read/unread tracking
- Bulk mark-as-read support

#### Search
- Full-text search across tools, categories, and tags
- Combined tool and category autocomplete
- Paginated results with sorting

#### Admin Dashboard
- Admin-only API routes with role verification
- Tool CRUD with full validation
- Blog management
- Learning path management
- Use case management
- Deal management
- Contact message inbox

#### Community Features
- User profiles with activity
- Public stacks and collections
- Newsletter subscription
- Contact form

### Technical Improvements

- Next.js 16 App Router with RSC + Client Components
- Tailwind CSS v4 with CSS variable design tokens
- Dark mode (next-themes with class strategy)
- Prisma 7 with PostgreSQL adapter
- Zod validation on all API inputs
- In-memory rate limiting
- CSRF protection
- Comprehensive security headers (CSP, HSTS, etc.)
- Code splitting with next/dynamic
- Responsive mobile design with bottom navigation
- Accessibility (skip-to-content, ARIA labels, reduced motion)
- SEO (next-sitemap, Open Graph, robots.txt)
- Singleton Prisma client with mock fallback

---

## v1.0.0 — Initial Release

### Features

- AI Tools Directory with 1400+ tools
- Category browsing (15 categories)
- Basic search and filter
- Tool detail pages
- User registration and login (Supabase Auth)
- Admin panel for tool management
- Responsive design with Tailwind CSS
- Dark/light theme support
