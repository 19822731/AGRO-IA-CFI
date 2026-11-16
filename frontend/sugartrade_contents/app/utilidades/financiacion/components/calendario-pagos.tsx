"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Pago {
  id: number
  tipo: string
  entidad: string
  concepto: string
  monto: number
  fechaVencimiento: string
  estado: string
}

interface CalendarioPagosProps {
  pagos: Pago[]
}

export function CalendarioPagos({ pagos }: CalendarioPagosProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  // Formatear fechas
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Obtener color de badge según estado
  const getEstadoVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pagado":
        return "success"
      case "pendiente":
        return "warning"
      case "vencido":
        return "destructive"
      case "programado":
        return "default"
      default:
        return "secondary"
    }
  }

  // Filtrar pagos por mes seleccionado
  const pagosFiltrados = pagos.filter((pago) => {
    if (!date) return true

    const fechaPago = new Date(pago.fechaVencimiento)
    return fechaPago.getMonth() === date.getMonth() && fechaPago.getFullYear() === date.getFullYear()
  })

  // Obtener fechas con pagos para el calendario
  const fechasConPagos = pagos.map((pago) => new Date(pago.fechaVencimiento))

  // Manejar clic en pago
  const handlePagoClick = (pago: Pago) => {
    setPagoSeleccionado(pago)
    setShowDialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendario de Pagos</CardTitle>
            <CardDescription>Seleccione una fecha para ver los pagos programados</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              highlightedDays={fechasConPagos.map((date) => date.getDate())}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagos del Mes</CardTitle>
            <CardDescription>
              {date ? date.toLocaleDateString("es-ES", { month: "long", year: "numeric" }) : "Todos los pagos"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagosFiltrados.length > 0 ? (
                  pagosFiltrados.map((pago) => (
                    <TableRow
                      key={pago.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handlePagoClick(pago)}
                    >
                      <TableCell>{formatearFecha(pago.fechaVencimiento)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{pago.entidad}</div>
                        <div className="text-sm text-muted-foreground">{pago.concepto}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(pago.monto)}</TableCell>
                      <TableCell>
                        <Badge variant={getEstadoVariant(pago.estado)}>{pago.estado}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No hay pagos programados para este mes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de detalle de pago */}
      {pagoSeleccionado && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalle del Pago</DialogTitle>
              <DialogDescription>Información detallada del pago seleccionado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p className="text-lg font-semibold">{pagoSeleccionado.tipo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge variant={getEstadoVariant(pagoSeleccionado.estado)} className="mt-1">
                    {pagoSeleccionado.estado}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entidad</p>
                <p className="text-lg font-semibold">{pagoSeleccionado.entidad}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concepto</p>
                <p className="text-lg font-semibold">{pagoSeleccionado.concepto}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monto</p>
                  <p className="text-lg font-semibold">{formatCurrency(pagoSeleccionado.monto)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Vencimiento</p>
                  <p className="text-lg font-semibold">{formatearFecha(pagoSeleccionado.fechaVencimiento)}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cerrar
              </Button>
              {pagoSeleccionado.estado === "pendiente" && <Button>Registrar Pago</Button>}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
