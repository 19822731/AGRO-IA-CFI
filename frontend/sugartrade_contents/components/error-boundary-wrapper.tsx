"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { errorService } from "@/lib/error-handling"
import { ErrorDisplay } from "@/components/error-display"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  moduleName: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundaryWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Capturar el error en nuestro servicio
    errorService.captureError("REACT_ERROR", error.message, "high", {
      moduleName: this.props.moduleName,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI personalizada
      return (
        this.props.fallback || (
          <div className="p-4 rounded-md bg-red-900/20 border border-red-800">
            <ErrorDisplay error={`Error en el módulo ${this.props.moduleName}`} title="Ha ocurrido un error" />
            <div className="mt-4">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
