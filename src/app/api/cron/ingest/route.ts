import { NextResponse } from "next/server"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const auth = process.env.CRON_SECRET
    // Basic auth check - CRON_SECRET must match
    // Uncomment for production:
    // if (auth && request.headers.get("authorization") !== `Bearer ${auth}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { ingestGitHubTrending } = await import("@/lib/ingestion/github-ingestor")
    const { ingestPublicPrompts } = await import("@/lib/ingestion/prompts-ingestor")

    const [r1, r2] = await Promise.allSettled([
      ingestGitHubTrending(),
      ingestPublicPrompts(),
    ])

    return NextResponse.json({
      status: "completed",
      github: r1.status === "fulfilled" ? r1.value : { error: r1.reason?.message },
      prompts: r2.status === "fulfilled" ? r2.value : { error: r2.reason?.message },
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({ status: "failed", error: e.message }, { status: 500 })
  }
}
