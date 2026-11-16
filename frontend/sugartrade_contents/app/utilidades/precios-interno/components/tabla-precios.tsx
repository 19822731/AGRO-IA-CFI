"use client"

import { useEffect, useState } from "react"
import { obtenerPreciosInternos, type PrecioInterno } from "@/lib/services/precios-interno-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function TablaPreciosInternos() {
  const [precios, setPrecios] = useState<PrecioInterno[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarPrecios = async () => {
    try {
      setCargando(true)
      setError(null)
      const datos = await obtenerPreciosInternos()
      setPrecios(datos)
    } catch (err) {
      console.error("Error al cargar precios:", err)
      setError("No se pudieron cargar los precios. Intente nuevamente.")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPrecios()
  }, [])

  // Formatear fecha para mostrar
  const formatearFecha = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr)
      return fecha.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (e) {
      return fechaStr
    }
  }

  // Formatear precio según la unidad
  const formatearPrecio = (precio: number, unidad: string) => {
    if (unidad.startsWith("ARS")) {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
      }).format(precio)
    } else if (unidad.startsWith("USD")) {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(precio)
    } else {
      return `${precio.toLocaleString("es-AR")} ${unidad}`
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Precios del Mercado Interno</CardTitle>
          <CardDescription>Historial de precios registrados</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={cargarPrecios} disabled={cargando}>
          <RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : cargando && precios.length === 0 ? (
          <div className="text-center py-4">Cargando precios...</div>
        ) : precios.length === 0 ? (
          <div className="text-center py-4">No hay precios registrados</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {precios.map((precio) => {
                // Parsear datos_json si es string
                let observacion = ""
                if (precio.datos_json) {
                  try {
                    const datos =
                      typeof precio.datos_json === "string" ? JSON.parse(precio.datos_json) : precio.datos_json
                    observacion = datos.observacion || ""
                  } catch (e) {
                    console.error("Error al parsear datos_json:", e)
                  }
                }

                return (
                  <TableRow key={precio.id}>
                    <TableCell>{formatearFecha(precio.fecha)}</TableCell>
                    <TableCell>{formatearPrecio(precio.precio, precio.unidad)}</TableCell>
                    <TableCell>{precio.unidad}</TableCell>
                    <TableCell>{observacion}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
