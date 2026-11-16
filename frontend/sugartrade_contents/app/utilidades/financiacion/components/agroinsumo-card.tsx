"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"

interface AgroinsumoProps {
  agroinsumo: {
    id: number
    nombre: string
    proveedor: string
    precio: number
    unidad: string
    disponibilidad: boolean
  }
  onSimular: (monto: number) => void
}

export function AgroinsumoCard({ agroinsumo, onSimular }: AgroinsumoProps) {
  const [cantidad, setCantidad] = useState(1)
  const [showForm, setShowForm] = useState(false)

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setCantidad(value)
    }
  }

  const montoTotal = agroinsumo.precio * cantidad

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{agroinsumo.nombre}</CardTitle>
            <CardDescription>{agroinsumo.proveedor}</CardDescription>
          </div>
          <Badge variant={agroinsumo.disponibilidad ? "default" : "secondary"}>
            {agroinsumo.disponibilidad ? "Disponible" : "No disponible"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Precio por {agroinsumo.unidad}:</span>
            <span className="font-medium">{formatCurrency(agroinsumo.precio)}</span>
          </div>

          {showForm && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor={`cantidad-${agroinsumo.id}`}>Cantidad ({agroinsumo.unidad})</Label>
                <Input
                  id={`cantidad-${agroinsumo.id}`}
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={handleCantidadChange}
                />
              </div>

              <div className="p-3 bg-muted/30 rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Monto total:</span>
                  <span className="font-medium">{formatCurrency(montoTotal)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Financiamiento disponible:</span>
                  <span className="font-medium">Hasta 6 meses</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/20 pt-4">
        <Button variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Ocultar" : "Solicitar"}
        </Button>
        {showForm && <Button onClick={() => onSimular(montoTotal)}>Simular</Button>}
      </CardFooter>
    </Card>
  )
}
