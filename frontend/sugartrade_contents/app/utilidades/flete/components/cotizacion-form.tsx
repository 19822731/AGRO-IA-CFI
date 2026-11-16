"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CotizacionFormProps {
  onCotizar: (formData: any) => void
  isLoading: boolean
}

export default function CotizacionForm({ onCotizar, isLoading }: CotizacionFormProps) {
  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState("")
  const [tipoCarga, setTipoCarga] = useState("")
  const [peso, setPeso] = useState("")
  const [fecha, setFecha] = useState<Date | undefined>(undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCotizar({
      origen,
      destino,
      tipoCarga,
      peso: Number(peso),
      fecha,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="origen">Origen</Label>
        <Input
          id="origen"
          placeholder="Ciudad o dirección de origen"
          value={origen}
          onChange={(e) => setOrigen(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="destino">Destino</Label>
        <Input
          id="destino"
          placeholder="Ciudad o dirección de destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipoCarga">Tipo de Carga</Label>
        <Select value={tipoCarga} onValueChange={setTipoCarga} required>
          <SelectTrigger id="tipoCarga">
            <SelectValue placeholder="Seleccione tipo de carga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="azucar">Azúcar</SelectItem>
            <SelectItem value="granos">Granos</SelectItem>
            <SelectItem value="fertilizantes">Fertilizantes</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="peso">Peso (kg)</Label>
        <Input
          id="peso"
          type="number"
          placeholder="Peso en kilogramos"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fecha">Fecha de Recogida</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="fecha"
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !fecha && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccione una fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={fecha} onSelect={setFecha} initialFocus locale={es} />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cotizando...
          </>
        ) : (
          "Obtener Cotizaciones"
        )}
      </Button>
    </form>
  )
}
