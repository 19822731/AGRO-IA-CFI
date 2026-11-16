"use client"

import { useState, useCallback, useEffect } from "react"
import type { TipoContrato, TipoOrden, DatosContrato, OrdenCobertura, PosicionPortafolio, TipoUsuario } from "../types"

// Datos simulados para los contratos
const datosContratos: Record<TipoContrato, DatosContrato> = {
  contrato5: {
    id: "c5",
    nombre: "Contrato #5",
    precioActual: 542.3,
    fechaVencimiento: "15/06/2023",
    variacion: 1.25,
    descripcion:
      "Contrato a corto plazo con vencimiento en los próximos meses. Ideal para operaciones a corto plazo y protección inmediata contra fluctuaciones de precio.",
    tamanoContrato: 50, // 50 toneladas por contrato
  },
  contrato11: {
    id: "c11",
    nombre: "Contrato #11",
    precioActual: 498.75,
    fechaVencimiento: "15/12/2023",
    variacion: -0.75,
    descripcion:
      "Contrato a largo plazo con vencimiento en los próximos trimestres. Ideal para planificación estratégica y protección a largo plazo contra cambios en el mercado.",
    tamanoContrato: 100, // 100 toneladas por contrato
  },
}

export function useCobertura() {
  const [ordenes, setOrdenes] = useState<OrdenCobertura[]>([])
  const [posiciones, setPosiciones] = useState<PosicionPortafolio[]>([])

  // Simular actualización de precios cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Actualizar precios de contratos con pequeñas variaciones
      Object.keys(datosContratos).forEach((key) => {
        const contrato = datosContratos[key as TipoContrato]
        const variacion = (Math.random() - 0.5) * 2 // Entre -1% y 1%
        contrato.precioActual = Math.max(0, contrato.precioActual * (1 + variacion / 100))
        contrato.variacion = variacion
      })

      // Verificar si alguna orden de Stop-Loss o Take-Profit debe ejecutarse
      verificarOrdenesCondicionales()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Verificar si alguna orden condicional debe ejecutarse
  const verificarOrdenesCondicionales = useCallback(() => {
    // En una implementación real, esto se haría en el servidor
    const nuevasOrdenes = [...ordenes]
    const nuevasPosiciones = [...posiciones]

    // Verificar cada posición abierta
    nuevasPosiciones.forEach((posicion) => {
      if (posicion.estado === "cerrada") return

      const contrato = datosContratos[posicion.tipoContrato]
      const precioActual = contrato.precioActual

      // Verificar órdenes asociadas
      posicion.ordenesAsociadas.forEach((orden) => {
        if (orden.estado !== "pendiente") return

        // Verificar Stop-Loss
        if (orden.tipoOrden === "stop-loss" && orden.precioStopLoss) {
          const debeEjecutar =
            (posicion.precioEntrada > orden.precioStopLoss && precioActual <= orden.precioStopLoss) || // Para posiciones largas
            (posicion.precioEntrada < orden.precioStopLoss && precioActual >= orden.precioStopLoss) // Para posiciones cortas

          if (debeEjecutar) {
            // Ejecutar orden
            const index = nuevasOrdenes.findIndex((o) => o.id === orden.id)
            if (index >= 0) {
              nuevasOrdenes[index] = {
                ...nuevasOrdenes[index],
                estado: "ejecutada",
                fechaEjecucion: new Date(),
              }
            }

            // Cerrar posición
            const posIndex = nuevasPosiciones.findIndex((p) => p.id === posicion.id)
            if (posIndex >= 0) {
              const gananciaValor =
                (precioActual - posicion.precioEntrada) * posicion.cantidad * contrato.tamanoContrato
              const gananciaPercentage = (precioActual / posicion.precioEntrada - 1) * 100

              nuevasPosiciones[posIndex] = {
                ...nuevasPosiciones[posIndex],
                estado: "cerrada",
                fechaCierre: new Date(),
                precioCierre: precioActual,
                gananciaValor,
                gananciaPercentage,
              }
            }
          }
        }

        // Verificar Take-Profit
        if (orden.tipoOrden === "take-profit" && orden.precioTakeProfit) {
          const debeEjecutar =
            (posicion.precioEntrada < orden.precioTakeProfit && precioActual >= orden.precioTakeProfit) || // Para posiciones largas
            (posicion.precioEntrada > orden.precioTakeProfit && precioActual <= orden.precioTakeProfit) // Para posiciones cortas

          if (debeEjecutar) {
            // Ejecutar orden
            const index = nuevasOrdenes.findIndex((o) => o.id === orden.id)
            if (index >= 0) {
              nuevasOrdenes[index] = {
                ...nuevasOrdenes[index],
                estado: "ejecutada",
                fechaEjecucion: new Date(),
              }
            }

            // Cerrar posición
            const posIndex = nuevasPosiciones.findIndex((p) => p.id === posicion.id)
            if (posIndex >= 0) {
              const gananciaValor =
                (precioActual - posicion.precioEntrada) * posicion.cantidad * contrato.tamanoContrato
              const gananciaPercentage = (precioActual / posicion.precioEntrada - 1) * 100

              nuevasPosiciones[posIndex] = {
                ...nuevasPosiciones[posIndex],
                estado: "cerrada",
                fechaCierre: new Date(),
                precioCierre: precioActual,
                gananciaValor,
                gananciaPercentage,
              }
            }
          }
        }
      })
    })

    setOrdenes(nuevasOrdenes)
    setPosiciones(nuevasPosiciones)
  }, [ordenes, posiciones])

  // Obtener precio del contrato
  const obtenerPrecioContrato = useCallback(async (tipoContrato: TipoContrato): Promise<number> => {
    // Simulamos una llamada a API
    await new Promise((resolve) => setTimeout(resolve, 500))
    return datosContratos[tipoContrato].precioActual
  }, [])

  // Obtener datos completos del contrato
  const obtenerDatosContrato = useCallback(async (tipoContrato: TipoContrato): Promise<DatosContrato> => {
    // Simulamos una llamada a API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return datosContratos[tipoContrato]
  }, [])

  // Calcular valor nocional de la operación
  const calcularValorNocional = useCallback((tipoContrato: TipoContrato, cantidad: number, precio?: number): number => {
    const precioFinal = precio || datosContratos[tipoContrato].precioActual
    const { tamanoContrato } = datosContratos[tipoContrato]
    return precioFinal * tamanoContrato * cantidad
  }, [])

  // Crear una nueva orden
  const crearOrden = useCallback(
    async (
      tipoUsuario: TipoUsuario,
      tipoContrato: TipoContrato,
      tipoOrden: TipoOrden,
      cantidad: number,
      precio?: number,
      precioStopLoss?: number,
      precioTakeProfit?: number,
    ): Promise<{ orden: OrdenCobertura; posicion?: PosicionPortafolio }> => {
      // Simulamos una llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const contrato = datosContratos[tipoContrato]
      const precioFinal = precio || contrato.precioActual
      const valorNocional = precioFinal * contrato.tamanoContrato * cantidad

      const nuevaOrden: OrdenCobertura = {
        id: `orden-${Date.now()}`,
        tipoContrato,
        tipoOrden,
        cantidad,
        precio: tipoOrden === "limite" ? precio : undefined,
        precioStopLoss,
        precioTakeProfit,
        valorNocional,
        estado: tipoOrden === "mercado" ? "ejecutada" : "pendiente",
        fechaCreacion: new Date(),
        fechaEjecucion: tipoOrden === "mercado" ? new Date() : undefined,
      }

      // Crear órdenes adicionales para Stop-Loss y Take-Profit si se especificaron
      const ordenesAdicionales: OrdenCobertura[] = []

      // Si es una orden principal (no una orden condicional)
      let nuevaPosicion: PosicionPortafolio | undefined

      if (tipoOrden === "mercado" || tipoOrden === "limite") {
        // Si es una orden de mercado, crear posición inmediatamente
        if (tipoOrden === "mercado") {
          nuevaPosicion = {
            id: `posicion-${Date.now()}`,
            tipoContrato,
            cantidad,
            precioEntrada: precioFinal,
            valorEntrada: valorNocional,
            fechaApertura: new Date(),
            ordenesAsociadas: [],
            estado: "abierta",
          }

          // Crear órdenes condicionales si se especificaron
          if (precioStopLoss) {
            const ordenStopLoss: OrdenCobertura = {
              id: `orden-sl-${Date.now()}`,
              tipoContrato,
              tipoOrden: "stop-loss",
              cantidad,
              precioStopLoss,
              valorNocional: calcularValorNocional(tipoContrato, cantidad, precioStopLoss),
              estado: "pendiente",
              fechaCreacion: new Date(),
              posicionId: nuevaPosicion.id,
            }
            ordenesAdicionales.push(ordenStopLoss)
            nuevaPosicion.ordenesAsociadas.push(ordenStopLoss)
          }

          if (precioTakeProfit) {
            const ordenTakeProfit: OrdenCobertura = {
              id: `orden-tp-${Date.now()}`,
              tipoContrato,
              tipoOrden: "take-profit",
              cantidad,
              precioTakeProfit,
              valorNocional: calcularValorNocional(tipoContrato, cantidad, precioTakeProfit),
              estado: "pendiente",
              fechaCreacion: new Date(),
              posicionId: nuevaPosicion.id,
            }
            ordenesAdicionales.push(ordenTakeProfit)
            nuevaPosicion.ordenesAsociadas.push(ordenTakeProfit)
          }
        }
      }

      // Actualizar estado
      setOrdenes((prev) => [...prev, nuevaOrden, ...ordenesAdicionales])

      if (nuevaPosicion) {
        setPosiciones((prev) => [...prev, nuevaPosicion!])
      }

      return {
        orden: nuevaOrden,
        posicion: nuevaPosicion,
      }
    },
    [calcularValorNocional],
  )

  // Obtener todas las órdenes
  const obtenerOrdenes = useCallback((): OrdenCobertura[] => {
    return ordenes
  }, [ordenes])

  // Obtener todas las posiciones
  const obtenerPosiciones = useCallback((): PosicionPortafolio[] => {
    return posiciones
  }, [posiciones])

  // Cerrar una posición abierta
  const cerrarPosicion = useCallback(
    async (posicionId: string): Promise<boolean> => {
      // Simulamos una llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const posicionIndex = posiciones.findIndex((p) => p.id === posicionId && p.estado === "abierta")
      if (posicionIndex < 0) return false

      const posicion = posiciones[posicionIndex]
      const contrato = datosContratos[posicion.tipoContrato]
      const precioActual = contrato.precioActual

      // Calcular ganancias/pérdidas
      const gananciaValor = (precioActual - posicion.precioEntrada) * posicion.cantidad * contrato.tamanoContrato
      const gananciaPercentage = (precioActual / posicion.precioEntrada - 1) * 100

      // Actualizar posición
      const nuevasPosiciones = [...posiciones]
      nuevasPosiciones[posicionIndex] = {
        ...posicion,
        estado: "cerrada",
        fechaCierre: new Date(),
        precioCierre: precioActual,
        gananciaValor,
        gananciaPercentage,
      }

      // Cancelar órdenes asociadas pendientes
      const nuevasOrdenes = [...ordenes]
      posicion.ordenesAsociadas.forEach((orden) => {
        if (orden.estado === "pendiente") {
          const ordenIndex = nuevasOrdenes.findIndex((o) => o.id === orden.id)
          if (ordenIndex >= 0) {
            nuevasOrdenes[ordenIndex] = {
              ...nuevasOrdenes[ordenIndex],
              estado: "cancelada",
            }
          }
        }
      })

      setPosiciones(nuevasPosiciones)
      setOrdenes(nuevasOrdenes)

      return true
    },
    [posiciones, ordenes],
  )

  // Modificar órdenes de Stop-Loss o Take-Profit
  const modificarOrdenCondicional = useCallback(
    async (ordenId: string, tipoOrden: "stop-loss" | "take-profit", nuevoPrecio: number): Promise<boolean> => {
      // Simulamos una llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const ordenIndex = ordenes.findIndex((o) => o.id === ordenId && o.estado === "pendiente")
      if (ordenIndex < 0) return false

      const nuevasOrdenes = [...ordenes]
      if (tipoOrden === "stop-loss") {
        nuevasOrdenes[ordenIndex] = {
          ...nuevasOrdenes[ordenIndex],
          precioStopLoss: nuevoPrecio,
        }
      } else {
        nuevasOrdenes[ordenIndex] = {
          ...nuevasOrdenes[ordenIndex],
          precioTakeProfit: nuevoPrecio,
        }
      }

      setOrdenes(nuevasOrdenes)

      // Actualizar también en la posición asociada
      if (nuevasOrdenes[ordenIndex].posicionId) {
        const posicionId = nuevasOrdenes[ordenIndex].posicionId
        const posicionIndex = posiciones.findIndex((p) => p.id === posicionId)

        if (posicionIndex >= 0) {
          const nuevasPosiciones = [...posiciones]
          const ordenAsociadaIndex = nuevasPosiciones[posicionIndex].ordenesAsociadas.findIndex((o) => o.id === ordenId)

          if (ordenAsociadaIndex >= 0) {
            nuevasPosiciones[posicionIndex].ordenesAsociadas[ordenAsociadaIndex] = nuevasOrdenes[ordenIndex]
            setPosiciones(nuevasPosiciones)
          }
        }
      }

      return true
    },
    [ordenes, posiciones],
  )

  // Cancelar una orden
  const cancelarOrden = useCallback(
    async (ordenId: string): Promise<boolean> => {
      // Simulamos una llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const ordenIndex = ordenes.findIndex((o) => o.id === ordenId && o.estado === "pendiente")
      if (ordenIndex < 0) return false

      const nuevasOrdenes = [...ordenes]
      nuevasOrdenes[ordenIndex] = {
        ...nuevasOrdenes[ordenIndex],
        estado: "cancelada",
      }

      setOrdenes(nuevasOrdenes)

      // Actualizar también en la posición asociada si es necesario
      if (nuevasOrdenes[ordenIndex].posicionId) {
        const posicionId = nuevasOrdenes[ordenIndex].posicionId
        const posicionIndex = posiciones.findIndex((p) => p.id === posicionId)

        if (posicionIndex >= 0) {
          const nuevasPosiciones = [...posiciones]
          const ordenAsociadaIndex = nuevasPosiciones[posicionIndex].ordenesAsociadas.findIndex((o) => o.id === ordenId)

          if (ordenAsociadaIndex >= 0) {
            nuevasPosiciones[posicionIndex].ordenesAsociadas[ordenAsociadaIndex] = nuevasOrdenes[ordenIndex]
            setPosiciones(nuevasPosiciones)
          }
        }
      }

      return true
    },
    [ordenes, posiciones],
  )

  return {
    obtenerPrecioContrato,
    obtenerDatosContrato,
    calcularValorNocional,
    crearOrden,
    obtenerOrdenes,
    obtenerPosiciones,
    cerrarPosicion,
    modificarOrdenCondicional,
    cancelarOrden,
  }
}
