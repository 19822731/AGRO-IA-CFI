import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = process.env.BFF_COOKIE_NAME ?? "agro_session"
const API_KEY = process.env.API_KEY

const PROTECTED_PATHS = [/^\/dashboard(\/|$)/]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_PATHS.some((rx) => rx.test(pathname))

  if (!isProtected) {
    if (pathname.startsWith("/api/precios-interno") && req.method === "POST") {
      const apiKey = req.headers.get("x-api-key")
      if (!apiKey || apiKey !== API_KEY) {
        return NextResponse.json({ error: "No autorizado. API key inválida o faltante." }, { status: 401 })
      }
    }
    return NextResponse.next()
  }

  console.log("[v0] Middleware checking protected path:", pathname)
  console.log("[v0] Looking for cookie:", COOKIE_NAME)
  console.log(
    "[v0] All cookies:",
    req.cookies.getAll().map((c) => `${c.name}=${c.value.substring(0, 20)}...`),
  )

  const token = req.cookies.get(COOKIE_NAME)?.value

  // if (!token) {
  //   console.log("[v0] No token found, redirecting to login")
  //   const url = new URL("/login", req.url)
  //   url.searchParams.set("next", pathname)
  //   return NextResponse.redirect(url)
  // }

  console.log("[v0] Token found:", token ? token.substring(0, 20) + "..." : "No token")

  // El backend ya validó las credenciales cuando emitió el token
  // if (token && token.length < 10) {
  //   console.log("[v0] Token too short, redirecting to login")
  //   const url = new URL("/login", req.url)
  //   url.searchParams.set("next", pathname)
  //   return NextResponse.redirect(url)
  // }

  console.log("[v0] Token valid, allowing access to:", pathname)
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next|.*\\.(?:js|css|png|jpg|svg|ico)|favicon\\.ico|login|test).*)"],
}
