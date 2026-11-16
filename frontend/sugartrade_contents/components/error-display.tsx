"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorDisplayProps {
  error: string | Error
  title?: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ error, title = "Error", onRetry, className = "" }: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : error
  const errorDetails = error instanceof Error ? error.stack : null

  return (
    <div className={`bg-red-900/20 border border-red-900 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
      <p className="mt-2 text-gray-300 break-words">{errorMessage}</p>

      {process.env.NODE_ENV === "development" && errorDetails && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-gray-400">Ver detalles técnicos</summary>
          <pre className="mt-2 text-xs overflow-auto p-2 bg-black/30 rounded text-gray-300">{errorDetails}</pre>
        </details>
      )}

      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
          Reintentar
        </Button>
      )}
    </div>
  )
}
