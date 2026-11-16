"use client"
import { useState, useCallback, useEffect } from "react"
import { authService, type UsuarioLogin, type UsuarioRegistro } from "@/lib/services/auth-service"
import { useRouter } from "next/navigation"

export function useAuth() {
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    // Load user on mount
    useEffect(() => {
        const currentUser = authService.getUser()
        setUser(currentUser)
    }, [])

    const login = useCallback(async (credentials: UsuarioLogin) => {
        try {
            setCargando(true)
            setError(null)
            await authService.login(credentials)
            const currentUser = authService.getUser()
            setUser(currentUser)
            router.push("/dashboard") // Adjust route as needed
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión")
            return false
        } finally {
            setCargando(false)
        }
    }, [router])

    const register = useCallback(async (data: UsuarioRegistro) => {
        try {
            setCargando(true)
            setError(null)
            await authService.register(data)
            // Auto login after register or redirect to login?
            // For now, let's assume we redirect to login
            router.push("/login")
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al registrarse")
            return false
        } finally {
            setCargando(false)
        }
    }, [router])

    const logout = useCallback(() => {
        authService.logout()
        setUser(null)
        router.push("/login")
    }, [router])

    return { login, register, logout, cargando, error, user }
}
