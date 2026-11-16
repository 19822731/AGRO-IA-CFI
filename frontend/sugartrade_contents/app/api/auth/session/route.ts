import { type NextRequest, NextResponse } from "next/server"

const COOKIE = process.env.BFF_COOKIE_NAME ?? "agro_session"

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value

  if (!token) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    const me = await fetch(`${process.env.API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    if (!me.ok) {
      return NextResponse.json({ authenticated: false })
    }

    const user = await me.json()
    return NextResponse.json({ authenticated: true, user })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}
