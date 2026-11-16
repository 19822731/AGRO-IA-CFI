"use client"

import { useEffect, useMemo } from "react"
import { useWarrantsStore, type ProductoType, type OperacionType } from "@/store/warrants-store"

export function useOperaciones() {
  // Acceder al store
  const {
    operaciones = [],
    warrants = [],
    registrarOperacion,
    completarOperacion,
    cancelarOperacion,
    calcularEstadisticas,
  } = useWarrantsStore()

  // Verificar si estamos en el cliente
  const isClient = typeof window !== "undefined"

  // Calcular estadísticas al cargar el componente
  useEffect(() => {
    if (isClient && calcularEstadisticas) {
      calcularEstadisticas()
    }
  }, [isClient, calcularEstadisticas])

  // Operaciones pendientes
  const operacionesPendientes = useMemo(() => {
    return operaciones.filter((op) => op.estado === "pendiente")
  }, [operaciones])

  // Operaciones completadas
  const operacionesCompletadas = useMemo(() => {
    return operaciones.filter((op) => op.estado === "completada")
  }, [operaciones])

  // Operaciones canceladas
  const operacionesCanceladas = useMemo(() => {
    return operaciones.filter((op) => op.estado === "cancelada")
  }, [operaciones])

  // Warrants disponibles para venta
  const warrantsDisponibles = useMemo(() => {
    return warrants.filter((w) => w.estado === "activo")
  }, [warrants])

  // Crear nueva operación
  const crearOperacion = (datos: {
    tipo: OperacionType
    producto: ProductoType
    cantidad: number
    precio: number
    contraparte: string
    warrantId?: string
  }) => {
    if (!isClient) return ""

    const monto = datos.cantidad * datos.precio
    const documentosRelacionados = datos.warrantId ? [datos.warrantId] : undefined

    return registrarOperacion({
      fecha: new Date().toLocaleDateString("es-AR"),
      tipo: datos.tipo,
      producto: datos.producto,
      cantidad: datos.cantidad,
      precio: datos.precio,
      monto,
      contraparte: datos.contraparte,
      estado: "pendiente",
      documentosRelacionados,
    })
  }

  return {
    operaciones,
    operacionesPendientes,
    operacionesCompletadas,
    operacionesCanceladas,
    warrantsDisponibles,
    crearOperacion,
    completarOperacion,
    cancelarOperacion,
  }
}
