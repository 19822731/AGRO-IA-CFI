"use client"

import { useState, useEffect } from "react"
import type {
  ZonaPrimaria,
  EstadoHabilitacion,
  Consolidacion,
  EstadoConsolidacion,
  Mercancia,
  Camion,
  Documento,
} from "../types/zona-primaria"
import { v4 as uuidv4 } from "uuid"

// Estado inicial de la zona primaria (simulado)
const zonaPrimariaInicial: ZonaPrimaria = {
  estado: "desconocido",
  requisitosCompletados: {
    delimitacion: false,
    senalizacion: false,
    iluminacion: false,
    pisos: false,
    seguridad: false,
    oficinas: false,
    servicios: false,
    equipamiento: false,
    espacioSuficiente: false,
    areaInspeccion: false,
    procedimientos: false,
    registroOperaciones: false,
    personalCapacitado: false,
  },
  consolidaciones: [],
}

export function useZonaPrimaria() {
  const [zonaPrimaria, setZonaPrimaria] = useState<ZonaPrimaria>(zonaPrimariaInicial)
  const [consolidacionActual, setConsolidacionActual] = useState<Consolidacion | null>(null)
  const [cargando, setCargando] = useState(true)

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setCargando(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Actualizar el estado de habilitación de la zona primaria
  const actualizarEstadoHabilitacion = (estado: EstadoHabilitacion) => {
    setZonaPrimaria((prev) => ({
      ...prev,
      estado,
      fechaHabilitacion: estado === "habilitada" ? new Date() : prev.fechaHabilitacion,
      fechaVencimiento:
        estado === "habilitada"
          ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          : prev.fechaVencimiento,
    }))
  }

  // Actualizar los requisitos completados
  const actualizarRequisito = (requisito: keyof ZonaPrimaria["requisitosCompletados"], completado: boolean) => {
    setZonaPrimaria((prev) => ({
      ...prev,
      requisitosCompletados: {
        ...prev.requisitosCompletados,
        [requisito]: completado,
      },
    }))
  }

  // Verificar si todos los requisitos están completados
  const todosRequisitosCompletados = () => {
    return Object.values(zonaPrimaria.requisitosCompletados).every((req) => req === true)
  }

  // Iniciar proceso de habilitación
  const iniciarProcesoHabilitacion = () => {
    actualizarEstadoHabilitacion("en-proceso")
  }

  // Completar proceso de habilitación
  const completarProcesoHabilitacion = () => {
    if (todosRequisitosCompletados()) {
      actualizarEstadoHabilitacion("habilitada")
      return true
    }
    return false
  }

  // Iniciar una nueva consolidación
  const iniciarConsolidacion = (camion: Camion, documentos: Documento[]) => {
    const nuevaConsolidacion: Consolidacion = {
      id: uuidv4(),
      fechaInicio: new Date(),
      fechaFinalizacion: null,
      estado: "ingreso",
      camion,
      mercancias: [],
      documentos,
      costoTotal: 0,
      pasos: {
        ingreso: {
          completado: false,
        },
      },
    }

    setConsolidacionActual(nuevaConsolidacion)
    return nuevaConsolidacion
  }

  // Avanzar al siguiente paso de la consolidación
  const avanzarPasoConsolidacion = (observaciones?: string) => {
    if (!consolidacionActual) return null

    const pasoActual = consolidacionActual.estado
    let siguientePaso: EstadoConsolidacion
    let costoAdicional = 0

    // Determinar el siguiente paso y el costo asociado
    switch (pasoActual) {
      case "ingreso":
        siguientePaso = "pesaje-entrada"
        costoAdicional = 40 // Costo de ingreso a zona primaria
        break
      case "pesaje-entrada":
        siguientePaso = "descarga-consolidacion"
        costoAdicional = 30 // Costo de pesaje de entrada
        break
      case "descarga-consolidacion":
        siguientePaso = "control-verificacion"
        break
      case "control-verificacion":
        siguientePaso = "documentacion"
        break
      case "documentacion":
        siguientePaso = "despacho"
        break
      case "despacho":
        siguientePaso = "pesaje-salida"
        costoAdicional = 50 // Costo de despacho
        break
      case "pesaje-salida":
        siguientePaso = "salida"
        costoAdicional = 30 // Costo de pesaje de salida
        break
      case "salida":
        siguientePaso = "completada"
        costoAdicional = 30 // Costo de salida
        break
      default:
        return consolidacionActual
    }

    // Actualizar el estado de la consolidación
    const consolidacionActualizada: Consolidacion = {
      ...consolidacionActual,
      estado: siguientePaso,
      costoTotal: consolidacionActual.costoTotal + costoAdicional,
      pasos: {
        ...consolidacionActual.pasos,
        [pasoActual]: {
          completado: true,
          fechaHora: new Date(),
          observaciones,
        },
        [siguientePaso]: {
          completado: false,
        },
      },
    }

    // Si la consolidación está completada, actualizar la fecha de finalización
    if (siguientePaso === "completada") {
      consolidacionActualizada.fechaFinalizacion = new Date()

      // Agregar la consolidación completada a la lista de consolidaciones
      setZonaPrimaria((prev) => ({
        ...prev,
        consolidaciones: [...prev.consolidaciones, consolidacionActualizada],
      }))

      // Limpiar la consolidación actual
      setConsolidacionActual(null)
    } else {
      setConsolidacionActual(consolidacionActualizada)
    }

    return consolidacionActualizada
  }

  // Registrar el peso de entrada del camión
  const registrarPesoEntrada = (peso: number) => {
    if (!consolidacionActual) return null

    const consolidacionActualizada: Consolidacion = {
      ...consolidacionActual,
      camion: {
        ...consolidacionActual.camion,
        pesoEntrada: peso,
      },
    }

    setConsolidacionActual(consolidacionActualizada)
    return consolidacionActualizada
  }

  // Registrar el peso de salida del camión
  const registrarPesoSalida = (peso: number) => {
    if (!consolidacionActual) return null

    const consolidacionActualizada: Consolidacion = {
      ...consolidacionActual,
      camion: {
        ...consolidacionActual.camion,
        pesoSalida: peso,
      },
    }

    setConsolidacionActual(consolidacionActualizada)
    return consolidacionActualizada
  }

  // Agregar mercancía a la consolidación
  const agregarMercancia = (mercancia: Omit<Mercancia, "id">) => {
    if (!consolidacionActual) return null

    const nuevaMercancia: Mercancia = {
      ...mercancia,
      id: uuidv4(),
    }

    const consolidacionActualizada: Consolidacion = {
      ...consolidacionActual,
      mercancias: [...consolidacionActual.mercancias, nuevaMercancia],
    }

    setConsolidacionActual(consolidacionActualizada)
    return consolidacionActualizada
  }

  // Agregar documento a la consolidación
  const agregarDocumento = (documento: Documento) => {
    if (!consolidacionActual) return null

    const consolidacionActualizada: Consolidacion = {
      ...consolidacionActual,
      documentos: [...consolidacionActual.documentos, documento],
    }

    setConsolidacionActual(consolidacionActualizada)
    return consolidacionActualizada
  }

  // Cancelar la consolidación actual
  const cancelarConsolidacion = () => {
    setConsolidacionActual(null)
  }

  return {
    zonaPrimaria,
    consolidacionActual,
    cargando,
    actualizarEstadoHabilitacion,
    actualizarRequisito,
    todosRequisitosCompletados,
    iniciarProcesoHabilitacion,
    completarProcesoHabilitacion,
    iniciarConsolidacion,
    avanzarPasoConsolidacion,
    registrarPesoEntrada,
    registrarPesoSalida,
    agregarMercancia,
    agregarDocumento,
    cancelarConsolidacion,
  }
}
