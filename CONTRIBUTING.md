# Contributing to AIVerse

Thank you for considering contributing to AIVerse! This document outlines the process for contributing to the project.

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and harassment-free environment for everyone.

---

## How to Set Up the Project Locally

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm 9+
- Git

### Steps

```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/your-username/aiverse.git
cd aiverse

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your database URL and Supabase credentials

# 5. Set up database
createdb aiverse
npm run db:push
npm run db:generate

# 6. Seed demo data (optional)
npm run db:seed

# 7. Start development server
npm run dev
```

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Protected — no direct pushes. |
| `develop` | Integration branch for features. |
| `feature/*` | New features. Branch from `develop`. |
| `fix/*` | Bug fixes. Branch from `develop`. |
| `hotfix/*` | Urgent production fixes. Branch from `main`, merge back to both. |
| `docs/*` | Documentation changes. |

### Branch Naming Conventions

- `feature/ai-tool-search` — kebab-case, descriptive
- `fix/login-redirect-loop` — describes the issue
- `docs/api-endpoints` — documentation updates

---

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, etc. |
| `ci` | CI/CD configuration |

### Examples

```
feat(tools): add GitHub fallback search when no local results
fix(auth): handle Supabase timeout during registration
docs(api): document trading market endpoint
refactor(prisma): extract mock client to separate function
```

---

## PR Process

1. **Create an issue** describing the feature or bug before starting work
2. **Discuss** the approach with maintainers
3. **Create a branch** from `develop`
4. **Implement** your changes
5. **Run checks** locally:
   ```bash
   npm run lint
   npm run typecheck
   ```
6. **Write tests** if applicable
7. **Commit** with conventional commit messages
8. **Push** your branch
9. **Open a pull request** against `develop`
10. **Address review feedback**

### PR Requirements

- Clear title and description
- Reference the related issue
- Screenshots for UI changes
- All checks passing
- No merge conflicts
- Updated documentation if needed

### PR Template

```markdown
## Description
Brief description of changes

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested
- [ ] Unit tests
- [ ] Manual testing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

---

## Code Review Guidelines

### For Reviewers

- **Be constructive**: Suggest improvements, don't just criticize
- **Be timely**: Review within 2 business days
- **Focus on**: Correctness, security, performance, maintainability, test coverage
- **Check for**: Input validation, error handling, auth checks, rate limiting

### For Contributors

- **Keep PRs small**: Ideally under 400 lines
- **Explain your decisions**: Why you chose a particular approach
- **Respond to feedback**: Address or discuss each comment
- **Don't take it personally**: Code reviews improve the project

---

## Testing Requirements

- **Unit tests**: For utility functions and hooks
- **Integration tests**: For API endpoints
- **No tests yet**: Testing infrastructure is being set up

Run all checks:
```bash
npm run lint
npm run typecheck
```

---

## Coding Standards

See [CODE_STYLE.md](./CODE_STYLE.md) for full details.

- TypeScript strict mode
- ESLint with Next.js config + TypeScript rules
- Prettier for formatting
- Tailwind CSS v4 for styling
- No `any` types (warned by ESLint)

---

## Project Structure

```
aiverse/
├── prisma/          # Database schema and seeds
├── src/
│   ├── app/         # Next.js App Router pages + API
│   ├── components/  # Reusable React components
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Server utilities and helpers
│   ├── config/      # Site configuration
│   └── types/       # TypeScript type definitions
├── public/          # Static assets
└── scripts/         # CLI scripts
```

---

## Adding a New API Endpoint

1. Create route file at `src/app/api/<feature>/route.ts`
2. Import from `@/lib/api-utils` for consistent responses
3. Add Zod validation for request bodies
4. Apply `requireApiAuth()` or `requireApiAdmin()` as appropriate
5. Add rate limiting if needed
6. Document in [API.md](./API.md)

```typescript
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"
import { z } from "zod"

const mySchema = z.object({ /* ... */ })

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiAuth()
    const body = await request.json()
    const parsed = mySchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const result = await prisma.myModel.create({ data: parsed.data })
    return apiSuccess(result, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## Adding a New Database Model

1. Add model to `prisma/schema.prisma`
2. Run `npm run db:push` to update database
3. Run `npm run db:generate` to regenerate Prisma client
4. Create migration: `npx prisma migrate dev --name add_model`
5. Update [DATABASE.md](./DATABASE.md) with new model documentation

---

## Issue Reporting

### Bug Reports

Use the GitHub issue tracker. Include:

- **Description**: What happened vs. what was expected
- **Steps to reproduce**: Minimal, complete, verifiable steps
- **Environment**: Browser, OS, Node version
- **Screenshots**: If applicable
- **Console errors**: Any relevant error messages

### Feature Requests

- **Clear use case**: Who needs it and why
- **Proposed solution**: How you think it should work
- **Alternatives considered**: Other approaches you've thought of

### Labels

| Label | Meaning |
|-------|---------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `documentation` | Docs improvement |
| `question` | Further information needed |

---

## Development Tips

### Database

```bash
npx prisma studio  # Open Prisma Studio GUI
npm run db:push     # Push schema changes
npm run db:generate # Regenerate Prisma client
```

### Admin Management

```bash
npm run admin:create    # Create admin via prompt
npm run admin:upgrade   # Upgrade existing user to admin
```

### Seeding

```bash
npm run db:seed      # Basic seed
npm run seed:new     # New feature seeds
npm run seed:all     # Run all seeds
```

### Useful Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
```
