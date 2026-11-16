"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import type { TipoOrden } from "../types"

interface OrdenCompletadaProps {
  tipoOrden: TipoOrden
  onVerPortafolio: () => void
  onNuevaOrden: () => void
}

export function OrdenCompletada({ tipoOrden, onVerPortafolio, onNuevaOrden }: OrdenCompletadaProps) {
  const esMercado = tipoOrden === "mercado"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
          Orden {esMercado ? "Ejecutada" : "Recibida"} con Éxito
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-md">
          {esMercado ? (
            <p>
              Tu orden de mercado ha sido ejecutada exitosamente. Puedes ver los detalles de la operación en tu
              portafolio.
            </p>
          ) : (
            <p>
              Tu orden límite ha sido recibida y está pendiente de ejecución. Recibirás una notificación cuando se
              ejecute. Puedes ver el estado de tu orden en tu portafolio.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onNuevaOrden}>
          Nueva Orden
        </Button>
        <Button onClick={onVerPortafolio}>Ver Portafolio</Button>
      </CardFooter>
    </Card>
  )
}
