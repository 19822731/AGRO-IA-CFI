"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"

interface ECheqProps {
  echeq: {
    id: number
    numero: string
    monto: number
    fechaEmision: string
    fechaVencimiento: string
    emisor: string
    estado: string
  }
  entidades: {
    id: number
    nombre: string
    tasaDescuento: number
    plazoMaximo: number
    montoMinimo: number
  }[]
  onSimular: (monto: number, tasa: number) => void
}

export function ECheqCard({ echeq, entidades, onSimular }: ECheqProps) {
  const [entidadSeleccionada, setEntidadSeleccionada] = useState<string>("")
  const [showForm, setShowForm] = useState(false)

  const entidadActual = entidades.find((e) => e.id.toString() === entidadSeleccionada)

  // Calcular días hasta vencimiento
  const fechaActual = new Date()
  const fechaVencimiento = new Date(echeq.fechaVencimiento)
  const diasHastaVencimiento = Math.ceil((fechaVencimiento.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24))

  // Formatear fechas
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{echeq.numero}</CardTitle>
            <CardDescription>{echeq.emisor}</CardDescription>
          </div>
          <Badge variant={echeq.estado === "pendiente" ? "default" : "secondary"}>
            {echeq.estado === "pendiente" ? "Pendiente" : "Descontado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Monto:</span>
            <span className="font-medium">{formatCurrency(echeq.monto)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Fecha de Emisión:</span>
            <span className="font-medium">{formatearFecha(echeq.fechaEmision)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Fecha de Vencimiento:</span>
            <span className="font-medium">{formatearFecha(echeq.fechaVencimiento)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Días hasta vencimiento:</span>
            <span className="font-medium">{diasHastaVencimiento} días</span>
          </div>

          {showForm && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor={`entidad-${echeq.id}`}>Entidad Financiera</Label>
                <Select value={entidadSeleccionada} onValueChange={setEntidadSeleccionada}>
                  <SelectTrigger id={`entidad-${echeq.id}`}>
                    <SelectValue placeholder="Seleccionar entidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {entidades.map((entidad) => (
                      <SelectItem key={entidad.id} value={entidad.id.toString()}>
                        {entidad.nombre} - {entidad.tasaDescuento}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {entidadActual && (
                <div className="space-y-2 p-3 bg-muted/30 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Tasa de descuento:</span>
                    <span className="font-medium">{entidadActual.tasaDescuento}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Plazo máximo:</span>
                    <span className="font-medium">{entidadActual.plazoMaximo} días</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monto mínimo:</span>
                    <span className="font-medium">{formatCurrency(entidadActual.montoMinimo)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/20 pt-4">
        <Button variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Ocultar" : "Descontar"}
        </Button>
        {showForm && entidadActual && (
          <Button onClick={() => onSimular(echeq.monto, entidadActual.tasaDescuento)} disabled={!entidadSeleccionada}>
            Simular
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
