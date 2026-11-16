import { type NextRequest, NextResponse } from "next/server"

const COOKIE = process.env.BFF_COOKIE_NAME ?? "agro_session"

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.url))
  res.cookies.set({
    name: COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  })
  return res
}
