"use client"

import { useEffect, useMemo } from "react"
import { useWarrantsStore } from "@/store/warrants-store"

export function useCanje() {
  // Acceder al store
  const { warrants = [], certificados = [], realizarCanje, calcularEstadisticas } = useWarrantsStore()

  // Verificar si estamos en el cliente
  const isClient = typeof window !== "undefined"

  // Calcular estadísticas al cargar el componente
  useEffect(() => {
    if (isClient && calcularEstadisticas) {
      calcularEstadisticas()
    }
  }, [isClient, calcularEstadisticas])

  // Certificados disponibles para canje
  const certificadosDisponibles = useMemo(() => {
    return certificados.filter((c) => c.tipo === "deposito" && c.estado === "disponible")
  }, [certificados])

  // Warrants activos
  const warrantsActivos = useMemo(() => {
    return warrants.filter((w) => w.estado === "activo")
  }, [warrants])

  // Certificados de canje disponibles
  const certificadosCanje = useMemo(() => {
    return certificados.filter((c) => c.tipo === "canje" && c.estado === "disponible")
  }, [certificados])

  // Ejecutar canje
  const ejecutarCanje = (certificadoId: string, warrantId: string) => {
    if (!isClient) return ""

    return realizarCanje(certificadoId, warrantId)
  }

  return {
    certificadosDisponibles,
    warrantsActivos,
    certificadosCanje,
    ejecutarCanje,
  }
}
