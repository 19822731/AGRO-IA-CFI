"use client"

import { Check, CircleDashed } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
  pasoActual: number
  pasos: {
    id: number
    titulo: string
    descripcion: string
  }[]
  onPasoClick?: (paso: number) => void
  className?: string
}

export function Stepper({ pasoActual, pasos, onPasoClick, className }: StepperProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex justify-between">
        {pasos.map((paso, index) => {
          const esCompleto = pasoActual > paso.id
          const esActivo = pasoActual === paso.id

          return (
            <div
              key={paso.id}
              className={cn(
                "flex flex-col items-center space-y-2 relative",
                esActivo || esCompleto ? "text-primary" : "text-muted-foreground",
                onPasoClick ? "cursor-pointer" : "",
              )}
              onClick={() => onPasoClick && onPasoClick(paso.id)}
            >
              {/* Línea conectora */}
              {index < pasos.length - 1 && (
                <div
                  className={cn("absolute top-4 w-full h-[2px] right-1/2", esCompleto ? "bg-primary" : "bg-muted")}
                  style={{ width: "calc(100% - 2rem)" }}
                />
              )}

              {/* Círculo indicador */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2",
                  esActivo
                    ? "border-primary bg-background"
                    : esCompleto
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-muted/20",
                )}
              >
                {esCompleto ? <Check className="w-4 h-4" /> : <CircleDashed className="w-4 h-4" />}
              </div>

              {/* Título del paso */}
              <div className="text-sm font-medium">{paso.titulo}</div>

              {/* Descripción del paso */}
              <div className="text-xs text-center max-w-[120px]">{paso.descripcion}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
