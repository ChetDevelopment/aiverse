import { PrismaClient, PricingModel } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const categories = [
  { name: "Chat AI", slug: "chat-ai", description: "AI chatbots and conversational agents", icon: "chat-ai", order: 1 },
  { name: "Coding", slug: "coding", description: "AI tools for software development", icon: "coding", order: 2 },
  { name: "Image", slug: "image", description: "AI image generation and editing", icon: "image", order: 3 },
  { name: "Video", slug: "video", description: "AI video creation and editing", icon: "video", order: 4 },
  { name: "Voice", slug: "voice", description: "AI voice and speech tools", icon: "voice", order: 5 },
  { name: "Marketing", slug: "marketing", description: "AI marketing and advertising tools", icon: "marketing", order: 6 },
  { name: "Writing", slug: "writing", description: "AI writing and content creation", icon: "writing", order: 7 },
  { name: "Productivity", slug: "productivity", description: "AI productivity assistants", icon: "productivity", order: 8 },
  { name: "Business", slug: "business", description: "AI business tools", icon: "business", order: 9 },
  { name: "Education", slug: "education", description: "AI educational tools", icon: "education", order: 10 },
  { name: "Automation", slug: "automation", description: "AI automation tools", icon: "automation", order: 11 },
  { name: "Open Source", slug: "open-source", description: "Open source AI tools and frameworks", icon: "open-source", order: 12 },
  { name: "Local AI", slug: "local-ai", description: "Run AI models locally on your hardware", icon: "local-ai", order: 13 },
  { name: "AI Agents", slug: "ai-agents", description: "Autonomous AI agents and frameworks", icon: "ai-agents", order: 14 },
  { name: "LLMs", slug: "llms", description: "Large language models and model providers", icon: "llms", order: 15 },
]

async function main() {
  console.log("Seeding database...")

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }

  const existingTools = await prisma.aiTool.count()
  if (existingTools === 0) {
    const chatCategory = await prisma.category.findUnique({ where: { slug: "chat-ai" } })
    const codingCategory = await prisma.category.findUnique({ where: { slug: "coding" } })
    const imageCategory = await prisma.category.findUnique({ where: { slug: "image" } })
    const writingCategory = await prisma.category.findUnique({ where: { slug: "writing" } })

    const tools = [
      {
        name: "ChatGPT", slug: "chatgpt", tagline: "Advanced AI chatbot for conversations, writing, and problem-solving",
        description: "ChatGPT is an AI-powered chatbot developed by OpenAI. It can answer questions, write content, generate code, and assist with a wide variety of tasks.",
        websiteUrl: "https://chat.openai.com", pricing: "FREEMIUM" as PricingModel, pricingDetail: "Free tier available. ChatGPT Plus starts at $20/month",
        logo: "https://www.google.com/s2/favicons?domain=chat.openai.com&sz=64", isFeatured: true, isPublished: true, featuredScore: 100, categoryIds: [chatCategory!.id],
      },
      {
        name: "GitHub Copilot", slug: "github-copilot", tagline: "AI pair programmer that helps you write better code faster",
        description: "GitHub Copilot is an AI coding assistant that provides real-time code suggestions as you type.",
        websiteUrl: "https://github.com/features/copilot", pricing: "PAID" as PricingModel, pricingDetail: "$10/month for individuals",
        logo: "https://www.google.com/s2/favicons?domain=github.com&sz=64", startingPrice: 10, isFeatured: true, isPublished: true, featuredScore: 95, categoryIds: [codingCategory!.id],
      },
      {
        name: "Midjourney", slug: "midjourney", tagline: "Generate stunning images from text descriptions using AI",
        description: "Midjourney is an AI image generation tool that creates high-quality, artistic images from natural language descriptions.",
        websiteUrl: "https://midjourney.com", pricing: "PAID" as PricingModel, pricingDetail: "Starts at $10/month",
        logo: null, startingPrice: 10, isFeatured: true, isPublished: true, featuredScore: 90, categoryIds: [imageCategory!.id],
      },
      {
        name: "Claude", slug: "claude", tagline: "Anthropic's helpful, honest, and harmless AI assistant",
        description: "Claude is an AI assistant created by Anthropic with a focus on safety and reliability. It excels at detailed analysis and long-form content.",
        websiteUrl: "https://claude.ai", pricing: "FREEMIUM" as PricingModel, pricingDetail: "Free tier available. Claude Pro at $20/month",
        logo: "https://www.google.com/s2/favicons?domain=claude.ai&sz=64", isFeatured: true, isPublished: true, featuredScore: 85, categoryIds: [chatCategory!.id],
      },
      {
        name: "Jasper", slug: "jasper", tagline: "AI content platform for marketing copy and brand content",
        description: "Jasper is an AI writing assistant designed for marketing teams and content creators.",
        websiteUrl: "https://jasper.ai", pricing: "PAID" as PricingModel, pricingDetail: "Starts at $39/month",
        startingPrice: 39, isFeatured: false, isPublished: true, featuredScore: 70, categoryIds: [writingCategory!.id],
      },
      {
        name: "Perplexity AI", slug: "perplexity-ai", tagline: "AI-powered answer engine with real-time web search",
        description: "Perplexity AI is an AI search engine that provides accurate, cited answers to complex questions.",
        websiteUrl: "https://perplexity.ai", pricing: "FREEMIUM" as PricingModel, pricingDetail: "Free tier available. Pro at $20/month",
        logo: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64", isFeatured: true, isPublished: true, featuredScore: 80, categoryIds: [chatCategory!.id],
      },
    ]

    for (const tool of tools) {
      const { categoryIds, ...toolData } = tool
      const created = await prisma.aiTool.create({
        data: { ...toolData, categories: { create: categoryIds.map((categoryId) => ({ categoryId })) } },
      })
      console.log(`Created tool: ${created.name}`)
    }
  }

  const chatCategory2 = await prisma.category.findUnique({ where: { slug: "chat-ai" } })
  const codingCategory2 = await prisma.category.findUnique({ where: { slug: "coding" } })
  const imageCategory2 = await prisma.category.findUnique({ where: { slug: "image" } })
  const writingCategory2 = await prisma.category.findUnique({ where: { slug: "writing" } })
  const osCategory = await prisma.category.findUnique({ where: { slug: "open-source" } })
  const localAiCategory = await prisma.category.findUnique({ where: { slug: "local-ai" } })
  const agentsCategory = await prisma.category.findUnique({ where: { slug: "ai-agents" } })
  const llmsCategory = await prisma.category.findUnique({ where: { slug: "llms" } })

  const moreTools = [
    {
      name: "Ollama", slug: "ollama", tagline: "Run popular LLMs locally with one command",
      description: "Ollama lets you run large language models like Llama 3, Mistral, and Gemma locally on your machine. Simple setup, no GPU required for smaller models.",
      websiteUrl: "https://ollama.ai", pricing: "FREE" as PricingModel, pricingDetail: "100% free and open source",
        logo: "https://www.google.com/s2/favicons?domain=ollama.ai&sz=64", isFeatured: true, isPublished: true, isOpenSource: true, isEthical: true, featuredScore: 90, categoryIds: [localAiCategory!.id, osCategory!.id],
    },
    {
      name: "Llama 3", slug: "llama-3", tagline: "Meta's most capable open-source LLM",
      description: "Llama 3 is Meta's latest open-source large language model. Available in 8B and 70B parameter sizes, it rivals proprietary models in performance.",
      websiteUrl: "https://llama.meta.com", pricing: "FREE" as PricingModel, pricingDetail: "Open source, free to use",
        logo: "https://www.google.com/s2/favicons?domain=meta.com&sz=64", isFeatured: true, isPublished: true, isOpenSource: true, featuredScore: 88, categoryIds: [llmsCategory!.id, osCategory!.id],
    },
    {
      name: "Mistral AI", slug: "mistral", tagline: "Powerful open-weight language models",
      description: "Mistral AI offers state-of-the-art open-weight models including Mistral 7B and Mixtral 8x7B. Known for efficiency and strong performance.",
      websiteUrl: "https://mistral.ai", pricing: "FREEMIUM" as PricingModel, pricingDetail: "Open weights + paid API access",
      logo: "https://www.google.com/s2/favicons?domain=mistral.ai&sz=64", isFeatured: true, isPublished: true, featuredScore: 85, categoryIds: [llmsCategory!.id, osCategory!.id],
    },
    {
      name: "LangChain", slug: "langchain", tagline: "Build AI-powered applications with LLMs",
      description: "LangChain is a framework for developing applications powered by language models. Supports chains, agents, retrieval, and tool use.",
      websiteUrl: "https://langchain.com", pricing: "FREE" as PricingModel, pricingDetail: "Open source framework",
        logo: "https://www.google.com/s2/favicons?domain=langchain.com&sz=64", isFeatured: true, isPublished: true, isOpenSource: true, featuredScore: 82, categoryIds: [agentsCategory!.id, osCategory!.id],
    },
    {
      name: "AutoGPT", slug: "autogpt", tagline: "Autonomous AI agent that accomplishes goals",
      description: "AutoGPT is an experimental open-source application that uses GPT-4 to autonomously achieve user-defined goals by breaking them into subtasks.",
      websiteUrl: "https://agpt.co", pricing: "FREE" as PricingModel, pricingDetail: "Open source",
        logo: "https://www.google.com/s2/favicons?domain=agpt.co&sz=64", isFeatured: false, isPublished: true, isOpenSource: true, featuredScore: 75, categoryIds: [agentsCategory!.id, osCategory!.id],
    },
    {
      name: "LM Studio", slug: "lm-studio", tagline: "Run local LLMs with a GUI",
      description: "LM Studio provides a desktop application for downloading and running open-source language models locally. Features a chat interface and OpenAI-compatible local server.",
      websiteUrl: "https://lmstudio.ai", pricing: "FREE" as PricingModel, pricingDetail: "Free desktop app",
      logo: "https://www.google.com/s2/favicons?domain=lmstudio.ai&sz=64", isFeatured: false, isPublished: true, featuredScore: 72, categoryIds: [localAiCategory!.id],
    },
    {
      name: "llama.cpp", slug: "llama-cpp", tagline: "Run LLMs on CPU with quantization",
      description: "llama.cpp enables running large language models on consumer hardware using CPU with optimized quantization techniques. Supports many model formats.",
      websiteUrl: "https://github.com/ggerganov/llama.cpp", pricing: "FREE" as PricingModel, pricingDetail: "Open source",
        logo: "https://www.google.com/s2/favicons?domain=github.com&sz=64", isFeatured: false, isPublished: true, isOpenSource: true, isEthical: true, featuredScore: 70, categoryIds: [localAiCategory!.id, osCategory!.id],
    },
    {
      name: "Stable Diffusion", slug: "stable-diffusion", tagline: "Open-source AI image generation",
      description: "Stable Diffusion is a deep learning text-to-image model released by Stability AI. Can run locally or via cloud APIs.",
      websiteUrl: "https://stability.ai", pricing: "FREE" as PricingModel, pricingDetail: "Open source model + paid API",
        logo: "https://www.google.com/s2/favicons?domain=stability.ai&sz=64", isFeatured: true, isPublished: true, isOpenSource: true, featuredScore: 80, categoryIds: [osCategory!.id, imageCategory2!.id],
    },
    {
      name: "Hugging Face", slug: "hugging-face", tagline: "The AI community's model hub",
      description: "Hugging Face is the leading platform for hosting, sharing, and using AI models. Over 500,000 models available including transformers, diffusers, and more.",
      websiteUrl: "https://huggingface.co", pricing: "FREEMIUM" as PricingModel, pricingDetail: "Free tier + paid inference API",
        logo: "https://www.google.com/s2/favicons?domain=huggingface.co&sz=64", isFeatured: true, isPublished: true, isOpenSource: true, isEthical: true, featuredScore: 95, categoryIds: [osCategory!.id, llmsCategory!.id],
    },
  ]

  for (const tool of moreTools) {
    const { categoryIds, ...toolData } = tool
    try {
      const created = await prisma.aiTool.create({
        data: { ...toolData, categories: { create: categoryIds.map((categoryId) => ({ categoryId })) } },
      })
      console.log(`Created tool: ${created.name}`)
    } catch (e) {
      console.log(`Skipped: ${tool.name} (may already exist)`)
    }
  }

  const existingDeals = await prisma.freeDeal.count()
  if (existingDeals === 0) {
    const ollama = await prisma.aiTool.findUnique({ where: { slug: "ollama" } })
    const hf = await prisma.aiTool.findUnique({ where: { slug: "hugging-face" } })

    await prisma.freeDeal.createMany({
      data: [
        { toolName: "Ollama", toolSlug: "ollama", description: "Run Llama 3, Mistral, and more LLMs locally for free. No GPU required for smaller models.", dealType: "open-source", link: "https://ollama.ai", toolId: ollama?.id, verified: true },
        { toolName: "Hugging Face", toolSlug: "hugging-face", description: "Access 500k+ free AI models. Free inference API with rate limits.", dealType: "free-tier", link: "https://huggingface.co", toolId: hf?.id, verified: true },
        { toolName: "ChatGPT", toolSlug: "chatgpt", description: "Free tier includes GPT-3.5 access with unlimited messages.", dealType: "free-tier", link: "https://chat.openai.com", verified: true },
        { toolName: "Claude", toolSlug: "claude", description: "Free tier with limited messages on Claude 3 Sonnet.", dealType: "free-tier", link: "https://claude.ai", verified: true },
        { toolName: "Stable Diffusion", toolSlug: "stable-diffusion", description: "Fully open-source image generation. Run locally or use free online demos.", dealType: "open-source", link: "https://stability.ai", verified: true },
      ],
    })
    console.log("Created sample deals")
  }

  console.log("Seeding complete!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
