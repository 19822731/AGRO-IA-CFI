"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, AlertTriangle } from "lucide-react"
import { TarjetaCotizacion } from "./tarjeta-cotizacion"
import type { Cotizacion, DatosFinca, DatosProductor, Cobertura } from "../types/seguro"
import { obtenerCotizaciones } from "../services/api-service"

interface VisualizacionCotizacionesProps {
  datosProductor: DatosProductor
  datosFinca: DatosFinca
  coberturas: Cobertura[]
  cotizaciones: Cotizacion[]
  cotizacionSeleccionada: string | null
  onCotizacionesActualizadas: (cotizaciones: Cotizacion[]) => void
  onSeleccionarCotizacion: (id: string) => void
  onAnterior: () => void
  onSiguiente: () => void
}

export function VisualizacionCotizaciones({
  datosProductor,
  datosFinca,
  coberturas,
  cotizaciones,
  cotizacionSeleccionada,
  onCotizacionesActualizadas,
  onSeleccionarCotizacion,
  onAnterior,
  onSiguiente,
}: VisualizacionCotizacionesProps) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarCotizaciones = async () => {
      if (cotizaciones.length === 0) {
        setCargando(true)
        setError(null)
        try {
          const nuevasCotizaciones = await obtenerCotizaciones(datosProductor, datosFinca, coberturas)
          onCotizacionesActualizadas(nuevasCotizaciones)
        } catch (err) {
          setError("Error al obtener cotizaciones. Por favor, inténtelo nuevamente.")
          console.error(err)
        } finally {
          setCargando(false)
        }
      }
    }

    cargarCotizaciones()
  }, [datosProductor, datosFinca, coberturas, cotizaciones.length, onCotizacionesActualizadas])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Cotizaciones Disponibles</CardTitle>
        <CardDescription>
          Compare las cotizaciones y seleccione la que mejor se adapte a sus necesidades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="text-lg font-medium">Error al obtener cotizaciones</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => onCotizacionesActualizadas([])} variant="outline">
              Reintentar
            </Button>
          </div>
        ) : cotizaciones.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <div>
              <h3 className="text-lg font-medium">No hay cotizaciones disponibles</h3>
              <p className="text-muted-foreground">
                No se encontraron cotizaciones para las coberturas seleccionadas. Por favor, modifique su selección e
                inténtelo nuevamente.
              </p>
            </div>
            <Button onClick={onAnterior} variant="outline">
              Volver a Selección de Coberturas
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cotizaciones.map((cotizacion) => (
                <TarjetaCotizacion
                  key={cotizacion.aseguradoraId}
                  cotizacion={cotizacion}
                  seleccionada={cotizacion.aseguradoraId === cotizacionSeleccionada}
                  onSeleccionar={() => onSeleccionarCotizacion(cotizacion.aseguradoraId)}
                />
              ))}
            </div>

            {!cotizacionSeleccionada && cotizaciones.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm">Seleccione una cotización para continuar con el proceso.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onAnterior}>
          Anterior
        </Button>
        <Button onClick={onSiguiente} disabled={!cotizacionSeleccionada || cargando}>
          Continuar
        </Button>
      </CardFooter>
    </Card>
  )
}
