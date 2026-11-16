import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const COOKIE = process.env.BFF_COOKIE_NAME ?? "agro_session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    console.log("[v0] Login attempt for:", email)
    console.log("[v0] API_BASE_URL:", process.env.API_BASE_URL)

    if (!process.env.API_BASE_URL) {
      console.error("[v0] API_BASE_URL not configured")

      // En desarrollo, permitir login simulado para testing
      if (process.env.NODE_ENV === "development") {
        console.log("[v0] Development mode: simulating successful login")
        const cookieStore = await cookies()
        cookieStore.set({
          name: COOKIE,
          value: "dev_token_" + Date.now(),
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: false,
          maxAge: 60 * 60 * 8,
        })
        console.log("[v0] Cookie set successfully with name:", COOKIE)
        return NextResponse.json({ success: true })
      }

      return NextResponse.json(
        {
          error: "Configuration error: API_BASE_URL not configured",
          detail:
            "Please configure API_BASE_URL environment variable in Vercel settings with your FastAPI backend URL (e.g., https://your-ngrok-url.ngrok-free.app)",
        },
        { status: 500 },
      )
    }

    const body = new URLSearchParams({ username: email, password })

    const r = await fetch(`${process.env.API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    })

    console.log("[v0] Backend response status:", r.status)

    if (!r.ok) {
      const errorText = await r.text()
      console.log("[v0] Backend error:", errorText)

      return NextResponse.json(
        {
          error: "Invalid credentials",
          detail: errorText,
          status: r.status,
        },
        { status: 401 },
      )
    }

    const { access_token, token_type } = await r.json()
    console.log("[v0] Login successful, setting cookie")

    const isDevelopment = process.env.NODE_ENV === "development"
    // Vercel usa HTTPS, por lo que la cookie SIEMPRE debe ser segura,
    // excepto cuando estamos explícitamente en un entorno local
    const isSecure = !isDevelopment

    console.log("[v0] Token received from backend:", access_token ? "***" + access_token.slice(-4) : "null")
    console.log("[v0] Cookie name:", COOKIE)
    console.log("[v0] Environment:", process.env.NODE_ENV)
    console.log(`[v0] Setting cookie. isDevelopment: ${isDevelopment}, isSecure: ${isSecure}`)

    const cookieStore = await cookies()
    cookieStore.set({
      name: COOKIE,
      value: access_token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isSecure, // Usando la nueva lógica corregida
      maxAge: 60 * 60 * 8, // 8 horas
    })

    console.log("[v0] Cookie set successfully with name:", COOKIE)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json(
      {
        error: "Login failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
