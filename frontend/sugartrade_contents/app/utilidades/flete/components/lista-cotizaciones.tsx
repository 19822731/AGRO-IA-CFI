"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Clock, DollarSign, Truck } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Cotizacion {
  id: string
  proveedor: string
  precio: number
  tiempoEstimado: string
  calificacion: number
}

interface ListaCotizacionesProps {
  cotizaciones: Cotizacion[]
  isLoading: boolean
}

export default function ListaCotizaciones({ cotizaciones, isLoading }: ListaCotizacionesProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (cotizaciones.length === 0) {
    return (
      <div className="text-center py-8">
        <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay cotizaciones disponibles</h3>
        <p className="text-muted-foreground mt-2">Complete el formulario para obtener cotizaciones de flete</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cotizaciones.map((cotizacion) => (
        <Card key={cotizacion.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <h3 className="font-medium text-lg mb-2">{cotizacion.proveedor}</h3>
              <div className="flex justify-between mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{cotizacion.tiempoEstimado}</span>
                </div>
                <div className="flex items-center text-sm text-amber-500">
                  <Star className="mr-1 h-4 w-4 fill-amber-500" />
                  <span>{cotizacion.calificacion.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4 text-green-600" />
                  <span className="font-bold text-lg">{formatCurrency(cotizacion.precio, "ARS")}</span>
                </div>
                <Button size="sm">Seleccionar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
