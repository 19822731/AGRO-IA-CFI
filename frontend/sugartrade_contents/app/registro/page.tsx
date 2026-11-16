"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
    const { register, cargando, error: authError } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rol, setRol] = useState("productor")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const success = await register({ email, password, rol })
        if (success) {
            // Redirect handled by useAuth or we can show success message
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Crear Cuenta
                    </CardTitle>
                    <CardDescription className="text-center">Únete a Agro-IA Marketplace</CardDescription>
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
                                type="email"
                                placeholder="tu@email.com"
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

                        <div className="space-y-2">
                            <Label htmlFor="rol">Tipo de Usuario</Label>
                            <Select value={rol} onValueChange={setRol}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="productor">Productor (Vendedor)</SelectItem>
                                    <SelectItem value="inversor">Inversor (Comprador)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={cargando}>
                            {cargando ? "Creando cuenta..." : "Registrarse"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-gray-500">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Inicia Sesión
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
