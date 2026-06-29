<div align="center">
  <img src="https://raw.githubusercontent.com/ChetDevelopment/aiverse/main/public/image.png" alt="AIVerse" width="80" height="80" />
  <h1 align="center">✨ AIVerse</h1>
  <p align="center">
    <strong>The AI Productivity Ecosystem</strong><br />
    Discover · Learn · Build · Master AI
  </p>
  <p align="center">
    <a href="https://aiverse-silk.vercel.app">
      <img src="https://img.shields.io/badge/Live-Demo-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white" />
    </a>
    <a href="./ARCHITECTURE.md">
      <img src="https://img.shields.io/badge/Architecture-Read-06B6D4?style=for-the-badge&logo=readthedocs&logoColor=white" />
    </a>
    <a href="./API.md">
      <img src="https://img.shields.io/badge/API-Docs-10B981?style=for-the-badge&logo=swagger&logoColor=white" />
    </a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Prisma_7-2D3748?style=flat-square&logo=prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" />
    <img src="https://img.shields.io/badge/61_tests-passing-22C55E?style=flat-square&logo=vitest&logoColor=white" />
    <img src="https://img.shields.io/badge/79_routes-0_errors-22C55E?style=flat-square" />
  </p>
</div>

---

## 🌟 What is AIVerse?

**AIVerse** isn't just another AI directory — it's a **complete AI productivity platform**. Think of it as your command center for the AI world.

```text
┌─────────────────────────────────────────────────────┐
│                   AIVerse                           │
├──────────┬──────────┬───────────┬───────────────────┤
│ DISCOVER │  LEARN   │   BUILD   │   INTELLIGENCE    │
│ ─────────│ ──────── │ ───────── │ ───────────────── │
│ AI Tools │ Learning │ Workspace │  Trading Hub      │
│ Search   │ Prompts  │ Stacks    │  AI Copilot       │
│ Compare  │ Use Cases│ Collect.  │  Deals            │
│ Trending │ Blog     │ Recommend │  Analytics        │
└──────────┴──────────┴───────────┴───────────────────┘
```

Whether you're a developer, designer, student, or business professional — AIVerse helps you **discover the right tools, learn how to use them, build workflows, and stay ahead of the AI revolution.**

---

## ✨ Features That Matter

### 🚀 Discover
| Feature | What It Does |
|---------|-------------|
| **1,400+ AI Tools** | Every AI tool across 15 categories — from ChatGPT to niche startups |
| **Smart Search** | Full-text search with category, pricing, and sorting filters |
| **Compare Mode** | Side-by-side comparison of up to 3 tools with pros/cons |
| **GitHub Discovery** | Auto-discovered open-source AI projects with 361 repos indexed |

### 📚 Learn
| Feature | What It Does |
|---------|-------------|
| **Learning Paths** | Guided paths for Developers, Designers, Business, Students, Marketers |
| **Prompt Library** | 50+ curated prompts + **AI Prompt Generator** (create custom prompts) |
| **Use Case Explorer** | Browse by goal — "Build a website", "Write a thesis", "Start a podcast" |
| **AI News** | Live Hacker News feed with article extraction & reader mode |

### 🛠️ Build
| Feature | What It Does |
|---------|-------------|
| **Workspaces** | Personal workspaces with tools, notes, prompts & workflow builder |
| **AI Stacks** | Drag & drop tool pipelines (YouTube Creator, Design Sprint Kit, etc.) |
| **Collections** | Curated tool collections — "Best Free AI Tools", "AI for Designers" |
| **AI Recommendations** | Personalized recommendations based on your favorites & history |

### 🧠 Intelligence
| Feature | What It Does |
|---------|-------------|
| **Trading Hub** | Live BTC/ETH/SOL prices, candlestick charts, Fear & Greed index |
| **AI Copilot** | Context-aware floating assistant that knows your saved tools |
| **Free Deals** | 600+ verified free deals, promo codes & open-source tools |

---

## 🏗️ Architecture at a Glance

```
Frontend (Next.js 16)          Backend (Prisma + PostgreSQL)
┌──────────────────┐          ┌──────────────────────────────┐
│                  │          │                              │
│  Server (RSC)    │◄────────►│  26 Database Models          │
│  Components      │          │  Users · Tools · Reviews     │
│                  │          │  Prompts · Stacks · Learning  │
│  Client          │          │  Workspaces · Trading · Blog │
│  Components      │          │  Deals · GitHub Discovery    │
│                  │          │                              │
│  API Routes (46) │◄────────►│  Supabase Auth + OpenAI API  │
│                  │          │  + Ollama (local AI)         │
└──────────────────┘          └──────────────────────────────┘
```

### Why This Architecture?

| Decision | Why |
|----------|-----|
| **Next.js App Router** | Server Components for SEO, Client Components for interactivity |
| **Prisma + PostgreSQL** | Type-safe database access with migrations & relations |
| **Supabase Auth** | OAuth-ready (Google, GitHub) + local auth fallback |
| **Tailwind CSS v4** | Utility-first, fast iteration, dark mode built-in |
| **ISR + Code Splitting** | 5-minute revalidation on key pages, lazy-loaded components |

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center"><b>Framework</b></td>
    <td>Next.js 16 (App Router) · TypeScript 5 · React 19</td>
  </tr>
  <tr>
    <td align="center"><b>Database</b></td>
    <td>PostgreSQL · Prisma 7 ORM · Neon (serverless)</td>
  </tr>
  <tr>
    <td align="center"><b>Auth</b></td>
    <td>Supabase SSR · bcryptjs · OAuth (Google/GitHub)</td>
  </tr>
  <tr>
    <td align="center"><b>UI</b></td>
    <td>Tailwind CSS v4 · Radix UI · Lucide Icons · Framer Motion</td>
  </tr>
  <tr>
    <td align="center"><b>AI</b></td>
    <td>OpenAI API · Ollama (local) · lightweight-charts (TradingView)</td>
  </tr>
  <tr>
    <td align="center"><b>Testing</b></td>
    <td>Vitest · React Testing Library · Playwright · 61 tests</td>
  </tr>
  <tr>
    <td align="center"><b>CI/CD</b></td>
    <td>GitHub Actions · ESLint · TypeScript · Auto-deploy to Vercel</td>
  </tr>
</table>

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/ChetDevelopment/aiverse.git
cd aiverse

# Install
npm install

# Set up database (PostgreSQL required)
cp .env.example .env
# Edit .env with your DATABASE_URL, Supabase credentials
npm run db:push
npm run seed:all

# Start developing
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your local AIVerse is ready.

### One-command Setup
```bash
npm run setup   # Install + push DB + seed all data
```

---

## 📊 Project Stats

```
┌─────────────────────────────────────────────┐
│  📁 272 source files                        │
│  🛣️  79 routes (app)                        │
│  🔌 46 API endpoints                        │
│  🗄️  26 database models                     │
│  ✅ 0 TypeScript errors                     │
│  ✅ 0 ESLint errors                         │
│  🧪 61 tests · 8 test suites               │
│  🚀 ~45s build time                         │
│  📦 589 npm packages                        │
└─────────────────────────────────────────────┘
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📖 ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, data flow, design decisions |
| [📖 API.md](./API.md) | All 46 API endpoints documented |
| [📖 DATABASE.md](./DATABASE.md) | 26 models, relationships, indexes |
| [📖 DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy to Vercel, Docker, production checklist |
| [📖 SECURITY.md](./SECURITY.md) | Auth, CSP, rate limiting, security practices |
| [📖 CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute, code review, PR process |
| [📖 CHANGELOG.md](./CHANGELOG.md) | Release history |
| [📖 ROADMAP.md](./ROADMAP.md) | What's coming next |

---

## 🧪 Running Tests

```bash
npm test              # 61 tests · 8 suites
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # Playwright E2E tests
```

---

## 🤝 Contributing

Contributions are what make the open-source community amazing. Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for more information.

---

<div align="center">
  <p>
    <strong>Built with ❤️ by the AIVerse Team</strong>
  </p>
  <p>
    <a href="https://aiverse-silk.vercel.app">🌐 Live Demo</a> ·
    <a href="https://github.com/ChetDevelopment/aiverse/issues">🐛 Report Bug</a> ·
    <a href="https://github.com/ChetDevelopment/aiverse/issues">✨ Request Feature</a>
  </p>
  <p>
    <sub>⭐ Star us on GitHub — it helps others discover the project!</sub>
  </p>
</div>
