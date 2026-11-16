"use client"

import { useState } from "react"

// Definición de la región NOA (coordenadas aproximadas)
export const NOA_REGION = {
  north: -21.7, // Límite norte (Jujuy)
  south: -30.5, // Límite sur (La Rioja)
  east: -62.0, // Límite este (Santiago del Estero)
  west: -68.5, // Límite oeste (Catamarca/Salta)
  provinces: ["Jujuy", "Salta", "Tucumán", "Santiago del Estero", "Catamarca", "La Rioja"],
}

export interface GeolocationState {
  position: {
    latitude: number | null
    longitude: number | null
  }
  isInNOA: boolean
  province: string | null
  error: string | null
  loading: boolean
  getLocation: () => Promise<void>
}

export function useGeolocation(): GeolocationState {
  const [position, setPosition] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [isInNOA, setIsInNOA] = useState<boolean>(false)
  const [province, setProvince] = useState<string | null>(null)

  // Función para verificar si las coordenadas están dentro del NOA
  const checkIfInNOA = (lat: number, lng: number) => {
    const inRegion =
      lat <= NOA_REGION.north && lat >= NOA_REGION.south && lng <= NOA_REGION.east && lng >= NOA_REGION.west

    setIsInNOA(inRegion)

    // Determinación aproximada de la provincia (simplificada)
    if (inRegion) {
      // Lógica simplificada para determinar la provincia
      if (lat > -24 && lng < -64.5) setProvince("Jujuy")
      else if (lat > -26 && lng < -64) setProvince("Salta")
      else if (lat > -28 && lng > -66) setProvince("Tucumán")
      else if (lat < -26 && lng > -64) setProvince("Santiago del Estero")
      else if (lat < -27 && lng < -65) setProvince("Catamarca")
      else if (lat < -28) setProvince("La Rioja")
      else setProvince("NOA")
    } else {
      setProvince(null)
    }

    return inRegion
  }

  // Función para obtener la ubicación actual
  const getLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError("La geolocalización no está soportada por su navegador")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords
      setPosition({ latitude, longitude })
      checkIfInNOA(latitude, longitude)
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Usuario denegó la solicitud de geolocalización")
            break
          case err.POSITION_UNAVAILABLE:
            setError("Información de ubicación no disponible")
            break
          case err.TIMEOUT:
            setError("Se agotó el tiempo para obtener la ubicación")
            break
          default:
            setError("Error desconocido al obtener la ubicación")
        }
      } else {
        setError("Error al obtener la ubicación")
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    position,
    isInNOA,
    province,
    error,
    loading,
    getLocation,
  }
}
