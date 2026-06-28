# AIVerse API Reference

All endpoints are under `/api/`. Responses use a consistent format:

```typescript
// Success: returns data directly (via apiSuccess())
{ /* response payload */ }

// Error:
{ error: string }
// Status codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 429 (rate limited), 500 (server error)
```

---

## Authentication

### POST /api/auth/register

Create a new user account.

**Auth:** None  
**Rate limit:** 3 requests per 60s per IP

**Request body:**
```json
{
  "name": "string (2-100 chars)",
  "email": "valid email",
  "password": "string (min 8, requires uppercase, lowercase, number)",
  "confirmPassword": "must match password"
}
```

**Response (201):**
```json
{ "success": true, "local": false }
```

`local: true` if Supabase was unavailable (user created locally only).

---

### POST /api/auth/login

Authenticate a user.

**Auth:** None  
**Rate limit:** 5 requests per 60s per IP

**Request body:**
```json
{
  "email": "valid email",
  "password": "string (min 8 chars)"
}
```

**Response (200):**
```json
{ "success": true, "redirect": "/admin" }
```

Sets Supabase session cookie or `aiverse_local_session` cookie on success.

---

### POST /api/auth/logout

Sign out the current user.

**Auth:** Required  
**Response (200):** `{ "success": true }`

---

### GET /api/auth/user

Get the current authenticated user.

**Auth:** None (returns `{ user: null }` if not authenticated)

**Response (200):**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string | null",
    "avatarUrl": "string | null"
  }
}
```

---

### GET /api/auth/callback

OAuth callback handler for Supabase social auth (Google, GitHub).

**Auth:** None  
**Query params:** `code` (auth code), `next` (redirect path, default `/`)  
**Response:** Redirect to `{origin}/{next}` or `/login?error=auth_callback_error`

---

## Tools

### GET /api/tools

Search and browse AI tools.

**Auth:** None  
**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | - | Full-text search (name, tagline, description) |
| `category` | string | - | Category slug filter |
| `pricing` | enum | - | `FREE`, `FREEMIUM`, `PAID`, `CONTACT` |
| `sort` | enum | `popular` | `popular`, `newest`, `rating` |
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page (max 50) |
| `github` | boolean | `true` | Enable GitHub fallback when no local results |

**Response (200):**
```json
{
  "items": [ /* AiTool[] with categories and reviews */ ],
  "total": 100,
  "page": 1,
  "pageSize": 12,
  "totalPages": 9,
  "fromGitHub": false,
  "query": "chatgpt"
}
```

When `fromGitHub` is true, items are fetched from GitHub API as a fallback.

---

### POST /api/tools

Create a new AI tool (admin only).

**Auth:** Admin required  
**Validation:** `toolSchema` (Zod)

**Request body:**
```json
{
  "name": "string (2-200)",
  "slug": "string (2-200)",
  "tagline": "string (10-300)",
  "description": "string (50-5000)",
  "websiteUrl": "valid URL",
  "logo": "valid URL (optional)",
  "pricing": "FREE | FREEMIUM | PAID | CONTACT",
  "pricingDetail": "string (optional)",
  "startingPrice": "number (optional)",
  "categoryIds": ["string"],
  "tagIds": ["string (optional)"],
  "pros": [{ "text": "string" }],
  "cons": [{ "text": "string" }],
  "screenshots": [{ "url": "string", "alt": "string" }],
  "faqs": [{ "question": "string", "answer": "string" }]
}
```

**Response (201):** `{ /* created AiTool */ }`

---

### GET /api/tools/{slug}

Get a single AI tool by slug. Increments view count.

**Auth:** None  
**Response (200):** Full tool with categories, tags, pros, cons, screenshots, reviews, FAQs, alternatives, and counts.

---

### PUT /api/tools/{slug}

Update an AI tool (admin only).

**Auth:** Admin required  
**Body:** Same shape as POST  
**Response (200):** `{ "updated": true }`

---

### DELETE /api/tools/{slug}

Delete an AI tool (admin only).

**Auth:** Admin required  
**Response (200):** `{ "deleted": true }`

---

### GET /api/tools/suggest

Autocomplete suggestions for search.

**Auth:** None  
**Query params:** `q` (string, min 2 chars)  
**Response (200):**
```json
{
  "tools": [{ "name": "string", "slug": "string", "tagline": "string", "pricing": "enum" }],
  "categories": [{ "name": "string", "slug": "string" }]
}
```

---

## Workspaces

### GET /api/workspaces

List user's workspaces.

**Auth:** Required  
**Query params:** `search` (string), `archived` (`true`, `false`, `all`)  
**Response (200):** `{ "data": [ /* Workspace[] with _count.items */ ] }`

---

### POST /api/workspaces

Create a workspace.

**Auth:** Required  
**Request body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "emoji": "string (default: 💼)"
}
```

**Response (201):** `{ /* created Workspace */ }`

---

### GET /api/workspaces/{id}

Get workspace details with items.

**Auth:** Required (or public workspace)  
**Response (200):** `{ "data": { /* Workspace with items, tools, prompts, collections */ } }`

---

### PUT /api/workspaces/{id}

Update workspace (owner only).

**Auth:** Required  
**Body:** Any of `name`, `description`, `emoji`, `isPublic`, `archived`  
**Response (200):** Updated workspace

---

### DELETE /api/workspaces/{id}

Delete workspace (owner only).

**Auth:** Required  
**Response (200):** `{ "deleted": true }`

---

### POST /api/workspaces/{id}/duplicate

Duplicate a workspace.

**Auth:** Required  
**Response (201):** Duplicated workspace with all items

---

### GET /api/workspaces/{id}/items

List workspace items.

**Auth:** Required (or public workspace)  
**Response (200):** `[ /* WorkspaceItem[] with tools, prompts, collections */ ]`

---

### POST /api/workspaces/{id}/items

Add item to workspace.

**Auth:** Required (owner only)  
**Request body:**
```json
{
  "toolId": "string (optional)",
  "note": "string (optional)",
  "promptId": "string (optional)",
  "collectionId": "string (optional)",
  "workflow": "string (optional)"
}
```

**Response (201):** Created item

---

### PUT /api/workspaces/{id}/items/{itemId}

Update workspace item.

**Auth:** Required (owner only)  
**Body:** Any of `note`, `order`, `workflow`  
**Response (200):** Updated item

---

### DELETE /api/workspaces/{id}/items/{itemId}

Remove item from workspace.

**Auth:** Required (owner only)  
**Response (200):** `{ "deleted": true }`

---

## Stacks

### GET /api/stacks

List AI stacks.

**Auth:** None  
**Query params:** `q` (search), `userId` (filter by user), `mine` (`true` for user's stacks)  
**Response (200):** `{ "data": [ /* Stack[] with user, _count */ ] }`

---

### POST /api/stacks

Create a stack.

**Auth:** Required  
**Request body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "emoji": "string (default: 🔧)",
  "isPublic": "boolean (default: true)",
  "toolIds": ["string (optional)"]
}
```

**Response (201):** Created stack

---

### GET /api/stacks/{id}

Get stack details with items.

**Auth:** None  
**Response (200):** `{ "data": { /* Stack with items, tools with categories and reviews */ } }`

---

### PUT /api/stacks/{id}

Update stack (owner only).

**Auth:** Required  
**Body:** Any of `name`, `description`, `emoji`, `isPublic`  
**Response (200):** Updated stack

---

### DELETE /api/stacks/{id}

Delete stack (owner only).

**Auth:** Required  
**Response (200):** `{ "deleted": true }`

---

### POST /api/stacks/{id}/like

Toggle like on a stack.

**Auth:** Required  
**Response (200):** `{ "liked": true|false, "likeCount": 42 }`

---

### POST /api/stacks/{id}/clone

Clone a stack.

**Auth:** Required  
**Response (201):** Cloned stack (with "(copy)" suffix, private by default)

---

### GET /api/stacks/{id}/comments

List comments on a stack.

**Auth:** None  
**Response (200):** `[ /* StackComment[] with user info */ ]`

---

### POST /api/stacks/{id}/comments

Add a comment to a stack.

**Auth:** Required  
**Request body:** `{ "content": "string (required)" }`  
**Response (201):** Created comment

---

### POST /api/stacks/{id}/items

Add tool to stack (owner only).

**Auth:** Required  
**Request body:** `{ "toolId": "string", "order": "number (optional)" }`  
**Response (201):** Created stack item

---

### PUT /api/stacks/{id}/items

Reorder stack items (owner only).

**Auth:** Required  
**Request body:** `{ "itemIds": ["string"] }` (order in array determines new order)  
**Response (200):** `{ "reordered": true }`

---

## Prompts

### GET /api/prompts

List prompts with filtering.

**Auth:** None  
**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `toolId` | string | Filter by tool |
| `category` | string | Filter by category |
| `difficulty` | string | Filter by difficulty |
| `isOfficial` | boolean | Filter official/community |
| `search` | string | Full-text search |
| `page` | number | Page number (default 1) |
| `limit` | number | Per page (max 50, default 12) |

**Response (200):**
```json
{
  "items": [ /* Prompt[] with tool, user, _count.favorites */ ],
  "total": 50,
  "page": 1,
  "pageSize": 12,
  "totalPages": 5
}
```

---

### POST /api/prompts

Create a prompt.

**Auth:** Required  
**Request body:**
```json
{
  "toolId": "string (required)",
  "title": "string (required)",
  "content": "string (required)",
  "description": "string (optional)",
  "category": "string (optional)",
  "difficulty": "beginner | intermediate | advanced",
  "language": "en (default)"
}
```

**Response (201):** Created prompt

---

### GET /api/prompts/{id}

Get prompt details.

**Auth:** None  
**Response (200):** Prompt with tool, user, and favorite count

---

### PUT /api/prompts/{id}

Update prompt (owner or admin).

**Auth:** Required  
**Body:** Any of `title`, `content`, `description`, `category`, `difficulty`, `language`  
**Response (200):** Updated prompt

---

### DELETE /api/prompts/{id}

Delete prompt (owner or admin).

**Auth:** Required  
**Response (200):** `{ "deleted": true }`

---

### POST /api/prompts/{id}/rate

Rate a prompt (1-5 stars).

**Auth:** Required  
**Request body:** `{ "rating": 3 }` (integer 1-5)  
**Response (200):** Updated prompt with new `avgRating` and `ratingCount`

---

### POST /api/prompts/{id}/favorite

Toggle favorite on a prompt.

**Auth:** Required  
**Response (200):** `{ "favorited": true | false }`

---

### POST /api/prompts/{id}/use

Increment prompt use count.

**Auth:** None  
**Response (200):** Updated prompt with incremented `useCount`

---

## Learning

### GET /api/learning

List published learning paths.

**Auth:** None  
**Response (200):**
```json
{
  "paths": [ /* LearningPath[] */ ],
  "grouped": { "AI for Developers": [ /* paths */ ] },
  "categories": ["AI for Developers", "AI for Designers"]
}
```

---

### POST /api/learning

Create a learning path (admin only).

**Auth:** Admin required  
**Request body:**
```json
{
  "title": "string (required)",
  "slug": "string (required, unique)",
  "description": "string (optional)",
  "icon": "string (optional)",
  "difficulty": "beginner (default)",
  "category": "string (optional)",
  "steps": [ /* JSON steps */ ],
  "published": false
}
```

**Response (201):** Created learning path

---

### GET /api/learning/{slug}

Get a learning path with related paths.

**Auth:** None  
**Response (200):** `{ "path": { /* LearningPath */ }, "related": [ /* related LearningPath[] */ ] }`

---

## Use Cases

### GET /api/usecases

List use cases.

**Auth:** None  
**Query params:** `q` (search), `category` (filter)  
**Response (200):** `{ "data": [ /* UseCase[] with _count.tools */ ] }`

---

### POST /api/usecases

Create a use case (admin only).

**Auth:** Admin required  
**Request body:**
```json
{
  "title": "string (required)",
  "slug": "string (required)",
  "description": "string (optional)",
  "icon": "string (optional)",
  "difficulty": "beginner (default)",
  "estimatedTime": "string (optional)",
  "category": "string (optional)",
  "steps": [ /* JSON steps */ ],
  "toolIds": ["string"]
}
```

**Response (201):** Created use case

---

### GET /api/usecases/{slug}

Get use case details with tools.

**Auth:** None  
**Response (200):** Use case with tools (full tool data including categories and reviews)

---

### GET /api/usecases/{slug}/prompts

Get prompts associated with a use case's tools.

**Auth:** None  
**Response (200):** `{ "prompts": [ /* Prompt[] with tool info */ ] }`

---

## Trading

### GET /api/trading/market

Get crypto market data. Fetches live prices from CoinGecko with mock data fallback.

**Auth:** None  
**Response (200):**
```json
{
  "assets": [
    { "symbol": "BTC/USDT", "name": "Bitcoin", "price": 67450, "change24h": 2.3, "volume24h": 23500000000, "logo": "https://..." }
  ],
  "fearGreed": 65,
  "sentiment": 72,
  "marketCap": "$2.45T",
  "volume24h": "$85.3B",
  "btcDominance": "52.4%",
  "openInterest": "$38.2B",
  "topGainers": [{ "name": "ICP", "change": "+12.5%" }],
  "topLosers": [{ "name": "EOS", "change": "-5.2%" }],
  "news": [{ "title": "string", "source": "string", "time": "string", "sentiment": "bullish|bearish|neutral" }],
  "communityPosts": [{ "user": "string", "text": "string", "likes": 123, "sentiment": "string" }]
}
```

---

### GET /api/trading/analysis

Get simulated technical analysis for a symbol.

**Auth:** None  
**Query params:** `symbol` (default: `BTC/USDT`)  
**Response (200):**
```json
{
  "symbol": "BTC/USDT",
  "signal": "BUY | SELL | HOLD",
  "confidence": 72,
  "summary": "string",
  "indicators": [
    { "name": "RSI (14)", "value": "58.4", "signal": "Neutral" },
    { "name": "MACD", "value": "Bullish Crossover", "signal": "BUY" }
  ],
  "recommendation": "string",
  "timestamp": 1719567890000
}
```

---

## Recommendations

### GET /api/recommendations

Get personalized recommendations.

**Auth:** None (returns generic if unauthenticated)  
**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | `home` | `trending-tools`, `personalized-tools`, `continue-learning`, `tool-relationships`, `prompts`, `stacks`, `learning-paths`, `workspace-suggestions`, `home` |
| `limit` | number | 6 | Items per section (max 20) |
| `tool` | string | - | Tool slug (for `tool-relationships` type) |

**Response varies by type:**

**home:** Composite response with trending tools, prompts, learning paths, stacks, and user context

**tool-relationships:** Cross-content relationships using `getToolRelationships()`:
```json
{
  "prompts": [{ "id": "string", "title": "string", "difficulty": "string" }],
  "learningPaths": [{ "slug": "string", "title": "string", "difficulty": "string" }],
  "blogPosts": [{ "slug": "string", "title": "string", "excerpt": "string" }],
  "useCases": [{ "slug": "string", "title": "string", "difficulty": "string" }],
  "stacks": [{ "id": "string", "name": "string", "emoji": "string", "likeCount": 0 }],
  "alternatives": [{ "id": "string", "name": "string", "slug": "string", "tagline": "string" }],
  "deals": [{ "id": "string", "toolName": "string", "description": "string", "dealType": "string" }]
}
```

---

## Blog

### GET /api/blog

List blog posts.

**Auth:** None  
**Query params:** `page` (default 1), `limit` (default 12, max 50), `published` (boolean, default true)  
**Response (200):**
```json
{
  "items": [ /* BlogPost[] */ ],
  "total": 25,
  "page": 1,
  "pageSize": 12,
  "totalPages": 3
}
```

---

### POST /api/blog

Create a blog post (admin only).

**Auth:** Admin required  
**Validation:** `blogSchema` (Zod)  
**Request body:**
```json
{
  "title": "string (5-200)",
  "slug": "string (3-200)",
  "excerpt": "string (max 500, optional)",
  "content": "string (min 50)",
  "coverImage": "valid URL (optional)",
  "author": "string (2-100)",
  "published": false,
  "featured": false,
  "readTime": 5,
  "tags": "string (comma-separated, optional)"
}
```

**Response (201):** Created blog post

---

### GET /api/blog/{slug}

Get a single blog post.

**Auth:** None  
**Response (200):** Blog post

---

### PUT /api/blog/{slug}

Update a blog post (admin only).

**Auth:** Admin required  
**Body:** Partial blog post fields  
**Response (200):** Updated blog post

---

## News

### GET /api/news

Fetch Hacker News stories with tech classification.

**Auth:** None  
**Query params:** `topic` (`all`, `AI`, `Security`, `Dev`, `Hardware`, `Tech`), `refresh` (boolean)  
**Response (200):**
```json
{
  "items": [
    {
      "id": 40123456,
      "title": "string",
      "url": "string",
      "points": 120,
      "author": "string",
      "timeAgo": "2h ago",
      "source": "example.com",
      "sourceDomain": "example.com",
      "thumbnail": "https://www.google.com/s2/favicons?domain=...",
      "commentCount": 45,
      "techScore": 8
    }
  ],
  "cached": false
}
```

Cached for 5 minutes.

---

### GET /api/news/content

Extract article content from a URL using Mozilla Readability.

**Auth:** None  
**Query params:** `url` (required)  
**Response (200):**
```json
{
  "title": "string",
  "excerpt": "string",
  "content": "string (HTML)",
  "paragraphs": ["string"],
  "textContent": "string",
  "url": "string",
  "byline": "string",
  "siteName": "string"
}
```

---

## GitHub

### GET /api/github/trending

Fetch trending GitHub repositories across 15 categories.

**Auth:** None  
**Query params:** `refresh` (boolean)  
**Response (200):**
```json
{
  "AI/ML": [{ "name": "string", "full_name": "string", "stars": 1000, "forks": 200, "language": "Python", "description": "string" }],
  "Trending Today": [],
  "ChatGPT & LLMs": []
}
```

Cached for 30 minutes. Categories: AI/ML, Trending Today, ChatGPT & LLMs, Computer Vision, Open Source, Startup Tools, DevOps & Cloud, Data Science, Security, Mobile Apps, Web Dev, Blockchain & Web3, Robotics, Health & Bio, Gaming.

---

### GET /api/github/details

Get detailed GitHub repository information.

**Auth:** None  
**Query params:** `full_name` (required, e.g. `owner/repo`)  
**Response (200):**
```json
{
  "clone_urls": { "https": "string", "ssh": "string" },
  "last_workflow_run": { "name": "string", "status": "string", "conclusion": "string", "url": "string", "date": "string" },
  "tags": [{ "name": "string", "url": "string" }],
  "codeowners": "present | null",
  "has_security_policy": true,
  "features": {
    "has_issues": true,
    "has_projects": true,
    "has_wiki": true,
    "has_discussions": true,
    "has_pages": false,
    "archived": false,
    "disabled": false,
    "visibility": "public",
    "fork": false
  }
}
```

### GET /api/github/search-code

Search code within a GitHub repository.

**Auth:** None  
**Query params:** `full_name` (required), `q` (search query, required)  
**Response (200):** `{ "items": [{ "name": "string", "path": "string", "html_url": "string" }], "total": 0 }`

### GET /api/github/repo

Fetch repository metadata.

**Auth:** None  
**Query params:** (various)  
**Response:** Repository metadata

---

## Discovery

### GET /api/discover/projects

List discovered GitHub projects.

**Auth:** None  
**Query params:** `page` (default 1), `limit` (default 20, max 50), `category`, `q` (search), `sort` (`stars`, `updated`, `newest`)  
**Response (200):**
```json
{
  "items": [ /* DiscoveredProject[] */ ],
  "total": 200,
  "page": 1,
  "pageSize": 20,
  "totalPages": 10,
  "categories": { "AI": 45, "Web Dev": 30 }
}
```

### POST /api/discover/run

Run GitHub discovery search (admin only).

**Auth:** Admin required  
**Response (200):**
```json
{
  "totalFound": 95,
  "newDiscovered": 12,
  "duration": 4523,
  "queries": [{ "query": "string", "results": 10 }]
}
```

---

## Reviews

### POST /api/reviews

Create or update a review for a tool.

**Auth:** Required  
**Rate limit:** 10 per 60s per IP  
**Request body:**
```json
{
  "toolId": "string (required)",
  "rating": 4,
  "comment": "string (10-2000 chars, optional)"
}
```

**Validated with `reviewSchema` (Zod):** rating 1-5 integer, comment optional 10-2000 chars.

Uses `upsert` on `userId_toolId` unique constraint.

**Response (201):** `{ /* created Review */ }`

---

### POST /api/reviews/{id}/helpful

Mark a review as helpful or not.

**Auth:** Required  
**Request body:** `{ "helpful": true | false }`  
**Response (200):** `{ "success": true }`

---

## Favorites & Bookmarks

### POST /api/favorites

Add a tool to favorites.

**Auth:** Required  
**Request body:** `{ "toolId": "string" }`  
**Response (200):** `{ "favorited": true }`

### DELETE /api/favorites

Remove a tool from favorites.

**Auth:** Required  
**Request body:** `{ "toolId": "string" }`  
**Response (200):** `{ "favorited": false }`

### GET /api/bookmarks

List user's bookmarked tools.

**Auth:** Required  
**Response (200):** `[ /* Bookmark[] with full tool data */ ]`

### POST /api/bookmarks

Add a tool to bookmarks.

**Auth:** Required  
**Request body:** `{ "toolId": "string" }`  
**Response (200):** `{ "bookmarked": true }`

### DELETE /api/bookmarks

Remove a tool from bookmarks.

**Auth:** Required  
**Request body:** `{ "toolId": "string" }`  
**Response (200):** `{ "bookmarked": false }`

---

## History

### GET /api/history

Get user's browsing history (last 50 items).

**Auth:** Required (returns `[]` if not authenticated)  
**Response (200):** `[ /* History[] with tool info */ ]`

### POST /api/history

Record a tool view in history.

**Auth:** Required  
**Request body:** `{ "toolId": "string" }`  
**Response (200):** `{ "success": true }`

---

## Categories

### GET /api/categories

List all categories with tool counts.

**Auth:** None  
**Response (200):**
```json
{
  "data": [
    { "id": "string", "name": "Chat AI", "slug": "chat-ai", "description": "string", "icon": "string", "order": 0, "_count": { "tools": 120 } }
  ]
}
```

---

## Collections

### GET /api/collections

List curated collections (free tools, trending, new).

**Auth:** None  
**Response (200):**
```json
[
  { "id": "free-tools", "name": "Best Free AI Tools", "description": "string", "icon": "free", "tools": [{ "id": "string", "name": "string", "slug": "string", "tagline": "string" }] }
]
```

### GET /api/collections/user

List user's personal collections.

**Auth:** Required  
**Response (200):** `[ /* Collection[] with _count.items */ ]`

### POST /api/collections/user

Create a personal collection.

**Auth:** Required  
**Request body:** `{ "name": "string (required)", "description": "string (optional)", "icon": "string (optional)" }`  
**Response (201):** Created collection

---

## Notifications

### GET /api/notifications

Get user's notifications.

**Auth:** Required  
**Response (200):** `{ "items": [ /* Notification[] */ ], "unreadCount": 3 }`

### POST /api/notifications/read

Mark notifications as read.

**Auth:** Required  
**Request body:** `{ "id": "string (specific notification, optional)", "all": true (mark all as read, optional) }`  
**Response (200):** `{ "success": true }`

---

## AI Copilot

### POST /api/ai/chat

Send a message to the AI copilot.

**Auth:** None (context is personalized if userId provided)  
**Request body:**
```json
{
  "message": "string (required)",
  "history": [{ "role": "user|assistant", "content": "string" }],
  "userId": "string (optional)",
  "context": {
    "page": "string (optional)",
    "category": "string (optional)",
    "searchQuery": "string (optional)",
    "toolSlug": "string (optional)",
    "savedCount": 0,
    "compareCount": 0
  }
}
```

**Response (200):** `{ "reply": "AI response text" }`

Requires `OPENAI_API_KEY` environment variable. Falls back to error message if unavailable.

---

## Deals

### GET /api/deals

List free AI tool deals.

**Auth:** None  
**Response (200):** `{ "data": [ /* FreeDeal[] with tool info */ ] }`

### POST /api/deals

Create a deal (admin only).

**Auth:** Admin required  
**Validation:** `dealSchema` (Zod)  
**Response (201):** Created deal

---

## Contact

### POST /api/contact

Submit a contact form message.

**Auth:** None  
**Rate limit:** 3 per 60s per IP  
**Request body:** `{ "name": "string", "email": "string", "message": "string" }`  
**Response (201):** `{ "message": "Message received" }`

### GET /api/contact

List contact messages.

**Auth:** None  
**Response (200):** `[ /* ContactMessage[] */ ]`

---

## Newsletter

### POST /api/newsletter

Subscribe to the newsletter.

**Auth:** None  
**Rate limit:** 3 per 60s per IP  
**Validation:** `newsletterSchema` (Zod, valid email)  
**Request body:** `{ "email": "valid email" }`  
**Response (201):** `{ "message": "Successfully subscribed" }`

Uses `upsert` to reactivate if previously unsubscribed.

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (not admin / not owner) |
| 404 | Resource not found |
| 409 | Conflict (duplicate slug) |
| 429 | Rate limited |
| 500 | Internal server error |
| 503 | Service unavailable (AI) |

All error responses: `{ "error": "Human-readable message" }`
