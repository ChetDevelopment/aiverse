# AIVerse Database Schema

## Overview

- **Engine:** PostgreSQL 15+
- **ORM:** Prisma 7
- **Client:** `@prisma/client` with `@prisma/adapter-pg`
- **Models:** 26
- **Enums:** 3

The Prisma client is configured as a singleton in `src/lib/prisma.ts`. When no `DATABASE_URL` is available (e.g., during build), it falls back to a mock client that returns empty results.

---

## Enums

### `UserRole`
```prisma
enum UserRole { USER ADMIN }
```

### `PricingModel`
```prisma
enum PricingModel { FREE FREEMIUM PAID CONTACT }
```

### `DiscoveryStatus`
```prisma
enum DiscoveryStatus { PENDING APPROVED REJECTED }
```

---

## Models

### 1. User

Core user account. Supports both Supabase Auth and local bcrypt auth.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | Primary key |
| `email` | String | `@unique` | Login identifier |
| `name` | String? | | Display name |
| `avatarUrl` | String? | | Profile picture URL |
| `passwordHash` | String? | | bcrypt hash (local auth only) |
| `role` | UserRole | `@default(USER)` | `USER` or `ADMIN` |
| `createdAt` | DateTime | `@default(now())` | |
| `updatedAt` | DateTime | `@updatedAt` | |

**Relations:** Account[], Review[], Favorite[], Bookmark[], History[], Collection[], Notification[], HelpfulVote[], Prompt[], PromptRating[], PromptFavorite[], Workspace[], Stack[], StackLike[], StackComment[]

---

### 2. Account

OAuth provider accounts linked to a user.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `userId` | String | | FK → User |
| `provider` | String | | e.g. "google", "github" |
| `providerAccountId` | String | | Provider's user ID |
| `refreshToken` | String? | | |
| `accessToken` | String? | | |
| `expiresAt` | Int? | | Token expiry timestamp |
| `createdAt` | DateTime | `@default(now())` | |

**Unique:** `@@unique([provider, providerAccountId])`  
**Relation:** User (M:1, cascade delete)

---

### 3. AiTool

The primary entity. Each entry represents an AI tool in the directory.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `name` | String | | Tool name |
| `slug` | String | `@unique` | URL-safe identifier |
| `tagline` | String | | Short description (10-300 chars) |
| `description` | String | | Full description (50-5000 chars) |
| `logo` | String? | | Logo URL |
| `websiteUrl` | String | | Official website |
| `pricing` | PricingModel | `@default(FREE)` | |
| `pricingDetail` | String? | | Pricing description |
| `startingPrice` | Float? | | |
| `isFeatured` | Boolean | `@default(false)` | |
| `isPublished` | Boolean | `@default(false)` | |
| `isOpenSource` | Boolean | `@default(false)` | |
| `isEthical` | Boolean | `@default(false)` | |
| `featuredScore` | Int | `@default(0)` | For featured sorting |
| `viewCount` | Int | `@default(0)` | Incremented on detail view |
| `clickCount` | Int | `@default(0)` | |
| `createdAt` | DateTime | `@default(now())` | |
| `updatedAt` | DateTime | `@updatedAt` | |

**Indexes:** `[isPublished, isFeatured]`, `[slug]`, `[pricing]`, `[viewCount]`  
**Relations:** ToolCategory[], ToolTag[], Pro[], Con[], Screenshot[], Review[], Favorite[], Bookmark[], History[], Faq[], Alternative[], AlternativeFrom[], CollectionItem[], FreeDeal[], Prompt[], WorkspaceItem[], UseCaseTool[], StackItem[]

---

### 4. Category

Tool categories (e.g., "Chat AI", "Coding", "Image").

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `name` | String | | Display name |
| `slug` | String | `@unique` | URL-safe |
| `description` | String? | | |
| `icon` | String? | | Icon identifier |
| `order` | Int | `@default(0)` | Sort order |
| `createdAt` | DateTime | `@default(now())` | |

**Indexes:** `[slug]`, `[order]`  
**Relations:** ToolCategory[]

---

### 5. ToolCategory

Many-to-many join between AiTool and Category.

| Field | Type | Description |
|-------|------|-------------|
| `toolId` | String | FK → AiTool |
| `categoryId` | String | FK → Category |

**Composite key:** `@@id([toolId, categoryId])`  
**Relations:** AiTool (M:1, cascade), Category (M:1, cascade)

---

### 6. Tag

Tags for tools (e.g., "open-source", "GPT-4").

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `name` | String | `@unique` | |
| `slug` | String | `@unique` | |
| `createdAt` | DateTime | `@default(now())` | |

**Relations:** ToolTag[]

---

### 7. ToolTag

Many-to-many join between AiTool and Tag.

| Field | Type |
|-------|------|
| `toolId` | String |
| `tagId` | String |

**Composite key:** `@@id([toolId, tagId])`

---

### 8. Pro

Pros/advantages of a tool.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `text` | String | | Pro description (2-500 chars) |
| `toolId` | String | | FK → AiTool |

**Index:** `[toolId]`

---

### 9. Con

Cons/disadvantages of a tool.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `text` | String | |
| `toolId` | String | |

**Index:** `[toolId]`

---

### 10. Screenshot

Tool screenshots.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `url` | String | | Image URL |
| `alt` | String? | | Alt text |
| `order` | Int | `@default(0)` | Display order |
| `toolId` | String | | FK → AiTool |

**Index:** `[toolId]`

---

### 11. Review

User reviews for tools. One review per user per tool (unique constraint).

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `rating` | Int | | 1-5 |
| `comment` | String? | | 10-2000 chars |
| `userId` | String | | FK → User |
| `toolId` | String | | FK → AiTool |
| `createdAt` | DateTime | `@default(now())` | |
| `updatedAt` | DateTime | `@updatedAt` | |

**Unique:** `@@unique([userId, toolId])`  
**Indexes:** `[toolId]`, `[userId]`, `[createdAt]`  
**Relations:** User (M:1), AiTool (M:1), HelpfulVote[]

---

### 12. Favorite

User's favorited tools.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `userId` | String | |
| `toolId` | String | |
| `createdAt` | DateTime | `@default(now())` |

**Unique:** `@@unique([userId, toolId])`  
**Index:** `[userId]`

---

### 13. Bookmark

User's bookmarked tools.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `userId` | String | |
| `toolId` | String | |
| `createdAt` | DateTime | `@default(now())` |

**Unique:** `@@unique([userId, toolId])`  
**Index:** `[userId]`

---

### 14. History

User's browsing history for tools.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `userId` | String | |
| `toolId` | String | |
| `createdAt` | DateTime | `@default(now())` |

**Indexes:** `[userId]`, `[toolId]`

---

### 15. Faq

Frequently asked questions for a tool.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `question` | String | |
| `answer` | String | |
| `order` | Int | `@default(0)` |
| `toolId` | String | |

**Index:** `[toolId]`

---

### 16. Alternative

Tool-to-tool alternative relationships (self-referencing M:N).

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `toolId` | String | Source tool |
| `alternativeId` | String | Alternative tool |

**Unique:** `@@unique([toolId, alternativeId])`  
**Relations:** AiTool (M:1, source), AiTool (M:1 via "AlternativeTo", target)

---

### 17. NewsletterSubscriber

Newsletter subscription list.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `email` | String | `@unique` |
| `active` | Boolean | `@default(true)` |
| `createdAt` | DateTime | `@default(now())` |

---

### 18. FreeDeal

Free/promotional deals for AI tools.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `toolId` | String? | | FK → AiTool |
| `toolName` | String | | Denormalized tool name |
| `toolSlug` | String | `@unique` | |
| `description` | String | | |
| `dealType` | String | `@default("free-tier")` | `free-tier`, `promo-code`, `lifetime-deal`, `open-source`, `student` |
| `promoCode` | String? | | |
| `promoUrl` | String? | | |
| `link` | String | | Deal URL |
| `verified` | Boolean | `@default(false)` | |
| `expiresAt` | DateTime? | | |
| `createdAt` | DateTime | `@default(now())` | |
| `updatedAt` | DateTime | `@updatedAt` | |

**Index:** `[verified, expiresAt]`  
**Relation:** AiTool? (M:1)

---

### 19. DiscoveredProject

Auto-discovered GitHub open-source projects.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `repoName` | String | | |
| `repoOwner` | String | | |
| `fullName` | String | `@unique` | `owner/repo` |
| `githubUrl` | String | | |
| `description` | String? | | |
| `stars` | Int | `@default(0)` | |
| `forks` | Int | `@default(0)` | |
| `watchers` | Int | `@default(0)` | |
| `language` | String? | | Primary language |
| `topics` | String? | | Comma-separated |
| `license` | String? | | |
| `summary` | String? | | AI-generated summary |
| `category` | String? | | Mapped category |
| `logoUrl` | String? | | |
| `readmeScore` | Int | `@default(0)` | |
| `lastPushAt` | DateTime? | | |
| `discoveredAt` | DateTime | `@default(now())` | |
| `status` | DiscoveryStatus | `@default(PENDING)` | |
| `reviewedBy` | String? | | Admin reviewer |
| `reviewedAt` | DateTime? | | |
| `createdAt` | DateTime | `@default(now())` | |
| `updatedAt` | DateTime | `@updatedAt` | |

**Indexes:** `[status]`, `[stars]`, `[category]`, `[discoveredAt]`

---

### 20. DiscoveryLog

Log of discovery runs.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `source` | String | `@default("github")` |
| `query` | String | |
| `resultsFound` | Int | `@default(0)` |
| `newDiscovered` | Int | `@default(0)` |
| `status` | String | `@default("success")` |
| `errorMessage` | String? | |
| `durationMs` | Int | `@default(0)` |
| `createdAt` | DateTime | `@default(now())` |

**Index:** `[createdAt]`

---

### 21. ContactMessage

Contact form submissions.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `name` | String | |
| `email` | String | |
| `message` | String | |
| `read` | Boolean | `@default(false)` |
| `createdAt` | DateTime | `@default(now())` |

---

### 22. BlogPost

Blog system posts.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `title` | String | | |
| `slug` | String | `@unique` | |
| `excerpt` | String? | | |
| `content` | String | | Full HTML |
| `coverImage` | String? | | |
| `author` | String | | |
| `published` | Boolean | `@default(false)` | |
| `featured` | Boolean | `@default(false)` | |
| `readTime` | Int | `@default(5)` | Minutes |
| `tags` | String? | | Comma-separated |
| `createdAt` | DateTime | `@default(now())` | |
| `updatedAt` | DateTime | `@updatedAt` | |

**Indexes:** `[slug]`, `[published, featured]`, `[createdAt]`

---

### 23. Collection

User-curated tool collections.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `name` | String | |
| `slug` | String | `@unique` |
| `description` | String? | |
| `icon` | String? | |
| `userId` | String | |
| `public` | Boolean | `@default(true)` |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

**Indexes:** `[userId]`, `[slug]`  
**Relations:** User (M:1), CollectionItem[], WorkspaceItem[]

---

### 24. CollectionItem

Items within a user collection.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `collectionId` | String | |
| `toolId` | String | |
| `note` | String? | |
| `order` | Int | `@default(0)` |
| `createdAt` | DateTime | `@default(now())` |

**Unique:** `@@unique([collectionId, toolId])`  
**Relations:** Collection (M:1), AiTool (M:1)

---

### 25. Notification

User notifications.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `userId` | String | |
| `type` | String | |
| `title` | String | |
| `message` | String? | |
| `link` | String? | |
| `read` | Boolean | `@default(false)` |
| `createdAt` | DateTime | `@default(now())` |

**Indexes:** `[userId, read]`, `[createdAt]`

---

### 26. HelpfulVote

Votes on whether a review was helpful.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `reviewId` | String | |
| `userId` | String | |
| `helpful` | Boolean | `@default(true)` |
| `createdAt` | DateTime | `@default(now())` |

**Unique:** `@@unique([reviewId, userId])`  
**Relations:** Review (M:1), User (M:1)

---

### 27. Prompt

Tool prompts shared by the community or official.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `toolId` | String | | |
| `title` | String | | |
| `content` | String | | The prompt text |
| `description` | String? | | |
| `category` | String? | | |
| `difficulty` | String | `@default("beginner")` | |
| `language` | String | `@default("en")` | |
| `isOfficial` | Boolean | `@default(false)` | |
| `userId` | String? | | Null for official prompts |
| `avgRating` | Float | `@default(0)` | Computed from ratings |
| `ratingCount` | Int | `@default(0)` | |
| `useCount` | Int | `@default(0)` | |
| `createdAt` | DateTime | `@default(now())` | |
| `updatedAt` | DateTime | `@updatedAt` | |

**Indexes:** `[toolId]`, `[userId]`, `[category]`, `[isOfficial]`  
**Relations:** AiTool (M:1), User? (M:1), PromptRating[], PromptFavorite[], WorkspaceItem[]

---

### 28. PromptRating

User ratings on prompts (1-5).

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `promptId` | String | |
| `userId` | String | |
| `rating` | Int | |
| `createdAt` | DateTime | `@default(now())` |

**Unique:** `@@unique([promptId, userId])`  
**Indexes:** `[promptId]`, `[userId]`

---

### 29. PromptFavorite

User favorites on prompts.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `promptId` | String | |
| `userId` | String | |
| `createdAt` | DateTime | `@default(now())` |

**Unique:** `@@unique([promptId, userId])`  
**Indexes:** `[promptId]`, `[userId]`

---

### 30. Workspace

User workspaces for organizing tools and resources.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `name` | String | |
| `description` | String? | |
| `emoji` | String | `@default("💼")` |
| `userId` | String | |
| `isPublic` | Boolean | `@default(false)` |
| `archived` | Boolean | `@default(false)` |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

**Index:** `[userId]`  
**Relations:** User (M:1), WorkspaceItem[]

---

### 31. WorkspaceItem

Items within a workspace (tools, notes, prompts, collections, workflows).

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `workspaceId` | String | | |
| `toolId` | String? | | Linked tool |
| `note` | String? | | Text note |
| `promptId` | String? | | Linked prompt |
| `collectionId` | String? | | Linked collection |
| `workflow` | String? | | Workflow JSON |
| `order` | Int | `@default(0)` | |

**Index:** `[workspaceId]`  
**Relations:** Workspace (M:1), AiTool? (M:1), Prompt? (M:1), Collection? (M:1)

---

### 32. UseCase

Use cases that combine multiple tools for a goal.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `title` | String | | |
| `slug` | String | `@unique` | |
| `description` | String? | | |
| `icon` | String? | | |
| `difficulty` | String | `@default("beginner")` | |
| `estimatedTime` | String? | | |
| `category` | String? | | |
| `steps` | Json? | | JSON array of steps |
| `createdAt` | DateTime | `@default(now())` | |

**Index:** `[slug]`  
**Relations:** UseCaseTool[]

---

### 33. UseCaseTool

Join between UseCase and AiTool with ordering.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `useCaseId` | String | |
| `toolId` | String | |
| `order` | Int | `@default(0)` |

**Unique:** `@@unique([useCaseId, toolId])`  
**Indexes:** `[useCaseId]`, `[toolId]`

---

### 34. Stack

User-created tool stacks (composable workflows).

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `name` | String | |
| `description` | String? | |
| `emoji` | String | `@default("🔧")` |
| `userId` | String | |
| `isPublic` | Boolean | `@default(true)` |
| `likeCount` | Int | `@default(0)` |
| `cloneCount` | Int | `@default(0)` |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

**Indexes:** `[userId]`, `[isPublic, likeCount]`  
**Relations:** User (M:1), StackItem[], StackLike[], StackComment[]

---

### 35. StackItem

Tools within a stack.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `stackId` | String | |
| `toolId` | String | |
| `order` | Int | `@default(0)` |

**Unique:** `@@unique([stackId, toolId])`  
**Indexes:** `[stackId]`, `[toolId]`

---

### 36. StackLike

Likes on stacks.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `stackId` | String | |
| `userId` | String | |
| `createdAt` | DateTime | `@default(now())` |

**Unique:** `@@unique([stackId, userId])`  
**Indexes:** `[stackId]`, `[userId]`

---

### 37. StackComment

Comments on stacks.

| Field | Type | Attributes |
|-------|------|------------|
| `id` | String | `@id @default(cuid())` |
| `stackId` | String | |
| `userId` | String | |
| `content` | String | |
| `createdAt` | DateTime | `@default(now())` |

**Index:** `[stackId]`

---

### 38. LearningPath

Guided learning paths with steps.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | String | `@id @default(cuid())` | |
| `title` | String | | |
| `slug` | String | `@unique` | |
| `description` | String? | | |
| `icon` | String? | | |
| `difficulty` | String | `@default("beginner")` | |
| `category` | String? | | |
| `steps` | Json? | | JSON array of learning steps |
| `published` | Boolean | `@default(false)` | |
| `createdAt` | DateTime | `@default(now())` | |
| `updatedAt` | DateTime | `@updatedAt` | |

**Indexes:** `[slug]`, `[published]`

---

## Entity Relationship Diagram (Text)

```
User ──1:N── Account
User ──1:N── Review ──N:1── AiTool
User ──1:N── Favorite ──N:1── AiTool
User ──1:N── Bookmark ──N:1── AiTool
User ──1:N── History ──N:1── AiTool
User ──1:N── Collection ──1:N── CollectionItem ──N:1── AiTool
User ──1:N── Notification
User ──1:N── HelpfulVote ──N:1── Review
User ──1:N── Workspace ──1:N── WorkspaceItem
WorkspaceItem ──N:1── AiTool
WorkspaceItem ──N:1── Prompt
WorkspaceItem ──N:1── Collection
User ──1:N── Prompt ──N:1── AiTool
Prompt ──1:N── PromptRating ──N:1── User
Prompt ──1:N── PromptFavorite ──N:1── User
User ──1:N── Stack ──1:N── StackItem ──N:1── AiTool
Stack ──1:N── StackLike ──N:1── User
Stack ──1:N── StackComment ──N:1── User
User ──1:N── StackLike
User ──1:N── StackComment

AiTool ──N:M── Category (via ToolCategory)
AiTool ──N:M── Tag (via ToolTag)
AiTool ──1:N── Pro
AiTool ──1:N── Con
AiTool ──1:N── Screenshot
AiTool ──1:N── Faq
AiTool ──N:M── AiTool (via Alternative, self-referencing)
AiTool ──1:N── FreeDeal
AiTool ──N:M── UseCase (via UseCaseTool)

UseCase ──1:N── UseCaseTool ──N:1── AiTool
LearningPath (standalone)
BlogPost (standalone)
NewsletterSubscriber (standalone)
ContactMessage (standalone)
DiscoveredProject (standalone)
DiscoveryLog (standalone)
```

---

## Indexes Summary

| Model | Indexes |
|-------|---------|
| AiTool | `[isPublished, isFeatured]`, `[slug]`, `[pricing]`, `[viewCount]` |
| Category | `[slug]`, `[order]` |
| Pro | `[toolId]` |
| Con | `[toolId]` |
| Screenshot | `[toolId]` |
| Review | `[toolId]`, `[userId]`, `[createdAt]` |
| Favorite | `[userId]` |
| Bookmark | `[userId]` |
| History | `[userId]`, `[toolId]` |
| Faq | `[toolId]` |
| FreeDeal | `[verified, expiresAt]` |
| DiscoveredProject | `[status]`, `[stars]`, `[category]`, `[discoveredAt]` |
| DiscoveryLog | `[createdAt]` |
| BlogPost | `[slug]`, `[published, featured]`, `[createdAt]` |
| Collection | `[userId]`, `[slug]` |
| WorkspaceItem | `[workspaceId]` |
| Notification | `[userId, read]`, `[createdAt]` |
| Prompt | `[toolId]`, `[userId]`, `[category]`, `[isOfficial]` |
| PromptRating | `[promptId]`, `[userId]` |
| PromptFavorite | `[promptId]`, `[userId]` |
| Stack | `[userId]`, `[isPublic, likeCount]` |
| StackItem | `[stackId]`, `[toolId]` |
| StackLike | `[stackId]`, `[userId]` |
| StackComment | `[stackId]` |
| LearningPath | `[slug]`, `[published]` |
| UseCase | `[slug]` |
| UseCaseTool | `[useCaseId]`, `[toolId]` |
| Workspace | `[userId]` |

---

## Migration Guide

### Creating Migrations

```bash
# Create a migration after schema changes
npx prisma migrate dev --name add_field_to_tool

# Apply to production
npx prisma migrate deploy
```

### Pushing Schema (No Migration History)

```bash
# Push schema directly (for development, overwrites data)
npm run db:push
```

### Generating Client

```bash
# Generate Prisma client after schema changes
npm run db:generate
```

### Key Migration Commands

```bash
npm run db:push     # Push schema to DB
npm run db:generate # Generate Prisma client
npm run db:seed     # Run prisma/seed.ts
npx prisma studio   # Open Prisma Studio GUI
```

---

## Seed Data Strategy

Multiple seed files exist for different scenarios:

| File | Contents | Command |
|------|----------|---------|
| `prisma/seed.ts` | Base: categories, tags, users, sample tools | `npm run db:seed` |
| `prisma/seed-new.ts` | New models: prompts, learning paths, use cases, stacks | `npm run seed:new` |
| `prisma/seed-blog.ts` | Blog posts with content | `npm run seed:blog` |
| `prisma/seed-deals.ts` | Free deals | `npm run seed:deals` |
| `prisma/seed-reviews.ts` | User reviews | `npm run seed:reviews` |
| `prisma/seed-complete.ts` | Everything above combined | `npm run seed:complete` |
| `prisma/seed-bulk.ts` | Bulk tool import | Manual |
| `prisma/seed-full.ts` | Full dataset | Manual |
| `prisma/seed-from-html.ts` | Import from HTML source | Manual |

The first registered user is automatically assigned the `ADMIN` role.
