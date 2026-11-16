"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CotizacionFormProps {
  onObtenerCotizaciones: (datosCotizacion: any) => void
  isLoading: boolean
}

export function CotizacionForm({ onObtenerCotizaciones, isLoading }: CotizacionFormProps) {
  const [tipoCultivo, setTipoCultivo] = useState("")
  const [ubicacion, setUbicacion] = useState("")
  const [superficie, setSuperficie] = useState("")
  const [riesgos, setRiesgos] = useState<string[]>([])

  const handleRiesgoChange = (riesgo: string) => {
    if (riesgos.includes(riesgo)) {
      setRiesgos(riesgos.filter((r) => r !== riesgo))
    } else {
      setRiesgos([...riesgos, riesgo])
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const datosCotizacion = {
      tipoCultivo,
      ubicacion,
      superficie: Number.parseFloat(superficie),
      riesgos,
    }
    onObtenerCotizaciones(datosCotizacion)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tipoCultivo">Tipo de Cultivo</Label>
        <Select value={tipoCultivo} onValueChange={setTipoCultivo} required>
          <SelectTrigger id="tipoCultivo">
            <SelectValue placeholder="Seleccione un cultivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="caña_azucar">Caña de Azúcar</SelectItem>
            <SelectItem value="maiz">Maíz</SelectItem>
            <SelectItem value="soja">Soja</SelectItem>
            <SelectItem value="trigo">Trigo</SelectItem>
            <SelectItem value="girasol">Girasol</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ubicacion">Ubicación</Label>
        <Select value={ubicacion} onValueChange={setUbicacion} required>
          <SelectTrigger id="ubicacion">
            <SelectValue placeholder="Seleccione una provincia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tucuman">Tucumán</SelectItem>
            <SelectItem value="salta">Salta</SelectItem>
            <SelectItem value="jujuy">Jujuy</SelectItem>
            <SelectItem value="santa_fe">Santa Fe</SelectItem>
            <SelectItem value="cordoba">Córdoba</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="superficie">Superficie (hectáreas)</Label>
        <Input
          type="number"
          id="superficie"
          value={superficie}
          onChange={(e) => setSuperficie(e.target.value)}
          min="1"
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Riesgos a Cubrir</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="granizo"
              checked={riesgos.includes("granizo")}
              onCheckedChange={() => handleRiesgoChange("granizo")}
            />
            <Label htmlFor="granizo" className="font-normal">
              Granizo
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="inundacion"
              checked={riesgos.includes("inundacion")}
              onCheckedChange={() => handleRiesgoChange("inundacion")}
            />
            <Label htmlFor="inundacion" className="font-normal">
              Inundación
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sequia"
              checked={riesgos.includes("sequia")}
              onCheckedChange={() => handleRiesgoChange("sequia")}
            />
            <Label htmlFor="sequia" className="font-normal">
              Sequía
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="helada"
              checked={riesgos.includes("helada")}
              onCheckedChange={() => handleRiesgoChange("helada")}
            />
            <Label htmlFor="helada" className="font-normal">
              Helada
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="incendio"
              checked={riesgos.includes("incendio")}
              onCheckedChange={() => handleRiesgoChange("incendio")}
            />
            <Label htmlFor="incendio" className="font-normal">
              Incendio
            </Label>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !tipoCultivo || !ubicacion || !superficie || riesgos.length === 0}
      >
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
  )
}
