"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"

interface HistorialItem {
  id: number
  tipo: string
  entidad: string
  monto: number
  fechaSolicitud: string
  estado: string
  plazo?: number
  tasaAnual?: number
  tasaDescuento?: number
}

interface HistorialFinanciamientoProps {
  historial: HistorialItem[]
}

export function HistorialFinanciamiento({ historial }: HistorialFinanciamientoProps) {
  const [filtro, setFiltro] = useState("")

  // Formatear fechas
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Filtrar historial
  const historialFiltrado = historial.filter(
    (item) =>
      item.tipo.toLowerCase().includes(filtro.toLowerCase()) ||
      item.entidad.toLowerCase().includes(filtro.toLowerCase()) ||
      item.estado.toLowerCase().includes(filtro.toLowerCase()),
  )

  // Obtener color de badge según estado
  const getEstadoVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "aprobado":
        return "success"
      case "procesado":
        return "default"
      case "en curso":
        return "warning"
      case "rechazado":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Financiamiento</CardTitle>
        <CardDescription>Registro de todas sus solicitudes de financiamiento</CardDescription>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Filtrar por tipo, entidad o estado..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <Button variant="outline" onClick={() => setFiltro("")}>
            Limpiar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Plazo/Tasa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historialFiltrado.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.tipo}</TableCell>
                <TableCell>{item.entidad}</TableCell>
                <TableCell>{formatCurrency(item.monto)}</TableCell>
                <TableCell>{formatearFecha(item.fechaSolicitud)}</TableCell>
                <TableCell>
                  {item.plazo ? `${item.plazo} meses` : ""}
                  {item.tasaAnual ? ` / ${item.tasaAnual}%` : ""}
                  {item.tasaDescuento ? `${item.tasaDescuento}%` : ""}
                </TableCell>
                <TableCell>
                  <Badge variant={getEstadoVariant(item.estado)}>{item.estado}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Ver detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
