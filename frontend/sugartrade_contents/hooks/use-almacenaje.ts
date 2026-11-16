"use client"

import { useEffect, useMemo } from "react"
import { useWarrantsStore, type ProductoType } from "@/store/warrants-store"

export function useAlmacenaje() {
  // Acceder al store
  const { depositos = [], warrants = [], ingresarProducto, retirarProducto, calcularEstadisticas } = useWarrantsStore()

  // Verificar si estamos en el cliente
  const isClient = typeof window !== "undefined"

  // Calcular estadísticas al cargar el componente
  useEffect(() => {
    if (isClient && calcularEstadisticas) {
      calcularEstadisticas()
    }
  }, [isClient, calcularEstadisticas])

  // Depósitos con capacidad disponible
  const depositosDisponibles = useMemo(() => {
    return depositos.filter((d) => d.capacidadTotal > d.ocupacionActual)
  }, [depositos])

  // Warrants activos por depósito
  const warrantsPorDeposito = useMemo(() => {
    const resultado: Record<string, typeof warrants> = {}

    depositos.forEach((deposito) => {
      resultado[deposito.nombre] = warrants.filter((w) => w.deposito === deposito.nombre && w.estado === "activo")
    })

    return resultado
  }, [depositos, warrants])

  // Ocupación por producto y depósito
  const ocupacionPorProducto = useMemo(() => {
    const resultado: Record<string, Record<ProductoType, number>> = {}

    depositos.forEach((deposito) => {
      resultado[deposito.nombre] = { ...deposito.productos }
    })

    return resultado
  }, [depositos])

  // Ingresar nuevo producto
  const ingresarNuevoProducto = (datos: {
    deposito: string
    producto: ProductoType
    cantidad: number
    valor: number
  }) => {
    if (!isClient) return ""

    return ingresarProducto(datos.deposito, datos.producto, datos.cantidad, datos.valor)
  }

  // Retirar producto
  const retirarProductoDeposito = (warrantId: string, cantidad: number) => {
    if (!isClient) return

    retirarProducto(warrantId, cantidad)
  }

  return {
    depositos,
    depositosDisponibles,
    warrantsPorDeposito,
    ocupacionPorProducto,
    ingresarNuevoProducto,
    retirarProductoDeposito,
  }
}
