"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to an error analytics service
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Algo salió mal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Se ha producido un error inesperado. Nuestro equipo ha sido notificado.
            </p>
            {process.env.NODE_ENV === "development" && (
              <div className="p-2 bg-muted rounded-md overflow-auto">
                <p className="font-mono text-sm break-words">{error.message}</p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground">Ver detalles técnicos</summary>
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-background rounded">{error.stack}</pre>
                  </details>
                )}
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
