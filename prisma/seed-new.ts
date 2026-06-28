import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString: url })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding new models...\n")

  // ── Learning Paths ──
  const paths = [
    {
      title: "AI for Developers",
      slug: "ai-for-developers",
      description: "Master AI-assisted development with Copilot, Cursor, Claude, and more. Learn to code faster and smarter.",
      icon: "Code2",
      difficulty: "intermediate",
      category: "coding",
      steps: [
        { title: "Get Started with GitHub Copilot", description: "Install Copilot in your IDE and learn the basics of AI pair programming.", tools: ["github-copilot"] },
        { title: "Master Cursor AI Editor", description: "Explore Cursor's agent mode, multi-file editing, and codebase-aware chat.", tools: ["cursor"] },
        { title: "Use Claude for Code Review", description: "Learn how Claude can analyze, review, and refactor your code.", tools: ["claude"] },
        { title: "Build with AI Agents", description: "Use OpenHands and Aider for autonomous software development tasks.", tools: ["openhands", "aider"] },
      ],
      published: true,
    },
    {
      title: "AI for Content Creators",
      slug: "ai-for-content-creators",
      description: "Create stunning content with AI tools. From writing to images, video, and voiceovers.",
      icon: "PenTool",
      difficulty: "beginner",
      category: "writing",
      steps: [
        { title: "Write with ChatGPT", description: "Generate blog posts, social media content, and marketing copy.", tools: ["chatgpt"] },
        { title: "Create Images with Midjourney", description: "Master prompt engineering for stunning AI images.", tools: ["midjourney"] },
        { title: "Edit Videos with CapCut", description: "Use AI-powered video editing features.", tools: ["capcut"] },
        { title: "Generate Voiceovers with ElevenLabs", description: "Create realistic voiceovers for your content.", tools: ["elevenlabs"] },
      ],
      published: true,
    },
    {
      title: "AI for Business",
      slug: "ai-for-business",
      description: "Leverage AI to automate workflows, analyze data, and grow your business.",
      icon: "Briefcase",
      difficulty: "beginner",
      category: "business",
      steps: [
        { title: "Automate with Zapier AI", description: "Create AI-powered workflows across your tools.", tools: ["zapier"] },
        { title: "Analyze Data with ChatGPT", description: "Use AI for data analysis and business intelligence.", tools: ["chatgpt"] },
        { title: "Generate Marketing Copy", description: "Use Jasper and Copy.ai for compelling marketing content.", tools: ["jasper", "copy-ai"] },
        { title: "Manage Projects with Notion AI", description: "Enhance project management with AI assistance.", tools: ["notion-ai"] },
      ],
      published: true,
    },
    {
      title: "AI for Students",
      slug: "ai-for-students",
      description: "Study smarter, not harder. Use AI for research, writing, and learning.",
      icon: "GraduationCap",
      difficulty: "beginner",
      category: "education",
      steps: [
        { title: "Research with Perplexity AI", description: "Use AI-powered search for academic research.", tools: ["perplexity-ai"] },
        { title: "Write Essays with Claude", description: "Get help structuring and writing academic papers.", tools: ["claude"] },
        { title: "Study with Quizlet AI", description: "Use AI-generated flashcards and practice tests.", tools: ["quizlet"] },
        { title: "Solve Math with Wolfram Alpha", description: "Use computational AI for complex math problems.", tools: ["wolfram-alpha"] },
      ],
      published: true,
    },
    {
      title: "AI for Designers",
      slug: "ai-for-designers",
      description: "Transform your design workflow with AI-powered tools for everything from logos to layouts.",
      icon: "Palette",
      difficulty: "intermediate",
      category: "image",
      steps: [
        { title: "Generate Assets with Midjourney", description: "Create unique design assets and illustrations.", tools: ["midjourney"] },
        { title: "Edit with Adobe Firefly", description: "Use generative AI directly in Adobe Creative Suite.", tools: ["adobe-firefly"] },
        { title: "Design with Canva AI", description: "Accelerate your design process with Canva's AI tools.", tools: ["canva"] },
        { title: "Create Logos with Looka", description: "Design professional logos using AI.", tools: ["looka"] },
      ],
      published: true,
    },
  ]

  for (const path of paths) {
    const exists = await prisma.learningPath.findUnique({ where: { slug: path.slug } })
    if (!exists) {
      await prisma.learningPath.create({ data: path })
      console.log(`  Created learning path: ${path.title}`)
    }
  }

  // ── Use Cases ──
  const useCases = [
    { title: "Build a Website", slug: "build-a-website", description: "Create a professional website from scratch using AI tools.", icon: "Globe", difficulty: "intermediate", estimatedTime: "2-4 hours", category: "Development", steps: [{ title: "Design with Framer AI", description: "Use AI to design your site layout" }, { title: "Develop with Cursor", description: "Code your site with AI assistance" }, { title: "Deploy with Vercel", description: "Launch your site" }] },
    { title: "Write a Thesis", slug: "write-a-thesis", description: "Research, outline, and write a comprehensive thesis with AI assistance.", icon: "BookOpen", difficulty: "advanced", estimatedTime: "2-3 months", category: "Writing", steps: [{ title: "Research with Perplexity", description: "Gather academic sources" }, { title: "Outline with Claude", description: "Structure your thesis" }, { title: "Write with ChatGPT", description: "Draft sections" }, { title: "Edit with Grammarly", description: "Polish your writing" }] },
    { title: "Generate Marketing Content", slug: "generate-marketing-content", description: "Create compelling marketing copy, ads, and social media content.", icon: "Megaphone", difficulty: "beginner", estimatedTime: "30 min", category: "Marketing", steps: [{ title: "Strategy with ChatGPT", description: "Plan your content strategy" }, { title: "Write with Jasper", description: "Generate marketing copy" }, { title: "Design with Canva", description: "Create visual assets" }] },
    { title: "Edit Videos Like a Pro", slug: "edit-videos-like-a-pro", description: "Learn to edit, enhance, and produce professional videos.", icon: "Video", difficulty: "intermediate", estimatedTime: "1-2 hours", category: "Content Creation", steps: [{ title: "Edit with CapCut", description: "AI-powered video editing" }, { title: "Generate with Runway", description: "AI video generation" }, { title: "Voiceover with ElevenLabs", description: "AI voice narration" }] },
    { title: "Learn Programming", slug: "learn-programming", description: "Start coding from scratch with AI as your personal tutor.", icon: "Code2", difficulty: "beginner", estimatedTime: "3-6 months", category: "Development", steps: [{ title: "Learn Basics with ChatGPT", description: "Get explanations and examples" }, { title: "Practice with GitHub Copilot", description: "Write code with AI assistance" }, { title: "Build Projects with Replit", description: "Create real projects" }] },
    { title: "Start a Podcast", slug: "start-a-podcast", description: "Launch and grow a successful podcast using AI tools.", icon: "Mic", difficulty: "beginner", estimatedTime: "2-3 hours", category: "Content Creation", steps: [{ title: "Script with Claude", description: "Write episode scripts" }, { title: "Record with Riverside", description: "AI-enhanced recording" }, { title: "Edit with Descript", description: "AI-powered editing" }, { title: "Generate Artwork with Midjourney", description: "Create cover art" }] },
    { title: "Design a Logo", slug: "design-a-logo", description: "Create a professional logo and brand identity with AI.", icon: "Palette", difficulty: "beginner", estimatedTime: "1 hour", category: "Design", steps: [{ title: "Ideate with ChatGPT", description: "Brainstorm concepts" }, { title: "Generate with Looka", description: "AI logo generation" }, { title: "Refine with Canva", description: "Polish your design" }] },
    { title: "Analyze Data", slug: "analyze-data", description: "Transform raw data into actionable insights using AI.", icon: "BarChart3", difficulty: "intermediate", estimatedTime: "1-2 hours", category: "Business", steps: [{ title: "Clean with ChatGPT", description: "Prepare your data" }, { title: "Visualize with AI", description: "Create charts and graphs" }, { title: "Report with Notion AI", description: "Generate insights report" }] },
    { title: "Research Papers", slug: "research-papers", description: "Accelerate your academic research with AI tools.", icon: "Search", difficulty: "advanced", estimatedTime: "2-4 weeks", category: "Education", steps: [{ title: "Discover with Semantic Scholar", description: "Find relevant papers" }, { title: "Summarize with Elicit", description: "Extract key findings" }, { title: "Write with Jenni AI", description: "Draft your paper" }] },
    { title: "Create a Video Course", slug: "create-a-video-course", description: "Build and publish an online video course with AI assistance.", icon: "Video", difficulty: "intermediate", estimatedTime: "1-2 weeks", category: "Content Creation", steps: [{ title: "Outline with Notion AI", description: "Plan your curriculum" }, { title: "Script with Claude", description: "Write lesson scripts" }, { title: "Record with Screen Studio", description: "Record high-quality videos" }, { title: "Edit with Descript", description: "AI-powered post-production" }] },
  ]

  const allTools = await prisma.aiTool.findMany({ select: { id: true, slug: true } })
  const toolMap = new Map(allTools.map((t) => [t.slug, t.id]))

  for (const uc of useCases) {
    const exists = await prisma.useCase.findUnique({ where: { slug: uc.slug } })
    if (exists) continue
    const useCase = await prisma.useCase.create({ data: { title: uc.title, slug: uc.slug, description: uc.description, icon: uc.icon, difficulty: uc.difficulty, estimatedTime: uc.estimatedTime, category: uc.category, steps: uc.steps } })
    // Link 2-4 random tools
    const shuffled = [...allTools].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3))
    for (let i = 0; i < shuffled.length; i++) {
      await prisma.useCaseTool.create({ data: { useCaseId: useCase.id, toolId: shuffled[i].id, order: i } }).catch(() => {})
    }
    console.log(`  Created use case: ${uc.title}`)
  }

  // ── Prompts ──
  const promptsData = [
    { toolSlug: "chatgpt", title: "Code Review Prompt", content: "Review the following code for bugs, performance issues, and best practices. Provide specific suggestions for improvement:\n\n```\n[PASTE CODE HERE]\n```", description: "Get AI to review your code", category: "Coding", difficulty: "intermediate" },
    { toolSlug: "chatgpt", title: "Brainstorming Assistant", content: "I need to brainstorm ideas for [TOPIC]. Generate 10 creative ideas, each with a brief description and potential impact. Consider different angles and unconventional approaches.", description: "Generate creative ideas", category: "Creativity", difficulty: "beginner" },
    { toolSlug: "chatgpt", title: "Email Writer", content: "Write a professional email about [SUBJECT] to [RECIPIENT]. The tone should be [FORMAL/CASUAL]. Include a clear subject line, greeting, body, and closing.", description: "Craft professional emails", category: "Writing", difficulty: "beginner" },
    { toolSlug: "claude", title: "Long-Form Article Writer", content: "Write a comprehensive article about [TOPIC]. Include an engaging introduction, 5-7 main sections with subheadings, concrete examples, and a conclusion with key takeaways. Target length: 2000 words.", description: "Generate long-form content", category: "Writing", difficulty: "intermediate" },
    { toolSlug: "claude", title: "Document Analyzer", content: "Analyze this document and provide: 1) A concise summary (2-3 sentences), 2) Key findings and insights, 3) Potential gaps or issues, 4) Actionable recommendations:\n\n[DOCUMENT TEXT]", description: "Analyze documents in depth", category: "Analysis", difficulty: "advanced" },
    { toolSlug: "claude", title: "Socratic Tutor", content: "Act as a Socratic tutor. Help me understand [TOPIC] by asking guiding questions rather than giving direct answers. Challenge my assumptions and help me discover the answers myself.", description: "Learn through guided questions", category: "Education", difficulty: "beginner" },
    { toolSlug: "midjourney", title: "Product Photography Prompt", content: "Professional product photography of [PRODUCT], studio lighting, white background, high angle, 8K, commercial photography, sharp focus, clean composition --ar 4:3 --v 6", description: "Generate product photos", category: "Image", difficulty: "intermediate" },
    { toolSlug: "midjourney", title: "Character Design Prompt", content: "Fantasy character design, [DESCRIPTION], full body, concept art, trending on ArtStation, intricate details, dramatic lighting, --ar 2:3 --v 6 --style raw", description: "Design original characters", category: "Image", difficulty: "intermediate" },
    { toolSlug: "dalle-3", title: "Illustration Generator", content: "Create a children's book illustration of [SCENE]. Use warm colors, soft textures, and whimsical style. The mood should be [MOOD]. Include [SPECIFIC ELEMENTS].", description: "Generate storybook illustrations", category: "Image", difficulty: "beginner" },
    { toolSlug: "github-copilot", title: "Test Generator", content: "// Generate comprehensive unit tests for the following function\n// Include edge cases, failure scenarios, and happy path tests\n// Use the same testing framework as the project", description: "Auto-generate unit tests", category: "Coding", difficulty: "intermediate" },
    { toolSlug: "cursor", title: "Refactor Command", content: "Refactor this code to improve readability and maintainability. Apply SOLID principles, extract reusable functions, add proper TypeScript types, and improve naming.", description: "Refactor code with AI", category: "Coding", difficulty: "advanced" },
    { toolSlug: "elevenlabs", title: "Narration Script", content: "[SCENE DESCRIPTION]\n\nNarrator (warm, professional tone): [NARRATION TEXT]\n\nCharacter A (excited, energetic): [DIALOGUE]\n\nCharacter B (calm, measured): [DIALOGUE]", description: "Script for voice narration", category: "Voice", difficulty: "beginner" },
    { toolSlug: "grammarly", title: "Tone Adjustment", content: "Rewrite the following text to be more [FORMAL/CASUAL/CONVINCING/EMPATHETIC] while preserving the core message:\n\n[TEXT]", description: "Adjust writing tone", category: "Writing", difficulty: "beginner" },
    { toolSlug: "perplexity-ai", title: "Deep Research Query", content: "Research [TOPIC] comprehensively. Include: recent developments (2024-2025), key researchers/companies, controversies, future predictions, and practical applications. Cite sources.", description: "Conduct deep research", category: "Research", difficulty: "advanced" },
    { toolSlug: "canva", title: "Brand Kit Setup", content: "Design a brand kit including: color palette (5 colors), typography pairings (heading + body), logo variations, social media templates, and brand guidelines. Style: [MODERN/MINIMAL/BOLD].", description: "Create a brand identity", category: "Design", difficulty: "intermediate" },
    { toolSlug: "notion-ai", title: "Project Plan Generator", content: "Create a project plan for [PROJECT]. Include: objectives, timeline (with milestones), resource requirements, risk assessment, success metrics, and team roles.", description: "Generate project plans", category: "Productivity", difficulty: "intermediate" },
    { toolSlug: "jasper", title: "Ad Copy Generator", content: "Write 5 variations of Facebook ad copy for [PRODUCT/SERVICE]. Each variation should target a different angle: 1) Problem/Solution, 2) Social Proof, 3) Fear of Missing Out, 4) Value Proposition, 5) Storytelling.", description: "Generate ad variations", category: "Marketing", difficulty: "intermediate" },
    { toolSlug: "zapier", title: "Workflow Automation Prompt", content: "Design a Zapier workflow that:\n1. Trigger: [TRIGGER EVENT]\n2. Action 1: [FIRST ACTION]\n3. Condition: [IF/THEN LOGIC]\n4. Action 2: [SECOND ACTION]\n5. Notification: [HOW TO NOTIFY]", description: "Design automations", category: "Automation", difficulty: "advanced" },
    { toolSlug: "runway", title: "Video Style Prompt", content: "Transform this video with [STYLE] aesthetic. Apply consistent color grading, add [EFFECTS], maintain [MOOD] throughout. Output format: [RESOLUTION] at [FPS] fps.", description: "Apply video styles", category: "Video", difficulty: "intermediate" },
    { toolSlug: "capcut", title: "Auto-Editing Preset", content: "Create an editing preset for [CONTENT TYPE]. Include: transition style, color grade, text overlay template, background music mood, and export settings optimized for [PLATFORM].", description: "Video editing presets", category: "Video", difficulty: "beginner" },
    { toolSlug: "adobe-firefly", title: "Vector Art Prompt", content: "Create a vector illustration of [SUBJECT] in [STYLE] style. Use clean lines, flat colors, and scalable design. Include [SPECIFIC ELEMENTS]. Format: SVG.", description: "Generate vector art", category: "Image", difficulty: "intermediate" },
    { toolSlug: "looka", title: "Logo Design Brief", content: "Design a logo for [COMPANY NAME] in [INDUSTRY]. Preferred style: [MODERN/CLASSIC/MINIMAL]. Colors: [PREFERENCES]. The logo should convey [FEELING/VALUE].", description: "Brief for logo design", category: "Design", difficulty: "beginner" },
    { toolSlug: "synthesia", title: "AI Avatar Script", content: "Create a talking head video script for [TOPIC]. Duration: [TIME]. Tone: [PROFESSIONAL/CASUAL]. Include: hook, key points (3-5), call to action. The presenter should use [HAND GESTURES/VISUAL AIDS].", description: "Script for AI avatars", category: "Video", difficulty: "intermediate" },
    { toolSlug: "descript", title: "Podcast Edit Guide", content: "Edit this podcast episode: remove filler words (um, ah, like), normalize audio levels, add intro/outro music, generate show notes, and create social media clips (30-60 seconds).", description: "AI podcast editing", category: "Video", difficulty: "intermediate" },
    { toolSlug: "ollama", title: "Local Model Setup", content: "Pull and run [MODEL NAME] locally:\n\n```bash\nollama pull [MODEL]\nollama run [MODEL]\n```\n\nThen configure with:\n```bash\nollama create mymodel -f Modelfile\n```", description: "Run models locally", category: "Local AI", difficulty: "intermediate" },
  ]

  for (const p of promptsData) {
    const tool = toolMap.get(p.toolSlug)
    if (!tool) continue
    await prisma.prompt.create({
      data: {
        toolId: tool,
        title: p.title,
        content: p.content,
        description: p.description,
        category: p.category,
        difficulty: p.difficulty,
        isOfficial: true,
        useCount: Math.floor(Math.random() * 500),
      },
    }).catch(() => {})
  }
  console.log(`  Created ${promptsData.length} prompts`)

  // ── Stacks ──
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  if (admin) {
    const stackDefs = [
      { name: "YouTube Creator Pipeline", emoji: "Video", description: "Full production pipeline for YouTube content creators", tools: ["chatgpt", "midjourney", "elevenlabs", "capcut", "canva"] },
      { name: "AI Writing Studio", emoji: "PenTool", description: "Complete writing workflow from research to publication", tools: ["perplexity-ai", "claude", "grammarly", "notion-ai"] },
      { name: "Development Power Suite", emoji: "Code2", description: "Everything a developer needs to build with AI", tools: ["github-copilot", "cursor", "claude", "replit"] },
      { name: "Design Sprint Kit", emoji: "Palette", description: "Rapid design prototyping with AI assistance", tools: ["midjourney", "canva", "adobe-firefly", "looka"] },
      { name: "Data Science Lab", emoji: "BarChart3", description: "AI-powered data analysis and visualization stack", tools: ["chatgpt", "notion-ai", "claude", "perplexity-ai"] },
    ]

    for (const sd of stackDefs) {
      const existing = await prisma.stack.findFirst({ where: { name: sd.name, userId: admin.id } })
      if (existing) continue
      const stack = await prisma.stack.create({
        data: { name: sd.name, emoji: sd.emoji, description: sd.description, userId: admin.id, isPublic: true, likeCount: Math.floor(Math.random() * 50) },
      })
      const toolIds = sd.tools.map((slug) => toolMap.get(slug)).filter(Boolean) as string[]
      for (let i = 0; i < toolIds.length; i++) {
        await prisma.stackItem.create({ data: { stackId: stack.id, toolId: toolIds[i], order: i } }).catch(() => {})
      }
      console.log(`  Created stack: ${sd.name}`)
    }
  }

  // ── Final Summary ──
  console.log("\n=== Seed Summary ===")
  for (const [name, model] of Object.entries({
    "Learning Paths": "learningPath",
    Prompts: "prompt",
    "Use Cases": "useCase",
    Stacks: "stack",
  })) {
    const count = await (prisma as any)[model].count()
    console.log(`  ${name}: ${count}`)
  }

  await prisma.$disconnect()
  console.log("\nNew model seeding complete!")
}

main().catch((e) => { console.error(e); process.exit(1) })
