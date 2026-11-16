"use client"

import { useState, useEffect } from "react"

interface PrecioContrato {
  precio: number
  cambio: number
  unidad: string
}

interface PrecioHistorico {
  fecha: string
  precio: number
}

interface PrecioFuturo {
  mes: string
  precio: number
  cambio: number
}

export interface PreciosAzucar {
  actualizado: string
  mercadoInterno: PrecioContrato
  contrato5: PrecioContrato
  contrato11: PrecioContrato
  historicos: PrecioHistorico[]
  historicosMercadoInterno: PrecioHistorico[]
  futuros: PrecioFuturo[]
}

export function useSugarPrices() {
  const [precios, setPrecios] = useState<PreciosAzucar | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSugarPrices() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/sugar-prices")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setPrecios(data)
      } catch (error) {
        console.error("Error fetching sugar prices:", error)
        setError("Error al cargar los precios del azúcar.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSugarPrices()

    // Opcional: Actualizar precios cada cierto tiempo
    const interval = setInterval(fetchSugarPrices, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [])

  return { precios, isLoading, error }
}
