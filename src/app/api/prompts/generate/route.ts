import { NextRequest } from "next/server"
import { apiError, apiSuccess } from "@/lib/api-utils"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { description, toolSlug, category, difficulty } = await request.json()

    if (!description || description.trim().length < 5) {
      return apiError("Please describe what kind of prompt you need")
    }

    const toolName = toolSlug
      ? (await prisma.aiTool.findUnique({ where: { slug: toolSlug }, select: { name: true } }))?.name
      : null

    const systemPrompt = `You are an expert AI prompt engineer. Generate a high-quality, detailed prompt based on the user's request.
The prompt should be:
- Specific and actionable
- Include clear instructions
- Use proper formatting (markdown if applicable)
- Optimized for the best results
- Around 100-300 words

${toolName ? `The prompt is for the AI tool: ${toolName}` : ""}
${category ? `Category: ${category}` : ""}
${difficulty ? `Difficulty level: ${difficulty}` : ""}

Return ONLY the generated prompt text. No explanations, no introductions.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: description },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI prompt generation error:", response.status, errorText)
      return apiError("AI prompt generation temporarily unavailable", 503)
    }

    const data = await response.json()
    const generatedContent = data.choices?.[0]?.message?.content?.trim()

    if (!generatedContent) {
      return apiError("Failed to generate prompt. Please try again.")
    }

    const suggestedTitle = generatedContent.split("\n")[0]
      ?.replace(/^#\s*/, "")
      ?.replace(/^["']|["']$/g, "")
      ?.slice(0, 80) || "Generated Prompt"

    return apiSuccess({
      content: generatedContent,
      suggestedTitle,
      toolSlug: toolSlug || null,
      category: category || null,
      difficulty: difficulty || "beginner",
    })
  } catch (error) {
    console.error("Prompt generation error:", error)
    return apiError("AI prompt generation temporarily unavailable", 503)
  }
}
