import { NextResponse } from "next/server"
import { bffFetch } from "@/lib/bff"

export const runtime = "nodejs"

export async function POST() {
  try {
    const res = await bffFetch("/api/prd/run", { method: "POST" })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    // Handle build-time errors gracefully
    if (error instanceof Error && error.message.includes("Missing API_BASE_URL")) {
      return NextResponse.json({ error: "API configuration not available" }, { status: 503 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
