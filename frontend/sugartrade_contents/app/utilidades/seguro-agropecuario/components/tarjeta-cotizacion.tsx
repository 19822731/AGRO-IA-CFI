"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import type { Cotizacion } from "../types/seguro"
import { cn } from "@/lib/utils"

interface TarjetaCotizacionProps {
  cotizacion: Cotizacion
  seleccionada: boolean
  onSeleccionar: () => void
}

export function TarjetaCotizacion({ cotizacion, seleccionada, onSeleccionar }: TarjetaCotizacionProps) {
  return (
    <Card
      className={cn(
        "w-full transition-all duration-200",
        seleccionada ? "border-primary shadow-md" : "hover:border-primary/50",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-20 bg-muted rounded flex items-center justify-center">
              <img
                src={cotizacion.aseguradoraLogo || "/placeholder.svg"}
                alt={cotizacion.aseguradoraNombre}
                className="max-h-8 max-w-full"
              />
            </div>
            <CardTitle className="text-lg">{cotizacion.aseguradoraNombre}</CardTitle>
          </div>
          {seleccionada && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              <Check className="mr-1 h-3 w-3" /> Seleccionada
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          <div className="flex justify-between items-baseline border-b pb-2">
            <span className="text-muted-foreground">Prima Total:</span>
            <span className="text-2xl font-bold">${cotizacion.primaTotal.toLocaleString()}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Suma Asegurada:</span>
              <span className="font-medium">${cotizacion.sumaAsegurada.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deducible:</span>
              <span className="font-medium">${cotizacion.deducible.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plazo:</span>
              <span className="font-medium">{cotizacion.plazo}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Coberturas incluidas:</h4>
            <ul className="text-sm space-y-1">
              {cotizacion.coberturas.map((cobertura) => (
                <li key={cobertura.id} className="flex justify-between">
                  <span>{cobertura.nombre}</span>
                  <span className="text-muted-foreground">${cobertura.prima.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>

          {cotizacion.beneficiosAdicionales.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Beneficios adicionales:</h4>
              <ul className="text-sm space-y-1">
                {cotizacion.beneficiosAdicionales.map((beneficio, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-primary" />
                    <span>{beneficio}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onSeleccionar} variant={seleccionada ? "outline" : "default"} className="w-full">
          {seleccionada ? "Cotización Seleccionada" : "Seleccionar Cotización"}
        </Button>
      </CardFooter>
    </Card>
  )
}
