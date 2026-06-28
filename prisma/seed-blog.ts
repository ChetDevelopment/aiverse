import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString: url })
const prisma = new PrismaClient({ adapter })

const posts = [
  {
    title: "Top 10 AI Tools for Developers in 2025",
    slug: "top-10-ai-tools-for-developers-2025",
    excerpt: "Discover the most powerful AI tools that are transforming software development this year.",
    content: `The landscape of AI-powered development tools has exploded in 2025. From intelligent code completion to autonomous debugging agents, developers now have access to capabilities that seemed like science fiction just a few years ago.\n\n## 1. GitHub Copilot\nGitHub Copilot has evolved far beyond simple code completion. With deep integration across the entire development lifecycle, it now handles complex refactoring, test generation, and even architectural decisions.\n\n## 2. Cursor\nCursor has redefined what an IDE can be. With its AI-native architecture, it understands your entire codebase and can make multi-file changes based on natural language instructions.\n\n## 3. Claude\nAnthropic's Claude has become the go-to for complex reasoning tasks. Its ability to maintain context across long conversations makes it invaluable for debugging and architecture planning.\n\n## 4. Windsurf\nCodeium's Windsurf combines the power of AI with a familiar VS Code interface, offering agentic coding capabilities that let you describe features and watch them get built.\n\n## 5. Aider\nFor terminal enthusiasts, Aider provides AI pair programming directly in your command line. It works seamlessly with git and can handle complex multi-file refactoring tasks.\n\n## 6. Continue\nAs an open-source AI code assistant, Continue gives you full control over your AI coding experience. It works with any model and any provider.\n\n## 7. Amazon Q Developer\nAmazon's offering has matured significantly, with deep AWS integration that makes cloud development dramatically faster.\n\n## 8. Tabnine\nTabnine remains a favorite for teams that need privacy and customization. Its ability to learn from your codebase makes its suggestions increasingly relevant over time.\n\n## 9. Replit AI\nFor rapid prototyping and learning, Replit's AI assistant is unmatched. It can take you from idea to deployed application in minutes.\n\n## 10. OpenHands\nThis open-source AI coding agent represents the cutting edge of autonomous software development. It can independently tackle complex issues and submit pull requests.\n\n## Conclusion\nThe AI coding tool landscape is evolving at an incredible pace. The best approach is to experiment with multiple tools and find what works best for your workflow.`,
    author: "AIVerse Team",
    published: true,
    featured: true,
    readTime: 8,
    tags: "AI tools, developer tools, coding, programming",
  },
  {
    title: "Getting Started with Local LLMs: A Complete Guide",
    slug: "getting-started-with-local-llms",
    excerpt: "Learn how to run large language models on your own hardware for free, privately, and offline.",
    content: `Running large language models locally has become increasingly accessible. With tools like Ollama, LM Studio, and llama.cpp, you can run powerful models on consumer hardware.\n\n## Why Run Local LLMs?\n\n- **Privacy**: Your data never leaves your machine\n- **Cost**: No API fees after initial hardware\n- **Offline access**: Work without internet\n- **Customization**: Fine-tune models for your needs\n- **Latency**: Instant responses, no network delays\n\n## Hardware Requirements\n\n### Minimum (for 7B models)\n- 8GB RAM\n- 4GB VRAM (or just CPU)\n- 10GB storage\n\n### Recommended (for 70B models)\n- 32GB RAM\n- 24GB VRAM (RTX 3090/4090)\n- 50GB storage\n\n## Getting Started with Ollama\n\nOllama is the easiest way to get started. Install it from ollama.ai and run:\n\n\`\`\`bash\nollama pull llama3.2\nollama run llama3.2\n\`\`\`\n\n## Popular Local Models\n\n- **Llama 3.2** (Meta) - Best all-around\n- **Mistral** - Efficient and capable\n- **DeepSeek** - Strong reasoning\n- **Phi-3** (Microsoft) - Great for edge devices\n- **Gemma** (Google) - Lightweight and fast\n\n## Advanced: llama.cpp\n\nFor maximum performance, use llama.cpp with GPU acceleration:\n\n\`\`\`bash\ngit clone https://github.com/ggerganov/llama.cpp\ncd llama.cpp\nmake\n./main -m model.gguf -p "Hello, AI!"\n\`\`\`\n\n## Conclusion\n\nLocal LLMs are the future of private, accessible AI. Start with Ollama for the easiest experience, then experiment with llama.cpp for advanced use cases.`,
    author: "AIVerse Team",
    published: true,
    featured: true,
    readTime: 10,
    tags: "local AI, LLMs, Ollama, llama.cpp, open source, tool:ollama, tool:llama-cpp",
  },
  {
    title: "AI Image Generation: Midjourney vs Stable Diffusion vs DALL-E 3",
    slug: "ai-image-generation-comparison-2025",
    excerpt: "A comprehensive comparison of the top AI image generation tools to help you choose the right one.",
    content: `The three major AI image generation platforms have each evolved unique strengths. Here's how they compare in 2025.\n\n## Midjourney\n\n**Best for:** Artistic quality and aesthetic appeal\n\nMidjourney continues to lead in artistic quality. Version 7 introduced unprecedented control over composition and style. The community aspect remains strong with thousands of shared prompts and techniques.\n\n**Pros:**\n- Highest artistic quality\n- Strong community\n- Consistent style\n\n**Cons:**\n- Discord-only interface\n- No free tier\n- Less control over specific details\n\n## Stable Diffusion\n\n**Best for:** Customization and open-source flexibility\n\nStable Diffusion 3 has made huge leaps in quality. The open-source nature means countless community models, LoRAs, and fine-tuned versions are available.\n\n**Pros:**\n- Free and open-source\n- Run locally\n- Infinite customization\n- ComfyUI and A1111 interfaces\n\n**Cons:**\n- Requires technical setup\n- Quality varies by model\n- Hardware requirements\n\n## DALL-E 3\n\n**Best for:** Ease of use and prompt adherence\n\nDALL-E 3 excels at understanding complex prompts and generating exactly what you describe. Integration with ChatGPT makes it incredibly accessible.\n\n**Pros:**\n- Best prompt understanding\n- Easy to use\n- Integrated with ChatGPT\n- Good safety features\n\n**Cons:**\n- Paid only\n- Less artistic variety\n- No local running\n\n## Verdict\n\n- **For artists**: Midjourney\n- **For developers**: Stable Diffusion\n- **For everyday users**: DALL-E 3\n- **For privacy**: Stable Diffusion (local)\n- **For best value**: Stable Diffusion (free)`,
    author: "AIVerse Team",
    published: true,
    featured: false,
    readTime: 7,
    tags: "AI image generation, Midjourney, Stable Diffusion, DALL-E",
  },
  {
    title: "The Rise of AI Agents: What They Are and How to Use Them",
    slug: "rise-of-ai-agents-guide",
    excerpt: "AI agents are transforming how we work. Learn what they are, how they work, and the best tools to build them.",
    content: `AI agents represent the next evolution of artificial intelligence. Unlike simple chatbots that respond to queries, AI agents can independently plan and execute complex tasks.\n\n## What Are AI Agents?\n\nAI agents are autonomous systems that can:\n- Understand goals in natural language\n- Break down complex tasks into steps\n- Use tools and APIs\n- Learn from feedback\n- Persist state across interactions\n\n## Popular AI Agent Frameworks\n\n### LangChain\nLangChain remains the most popular framework for building AI agents. Its ecosystem of tools, integrations, and deployment options is unmatched.\n\n### AutoGPT\nAutoGPT pioneered the autonomous agent space. While the original project has evolved, its influence on the entire field is undeniable.\n\n### CrewAI\nCrewAI takes a unique approach by orchestrating multiple AI agents that work together as a team, each with specialized roles.\n\n### Microsoft AutoGen\nAutoGen provides a robust framework for building multi-agent conversations, with strong support from Microsoft's research team.\n\n## Use Cases\n\n- **Customer support**: 24/7 intelligent support agents\n- **Code generation**: Autonomous software development\n- **Research**: Automated literature review and analysis\n- **Data analysis**: End-to-end data pipeline execution\n- **DevOps**: Automated infrastructure management\n\n## Getting Started\n\n\`\`\`python\nfrom langchain.agents import create_react_agent\nfrom langchain.tools import Tool\n\n# Define tools\ntools = [\n    Tool(name="Search", func=search_function, description="Web search"),\n]\n\n# Create agent\nagent = create_react_agent(llm, tools, prompt)\n\`\`\`\n\n## The Future\n\nAI agents are rapidly evolving. By the end of 2025, expect to see agents that can handle most knowledge worker tasks autonomously, with humans providing oversight and handling exceptions.`,
    author: "AIVerse Team",
    published: true,
    featured: false,
    readTime: 9,
    tags: "AI agents, autonomous AI, LangChain, AutoGPT, CrewAI",
  },
  {
    title: "Best Free AI Tools for Students in 2025",
    slug: "best-free-ai-tools-for-students",
    excerpt: "Save money and study smarter with these free AI tools designed for students.",
    content: `Students have access to an incredible array of free AI tools that can transform how they learn, write, and research.\n\n## Writing and Research\n\n### 1. Grammarly\nGrammarly's free tier catches grammar errors, suggests style improvements, and checks tone. Essential for any student paper.\n\n### 2. Perplexity AI\nPerplexity provides cited answers to questions, making it perfect for research. Unlike ChatGPT, it shows you where information comes from.\n\n### 3. Claude (Free)\nAnthropic's Claude offers a generous free tier excellent for analyzing long documents, summarizing research papers, and brainstorming ideas.\n\n## Studying\n\n### 4. Quizlet\nQuizlet's AI generates flashcards and practice tests from your notes. The learning algorithm adapts to your strengths and weaknesses.\n\n### 5. Khan Academy AI\nKhanmigo provides free AI tutoring across subjects. It doesn't give answers—it guides you to find them yourself.\n\n### 6. Photomath\nPhotomath solves math problems step-by-step. Great for checking your work and understanding complex solutions.\n\n## Coding\n\n### 7. GitHub Copilot (Free for Students)\nGitHub Copilot is free for verified students through the GitHub Student Developer Pack.\n\n### 8. Codeium\nCompletely free AI code completion that works with any IDE.\n\n## Productivity\n\n### 9. Notion AI\nNotion offers generous free access to AI features for note-taking and organization.\n\n### 10. Otter.ai\nOtter provides free meeting transcription that's perfect for recording and searching lecture notes.\n\n## Conclusion\n\nYou don't need to spend money to leverage AI as a student. These tools provide enterprise-grade capabilities at no cost.`,
    author: "AIVerse Team",
    published: true,
    featured: false,
    readTime: 6,
    tags: "free AI tools, students, education, productivity",
  },
  {
    title: "Understanding Open Source AI Licenses",
    slug: "understanding-open-source-ai-licenses",
    excerpt: "A clear guide to AI software licenses: MIT, Apache, GPL, and the new AI-specific licenses.",
    content: `Open source licenses for AI projects have unique considerations that traditional software licenses don't address.\n\n## Traditional Licenses\n\n### MIT License\nThe MIT License is the most permissive. You can use, modify, and distribute the software with minimal restrictions. Most popular AI tools use MIT.\n\n### Apache 2.0\nApache 2.0 adds patent protection and requires attribution. Many enterprise AI projects prefer this license.\n\n### GPL v3\nThe GPL v3 is a copyleft license—derivative works must also be open source. This is common in AI research projects.\n\n## AI-Specific Considerations\n\n### Model Weights\nModel weights may have different licensing than the code. For example, LLaMA models have custom licenses that restrict commercial use.\n\n### Dataset Licenses\nDatasets used for training may have their own licenses. Always check both the model license and the dataset licenses.\n\n### RAIL Licenses\nRAIL (Responsible AI Licenses) include behavioral-use clauses that restrict harmful applications of AI.\n\n## License Comparison\n\n| License | Commercial Use | Attribution | Patent Grant | Copyleft |\n|---------|---------------|-------------|--------------|----------|\n| MIT | Yes | No | No | No |\n| Apache 2.0 | Yes | Yes | Yes | No |\n| GPL v3 | Yes | Yes | Yes | Yes |\n| Community | Varies | Yes | No | Varies |\n\n## Choosing a License\n\n- **For maximum adoption**: MIT\n- **For corporate use**: Apache 2.0\n- **For community projects**: GPL v3\n- **For responsible AI**: RAIL\n\nAlways consult a lawyer for specific licensing questions.`,
    author: "AIVerse Team",
    published: true,
    featured: false,
    readTime: 7,
    tags: "open source, licenses, MIT, Apache, GPL, AI licensing",
  },
  {
    title: "How to Install and Set Up Ollama: Step-by-Step Guide",
    slug: "ollama-installation-guide",
    excerpt: "Complete walkthrough for installing Ollama on Windows, macOS, and Linux. Run local LLMs like Llama 3 and Mistral with one command.",
    content: `Ollama makes it incredibly easy to run large language models on your own machine. Here's how to get started on any platform.\n\n## What is Ollama?\n\nOllama is a free, open-source tool that lets you download and run LLMs locally with a simple command-line interface. It handles all the complex setup—model downloading, quantization, and GPU acceleration—automatically.\n\n## Installation\n\n### macOS\n\n\`\`\`bash\n# Download the installer from ollama.ai or use Homebrew:\nbrew install ollama\n\`\`\`\n\nOr download the macOS app from [ollama.ai](https://ollama.ai) and drag it to your Applications folder.\n\n### Windows\n\nDownload the Windows installer from [ollama.ai](https://ollama.ai) and run it. Ollama will be available in your terminal after installation.\n\n### Linux\n\n\`\`\`bash\ncurl -fsSL https://ollama.ai/install.sh | sh\n\`\`\`\n\n## Running Your First Model\n\nOnce installed, open a terminal and run:\n\n\`\`\`bash\nollama pull llama3.2\nollama run llama3.2\n\`\`\`\n\nThis downloads and starts an interactive chat session with Meta's Llama 3.2 model.\n\n## Popular Models to Try\n\n- \`llama3.2\` - Meta's latest 3B/11B model\n- \`mistral\` - Efficient 7B model\n- \`mixtral\` - Mixture of experts 8x7B\n- \`deepseek-r1\` - DeepSeek's reasoning model\n- \`phi3\` - Microsoft's compact model\n- \`gemma2\` - Google's lightweight model\n\n## Using Ollama as an API\n\nOllama includes an OpenAI-compatible API server:\n\n\`\`\`bash\nollama serve\n\`\`\`\n\nThen connect from any OpenAI-compatible client:\n\n\`\`\`python\nfrom openai import OpenAI\nclient = OpenAI(base_url="http://localhost:11434/v1")\nresponse = client.chat.completions.create(\n    model="llama3.2",\n    messages=[{"role": "user", "content": "Hello!"}]\n)\n\`\`\`\n\n## Tips\n\n- Use \`ollama list\` to see downloaded models\n- Use \`ollama rm <model>\` to remove models\n- Models are stored in \`~/.ollama/models/\`\n- For GPU acceleration on NVIDIA, install CUDA toolkit\n\n## Troubleshooting\n\n**Q: Ollama is slow on my machine.**\nA: Try smaller models like \`phi3\` or \`llama3.2:1b\`. Ensure you have sufficient RAM.\n\n**Q: How do I update Ollama?**\nA: On macOS/Linux: re-run the installer. On Windows: download the latest installer.\n\n**Q: Can I use Ollama offline?**\nA: Yes! Once a model is downloaded, no internet connection is needed.`,
    author: "AIVerse Team",
    published: true,
    featured: false,
    readTime: 8,
    tags: "Ollama, local LLM, setup guide, tutorial, tool:ollama",
  },
  {
    title: "How to Use Cursor: AI-First Code Editor Guide",
    slug: "cursor-ai-editor-guide",
    excerpt: "Learn how to use Cursor, the AI-native code editor. From setup to advanced features like multi-file editing and agent mode.",
    content: `Cursor is redefining how developers write code by deeply integrating AI into every aspect of the editor.\n\n## Getting Started\n\n### Installation\n\nDownload Cursor from [cursor.sh](https://cursor.sh). It's available for macOS, Windows, and Linux.\n\n### Import VS Code Settings\n\nOn first launch, Cursor will ask if you want to import extensions, themes, and settings from VS Code. This makes switching seamless.\n\n## Core Features\n\n### AI Chat (Ctrl+K)\nPress Ctrl+K anywhere to open the AI chat. You can ask questions about your code, request changes, or get explanations.\n\n### Tab Completion\nCursor suggests code as you type, just like GitHub Copilot. It learns from your codebase for better suggestions.\n\n### Multi-File Editing\nDescribe a feature in natural language, and Cursor can make changes across multiple files simultaneously.\n\n### Agent Mode\nCursor's agent can autonomously plan and execute complex tasks, from refactoring to building new features.\n\n### Codebase Search\nAsk questions about your entire codebase: "Where is the authentication logic?" or "How does the payment flow work?"\n\n## Keyboard Shortcuts\n\n| Shortcut | Action |\n|----------|--------|\n| Ctrl+K | AI command |\n| Ctrl+L | Open chat |\n| Ctrl+Shift+K | Edit selected code |\n| Ctrl+I | Inline suggestion |\n\n## Best Practices\n\n1. **Be specific in prompts**: Instead of "fix this", say "add error handling for network timeouts"\n2. **Use context**: Highlight relevant code before asking questions\n3. **Review AI changes**: Always review AI-generated code before committing\n4. **Build incrementally**: Start with small changes and build up to complex refactors\n\n## Pricing\n\nCursor has a generous free tier. Pro plan at $20/month includes unlimited AI usage and priority support.`,
    author: "AIVerse Team",
    published: true,
    featured: false,
    readTime: 7,
    tags: "Cursor, AI editor, coding, setup guide, tool:cursor",
  },
]

async function main() {
  console.log(`Seeding ${posts.length} blog posts...`)
  let created = 0, skipped = 0
  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (existing) { skipped++; continue }
    await prisma.blogPost.create({ data: post })
    created++
  }
  console.log(`Created: ${created}, Skipped: ${skipped}`)
  const total = await prisma.blogPost.count()
  console.log(`Total blog posts: ${total}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
