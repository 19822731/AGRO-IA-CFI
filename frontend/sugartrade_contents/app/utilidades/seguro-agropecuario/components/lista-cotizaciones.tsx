"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import type { Cotizacion } from "../types"
import { Star, Shield, Clock, AlertCircle } from "lucide-react"

interface ListaCotizacionesProps {
  cotizaciones: Cotizacion[]
  isLoading: boolean
}

export function ListaCotizaciones({ cotizaciones, isLoading }: ListaCotizacionesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones Disponibles</CardTitle>
          <CardDescription>Obteniendo las mejores ofertas para su cultivo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="mb-4">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-20" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!cotizaciones || cotizaciones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones Disponibles</CardTitle>
          <CardDescription>Complete el formulario para obtener cotizaciones</CardDescription>
        </CardHeader>
        <CardContent className="py-10 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No hay cotizaciones disponibles. Complete el formulario para obtener ofertas de seguro.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cotizaciones Disponibles</CardTitle>
        <CardDescription>Seleccione la mejor opción para su cultivo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cotizaciones.map((cotizacion) => (
          <Card key={cotizacion.id} className="mb-4 border-2 hover:border-primary/50 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{cotizacion.aseguradora}</CardTitle>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{cotizacion.calificacion}</span>
                </div>
              </div>
              <CardDescription>Seguro para cultivo</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold">{formatCurrency(cotizacion.precio, "ARS")}</div>
                <Badge variant="outline" className="text-xs">
                  Recomendado
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Deducible: {cotizacion.deducible}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Plazo: {cotizacion.plazo}</span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium mb-1">Cobertura:</p>
                <div className="flex flex-wrap gap-1">
                  {cotizacion.cobertura.map((riesgo) => (
                    <Badge key={riesgo} variant="secondary" className="capitalize">
                      {riesgo}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Contratar Seguro</Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
