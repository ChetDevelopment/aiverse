import { NextRequest, NextResponse } from "next/server"
import { getGoogleAuthUrl } from "@/lib/google-auth"

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin
  const url = getGoogleAuthUrl(origin)
  return NextResponse.redirect(url)
}
