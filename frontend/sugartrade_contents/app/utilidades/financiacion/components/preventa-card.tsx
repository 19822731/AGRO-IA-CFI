"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"

interface PreVentaProps {
  preventa: {
    id: number
    empresa: string
    demandaAnual: number
    precioFuturo: number
    plazoEntrega: string
    condicionesPago: string
  }
  onSimular: (monto: number) => void
}

export function PreVentaCard({ preventa, onSimular }: PreVentaProps) {
  const [toneladas, setToneladas] = useState(100)
  const [showForm, setShowForm] = useState(false)

  const handleToneladasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setToneladas(value)
    }
  }

  const montoTotal = preventa.precioFuturo * toneladas
  const montoAnticipado = montoTotal * 0.5 // 50% anticipado

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{preventa.empresa}</CardTitle>
            <CardDescription>Demanda anual: {preventa.demandaAnual} ton</CardDescription>
          </div>
          <Badge>Pre-Venta</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Precio futuro por tonelada:</span>
            <span className="font-medium">{formatCurrency(preventa.precioFuturo)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Plazo de entrega:</span>
            <span className="font-medium">{preventa.plazoEntrega}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Condiciones de pago:</span>
            <span className="font-medium">{preventa.condicionesPago}</span>
          </div>

          {showForm && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor={`toneladas-${preventa.id}`}>Toneladas a pre-vender</Label>
                <Input
                  id={`toneladas-${preventa.id}`}
                  type="number"
                  min="1"
                  max={preventa.demandaAnual}
                  value={toneladas}
                  onChange={handleToneladasChange}
                />
              </div>

              <div className="p-3 bg-muted/30 rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Monto total del contrato:</span>
                  <span className="font-medium">{formatCurrency(montoTotal)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Monto a recibir por anticipado:</span>
                  <span className="font-medium">{formatCurrency(montoAnticipado)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Garantía requerida:</span>
                  <span className="font-medium">50% en certificados</span>
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
        {showForm && <Button onClick={() => onSimular(montoAnticipado)}>Simular</Button>}
      </CardFooter>
    </Card>
  )
}
