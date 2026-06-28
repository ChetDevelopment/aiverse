# AIVerse Deployment Guide

---

## Prerequisites

- **Node.js** 20+ (runtime)
- **PostgreSQL** 15+ (database)
- **npm** 9+ (package manager)
- **Supabase** account (authentication)
- **OpenAI API key** (optional, for AI Copilot)
- **GitHub token** (optional, for GitHub discovery features)

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/aiverse` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | `eyJhbGciOiJIUzI1NiIs...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public application URL | `http://localhost:3000` |
| `OPENAI_API_KEY` | OpenAI API key for AI Copilot | - |
| `GITHUB_TOKEN` | GitHub personal access token for API calls | - |
| `CSRF_SECRET` | Secret for CSRF token generation | Auto-generated |

### Supabase OAuth (Optional)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_AUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `NEXT_PUBLIC_SUPABASE_AUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_SUPABASE_AUTH_GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `NEXT_PUBLIC_SUPABASE_AUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

---

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE aiverse;"

# Using Docker
docker run -d --name aiverse-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=aiverse \
  -p 5432:5432 \
  postgres:15
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database URL and Supabase credentials
```

### 3. Push Schema & Generate Client

```bash
npm run db:push
npm run db:generate
```

### 4. Seed Data (Optional)

```bash
# Basic seed
npm run db:seed

# Complete seed (all features)
npm run seed:complete
```

---

## Build Instructions

### Development

```bash
npm install
npm run dev
# Server starts at http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Verify Build

```bash
npm run lint       # ESLint check
npm run typecheck  # TypeScript check
```

---

## Deploy to Vercel

### 1. Prepare Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/aiverse.git
git push -u origin main
```

### 2. Configure on Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Set the **Framework Preset** to `Next.js`
3. Add all **Environment Variables** from the table above
4. Set **Root Directory** to `./` (default)
5. Deploy

### 3. Build Settings (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### 4. Post-Deployment

```bash
# Connect to production database and run migrations
npx prisma db push
# or
npx prisma migrate deploy
```

---

## Deploy to Docker

### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: aiverse
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/aiverse
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      GITHUB_TOKEN: ${GITHUB_TOKEN}
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  pgdata:
```

### Build and Run

```bash
# Build image
docker build -t aiverse .

# Run with docker-compose
docker-compose up -d

# Run standalone
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  aiverse
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Verify application responds
curl -I https://your-app.vercel.app/

# Check API responds
curl https://your-app.vercel.app/api/categories

# Verify authentication
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Verify Database Connection

```bash
# Run a simple query through the API
curl https://your-app.vercel.app/api/tools?limit=1
```

### 3. Verify Critical Features

- [ ] Homepage loads without errors
- [ ] Search returns results
- [ ] User registration works
- [ ] User login works (both Supabase and local auth)
- [ ] Admin routes are protected
- [ ] AI Copilot responds (if configured)
- [ ] Trading market data loads
- [ ] Blog posts are accessible
- [ ] News feed loads
- [ ] GitHub discovery returns results

---

## Monitoring and Logging

### Built-in Logging

The application logs to stdout/stderr. Key log prefixes:

- `[API_AUTH_LOGIN]` - Login attempts
- `[API_AUTH_USER]` - User info retrieval
- `[API_TOOLS]` - Tool queries and GitHub fallback
- `[API_GITHUB_DETAILS]` - GitHub detail queries
- `[API_GITHUB_DETAILS]` - Config file checks
- `AI chat error` - AI Copilot errors
- `API Error:` - General API errors

### Rate Limiting

In-memory rate limiting (resets on server restart):

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 req | 60s |
| Register | 3 req | 60s |
| Newsletter | 3 req | 60s |
| Reviews | 10 req | 60s |
| Tool Create | 20 req | 60s |
| Tool Update | 30 req | 60s |
| General API | 100 req | 60s |
| Contact | 3 req | 60s |

### Performance Considerations

- **HN News** is cached in-memory for 5 minutes
- **GitHub Trending** is cached in-memory for 30 minutes
- **CoinGecko prices** are cached with `next: { revalidate: 60 }`
- **Prisma client** is a global singleton (hot module reloading safe)
- **Database fallback** mock client is used when DATABASE_URL is not set

### Security Headers (automatically applied)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; ...
```

---

## Scaling Considerations

- **Database**: Enable connection pooling (e.g., Supabase pooler or PgBouncer)
- **Caching**: Add Redis for distributed rate limiting and caching
- **Background Jobs**: Use a job queue for GitHub discovery (currently synchronous)
- **File Uploads**: Currently use external URLs for logos/images
- **Serverless**: Vercel functions have 10s timeout; long operations (GitHub discovery) may need dedicated instances
