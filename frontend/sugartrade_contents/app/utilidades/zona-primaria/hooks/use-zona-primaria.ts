"use client"

import { useState, useCallback } from "react"
import type { ZonaPrimaria, EstadoHabilitacion, Consolidacion, Camion, Mercancia, PasoConsolidacion } from "../types"

// Datos de ejemplo para simular una API
const zonaPrimariaEjemplo: ZonaPrimaria = {
  id: "1",
  nombre: "Zona Primaria Principal",
  ubicacion: "Puerto de Buenos Aires",
  estado: "desconocido",
}

const consolidacionesEjemplo: Consolidacion[] = []

export function useZonaPrimaria() {
  const [zonaPrimaria, setZonaPrimaria] = useState<ZonaPrimaria>(zonaPrimariaEjemplo)
  const [consolidaciones, setConsolidaciones] = useState<Consolidacion[]>(consolidacionesEjemplo)
  const [consolidacionActual, setConsolidacionActual] = useState<Consolidacion | null>(null)
  const [pasos, setPasos] = useState<PasoConsolidacion[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Actualizar el estado de habilitación de la zona primaria
  const actualizarEstadoHabilitacion = useCallback((estado: EstadoHabilitacion) => {
    setCargando(true)
    setError(null)

    // Simulamos una llamada a API
    setTimeout(() => {
      setZonaPrimaria((prev) => ({
        ...prev,
        estado,
        fechaHabilitacion: estado === "habilitada" ? new Date() : undefined,
      }))
      setCargando(false)
    }, 1000)
  }, [])

  // Iniciar un nuevo proceso de consolidación
  const iniciarConsolidacion = useCallback(
    (camion: Camion, manifiestoNumero?: string, documentoTransporte?: string) => {
      setCargando(true)
      setError(null)

      // Verificamos si la zona primaria está habilitada
      if (zonaPrimaria.estado !== "habilitada") {
        setError("La zona primaria no está habilitada para realizar consolidaciones")
        setCargando(false)
        return
      }

      // Creamos una nueva consolidación
      const nuevaConsolidacion: Consolidacion = {
        id: `CONS-${Date.now()}`,
        zonaPrimariaId: zonaPrimaria.id,
        camion: {
          ...camion,
          horaEntrada: new Date(),
        },
        manifiestoNumero,
        documentoTransporte,
        mercancias: [],
        estado: "pendiente",
        fechaInicio: new Date(),
        costoTotal: 0,
        costoDesglosado: {
          ingreso: 50,
          pesajeEntrada: 40,
          despacho: 50,
          pesajeSalida: 40,
        },
        verificacionRealizada: false,
      }

      // Creamos los pasos del proceso
      const nuevosPasos: PasoConsolidacion[] = [
        {
          id: "1",
          titulo: "Ingreso a Zona Primaria",
          descripcion: "Registro del ingreso del camión a la zona primaria",
          completado: false,
          costo: 50,
        },
        {
          id: "2",
          titulo: "Pesaje de Entrada",
          descripcion: "Registro del peso del camión al ingresar",
          completado: false,
          costo: 40,
        },
        {
          id: "3",
          titulo: "Descarga y Consolidación",
          descripcion: "Proceso de descarga y consolidación de mercancías",
          completado: false,
        },
        {
          id: "4",
          titulo: "Control y Verificación",
          descripcion: "Verificación de la mercancía según documentación",
          completado: false,
        },
        {
          id: "5",
          titulo: "Documentación",
          descripcion: "Registro de documentos de la consolidación",
          completado: false,
        },
        {
          id: "6",
          titulo: "Despacho del Camión",
          descripcion: "Proceso de despacho del camión",
          completado: false,
          costo: 50,
        },
        {
          id: "7",
          titulo: "Pesaje de Salida",
          descripcion: "Registro del peso del camión al salir",
          completado: false,
          costo: 40,
        },
        {
          id: "8",
          titulo: "Salida de Zona Primaria",
          descripcion: "Registro de la salida del camión",
          completado: false,
        },
      ]

      // Actualizamos el estado
      setConsolidacionActual(nuevaConsolidacion)
      setPasos(nuevosPasos)
      setCargando(false)
    },
    [zonaPrimaria.estado, zonaPrimaria.id],
  )

  // Completar un paso del proceso de consolidación
  const completarPaso = useCallback(
    (pasoId: string, datos?: any) => {
      setCargando(true)
      setError(null)

      if (!consolidacionActual) {
        setError("No hay una consolidación en proceso")
        setCargando(false)
        return
      }

      // Actualizamos el paso
      setPasos((prev) =>
        prev.map((paso) =>
          paso.id === pasoId
            ? {
                ...paso,
                completado: true,
                fechaCompletado: new Date(),
                observaciones: datos?.observaciones,
              }
            : paso,
        ),
      )

      // Actualizamos la consolidación según el paso
      setConsolidacionActual((prev) => {
        if (!prev) return null

        const updated = { ...prev }

        switch (pasoId) {
          case "1": // Ingreso a Zona Primaria
            // Ya se registró la hora de entrada al iniciar la consolidación
            break
          case "2": // Pesaje de Entrada
            updated.camion = {
              ...updated.camion,
              pesoEntrada: datos?.peso || 0,
            }
            break
          case "3": // Descarga y Consolidación
            updated.mercancias = datos?.mercancias || []
            break
          case "4": // Control y Verificación
            updated.verificacionRealizada = true
            updated.verificadoPor = datos?.verificadoPor
            break
          case "5": // Documentación
            updated.documentosAdjuntos = datos?.documentos
            break
          case "6": // Despacho del Camión
            // No requiere actualización específica
            break
          case "7": // Pesaje de Salida
            updated.camion = {
              ...updated.camion,
              pesoSalida: datos?.peso || 0,
            }
            break
          case "8": // Salida de Zona Primaria
            updated.estado = "completada"
            updated.fechaFinalizacion = new Date()
            updated.camion = {
              ...updated.camion,
              horaSalida: new Date(),
            }

            // Añadimos la consolidación a la lista
            setConsolidaciones((prev) => [...prev, updated])
            break
        }

        return updated
      })

      setCargando(false)
    },
    [consolidacionActual],
  )

  // Agregar mercancía a la consolidación actual
  const agregarMercancia = useCallback(
    (mercancia: Mercancia) => {
      if (!consolidacionActual) {
        setError("No hay una consolidación en proceso")
        return
      }

      setConsolidacionActual((prev) => {
        if (!prev) return null

        return {
          ...prev,
          mercancias: [...prev.mercancias, { ...mercancia, id: `MERC-${Date.now()}` }],
        }
      })
    },
    [consolidacionActual],
  )

  // Eliminar mercancía de la consolidación actual
  const eliminarMercancia = useCallback(
    (mercanciaId: string) => {
      if (!consolidacionActual) {
        setError("No hay una consolidación en proceso")
        return
      }

      setConsolidacionActual((prev) => {
        if (!prev) return null

        return {
          ...prev,
          mercancias: prev.mercancias.filter((m) => m.id !== mercanciaId),
        }
      })
    },
    [consolidacionActual],
  )

  // Cancelar la consolidación actual
  const cancelarConsolidacion = useCallback(() => {
    if (!consolidacionActual) {
      setError("No hay una consolidación en proceso")
      return
    }

    setConsolidacionActual((prev) => {
      if (!prev) return null

      const cancelada = {
        ...prev,
        estado: "cancelada",
        fechaFinalizacion: new Date(),
      }

      // Añadimos la consolidación cancelada a la lista
      setConsolidaciones((prev) => [...prev, cancelada])

      return null
    })

    setPasos([])
  }, [consolidacionActual])

  // Calcular el costo total de la consolidación
  const calcularCostoTotal = useCallback(() => {
    if (!consolidacionActual) return 0

    const { costoDesglosado } = consolidacionActual
    return (
      costoDesglosado.ingreso +
      costoDesglosado.pesajeEntrada +
      costoDesglosado.despacho +
      costoDesglosado.pesajeSalida +
      (costoDesglosado.otros || 0)
    )
  }, [consolidacionActual])

  return {
    zonaPrimaria,
    consolidaciones,
    consolidacionActual,
    pasos,
    cargando,
    error,
    actualizarEstadoHabilitacion,
    iniciarConsolidacion,
    completarPaso,
    agregarMercancia,
    eliminarMercancia,
    cancelarConsolidacion,
    calcularCostoTotal,
  }
}
