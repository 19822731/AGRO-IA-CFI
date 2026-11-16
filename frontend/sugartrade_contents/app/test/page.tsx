"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestPage() {
  const [loginResult, setLoginResult] = useState<string>("")
  const [prdResult, setPrdResult] = useState<string>("")
  const [email, setEmail] = useState("operator@test.com")
  const [password, setPassword] = useState("supersecret")
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.text()
      setLoginResult(`Status: ${response.status} - ${result}`)

      // Check if cookie was set
      const cookies = document.cookie
      if (cookies.includes("access_token")) {
        setLoginResult((prev) => prev + "\n✅ Cookie access_token detectada")
      }
    } catch (error) {
      setLoginResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  const testPrdRun = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/prd/run", { method: "POST" })
      const result = await response.text()
      setPrdResult(`Status: ${response.status} - ${result}`)
    } catch (error) {
      setPrdResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  const testLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      const result = await response.text()
      setLoginResult(`Logout - Status: ${response.status} - ${result}`)
    } catch (error) {
      setLoginResult(`Logout Error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Testing Dashboard</h1>
        <Badge variant="outline">Smoke Tests</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Login Test */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Login Test</CardTitle>
            <CardDescription>Test the authentication endpoint and cookie setting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={testLogin} disabled={loading} className="flex-1">
                Test Login
              </Button>
              <Button onClick={testLogout} variant="outline" disabled={loading}>
                Logout
              </Button>
            </div>

            {loginResult && (
              <div className="p-3 bg-muted rounded-md">
                <pre className="text-sm whitespace-pre-wrap">{loginResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PRD Run Test */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 PRD Run Test</CardTitle>
            <CardDescription>Test the production run endpoint (requires authentication)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testPrdRun} disabled={loading} className="w-full">
              Test PRD Run
            </Button>

            {prdResult && (
              <div className="p-3 bg-muted rounded-md">
                <pre className="text-sm whitespace-pre-wrap">{prdResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Environment Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div>
              Environment: <Badge variant="secondary">{process.env.NODE_ENV}</Badge>
            </div>
            <div>
              Current cookies:{" "}
              <code className="text-xs bg-muted px-1 rounded">
                {typeof document !== "undefined" ? document.cookie || "None" : "Server-side"}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
