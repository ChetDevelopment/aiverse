import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString: url })
const prisma = new PrismaClient({ adapter })

const PROMPTS = [
  // === IMAGE GENERATION PROMPTS (with preview images) ===
  {
    toolSlug: "midjourney",
    title: "Professional Product Photography",
    content: `Professional product photography of [product name], studio lighting, white background, high angle, 8K, commercial photography, sharp focus, clean composition, shadow play, minimalist --ar 4:3 --v 6`,
    description: "Create stunning product photos with professional studio lighting and clean composition.",
    category: "image", difficulty: "intermediate",
    previewImage: "https://images.unsplash.com/photo-1542295669297-4d352b042bca?w=400&h=300&fit=crop",
    resultExample: "A crisp, professionally lit product shot with soft shadows and clean background.",
  },
  {
    toolSlug: "midjourney",
    title: "Fantasy Character Design",
    content: `Fantasy character design, [describe character], full body, concept art, trending on ArtStation, intricate details, dramatic lighting, cinematic, volumetric fog, depth of field --ar 2:3 --v 6 --style raw`,
    description: "Design detailed fantasy characters with dramatic cinematic lighting.",
    category: "image", difficulty: "intermediate",
    previewImage: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=300&fit=crop",
    resultExample: "A richly detailed fantasy character with dramatic side lighting and atmospheric depth.",
  },
  {
    toolSlug: "midjourney",
    title: "Architecture Visualization",
    content: `Modern architectural visualization of a [building type], futuristic design, clean lines, golden hour lighting, photorealistic, 8K, architectural photography, award-winning, reflection pools --ar 16:9 --v 6`,
    description: "Generate photorealistic architectural visualizations with stunning lighting.",
    category: "image", difficulty: "advanced",
    previewImage: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop",
    resultExample: "A photorealistic modern building rendered in golden hour light with reflections.",
  },
  {
    toolSlug: "midjourney",
    title: "Logo Design Minimalist",
    content: `Minimalist logo for [company name], [industry], clean vector style, geometric shapes, two colors, professional, scalable, white background --ar 1:1 --v 6`,
    description: "Design clean, professional logos with geometric shapes and minimal color palettes.",
    category: "image", difficulty: "beginner",
    previewImage: "https://images.unsplash.com/photo-1559827291-baf8f2a7ef43?w=400&h=300&fit=crop",
    resultExample: "A clean, minimal logo with geometric elements and professional spacing.",
  },
  {
    toolSlug: "dalle-3",
    title: "Children's Book Illustration",
    content: "Create a children's book illustration of [scene]. Use warm watercolor style, soft textures, and whimsical characters. The mood should be magical and friendly. Include detailed background elements.",
    description: "Generate warm, whimsical children's book illustrations with watercolor style.",
    category: "image", difficulty: "beginner",
    previewImage: "https://images.unsplash.com/photo-1513001900722-370f803f498d?w=400&h=300&fit=crop",
    resultExample: "A warm, whimsical scene with soft watercolor textures and gentle color gradients.",
  },
  {
    toolSlug: "stable-diffusion",
    title: "Cyberpunk City Scene",
    content: "cyberpunk city street at night, neon lights reflecting on wet pavement, flying cars, holographic advertisements, rain, volumetric lighting, ultra detailed, 8K, cinematic composition, blade runner aesthetic",
    description: "Create detailed cyberpunk cityscapes with neon atmospheres and cinematic quality.",
    category: "image", difficulty: "intermediate",
    previewImage: "https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=400&h=300&fit=crop",
    resultExample: "A moody cyberpunk street scene with vibrant neon reflections and deep shadows.",
  },
  {
    toolSlug: "midjourney",
    title: "Food Photography Editorial",
    content: `Editorial food photography of [dish name], overhead flat lay, natural window lighting, wooden table, fresh ingredients scattered, shallow depth of field, appetite appeal, magazine quality --ar 4:3 --v 6`,
    description: "Create magazine-quality food photography with natural lighting and artful composition.",
    category: "image", difficulty: "intermediate",
    previewImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    resultExample: "A beautifully composed flat-lay food photograph with natural light and rich textures.",
  },

  // === CODING PROMPTS (with result examples) ===
  {
    toolSlug: "github-copilot",
    title: "React Component Generator",
    content: `// Generate a reusable React component with the following specifications:
// - Component name: [Name]
// - Props: [list props]
// - Uses TypeScript
// - Includes proper error handling
// - Loading state
// - Empty state
// - Responsive design
// - Uses Tailwind CSS classes`,
    description: "Generate production-ready React components with TypeScript, error handling, and responsive styles.",
    category: "coding", difficulty: "intermediate",
    resultExample: "A fully typed React component with loading skeletons, error boundaries, and responsive Tailwind styles.",
  },
  {
    toolSlug: "github-copilot",
    title: "API Route Handler",
    content: `// Create a Next.js API route handler that:
// 1. Validates input using Zod
// 2. Handles authentication
// 3. Implements rate limiting
// 4. Returns consistent response format
// 5. Logs errors properly
// 6. Has proper HTTP status codes`,
    description: "Build production-ready API routes with validation, auth, and error handling.",
    category: "coding", difficulty: "advanced",
    resultExample: "A secure API handler with Zod validation, rate limiting, and consistent error responses.",
  },
  {
    toolSlug: "cursor",
    title: "Database Schema Designer",
    content: "Design a Prisma schema for [project type] with: User model with roles, main entity with relations, audit fields (createdAt, updatedAt), proper indexes, cascade deletes, unique constraints, and enum types where appropriate.",
    description: "Design optimized database schemas with proper relations, indexes, and constraints.",
    category: "coding", difficulty: "intermediate",
    resultExample: "A complete Prisma schema with all relations, indexes, and cascade rules properly defined.",
  },
  {
    toolSlug: "cursor",
    title: "Full Stack Feature Builder",
    content: `Build a [feature name] feature for a Next.js application:
Full stack implementation including:
- Database model (Prisma)
- API route with validation
- Server/page component
- Loading state
- Empty state
- Error handling
- Tests`,
    description: "Build complete full-stack features from database to UI with testing.",
    category: "coding", difficulty: "advanced",
    resultExample: "A complete full-stack feature with Prisma model, API endpoint, React components, and tests.",
  },
  {
    toolSlug: "claude",
    title: "Code Review & Optimization",
    content: "Review the following code for: bugs, security vulnerabilities, performance issues, TypeScript strictness, accessibility problems, and anti-patterns. Provide specific, actionable fixes for each issue found:\n\n```\n[PASTE CODE HERE]\n```",
    description: "Get comprehensive code reviews covering bugs, security, performance, and accessibility.",
    category: "coding", difficulty: "intermediate",
    resultExample: "A detailed code review with specific fixes for bugs, security issues, and performance improvements.",
  },
  {
    toolSlug: "chatgpt",
    title: "SQL Query Optimizer",
    content: "I have the following SQL query that is running slow. Please optimize it:\n\n[PASTE SLOW QUERY]\n\nTable schemas:\n[PAUSE SCHEMAS]\n\nPlease provide: 1. Optimized query, 2. Indexes to add, 3. Estimated performance gain",
    description: "Optimize slow SQL queries with proper indexes and query restructuring.",
    category: "coding", difficulty: "advanced",
    resultExample: "An optimized query with suggested indexes showing 10x+ performance improvement.",
  },

  // === WRITING PROMPTS ===
  {
    toolSlug: "chatgpt",
    title: "SEO Blog Post Writer",
    content: "Write a comprehensive blog post about [TOPIC]. Target keyword: [KEYWORD]. Include: attention-grabbing headline (H1), 5-7 H2 sections with 2-3 paragraphs each, FAQ section with 5 questions, meta description (under 160 chars), internal linking suggestions, target length: 1500-2000 words. Use conversational tone.",
    description: "Generate SEO-optimized blog posts with proper heading structure and keyword placement.",
    category: "writing", difficulty: "intermediate",
    resultExample: "A 1800-word SEO blog post with optimized headers, FAQ section, and meta description.",
  },
  {
    toolSlug: "claude",
    title: "Academic Paper Outline",
    content: "Create a detailed outline for an academic paper on [TOPIC]. Include: research question, literature review structure (5-7 key papers to cite), methodology section, expected findings, discussion points, conclusion. Follow APA 7th edition format. Suggest 3 potential titles.",
    description: "Structure academic papers with proper research methodology and citation format.",
    category: "writing", difficulty: "advanced",
    resultExample: "A complete paper outline with APA 7th edition formatting and literature review structure.",
  },
  {
    toolSlug: "grammarly",
    title: "Tone Adjuster",
    content: "Rewrite the following text to be more [FORMAL/CASUAL/PROFESSIONAL/PERSUASIVE/EMPATHETIC] while preserving the core message and key information. Adjust vocabulary, sentence structure, and rhythm accordingly:\n\n[TEXT]",
    description: "Adapt any text to match your desired tone while keeping the original meaning.",
    category: "writing", difficulty: "beginner",
    resultExample: "The same message rewritten in a professional tone with refined vocabulary and structure.",
  },
  {
    toolSlug: "jasper",
    title: "Social Media Content Calendar",
    content: "Create a 1-month social media content calendar for [BRAND] in [INDUSTRY]. Include: 4 posts per week across LinkedIn, Twitter, and Instagram. Each post should have: headline, body text (under 280 chars for Twitter), hashtags (5-10), best posting time, visual description, and CTA.",
    description: "Plan monthly social media content with platform-optimized posts and scheduling.",
    category: "writing", difficulty: "intermediate",
    resultExample: "A complete 30-day content calendar with platform-specific posts optimized for engagement.",
  },
  {
    toolSlug: "copy-ai",
    title: "Cold Email Sequence",
    content: "Write a 5-email cold outreach sequence for [PRODUCT/SERVICE] targeting [TARGET AUDIENCE]. Each email should: have a compelling subject line, personalize the opening, state the value proposition, include social proof, have a single CTA. Emails 2-5 should handle objections, provide case studies, offer demos, and create urgency.",
    description: "Build effective cold email sequences that convert prospects into customers.",
    category: "writing", difficulty: "advanced",
    resultExample: "A 5-part email sequence with tested subject lines, objection handling, and clear CTAs.",
  },

  // === BUSINESS PROMPTS ===
  {
    toolSlug: "chatgpt",
    title: "Business Plan Generator",
    content: "Create a comprehensive business plan for [IDEA]. Include: executive summary, company description, market analysis (TAM, SAM, SOM), competitive analysis (use Porter's Five Forces), marketing strategy, operational plan, financial projections (3-year), funding requirements, risk assessment. Format each section with bullet points.",
    description: "Generate complete business plans with market analysis, financials, and risk assessment.",
    category: "business", difficulty: "advanced",
    resultExample: "A professional business plan with market sizing, competitive analysis, and financial projections.",
  },
  {
    toolSlug: "notion-ai",
    title: "Project Kickoff Document",
    content: "Create a project kickoff document for [PROJECT NAME]. Include: project charter, stakeholder map, communication plan, risk register, milestone timeline, team roles and responsibilities, success metrics, budget overview, tools and resources needed.",
    description: "Structure project kickoffs with charters, timelines, risk registers, and success metrics.",
    category: "business", difficulty: "intermediate",
    resultExample: "A complete project kickoff document with charter, timeline, risks, and success metrics.",
  },
  {
    toolSlug: "chatgpt",
    title: "SWOT Analysis Framework",
    content: "Conduct a SWOT analysis for [COMPANY/PRODUCT]. For each category (Strengths, Weaknesses, Opportunities, Threats), provide 5-7 specific, actionable points. Then provide a TOWS matrix showing how to: leverage strengths for opportunities, overcome weaknesses to pursue opportunities, use strengths to mitigate threats, and address weaknesses against threats.",
    description: "Perform strategic SWOT analyses with actionable TOWS matrix recommendations.",
    category: "business", difficulty: "intermediate",
    resultExample: "A detailed SWOT analysis with TOWS matrix showing strategic action items.",
  },
  {
    toolSlug: "perplexity-ai",
    title: "Market Research Report",
    content: "Research [INDUSTRY/MARKET] comprehensively. Include: market size and growth rate (with sources), key players and market share, recent funding/ M&A activity, emerging trends, regulatory changes, consumer behavior shifts, technology disruptions, and 3-5 year outlook. Cite all sources.",
    description: "Conduct in-depth market research with cited sources and competitive analysis.",
    category: "business", difficulty: "advanced",
    resultExample: "A comprehensive market research report with cited data, trends, and competitive landscape.",
  },

  // === CREATIVE PROMPTS ===
  {
    toolSlug: "midjourney",
    title: "Album Cover Art",
    content: `Album cover design for [band/genre], surrealist style, vibrant colors, psychedelic elements, vinyl texture overlay, optical illusion, award-winning design, 3000x3000 --ar 1:1 --v 6 --style raw --s 250`,
    description: "Design eye-catching album covers with surrealist elements and vibrant colors.",
    category: "creative", difficulty: "intermediate",
    previewImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    resultExample: "A surreal album cover with vibrant psychedelic colors and optical illusion elements.",
  },
  {
    toolSlug: "midjourney",
    title: "Tattoo Design Flash",
    content: `Tattoo design of [subject], traditional American style, bold black outlines, limited color palette (red, green, yellow, black), flash art style, clean white background, symmetrical composition --ar 3:4 --v 6`,
    description: "Create traditional-style tattoo designs with bold lines and classic color schemes.",
    category: "creative", difficulty: "intermediate",
    previewImage: "https://images.unsplash.com/photo-1564648351416-3eec9f3e85ab?w=400&h=300&fit=crop",
    resultExample: "A bold traditional tattoo flash design with classic Americana styling.",
  },
  {
    toolSlug: "midjourney",
    title: "Interior Design Mood Board",
    content: `Interior design mood board for [room type], [style: modern/bohemian/minimalist/industrial], color palette: [colors], texture collage, material samples, furniture silhouettes, lighting scheme, 4K, professional interior design presentation --ar 16:9 --v 6`,
    description: "Create professional interior design mood boards with color palettes and material samples.",
    category: "creative", difficulty: "beginner",
    previewImage: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=300&fit=crop",
    resultExample: "A professional mood board with curated colors, textures, and furniture selections.",
  },
  {
    toolSlug: "dalle-3",
    title: "Board Game Concept Art",
    content: "Create concept art for a board game called [GAME NAME]. Show the game board in the center with player pieces, cards, and tokens arranged around it. The style should be vibrant and playful with clear, readable elements. Include the game's title in an elegant font at the top.",
    description: "Generate board game concepts with detailed components and playful art styles.",
    category: "creative", difficulty: "intermediate",
    previewImage: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=300&fit=crop",
    resultExample: "A colorful board game layout with clear components and engaging visual design.",
  },

  // === ANALYSIS PROMPTS ===
  {
    toolSlug: "chatgpt",
    title: "Data Analysis Report",
    content: "Analyze the following dataset and provide: 1) Key statistics (mean, median, std dev, quartiles), 2) 3-5 notable patterns or trends, 3) Correlation analysis between variables, 4) Outliers and anomalies, 5) Data quality issues, 6) 3 actionable recommendations:\n\n[DATA/CSV]",
    description: "Get comprehensive data analysis with statistics, patterns, correlations, and recommendations.",
    category: "analysis", difficulty: "advanced",
    resultExample: "A full data analysis report with statistics, correlations, anomalies, and recommendations.",
  },
  {
    toolSlug: "claude",
    title: "Document Summarizer & Analyzer",
    content: "Analyze this document and provide: 1) Executive summary (3-4 sentences), 2) Key findings and insights (numbered), 3) Critical data points with context, 4) Potential gaps or limitations, 5) Actionable recommendations prioritized by impact:\n\n[DOCUMENT]",
    description: "Extract key insights, findings, and recommendations from any document.",
    category: "analysis", difficulty: "intermediate",
    resultExample: "A structured document analysis with executive summary, key findings, and prioritized recommendations.",
  },
  {
    toolSlug: "perplexity-ai",
    title: "Competitive Intelligence Brief",
    content: "Research [COMPETITOR NAME] comprehensively. Provide: company overview and founding story, product offerings and pricing, target audience, recent news and product launches (last 6 months), funding and valuation, team background, marketing strategy, customer reviews/sentiment, key partnerships, strategic weaknesses we can exploit.",
    description: "Get deep competitive intelligence with product, funding, strategy, and weakness analysis.",
    category: "analysis", difficulty: "advanced",
    resultExample: "A comprehensive competitive brief covering product, strategy, funding, and market position.",
  },

  // === EDUCATION PROMPTS ===
  {
    toolSlug: "chatgpt",
    title: "Personalized Study Plan",
    content: "Create a 4-week study plan for learning [TOPIC]. My current level: [BEGINNER/INTERMEDIATE]. I can study [X] hours per week. Include: weekly learning objectives, daily study sessions with specific topics, recommended resources (books, courses, videos), practice exercises, milestone projects, review sessions, and self-assessment quizzes.",
    description: "Generate customized study plans with objectives, resources, and milestone projects.",
    category: "education", difficulty: "beginner",
    resultExample: "A 4-week personalized study plan with daily sessions, resources, and milestone projects.",
  },
  {
    toolSlug: "claude",
    title: "Socratic Tutor Dialogue",
    content: "Act as a Socratic tutor for [TOPIC]. Do NOT give me direct answers. Instead: ask guiding questions that help me discover the answer myself, challenge my assumptions, point out contradictions in my reasoning, encourage me to explain my thought process, and provide hints when I'm stuck. Start by asking me what I already know about the topic.",
    description: "Learn any topic through guided Socratic dialogue that builds critical thinking.",
    category: "education", difficulty: "beginner",
    resultExample: "An interactive tutoring session where the AI guides you to discover answers through questions.",
  },
  {
    toolSlug: "khan-academy",
    title: "Math Problem Solver",
    content: "Solve the following math problem step-by-step. For each step, explain: the reasoning behind it, the formula or concept used, and how it connects to the previous step. After solving, provide 3 similar practice problems with answers:\n\n[PROBLEM]",
    description: "Get detailed step-by-step math solutions with explanations and practice problems.",
    category: "education", difficulty: "intermediate",
    resultExample: "A complete step-by-step solution with concept explanations and similar practice problems.",
  },

  // === MARKETING PROMPTS ===
  {
    toolSlug: "jasper",
    title: "Facebook Ad Copy Generator",
    content: "Write 5 variations of Facebook ad copy for [PRODUCT/SERVICE]. Each variation should target a different angle: 1) Problem/Solution, 2) Social Proof/Testimonials, 3) Scarcity/FOMO, 4) Value Proposition, 5) Storytelling. Each ad should include: attention-grabbing headline (under 40 chars), main body (under 125 chars), CTA button text.",
    description: "Generate multiple Facebook ad variations targeting different psychological triggers.",
    category: "marketing", difficulty: "intermediate",
    resultExample: "5 Facebook ad variations with different angles, optimized headlines, and CTAs.",
  },
  {
    toolSlug: "copy-ai",
    title: "Landing Page Copywriter",
    content: "Write conversion-optimized landing page copy for [PRODUCT/SERVICE]. Include: above-fold headline and subheadline, 3 key benefit sections with social proof, feature list with icons, pricing section copy, FAQ section (5 questions), CTA button text (3 variations). Tone: [PROFESSIONAL/FRIENDLY/URGENT]. Target audience: [AUDIENCE].",
    description: "Write high-converting landing pages with optimized headlines, benefits, and CTAs.",
    category: "marketing", difficulty: "advanced",
    resultExample: "A complete landing page with conversion-optimized copy for every section.",
  },
  {
    toolSlug: "chatgpt",
    title: "Email Newsletter Template",
    content: "Create an email newsletter template for [INDUSTRY/BRAND]. Include: engaging subject line (5 options), preheader text, personalized greeting, main story/article (150 words), secondary story (75 words), product/tip of the week, subscriber social proof, footer with social links and unsubscribe. Use a friendly but professional tone.",
    description: "Generate engaging newsletter templates with multiple content sections and subject lines.",
    category: "marketing", difficulty: "intermediate",
    resultExample: "A complete newsletter with subject lines, stories, and subscriber engagement elements.",
  },
]

const CATEGORIES_LIST = ["writing", "coding", "analysis", "creative", "business", "education", "image", "marketing", "other"]

async function main() {
  console.log("Seeding prompt library with realistic prompts...\n")

  const tools = await prisma.aiTool.findMany({ select: { id: true, slug: true, name: true } })
  const toolMap = new Map(tools.map((t) => [t.slug, t]))
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } })

  let created = 0
  let skipped = 0

  for (const p of PROMPTS) {
    const tool = toolMap.get(p.toolSlug)
    if (!tool) { skipped++; continue }

    const existing = await prisma.prompt.findFirst({ where: { title: p.title, toolId: tool.id } })
    if (existing) { skipped++; continue }

    await prisma.prompt.create({
      data: {
        toolId: tool.id,
        title: p.title,
        content: p.content,
        description: p.description,
        category: p.category,
        difficulty: p.difficulty,
        isOfficial: true,
        previewImage: p.previewImage || null,
        resultExample: p.resultExample || null,
        userId: admin?.id || undefined,
        useCount: Math.floor(Math.random() * 500),
        ratingCount: Math.floor(Math.random() * 20),
        avgRating: 3.5 + Math.random() * 1.5,
      },
    })
    created++
  }

  console.log(`Created: ${created} prompts, Skipped: ${skipped}`)
  console.log(`Total prompts in DB: ${await prisma.prompt.count()}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
