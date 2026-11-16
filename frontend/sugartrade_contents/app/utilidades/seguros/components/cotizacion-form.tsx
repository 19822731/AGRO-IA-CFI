"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const TIPOS_CULTIVO = [
  { id: "caña", nombre: "Caña de Azúcar" },
  { id: "maiz", nombre: "Maíz" },
  { id: "soja", nombre: "Soja" },
  { id: "trigo", nombre: "Trigo" },
  { id: "girasol", nombre: "Girasol" },
]

const PROVINCIAS = [
  { id: "tucuman", nombre: "Tucumán" },
  { id: "salta", nombre: "Salta" },
  { id: "jujuy", nombre: "Jujuy" },
  { id: "chaco", nombre: "Chaco" },
  { id: "santafe", nombre: "Santa Fe" },
  { id: "cordoba", nombre: "Córdoba" },
  { id: "buenosaires", nombre: "Buenos Aires" },
]

const RIESGOS = [
  { id: "granizo", nombre: "Granizo" },
  { id: "inundacion", nombre: "Inundación" },
  { id: "sequia", nombre: "Sequía" },
  { id: "helada", nombre: "Helada" },
  { id: "incendio", nombre: "Incendio" },
]

export default function CotizacionForm() {
  const [tipoCultivo, setTipoCultivo] = useState("")
  const [ubicacion, setUbicacion] = useState("")
  const [superficie, setSuperficie] = useState("")
  const [riesgos, setRiesgos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleRiesgoChange = (riesgoId: string, checked: boolean) => {
    if (checked) {
      setRiesgos([...riesgos, riesgoId])
    } else {
      setRiesgos(riesgos.filter((r) => r !== riesgoId))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!tipoCultivo || !ubicacion || !superficie || riesgos.length === 0) {
      alert("Por favor complete todos los campos requeridos")
      return
    }

    setIsLoading(true)

    // Simulamos una llamada a la API
    setTimeout(() => {
      setIsLoading(false)

      // Aquí se dispararía un evento o se llamaría a una función para obtener cotizaciones
      console.log("Datos de cotización:", {
        tipoCultivo,
        ubicacion,
        superficie: Number(superficie),
        riesgos,
      })

      // Disparar un evento personalizado que ListaCotizaciones puede escuchar
      const event = new CustomEvent("nuevaCotizacion", {
        detail: {
          tipoCultivo,
          ubicacion,
          superficie: Number(superficie),
          riesgos,
        },
      })
      document.dispatchEvent(event)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cotizar Seguro</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipoCultivo">Tipo de Cultivo</Label>
            <Select value={tipoCultivo} onValueChange={setTipoCultivo}>
              <SelectTrigger id="tipoCultivo">
                <SelectValue placeholder="Seleccione un cultivo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_CULTIVO.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación (Provincia)</Label>
            <Select value={ubicacion} onValueChange={setUbicacion}>
              <SelectTrigger id="ubicacion">
                <SelectValue placeholder="Seleccione una provincia" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCIAS.map((provincia) => (
                  <SelectItem key={provincia.id} value={provincia.id}>
                    {provincia.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="superficie">Superficie (hectáreas)</Label>
            <Input
              id="superficie"
              type="number"
              min="1"
              value={superficie}
              onChange={(e) => setSuperficie(e.target.value)}
              placeholder="Ej: 100"
            />
          </div>

          <div className="space-y-2">
            <Label>Riesgos a Cubrir</Label>
            <div className="grid grid-cols-2 gap-2">
              {RIESGOS.map((riesgo) => (
                <div key={riesgo.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`riesgo-${riesgo.id}`}
                    checked={riesgos.includes(riesgo.id)}
                    onCheckedChange={(checked) => handleRiesgoChange(riesgo.id, checked as boolean)}
                  />
                  <Label htmlFor={`riesgo-${riesgo.id}`} className="text-sm">
                    {riesgo.nombre}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Obteniendo cotizaciones...
              </>
            ) : (
              "Obtener Cotizaciones"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
