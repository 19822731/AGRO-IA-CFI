"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"

interface MapaUbicacionProps {
  ubicacionInicial: { lat: number; lng: number }
  onUbicacionChange: (lat: number, lng: number) => void
}

export function MapaUbicacion({ ubicacionInicial, onUbicacionChange }: MapaUbicacionProps) {
  const [ubicacion, setUbicacion] = useState(ubicacionInicial)

  // Simulamos un mapa interactivo con un div
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Simulamos cambios en las coordenadas basados en la posición del clic
    const newLat = ubicacionInicial.lat + (y - rect.height / 2) / 1000
    const newLng = ubicacionInicial.lng + (x - rect.width / 2) / 1000

    setUbicacion({ lat: newLat, lng: newLng })
    onUbicacionChange(newLat, newLng)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Label className="text-sm font-medium mb-2 block">Seleccione la ubicación de su finca</Label>
        <div
          className="relative w-full h-[300px] bg-muted/30 rounded-md border cursor-crosshair overflow-hidden"
          onClick={handleMapClick}
        >
          {/* Simulación de un mapa */}
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=300&width=600')] bg-cover bg-center opacity-50"></div>

          {/* Marcador de ubicación */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: "50%",
              top: "50%",
            }}
          >
            <MapPin className="h-8 w-8 text-primary" />
          </div>

          {/* Información de coordenadas */}
          <div className="absolute bottom-2 right-2 bg-background/80 p-2 rounded text-xs">
            Lat: {ubicacion.lat.toFixed(4)}, Lng: {ubicacion.lng.toFixed(4)}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Haga clic en el mapa para seleccionar la ubicación exacta de su finca.
        </p>
      </CardContent>
    </Card>
  )
}
