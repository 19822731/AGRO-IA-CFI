export const runtime = "nodejs"

export async function GET() {
  const t0 = Date.now()
  try {
    const r = await fetch(`${process.env.API_BASE_URL}/healthz`, { cache: "no-store" })
    const body = await r.text() // por si devuelve texto
    const dt = Date.now() - t0
    return new Response(
      JSON.stringify({
        ok: r.ok,
        status: r.status,
        latency_ms: dt,
        backend_url: process.env.API_BASE_URL,
        sample: body.slice(0, 200),
      }),
      { status: r.ok ? 200 : r.status, headers: { "content-type": "application/json" } },
    )
  } catch (e: any) {
    const dt = Date.now() - t0
    return new Response(JSON.stringify({ ok: false, error: String(e), latency_ms: dt }), {
      status: 502,
      headers: { "content-type": "application/json" },
    })
  }
}
