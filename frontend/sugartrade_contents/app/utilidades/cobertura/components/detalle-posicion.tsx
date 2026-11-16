"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { PosicionPortafolio, OrdenCobertura } from "../types"
import { useCobertura } from "../hooks/use-cobertura"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react"

interface DetallePosicionProps {
  posicion: PosicionPortafolio
  precioActual: number
  onVolver: () => void
}

export function DetallePosicion({ posicion, precioActual, onVolver }: DetallePosicionProps) {
  const { cerrarPosicion, modificarOrdenCondicional, cancelarOrden } = useCobertura()
  const [cargando, setCargando] = useState(false)
  const [dialogoModificarAbierto, setDialogoModificarAbierto] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCobertura | null>(null)
  const [nuevoPrecio, setNuevoPrecio] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [dialogoCerrarAbierto, setDialogoCerrarAbierto] = useState(false)

  const nombreContrato = posicion.tipoContrato === "contrato5" ? "Contrato #5" : "Contrato #11"
  const gananciaValor = (precioActual - posicion.precioEntrada) * posicion.cantidad
  const gananciaPorcentaje = (precioActual / posicion.precioEntrada - 1) * 100
  const esGanancia = gananciaValor >= 0

  const handleModificarOrden = (orden: OrdenCobertura) => {
    setOrdenSeleccionada(orden)
    setNuevoPrecio(orden.tipoOrden === "stop-loss" ? orden.precioStopLoss || 0 : orden.precioTakeProfit || 0)
    setDialogoModificarAbierto(true)
  }

  const handleGuardarModificacion = async () => {
    if (!ordenSeleccionada) return

    if (nuevoPrecio <= 0) {
      setError("El precio debe ser mayor que cero")
      return
    }

    setCargando(true)
    try {
      await modificarOrdenCondicional(
        ordenSeleccionada.id,
        ordenSeleccionada.tipoOrden as "stop-loss" | "take-profit",
        nuevoPrecio,
      )
      setDialogoModificarAbierto(false)
    } catch (error) {
      console.error("Error al modificar orden:", error)
      setError("Error al modificar la orden. Intente nuevamente.")
    } finally {
      setCargando(false)
    }
  }

  const handleCancelarOrden = async (ordenId: string) => {
    setCargando(true)
    try {
      await cancelarOrden(ordenId)
    } catch (error) {
      console.error("Error al cancelar orden:", error)
    } finally {
      setCargando(false)
    }
  }

  const handleCerrarPosicion = async () => {
    setCargando(true)
    try {
      await cerrarPosicion(posicion.id)
      setDialogoCerrarAbierto(false)
      onVolver()
    } catch (error) {
      console.error("Error al cerrar posición:", error)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onVolver} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Detalle de Posición</CardTitle>
            <CardDescription>
              {nombreContrato} - {posicion.cantidad} contratos
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Precio de Entrada</h3>
              <p className="text-2xl font-bold mt-1">{formatCurrency(posicion.precioEntrada)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Precio Actual</h3>
              <p className="text-2xl font-bold mt-1">{formatCurrency(precioActual)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Ganancia/Pérdida</h3>
              <p className={`text-2xl font-bold mt-1 ${esGanancia ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(gananciaValor)} ({gananciaPorcentaje.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Órdenes Condicionales</h3>
          {posicion.ordenesAsociadas.length === 0 ? (
            <p className="text-muted-foreground">No hay órdenes condicionales asociadas a esta posición.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posicion.ordenesAsociadas.map((orden) => (
                  <TableRow key={orden.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {orden.tipoOrden === "stop-loss" ? (
                          <>
                            <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                            <span>Stop-Loss</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                            <span>Take-Profit</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {orden.tipoOrden === "stop-loss"
                        ? formatCurrency(orden.precioStopLoss || 0)
                        : formatCurrency(orden.precioTakeProfit || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={orden.estado === "pendiente" ? "default" : "secondary"}>
                        {orden.estado === "pendiente"
                          ? "Activa"
                          : orden.estado === "ejecutada"
                            ? "Ejecutada"
                            : "Cancelada"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {orden.estado === "pendiente" && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleModificarOrden(orden)}>
                            Modificar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleCancelarOrden(orden.id)}>
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="pt-4">
          <Dialog open={dialogoCerrarAbierto} onOpenChange={setDialogoCerrarAbierto}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Cerrar Posición
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar cierre de posición</DialogTitle>
                <DialogDescription>
                  Estás a punto de cerrar tu posición en {nombreContrato} al precio actual de mercado (
                  {formatCurrency(precioActual)}).
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-start space-x-3 p-3 border rounded-md bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Confirmación requerida</p>
                    <p className="text-sm text-muted-foreground">
                      Esta acción cerrará tu posición inmediatamente al precio actual de mercado y cancelará todas las
                      órdenes condicionales asociadas.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium">Resumen de la operación:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Precio de entrada:</span>
                      <span>{formatCurrency(posicion.precioEntrada)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Precio de cierre (estimado):</span>
                      <span>{formatCurrency(precioActual)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Ganancia/Pérdida:</span>
                      <span className={esGanancia ? "text-green-500" : "text-red-500"}>
                        {formatCurrency(gananciaValor)} ({gananciaPorcentaje.toFixed(2)}%)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogoCerrarAbierto(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleCerrarPosicion} disabled={cargando}>
                  {cargando ? "Procesando..." : "Confirmar cierre"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start">
        <Button variant="outline" onClick={onVolver}>
          Volver al portafolio
        </Button>
      </CardFooter>

      <Dialog open={dialogoModificarAbierto} onOpenChange={setDialogoModificarAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Modificar {ordenSeleccionada?.tipoOrden === "stop-loss" ? "Stop-Loss" : "Take-Profit"}
            </DialogTitle>
            <DialogDescription>Ingresa el nuevo precio para tu orden condicional.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nuevoPrecio">Nuevo precio</Label>
                <Input
                  id="nuevoPrecio"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={nuevoPrecio}
                  onChange={(e) => {
                    setNuevoPrecio(Number.parseFloat(e.target.value))
                    setError(null)
                  }}
                  className={error ? "border-red-500" : ""}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoModificarAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarModificacion} disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
