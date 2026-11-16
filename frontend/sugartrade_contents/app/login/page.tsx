"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const { login, cargando, error: authError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // const [loading, setLoading] = useState(false) // handled by useAuth
  // const [error, setError] = useState("") // handled by useAuth
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await login({ email, password })
    if (success) {
      // router.push(next) // handled by useAuth login function already, but we can double check
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            <div className="flex items-center justify-center">
              <span className="text-blue-500">A</span>
              <span className="text-red-500">g</span>
              <span className="text-red-500">r</span>
              <span className="text-red-500">o</span>
              <span className="text-gray-500">-</span>
              <span className="text-orange-500">I</span>
              <span className="text-green-500">A</span>
            </div>
          </CardTitle>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder al dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="Nombre de usuario o email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
        <div className="p-6 pt-0 flex justify-center">
          <p className="text-sm text-gray-500">
            ¿No tienes cuenta?{" "}
            <a href="/registro" className="text-blue-600 hover:underline">
              Regístrate aquí
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}
