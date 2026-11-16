"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Shield, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Cotizacion, DatosCotizacion } from "../types"

// Función para generar cotizaciones simuladas
const generarCotizaciones = (datos?: DatosCotizacion): Cotizacion[] => {
  if (!datos) return []

  const basePrice = 1500 // Precio base por hectárea en ARS
  const superficieMultiplier = datos.superficie / 100 // Factor por superficie
  const riesgosMultiplier = 1 + datos.riesgos.length * 0.15 // Factor por cantidad de riesgos

  // Aseguradoras simuladas
  const aseguradoras = [
    { nombre: "Aseguradora del Campo", calificacion: 4.5, factor: 1.05 },
    { nombre: "Protección Agrícola", calificacion: 4.2, factor: 0.95 },
    { nombre: "Seguro Rural", calificacion: 4.8, factor: 1.15 },
  ]

  return aseguradoras.map((aseguradora) => {
    // Cálculo del precio con variaciones por aseguradora
    const precioBase = basePrice * superficieMultiplier * riesgosMultiplier * aseguradora.factor
    const precioTotal = Math.round(precioBase * datos.superficie)

    // Generar coberturas específicas basadas en los riesgos seleccionados
    const coberturas = datos.riesgos.map((riesgo) => {
      const porcentajes: Record<string, number> = {
        granizo: 100,
        inundacion: 80,
        sequia: 70,
        helada: 85,
        incendio: 90,
      }

      return {
        tipo: riesgo,
        porcentaje: porcentajes[riesgo] || 75,
      }
    })

    return {
      id: `cotizacion-${aseguradora.nombre.toLowerCase().replace(/\s/g, "-")}`,
      aseguradora: aseguradora.nombre,
      precio: precioTotal,
      precioPorHectarea: Math.round(precioBase),
      calificacion: aseguradora.calificacion,
      coberturas,
      deducible: Math.round(10 + Math.random() * 10), // Deducible entre 10% y 20%
      vigencia: 12, // meses
      tiempoRespuesta: Math.round(24 + Math.random() * 48), // Entre 24 y 72 horas
    }
  })
}

export default function ListaCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Escuchar el evento personalizado de nueva cotización
    const handleNuevaCotizacion = (event: CustomEvent<DatosCotizacion>) => {
      setIsLoading(true)

      // Simular tiempo de carga
      setTimeout(() => {
        const nuevasCotizaciones = generarCotizaciones(event.detail)
        setCotizaciones(nuevasCotizaciones)
        setIsLoading(false)
      }, 1500)
    }

    // Añadir el event listener
    document.addEventListener("nuevaCotizacion", handleNuevaCotizacion as EventListener)

    // Limpiar el event listener
    return () => {
      document.removeEventListener("nuevaCotizacion", handleNuevaCotizacion as EventListener)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Cotizaciones Disponibles</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-border">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between mb-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-1/3" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (cotizaciones.length === 0) {
    return (
      <Card className="border border-border">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px] text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No hay cotizaciones disponibles</h3>
          <p className="text-muted-foreground max-w-md">
            Complete el formulario de cotización para obtener ofertas de seguros adaptadas a sus necesidades.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Cotizaciones Disponibles</h2>
      <div className="space-y-4">
        {cotizaciones.map((cotizacion) => (
          <Card key={cotizacion.id} className="border border-border">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{cotizacion.aseguradora}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(cotizacion.calificacion)
                              ? "text-yellow-500 fill-yellow-500"
                              : i < cotizacion.calificacion
                                ? "text-yellow-500 fill-yellow-500 opacity-50"
                                : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-sm">{cotizacion.calificacion.toFixed(1)}</span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  Recomendado
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Precio total</p>
                  <p className="text-2xl font-bold">{formatCurrency(cotizacion.precio, "ARS")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Por hectárea</p>
                  <p className="text-lg font-semibold">{formatCurrency(cotizacion.precioPorHectarea, "ARS")}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Cobertura</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cotizacion.coberturas.map((cobertura) => (
                        <Badge key={cobertura.tipo} variant="secondary" className="text-xs">
                          {cobertura.tipo.charAt(0).toUpperCase() + cobertura.tipo.slice(1)}: {cobertura.porcentaje}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Deducible:</span> {cotizacion.deducible}%
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vigencia:</span> {cotizacion.vigencia} meses
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tiempo de respuesta:</span> {cotizacion.tiempoRespuesta}h
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button className="w-full">Contratar Seguro</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
