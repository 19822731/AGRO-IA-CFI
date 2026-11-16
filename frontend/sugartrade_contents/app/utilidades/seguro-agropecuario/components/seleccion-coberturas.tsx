"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import type { Cobertura } from "../types/seguro"

interface SeleccionCoberturasProps {
  coberturas: Cobertura[]
  onToggleCobertura: (id: string) => void
  onAnterior: () => void
  onSiguiente: () => void
}

export function SeleccionCoberturas({
  coberturas,
  onToggleCobertura,
  onAnterior,
  onSiguiente,
}: SeleccionCoberturasProps) {
  const coberturasSeleccionadas = coberturas.filter((c) => c.seleccionada)
  const haySeleccionadas = coberturasSeleccionadas.length > 0

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Selección de Coberturas</CardTitle>
        <CardDescription>Seleccione las coberturas que desea incluir en su seguro agropecuario.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coberturas.map((cobertura) => (
            <div
              key={cobertura.id}
              className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={cobertura.id}
                checked={cobertura.seleccionada}
                onCheckedChange={() => onToggleCobertura(cobertura.id)}
              />
              <div className="space-y-1">
                <Label htmlFor={cobertura.id} className="text-base font-medium cursor-pointer">
                  {cobertura.nombre}
                </Label>
                <p className="text-sm text-muted-foreground">{cobertura.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        {!haySeleccionadas && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-sm">Debe seleccionar al menos una cobertura para continuar.</p>
          </div>
        )}

        {haySeleccionadas && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Coberturas seleccionadas:</h3>
            <ul className="list-disc list-inside space-y-1">
              {coberturasSeleccionadas.map((c) => (
                <li key={c.id} className="text-sm">
                  {c.nombre}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onAnterior}>
          Anterior
        </Button>
        <Button onClick={onSiguiente} disabled={!haySeleccionadas}>
          Obtener Cotizaciones
        </Button>
      </CardFooter>
    </Card>
  )
}
