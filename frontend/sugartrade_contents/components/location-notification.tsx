"use client"

import { useState, useEffect } from "react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, X } from "lucide-react"

interface LocationNotificationProps {
  onAnalyzeArea?: (lat: number, lng: number) => void
}

export default function LocationNotification({ onAnalyzeArea }: LocationNotificationProps) {
  const { position, isInNOA, province, error, loading, getLocation } = useGeolocation()
  const [dismissed, setDismissed] = useState(false)
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false)

  // Verificar si ya se ha solicitado la ubicación anteriormente
  useEffect(() => {
    const locationRequested = localStorage.getItem("locationRequested")
    if (locationRequested) {
      setHasRequestedLocation(true)
    }
  }, [])

  // Si el usuario ha descartado la notificación o no está en el NOA, no mostrar nada
  if (dismissed || (hasRequestedLocation && !isInNOA) || !hasRequestedLocation) {
    return null
  }

  const handleRequestLocation = () => {
    getLocation()
    localStorage.setItem("locationRequested", "true")
    setHasRequestedLocation(true)
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  const handleAnalyzeArea = () => {
    if (position.latitude && position.longitude && onAnalyzeArea) {
      onAnalyzeArea(position.latitude, position.longitude)
      setDismissed(true)
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-[#111936] border-[#1a2040] shadow-lg z-50">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-[#00a8ff] mr-2" />
            <h3 className="text-white font-medium">Ubicación detectada</h3>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!hasRequestedLocation ? (
          <div>
            <p className="text-gray-300 text-sm mb-3">
              ¿Desea permitir que Sugar Trade detecte su ubicación para ofrecer análisis específicos para su región?
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                No, gracias
              </Button>
              <Button size="sm" onClick={handleRequestLocation} disabled={loading}>
                {loading ? "Detectando..." : "Permitir"}
              </Button>
            </div>
          </div>
        ) : isInNOA ? (
          <div>
            <p className="text-gray-300 text-sm mb-1">
              Detectamos que se encuentra en la región del NOA
              {province && ` (${province})`}.
            </p>
            <p className="text-gray-300 text-sm mb-3">¿Desea realizar un análisis específico para su área?</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                No, gracias
              </Button>
              <Button size="sm" onClick={handleAnalyzeArea}>
                Analizar mi área
              </Button>
            </div>
          </div>
        ) : error ? (
          <div>
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={handleDismiss} className="w-full">
              Entendido
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-gray-300 text-sm mb-3">
              Su ubicación está fuera de la región del NOA. Puede seleccionar manualmente un área de interés en el mapa.
            </p>
            <Button variant="outline" size="sm" onClick={handleDismiss} className="w-full">
              Entendido
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
