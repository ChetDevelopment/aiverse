import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, PricingModel, DiscoveryStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60))
  return d
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

async function main() {
  console.log("=== Seeding Complete Data ===\n")

  // ── 1. USERS ──
  console.log("--- 1. Users ---")
  const passwordHash = await bcrypt.hash("password123", 10)

  const userDefs = [
    { key: "admin", email: "admin@aiverse.com", name: "Admin", role: "ADMIN" as const },
    { key: "alice", email: "alice@example.com", name: "Alice Johnson", role: "USER" as const },
    { key: "bob", email: "bob@example.com", name: "Bob Smith", role: "USER" as const },
  ]

  const userMap: Record<string, any> = {}
  for (const u of userDefs) {
    let user = await prisma.user.findUnique({ where: { email: u.email } })
    if (!user) {
      user = await prisma.user.create({
        data: { email: u.email, name: u.name, role: u.role, passwordHash },
      })
      console.log(`  Created user: ${u.email}`)
    } else {
      console.log(`  User exists: ${u.email}`)
    }
    userMap[u.key] = user
  }

  // ── 2. TAGS ──
  console.log("\n--- 2. Tags ---")
  const tagDefs = [
    { name: "AI", slug: "ai" },
    { name: "Machine Learning", slug: "machine-learning" },
    { name: "NLP", slug: "nlp" },
    { name: "Computer Vision", slug: "computer-vision" },
    { name: "Automation", slug: "automation" },
    { name: "Productivity", slug: "productivity" },
    { name: "Creative", slug: "creative" },
    { name: "Developer Tools", slug: "developer-tools" },
    { name: "Data Science", slug: "data-science" },
    { name: "Open Source", slug: "open-source" },
  ]

  const tagMap: Record<string, any> = {}
  for (const t of tagDefs) {
    let tag = await prisma.tag.findUnique({ where: { slug: t.slug } })
    if (!tag) {
      tag = await prisma.tag.create({ data: t })
      console.log(`  Created tag: ${t.name}`)
    }
    tagMap[t.slug] = tag
  }

  // ── 3. ENSURE ADDITIONAL TOOLS EXIST ──
  console.log("\n--- 3. Additional Tools ---")

  const catMap: Record<string, any> = {}
  for (const slug of ["chat-ai", "coding", "image", "writing", "productivity", "education", "design"]) {
    const cat = await prisma.category.findUnique({ where: { slug } })
    if (cat) catMap[slug] = cat
  }
  // Fallback: if "design" doesn't exist, use "image"
  if (!catMap["design"]) catMap["design"] = catMap["image"]

  const extraTools = [
    {
      name: "Canva", slug: "canva", tagline: "AI-powered design platform for everyone",
      description: "Canva is an online design platform with AI-powered tools for creating presentations, social media graphics, documents, and more.",
      websiteUrl: "https://canva.com", pricing: "FREEMIUM" as PricingModel, pricingDetail: "Free tier with premium features from $12.99/month",
      logo: "https://www.google.com/s2/favicons?domain=canva.com&sz=64", isPublished: true, isFeatured: true, featuredScore: 78,
      categorySlugs: ["image", "design"],
    },
    {
      name: "Cursor", slug: "cursor", tagline: "AI-first code editor built for productivity",
      description: "Cursor is an AI-native code editor with features like agent mode, multi-file editing, codebase-aware chat, and inline code generation.",
      websiteUrl: "https://cursor.sh", pricing: "FREEMIUM" as PricingModel, pricingDetail: "Free tier with Pro at $20/month",
      logo: "https://www.google.com/s2/favicons?domain=cursor.sh&sz=64", isPublished: true, isFeatured: true, featuredScore: 88,
      categorySlugs: ["coding"],
    },
    {
      name: "NotebookLM", slug: "notebooklm", tagline: "AI-powered research and note-taking assistant",
      description: "NotebookLM is Google's AI-powered notebook tool that helps you analyze documents, take notes, and generate insights from your sources.",
      websiteUrl: "https://notebooklm.google.com", pricing: "FREE" as PricingModel, pricingDetail: "Free to use",
      logo: "https://www.google.com/s2/favicons?domain=notebooklm.google.com&sz=64", isPublished: true, isFeatured: true, featuredScore: 75,
      categorySlugs: ["productivity", "education"],
    },
    {
      name: "Tabnine", slug: "tabnine", tagline: "AI code completion that respects your privacy",
      description: "Tabnine provides AI-powered code completions with support for local models, team-based customization, and privacy-focused deployment.",
      websiteUrl: "https://tabnine.com", pricing: "FREEMIUM" as PricingModel, pricingDetail: "Free tier with Pro at $12/month",
      logo: "https://www.google.com/s2/favicons?domain=tabnine.com&sz=64", isPublished: true, isFeatured: false, featuredScore: 65,
      categorySlugs: ["coding"],
    },
    {
      name: "Adobe Firefly", slug: "adobe-firefly", tagline: "Generative AI for creative expression",
      description: "Adobe Firefly is a family of creative generative AI models integrated into Adobe products for image generation, text effects, and design assets.",
      websiteUrl: "https://firefly.adobe.com", pricing: "FREEMIUM" as PricingModel, pricingDetail: "Free tier with premium features via Adobe subscription",
      logo: "https://www.google.com/s2/favicons?domain=firefly.adobe.com&sz=64", isPublished: true, isFeatured: true, featuredScore: 82,
      categorySlugs: ["image", "design"],
    },
  ]

  const toolMap: Record<string, string> = {}
  const allTools = await prisma.aiTool.findMany({ select: { id: true, slug: true } })
  for (const t of allTools) toolMap[t.slug] = t.id

  for (const et of extraTools) {
    if (toolMap[et.slug]) {
      console.log(`  Tool exists: ${et.name}`)
      continue
    }
    const existingTool = await prisma.aiTool.findUnique({ where: { slug: et.slug } })
    if (existingTool) {
      toolMap[et.slug] = existingTool.id
      console.log(`  Tool found (re-fetch): ${et.name}`)
      continue
    }
    try {
      const { categorySlugs, ...toolData } = et
      const categoryIds = categorySlugs.map((s) => catMap[s]?.id).filter(Boolean) as string[]
      const tool = await prisma.aiTool.create({
        data: {
          ...toolData,
          categories: { create: categoryIds.map((cid) => ({ categoryId: cid })) },
        },
      })
      toolMap[et.slug] = tool.id
      console.log(`  Created tool: ${et.name}`)
    } catch (err) {
      console.log(`  Skipped tool: ${et.name} (${(err as Error).message.slice(0, 60)})`)
      // Re-fetch it in case it was partially created
      const refetched = await prisma.aiTool.findUnique({ where: { slug: et.slug } })
      if (refetched) toolMap[et.slug] = refetched.id
    }
  }

  // ── 4. WORKSPACES ──
  console.log("\n--- 4. Workspaces ---")

  const workspaceDefs = [
    {
      name: "Content Creation Hub", emoji: "🎨", userId: userMap.alice.id,
      description: "My go-to tools for creating content across text, image, and design",
      items: [
        { toolSlug: "chatgpt", note: "Draft blog posts and social media content", workflow: "Write → edit → publish" },
        { toolSlug: "midjourney", note: "Generate unique visuals for articles", workflow: "Prompt → generate → refine" },
        { toolSlug: "canva", note: "Final design and layout for social posts", workflow: "Template → customize → export" },
      ],
    },
    {
      name: "AI Learning Lab", emoji: "🧪", userId: userMap.alice.id,
      description: "Exploring AI tools for learning and research",
      items: [
        { toolSlug: "claude", note: "Deep research and document analysis", workflow: "Ask questions → analyze → summarize" },
        { toolSlug: "perplexity-ai", note: "Quick fact-checking and source finding", workflow: "Search → verify → cite" },
      ],
    },
    {
      name: "Dev Projects", emoji: "💻", userId: userMap.bob.id,
      description: "My development toolkit for building software faster",
      items: [
        { toolSlug: "github-copilot", note: "Code suggestions in my IDE", workflow: "Type → suggest → accept" },
        { toolSlug: "cursor", note: "AI-native editor for complex refactors", workflow: "Open project → chat → refactor" },
        { toolSlug: "claude", note: "Code review and architecture discussions", workflow: "Share code → review → improve" },
      ],
    },
    {
      name: "Research & Analysis", emoji: "📊", userId: userMap.admin.id,
      description: "Tools for deep research and data analysis",
      items: [
        { toolSlug: "chatgpt", note: "Analyze datasets and generate reports", workflow: "Upload data → analyze → report" },
        { toolSlug: "perplexity-ai", note: "Market research and competitor analysis", workflow: "Query → gather sources → synthesize" },
        { toolSlug: "notebooklm", note: "Organize research notes and sources", workflow: "Collect → annotate → summarize" },
      ],
    },
  ]

  for (const wd of workspaceDefs) {
    const existing = await prisma.workspace.findFirst({
      where: { name: wd.name, userId: wd.userId },
    })
    if (existing) {
      console.log(`  Workspace exists: ${wd.name}`)
      continue
    }
    const ws = await prisma.workspace.create({
      data: {
        name: wd.name,
        description: wd.description,
        emoji: wd.emoji,
        userId: wd.userId,
      },
    })
    for (let i = 0; i < wd.items.length; i++) {
      const item = wd.items[i]
      const toolId = toolMap[item.toolSlug]
      if (!toolId) continue
      await prisma.workspaceItem.create({
        data: {
          workspaceId: ws.id,
          toolId,
          note: item.note,
          workflow: item.workflow,
          order: i,
        },
      }).catch(() => {})
    }
    console.log(`  Created workspace: ${wd.name} (${wd.items.length} items)`)
  }

  // ── 5. COLLECTIONS ──
  console.log("\n--- 5. Collections ---")

  const collectionDefs = [
    {
      name: "Best Free AI Tools", slug: "best-free-ai-tools", userId: userMap.admin.id,
      description: "Top AI tools with generous free tiers to get started without spending a dime",
      public: true, icon: "🎁",
      items: ["chatgpt", "claude", "perplexity-ai", "stable-diffusion"],
    },
    {
      name: "AI for Designers", slug: "ai-for-designers", userId: userMap.admin.id,
      description: "AI-powered tools that every designer should know about",
      public: true, icon: "🎨",
      items: ["midjourney", "canva", "adobe-firefly"],
    },
    {
      name: "My Favorites", slug: "my-favorites-alice", userId: userMap.alice.id,
      description: "My personally curated collection of AI tools",
      public: false, icon: "⭐",
      items: ["chatgpt", "claude"],
    },
    {
      name: "Dev Toolkit", slug: "dev-toolkit", userId: userMap.bob.id,
      description: "Essential AI tools for software developers",
      public: true, icon: "🔧",
      items: ["github-copilot", "cursor", "tabnine"],
    },
  ]

  for (const cd of collectionDefs) {
    let collection = await prisma.collection.findUnique({ where: { slug: cd.slug } })
    if (collection) {
      console.log(`  Collection exists: ${cd.name}`)
      continue
    }
    collection = await prisma.collection.create({
      data: {
        name: cd.name,
        slug: cd.slug,
        description: cd.description,
        icon: cd.icon,
        userId: cd.userId,
        public: cd.public,
      },
    })
    for (let i = 0; i < cd.items.length; i++) {
      const toolId = toolMap[cd.items[i]]
      if (!toolId) continue
      await prisma.collectionItem.create({
        data: { collectionId: collection.id, toolId, order: i },
      }).catch(() => {})
    }
    console.log(`  Created collection: ${cd.name} (${cd.items.length} items)`)
  }

  // ── 6. STACK COMMENTS & LIKES ──
  console.log("\n--- 6. Stack Comments & Likes ---")

  const stacks = await prisma.stack.findMany({
    orderBy: { createdAt: "asc" },
    take: 5,
  })

  if (stacks.length >= 2) {
    // 3 comments on first stack, 2 on second
    const commentDefs = [
      { stackIdx: 0, userId: userMap.alice.id, content: "Great stack for beginners! I've been using this workflow and it saves me hours." },
      { stackIdx: 0, userId: userMap.bob.id, content: "I would add ElevenLabs to this pipeline for voiceovers. Otherwise perfect setup!" },
      { stackIdx: 0, userId: userMap.admin.id, content: "Thanks for sharing! Pro tip: try using descriptive prompts for better Midjourney results." },
      { stackIdx: 1, userId: userMap.alice.id, content: "This writing workflow is incredible. Claude + Grammarly is a game changer." },
      { stackIdx: 1, userId: userMap.bob.id, content: "I replaced Notion AI with Obsidian for this stack, but otherwise solid choices." },
    ]

    for (const cd of commentDefs) {
      const stack = stacks[cd.stackIdx]
      const existing = await prisma.stackComment.findFirst({
        where: { stackId: stack.id, userId: cd.userId, content: cd.content },
      })
      if (existing) continue
      await prisma.stackComment.create({
        data: { stackId: stack.id, userId: cd.userId, content: cd.content },
      }).catch(() => {})
      console.log(`  Created comment on "${stack.name}"`)
    }

    // 8 stack likes across stacks
    const likedPairs = new Set<string>()
    const likeDistributions: { stackIdx: number; userKey: string }[] = [
      { stackIdx: 0, userKey: "alice" }, { stackIdx: 0, userKey: "bob" },
      { stackIdx: 1, userKey: "alice" }, { stackIdx: 1, userKey: "admin" },
      { stackIdx: 2, userKey: "alice" }, { stackIdx: 2, userKey: "bob" },
      { stackIdx: 3, userKey: "admin" }, { stackIdx: 4, userKey: "bob" },
    ]

    for (const ld of likeDistributions) {
      const stack = stacks[ld.stackIdx]
      if (!stack) continue
      const key = `${stack.id}-${userMap[ld.userKey].id}`
      if (likedPairs.has(key)) continue
      likedPairs.add(key)
      await prisma.stackLike.create({
        data: { stackId: stack.id, userId: userMap[ld.userKey].id },
      }).catch(() => {})
    }
    // Update like counts
    for (const stack of stacks) {
      const count = await prisma.stackLike.count({ where: { stackId: stack.id } })
      if (count > 0) {
        await prisma.stack.update({ where: { id: stack.id }, data: { likeCount: count } })
      }
    }
    console.log(`  Created ${likedPairs.size} stack likes`)
  } else {
    console.log("  Skipped - not enough stacks found")
  }

  // ── 7. REVIEWS (for helpful votes) ──
  console.log("\n--- 7. Reviews ---")

  const reviewDefs = [
    { toolSlug: "chatgpt", userKey: "alice", rating: 5, comment: "Best AI chatbot I've used. The free tier is generous and GPT-4 is incredible for complex tasks." },
    { toolSlug: "chatgpt", userKey: "bob", rating: 4, comment: "Great for coding help and brainstorming. Sometimes response times are slow during peak hours." },
    { toolSlug: "github-copilot", userKey: "alice", rating: 5, comment: "Indispensable for development. Saves me hours of boilerplate coding every week." },
    { toolSlug: "github-copilot", userKey: "bob", rating: 4, comment: "Great suggestions most of the time. Can be distracting with too many inline suggestions." },
    { toolSlug: "midjourney", userKey: "alice", rating: 4, comment: "Stunning image quality but the learning curve for prompts is steep." },
    { toolSlug: "claude", userKey: "alice", rating: 5, comment: "Perfect for long-form writing and document analysis. The 100K token context is amazing." },
    { toolSlug: "claude", userKey: "bob", rating: 4, comment: "Excellent for code review and architecture discussions. Slightly slower than ChatGPT for simple queries." },
    { toolSlug: "perplexity-ai", userKey: "admin", rating: 5, comment: "The best AI search engine. Citations make it invaluable for research." },
  ]

  const reviewMap: Record<string, string> = {}
  for (const rd of reviewDefs) {
    const toolId = toolMap[rd.toolSlug]
    const userId = userMap[rd.userKey]?.id
    if (!toolId || !userId) continue
    try {
      const review = await prisma.review.upsert({
        where: { userId_toolId: { userId, toolId } },
        update: { rating: rd.rating, comment: rd.comment },
        create: { userId, toolId, rating: rd.rating, comment: rd.comment },
      })
      reviewMap[`${userId}-${toolId}`] = review.id
    } catch {
      // skip
    }
  }
  console.log(`  Created/updated ${reviewDefs.length} reviews`)

  // ── 8. HELPFUL VOTES ──
  console.log("\n--- 8. Helpful Votes ---")

  const reviewIds = Object.values(reviewMap)
  const helpfulVoteDefs = [
    { reviewIdx: 0, userKey: "bob" },
    { reviewIdx: 0, userKey: "admin" },
    { reviewIdx: 1, userKey: "alice" },
    { reviewIdx: 1, userKey: "admin" },
    { reviewIdx: 2, userKey: "bob" },
    { reviewIdx: 3, userKey: "alice" },
    { reviewIdx: 4, userKey: "bob" },
    { reviewIdx: 5, userKey: "admin" },
    { reviewIdx: 6, userKey: "alice" },
    { reviewIdx: 7, userKey: "alice" },
  ]

  let helpfulCount = 0
  for (const hvd of helpfulVoteDefs) {
    const reviewId = reviewIds[hvd.reviewIdx]
    const userId = userMap[hvd.userKey]?.id
    if (!reviewId || !userId) continue
    try {
      await prisma.helpfulVote.upsert({
        where: { reviewId_userId: { reviewId, userId } },
        update: {},
        create: { reviewId, userId },
      })
      helpfulCount++
    } catch {
      // skip
    }
  }
  console.log(`  Created ${helpfulCount} helpful votes`)

  // ── 9. PROMPT RATINGS ──
  console.log("\n--- 9. Prompt Ratings ---")

  const prompts = await prisma.prompt.findMany({ take: 20 })
  if (prompts.length > 0) {
    const userKeys = ["alice", "bob", "admin"]
    let ratingCount = 0
    const ratedPairs = new Set<string>()

    for (let i = 0; i < 15 && i < prompts.length * userKeys.length; i++) {
      const prompt = pick(prompts)
      const userKey = pick(userKeys)
      const userId = userMap[userKey]?.id
      if (!userId) continue
      const key = `${prompt.id}-${userId}`
      if (ratedPairs.has(key)) continue
      ratedPairs.add(key)
      const rating = Math.floor(Math.random() * 3) + 3 // 3-5
      try {
        await prisma.promptRating.upsert({
          where: { promptId_userId: { promptId: prompt.id, userId } },
          update: { rating },
          create: { promptId: prompt.id, userId, rating },
        })
        ratingCount++
      } catch {
        // skip
      }
    }
    console.log(`  Created ${ratingCount} prompt ratings`)
  } else {
    console.log("  Skipped - no prompts found")
  }

  // ── 10. PROMPT FAVORITES ──
  console.log("\n--- 10. Prompt Favorites ---")

  if (prompts.length > 0) {
    const userKeys = ["alice", "bob", "admin"]
    let favCount = 0
    const favedPairs = new Set<string>()

    for (let i = 0; i < 10 && i < prompts.length * userKeys.length; i++) {
      const prompt = pick(prompts)
      const userKey = pick(userKeys)
      const userId = userMap[userKey]?.id
      if (!userId) continue
      const key = `${prompt.id}-${userId}`
      if (favedPairs.has(key)) continue
      favedPairs.add(key)
      try {
        await prisma.promptFavorite.upsert({
          where: { promptId_userId: { promptId: prompt.id, userId } },
          update: {},
          create: { promptId: prompt.id, userId },
        })
        favCount++
      } catch {
        // skip
      }
    }
    console.log(`  Created ${favCount} prompt favorites`)
  } else {
    console.log("  Skipped - no prompts found")
  }

  // ── 11. DISCOVERED PROJECTS ──
  console.log("\n--- 11. Discovered Projects ---")

  const projectDefs = [
    {
      repoName: "langchain", repoOwner: "langchain-ai", fullName: "langchain-ai/langchain",
      githubUrl: "https://github.com/langchain-ai/langchain",
      description: "Building applications with LLMs through composability. A framework for developing context-aware reasoning applications.",
      stars: 105000, forks: 17000, watchers: 2500, language: "Python",
      topics: "llm,ai,framework,chain,agent,rag,prompt",
      license: "MIT", status: "APPROVED" as DiscoveryStatus,
    },
    {
      repoName: "langflow", repoOwner: "langflow-ai", fullName: "langflow-ai/langflow",
      githubUrl: "https://github.com/langflow-ai/langflow",
      description: "Langflow is a low-code app builder for RAG and multi-agent AI applications. Build, test, and deploy AI workflows visually.",
      stars: 45000, forks: 6000, watchers: 1200, language: "Python",
      topics: "llm,low-code,rag,agent,visual,workflow",
      license: "MIT", status: "APPROVED" as DiscoveryStatus,
    },
    {
      repoName: "crewai", repoOwner: "crewAIInc", fullName: "crewAIInc/crewai",
      githubUrl: "https://github.com/crewAIInc/crewai",
      description: "Framework for orchestrating role-playing, autonomous AI agents. Enable collaborative intelligence through specialized agent teams.",
      stars: 28000, forks: 3800, watchers: 900, language: "Python",
      topics: "ai,agent,framework,llm,multi-agent,orchestration",
      license: "MIT", status: "APPROVED" as DiscoveryStatus,
    },
    {
      repoName: "ollama", repoOwner: "ollama", fullName: "ollama/ollama",
      githubUrl: "https://github.com/ollama/ollama",
      description: "Get up and running with large language models locally. Supports Llama 3, Mistral, Gemma, and many other models.",
      stars: 125000, forks: 10000, watchers: 3000, language: "Go",
      topics: "llm,local,ai,machine-learning,llama,mistral",
      license: "MIT", status: "APPROVED" as DiscoveryStatus,
    },
    {
      repoName: "comfyui", repoOwner: "comfyanonymous", fullName: "comfyanonymous/ComfyUI",
      githubUrl: "https://github.com/comfyanonymous/ComfyUI",
      description: "A powerful and modular stable diffusion GUI with a graph/nodes interface. Build complex image generation workflows visually.",
      stars: 65000, forks: 7000, watchers: 1500, language: "Python",
      topics: "stable-diffusion,ai,image-generation,node,workflow,gui",
      license: "GPL-3.0", status: "APPROVED" as DiscoveryStatus,
    },
    {
      repoName: "whisper", repoOwner: "openai", fullName: "openai/whisper",
      githubUrl: "https://github.com/openai/whisper",
      description: "Robust speech recognition via large-scale weak supervision. State-of-the-art multilingual speech-to-text system.",
      stars: 78000, forks: 9000, watchers: 2000, language: "Python",
      topics: "speech-recognition,ai,deep-learning,transcription,audio",
      license: "MIT", status: "APPROVED" as DiscoveryStatus,
    },
    {
      repoName: "stable-diffusion-webui", repoOwner: "AUTOMATIC1111", fullName: "AUTOMATIC1111/stable-diffusion-webui",
      githubUrl: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
      description: "Stable Diffusion web UI. A browser interface for Stable Diffusion with many features and extensions.",
      stars: 150000, forks: 28000, watchers: 3500, language: "Python",
      topics: "stable-diffusion,ai,image-generation,webui,diffusion",
      license: "AGPL-3.0", status: "APPROVED" as DiscoveryStatus,
    },
    {
      repoName: "llama-cpp-python", repoOwner: "abetlen", fullName: "abetlen/llama-cpp-python",
      githubUrl: "https://github.com/abetlen/llama-cpp-python",
      description: "Python bindings for llama.cpp. Run LLMs efficiently on CPU with GPU acceleration support.",
      stars: 12000, forks: 2000, watchers: 400, language: "Python",
      topics: "llm,llama,ai,python,bindings,local",
      license: "MIT", status: "APPROVED" as DiscoveryStatus,
    },
    {
      repoName: "autogpt", repoOwner: "Significant-Gravitas", fullName: "Significant-Gravitas/AutoGPT",
      githubUrl: "https://github.com/Significant-Gravitas/AutoGPT",
      description: "AutoGPT is the vision of accessible AI for everyone, to use and to build on. Our mission is to provide the tools to harness the power of AI.",
      stars: 172000, forks: 45000, watchers: 4000, language: "Python",
      topics: "ai,agent,autonomous,llm,automation,gpt",
      license: "MIT", status: "APPROVED" as DiscoveryStatus,
    },
    {
      repoName: "open-interpreter", repoOwner: "openinterpreter", fullName: "openinterpreter/open-interpreter",
      githubUrl: "https://github.com/openinterpreter/open-interpreter",
      description: "A natural language interface for computers. Let LLMs run code, browse the web, and control your computer.",
      stars: 58000, forks: 5000, watchers: 1300, language: "Python",
      topics: "ai,assistant,automation,code-execution,llm,natural-language",
      license: "AGPL-3.0", status: "APPROVED" as DiscoveryStatus,
    },
  ]

  for (const pd of projectDefs) {
    try {
      await prisma.discoveredProject.upsert({
        where: { fullName: pd.fullName },
        update: { stars: pd.stars, forks: pd.forks, description: pd.description },
        create: pd,
      })
      console.log(`  Created project: ${pd.repoName}`)
    } catch {
      console.log(`  Skipped project: ${pd.repoName}`)
    }
  }

  // ── 12. HISTORY ──
  console.log("\n--- 12. History ---")

  const toolSlugs = Object.keys(toolMap)
  let historyCount = 0
  const historyDates: { userKey: string; days: number }[] = []
  for (const uk of ["alice", "bob"]) {
    for (let d = 0; d < 7; d++) {
      const timesPerDay = uk === "alice" ? 2 : 1
      for (let t = 0; t < timesPerDay; t++) {
        if (historyDates.length < 20) {
          historyDates.push({ userKey: uk, days: d })
        }
      }
    }
  }
  // Fill remaining with random
  while (historyDates.length < 20) {
    historyDates.push({ userKey: pick(["alice", "bob"]), days: Math.floor(Math.random() * 7) })
  }

  for (const hd of historyDates) {
    const userId = userMap[hd.userKey]?.id
    const toolSlug = pick(toolSlugs)
    const toolId = toolMap[toolSlug]
    if (!userId || !toolId) continue
    try {
      await prisma.history.create({
        data: { userId, toolId, createdAt: daysAgo(hd.days) },
      })
      historyCount++
    } catch {
      // skip
    }
  }
  console.log(`  Created ${historyCount} history entries`)

  // ── 13. FAVORITES (tool favorites) ──
  console.log("\n--- 13. Favorites ---")

  const favDefs = [
    { toolSlug: "chatgpt", userKey: "alice" },
    { toolSlug: "claude", userKey: "alice" },
    { toolSlug: "midjourney", userKey: "alice" },
    { toolSlug: "chatgpt", userKey: "bob" },
    { toolSlug: "github-copilot", userKey: "bob" },
    { toolSlug: "cursor", userKey: "bob" },
    { toolSlug: "perplexity-ai", userKey: "admin" },
    { toolSlug: "ollama", userKey: "admin" },
  ]

  let favCount = 0
  for (const fd of favDefs) {
    const toolId = toolMap[fd.toolSlug]
    const userId = userMap[fd.userKey]?.id
    if (!toolId || !userId) continue
    try {
      await prisma.favorite.upsert({
        where: { userId_toolId: { userId, toolId } },
        update: {},
        create: { userId, toolId },
      })
      favCount++
    } catch {
      // skip
    }
  }
  console.log(`  Created ${favCount} favorites`)

  // ── 14. BOOKMARKS ──
  console.log("\n--- 14. Bookmarks ---")

  const bmDefs = [
    { toolSlug: "ollama", userKey: "alice" },
    { toolSlug: "langchain", userKey: "alice" },
    { toolSlug: "chatgpt", userKey: "alice" },
    { toolSlug: "stable-diffusion", userKey: "bob" },
    { toolSlug: "cursor", userKey: "bob" },
    { toolSlug: "claude", userKey: "admin" },
  ]

  let bmCount = 0
  for (const bd of bmDefs) {
    const toolId = toolMap[bd.toolSlug]
    const userId = userMap[bd.userKey]?.id
    if (!toolId || !userId) continue
    try {
      await prisma.bookmark.upsert({
        where: { userId_toolId: { userId, toolId } },
        update: {},
        create: { userId, toolId },
      })
      bmCount++
    } catch {
      // skip
    }
  }
  console.log(`  Created ${bmCount} bookmarks`)

  // ── 15. NOTIFICATIONS ──
  console.log("\n--- 15. Notifications ---")

  const notifDefs = [
    { userKey: "alice", type: "welcome", title: "Welcome to AIVerese!", message: "We're excited to have you on board. Start exploring AI tools today.", link: "/tools" },
    { userKey: "alice", type: "welcome", title: "Complete Your Profile", message: "Add your avatar and preferences to personalize your experience.", link: "/profile" },
    { userKey: "alice", type: "suggestion", title: "Try Claude for Writing", message: "Based on your interests, Claude is great for long-form content and analysis.", link: "/tools/claude" },
    { userKey: "alice", type: "suggestion", title: "Explore Midjourney Prompts", message: "Check out the latest community prompts for Midjourney.", link: "/prompts?tool=midjourney" },
    { userKey: "alice", type: "activity", title: "New Stack Available", message: "The community created a new stack: 'YouTube Creator Pipeline'", link: "/stacks" },
    { userKey: "alice", type: "activity", title: "Your Review Got a Vote", message: "Someone found your ChatGPT review helpful!", link: "/reviews" },
    { userKey: "alice", type: "suggestion", title: "Weekly Digest", message: "5 new AI tools were added this week. Check them out!", link: "/tools?sort=newest" },
    { userKey: "alice", type: "activity", title: "Collection Shared", message: "Admin shared 'Best Free AI Tools' collection with everyone.", link: "/collections/best-free-ai-tools" },
  ]

  let notifCount = 0
  for (const nd of notifDefs) {
    const userId = userMap[nd.userKey]?.id
    if (!userId) continue
    const existing = await prisma.notification.findFirst({
      where: { userId, type: nd.type, title: nd.title },
    })
    if (existing) continue
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: nd.type,
          title: nd.title,
          message: nd.message,
          link: nd.link,
          createdAt: daysAgo(Math.floor(Math.random() * 14)),
        },
      })
      notifCount++
    } catch {
      // skip
    }
  }
  console.log(`  Created ${notifCount} notifications`)

  // ── 16. CONTACT MESSAGES ──
  console.log("\n--- 16. Contact Messages ---")

  const contactDefs = [
    {
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      message: "Hi! I love the platform. I was wondering if you plan to add support for Midjourney's new style reference feature in the prompts section? It would be incredibly useful for my design team.",
    },
    {
      name: "Marcus Rivera",
      email: "marcus.r@example.com",
      message: "I'm a developer and I'd like to contribute to the open source tools section. I maintain a collection of AI developer tools that I think would be a great addition to your directory. Let me know how I can submit them!",
    },
  ]

  let contactCount = 0
  for (const cd of contactDefs) {
    const existing = await prisma.contactMessage.findFirst({
      where: { email: cd.email, message: cd.message },
    })
    if (existing) continue
    try {
      await prisma.contactMessage.create({ data: cd })
      contactCount++
    } catch {
      // skip
    }
  }
  console.log(`  Created ${contactCount} contact messages`)

  // ── SUMMARY ──
  console.log("\n=== Seed Summary ===")
  const modelMapping: Record<string, string> = {
    User: "user", Tag: "tag", Workspace: "workspace", WorkspaceItem: "workspaceItem",
    Collection: "collection", CollectionItem: "collectionItem",
    StackComment: "stackComment", StackLike: "stackLike",
    Review: "review", HelpfulVote: "helpfulVote",
    PromptRating: "promptRating", PromptFavorite: "promptFavorite",
    DiscoveredProject: "discoveredProject", History: "history",
    Favorite: "favorite", Bookmark: "bookmark",
    Notification: "notification", ContactMessage: "contactMessage",
  }
  for (const [label, prop] of Object.entries(modelMapping)) {
    const count = await (prisma as any)[prop].count()
    console.log(`  ${label}: ${count}`)
  }

  await prisma.$disconnect()
  console.log("\nComplete seeding finished!")
}

main().catch((e) => { console.error(e); process.exit(1) })
