"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Registrar el error en un servicio de análisis de errores
    console.error("Error no controlado:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Algo salió mal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Se ha producido un error inesperado. Nuestro equipo ha sido notificado.
            </p>
            {process.env.NODE_ENV === "development" && (
              <div className="p-2 bg-muted rounded-md overflow-auto">
                <p className="font-mono text-sm">{error.message}</p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button onClick={() => (window.location.href = "/")} variant="outline">
                Volver al inicio
              </Button>
              <Button onClick={reset}>Intentar de nuevo</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
