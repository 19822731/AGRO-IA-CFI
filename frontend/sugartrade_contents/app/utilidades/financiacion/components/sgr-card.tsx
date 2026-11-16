"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { formatCurrency } from "@/lib/utils"

interface SGRProps {
  sgr: {
    id: number
    nombre: string
    tasaAnual: number
    montoMaximo: number
    plazoMaximo: number
    requisitos: string[]
    estado: string
  }
  onSimular: (monto: number, plazo: number) => void
}

export function SGRCard({ sgr, onSimular }: SGRProps) {
  const [monto, setMonto] = useState(sgr.montoMaximo / 2)
  const [plazo, setPlazo] = useState(Math.floor(sgr.plazoMaximo / 2))
  const [showForm, setShowForm] = useState(false)

  const handleMontoChange = (value: number[]) => {
    setMonto(value[0])
  }

  const handlePlazoChange = (value: number[]) => {
    setPlazo(value[0])
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{sgr.nombre}</CardTitle>
            <CardDescription>Tasa Anual: {sgr.tasaAnual}%</CardDescription>
          </div>
          <Badge variant={sgr.estado === "disponible" ? "default" : "secondary"}>
            {sgr.estado === "disponible" ? "Disponible" : "No disponible"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Monto Máximo:</span>
            <span className="font-medium">{formatCurrency(sgr.montoMaximo)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Plazo Máximo:</span>
            <span className="font-medium">{sgr.plazoMaximo} meses</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Requisitos:</p>
            <ul className="text-sm space-y-1">
              {sgr.requisitos.map((req, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 mr-2 text-green-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {showForm && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor={`monto-${sgr.id}`}>Monto a solicitar</Label>
                  <span className="text-sm font-medium">{formatCurrency(monto)}</span>
                </div>
                <Slider
                  id={`monto-${sgr.id}`}
                  min={1000000}
                  max={sgr.montoMaximo}
                  step={100000}
                  value={[monto]}
                  onValueChange={handleMontoChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor={`plazo-${sgr.id}`}>Plazo (meses)</Label>
                  <span className="text-sm font-medium">{plazo} meses</span>
                </div>
                <Slider
                  id={`plazo-${sgr.id}`}
                  min={1}
                  max={sgr.plazoMaximo}
                  step={1}
                  value={[plazo]}
                  onValueChange={handlePlazoChange}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/20 pt-4">
        <Button variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Ocultar" : "Solicitar"}
        </Button>
        {showForm && <Button onClick={() => onSimular(monto, plazo)}>Simular</Button>}
      </CardFooter>
    </Card>
  )
}
