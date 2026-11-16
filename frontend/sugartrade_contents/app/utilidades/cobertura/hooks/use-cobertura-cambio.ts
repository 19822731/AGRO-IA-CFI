"use client"

import { useState, useCallback } from "react"
import type { TipoOperacionCambio, InstrumentoCambio, CoberturaCambioData } from "../types/cambio"

// Datos simulados para los instrumentos de cobertura de cambio
const generarInstrumentosCambio = (fechaNecesidad: string): InstrumentoCambio[] => {
  // Convertir la fecha de necesidad a un objeto Date
  const fechaNecesidadObj = new Date(fechaNecesidad)

  // Generar fechas de vencimiento cercanas a la fecha de necesidad
  const fechaVencimiento1 = new Date(fechaNecesidadObj)
  fechaVencimiento1.setDate(fechaVencimiento1.getDate() - 15) // 15 días antes

  const fechaVencimiento2 = new Date(fechaNecesidadObj)

  const fechaVencimiento3 = new Date(fechaNecesidadObj)
  fechaVencimiento3.setDate(fechaVencimiento3.getDate() + 15) // 15 días después

  // Tipo de cambio base (simulado)
  const tipoCambioBase = 950 // 1 USD = 950 ARS (simulado)

  // Generar instrumentos con diferentes tipos de cambio y costos
  return [
    {
      id: "instr-1",
      fechaVencimiento: fechaVencimiento1.toLocaleDateString("es-AR"),
      tipoCambioFijado: tipoCambioBase - 10, // Menor tipo de cambio para fecha anterior
      costoCobertura: 0.015, // 1.5% del monto
    },
    {
      id: "instr-2",
      fechaVencimiento: fechaVencimiento2.toLocaleDateString("es-AR"),
      tipoCambioFijado: tipoCambioBase,
      costoCobertura: 0.02, // 2% del monto
    },
    {
      id: "instr-3",
      fechaVencimiento: fechaVencimiento3.toLocaleDateString("es-AR"),
      tipoCambioFijado: tipoCambioBase + 15, // Mayor tipo de cambio para fecha posterior
      costoCobertura: 0.025, // 2.5% del monto
    },
  ]
}

export function useCoberturaCambio() {
  const [coberturas, setCoberturas] = useState<CoberturaCambioData[]>([])

  // Obtener instrumentos disponibles para cobertura de cambio
  const obtenerInstrumentosCambio = useCallback(async (fechaNecesidad: string): Promise<InstrumentoCambio[]> => {
    // Simulamos una llamada a API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return generarInstrumentosCambio(fechaNecesidad)
  }, [])

  // Contratar cobertura de cambio
  const contratarCoberturaCambio = useCallback(
    async (
      tipoOperacion: TipoOperacionCambio,
      montoDolares: number,
      fechaNecesidad: string,
      instrumentoSeleccionado: InstrumentoCambio,
    ): Promise<CoberturaCambioData> => {
      // Simulamos una llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const nuevaCobertura: CoberturaCambioData = {
        id: `cobertura-${Date.now()}`,
        tipoOperacion,
        montoDolares,
        fechaNecesidad,
        instrumentoSeleccionado,
        fechaContratacion: new Date(),
        estado: "activa",
      }

      setCoberturas((prev) => [...prev, nuevaCobertura])

      return nuevaCobertura
    },
    [],
  )

  // Obtener todas las coberturas de cambio
  const obtenerCoberturasCambio = useCallback((): CoberturaCambioData[] => {
    return coberturas
  }, [coberturas])

  return {
    obtenerInstrumentosCambio,
    contratarCoberturaCambio,
    obtenerCoberturasCambio,
  }
}
