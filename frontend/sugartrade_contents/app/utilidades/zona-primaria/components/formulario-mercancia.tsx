"use client"

import type React from "react"

import { useState } from "react"
import { useZonaPrimaria } from "../hooks/use-zona-primaria"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Mercancia } from "../types"

interface FormularioMercanciaProps {
  onCancel: () => void
  onComplete: () => void
}

export default function FormularioMercancia({ onCancel, onComplete }: FormularioMercanciaProps) {
  const { agregarMercancia } = useZonaPrimaria()
  const [mercancia, setMercancia] = useState<Partial<Mercancia>>({
    descripcion: "",
    cantidad: 0,
    peso: 0,
    unidad: "unidad",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!mercancia.descripcion || !mercancia.cantidad || !mercancia.peso || !mercancia.unidad) {
      return
    }

    agregarMercancia(mercancia as Mercancia)
    onComplete()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Mercancía</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Input
                id="descripcion"
                value={mercancia.descripcion}
                onChange={(e) => setMercancia({ ...mercancia, descripcion: e.target.value })}
                placeholder="Descripción de la mercancía"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  value={mercancia.cantidad || ""}
                  onChange={(e) => setMercancia({ ...mercancia, cantidad: Number.parseFloat(e.target.value) })}
                  placeholder="Ej. 10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidad">Unidad *</Label>
                <Select
                  value={mercancia.unidad}
                  onValueChange={(value) => setMercancia({ ...mercancia, unidad: value })}
                >
                  <SelectTrigger id="unidad">
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidad">Unidad</SelectItem>
                    <SelectItem value="caja">Caja</SelectItem>
                    <SelectItem value="pallet">Pallet</SelectItem>
                    <SelectItem value="bulto">Bulto</SelectItem>
                    <SelectItem value="contenedor">Contenedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg) *</Label>
                <Input
                  id="peso"
                  type="number"
                  value={mercancia.peso || ""}
                  onChange={(e) => setMercancia({ ...mercancia, peso: Number.parseFloat(e.target.value) })}
                  placeholder="Ej. 100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volumen">Volumen (m³) (opcional)</Label>
                <Input
                  id="volumen"
                  type="number"
                  value={mercancia.volumen || ""}
                  onChange={(e) => setMercancia({ ...mercancia, volumen: Number.parseFloat(e.target.value) })}
                  placeholder="Ej. 2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origen">Origen (opcional)</Label>
                <Input
                  id="origen"
                  value={mercancia.origen || ""}
                  onChange={(e) => setMercancia({ ...mercancia, origen: e.target.value })}
                  placeholder="País o lugar de origen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destino">Destino (opcional)</Label>
                <Input
                  id="destino"
                  value={mercancia.destino || ""}
                  onChange={(e) => setMercancia({ ...mercancia, destino: e.target.value })}
                  placeholder="País o lugar de destino"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!mercancia.descripcion || !mercancia.cantidad || !mercancia.peso || !mercancia.unidad}
          >
            Agregar Mercancía
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
