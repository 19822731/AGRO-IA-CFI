"use client"

import { useState, useEffect, useCallback } from "react"
import { almacenajeService } from "../services/almacenaje-service"
import type { Warrant, CertificadoDeposito, Deposito, Ingenio, FiltrosAlmacenaje, CertificadoEstado } from "../types"
import { toast } from "@/components/ui/use-toast"

// Hook para manejar las operaciones de almacenaje
export function useAlmacenaje() {
  // Estados para los datos principales
  const [warrants, setWarrants] = useState<Warrant[]>([])
  const [certificados, setCertificados] = useState<CertificadoDeposito[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])

  // Estados para los filtros
  const [filtros, setFiltros] = useState<FiltrosAlmacenaje>({})

  // Estados para el certificado seleccionado y sus detalles
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState<CertificadoDeposito | null>(null)
  const [warrantSeleccionado, setWarrantSeleccionado] = useState<Warrant | null>(null)

  // Estados para las operaciones
  const [cargando, setCargando] = useState<boolean>(false)
  const [estadisticas, setEstadisticas] = useState<any>(null)

  // Cargar datos iniciales
  useEffect(() => {
    // Cargar warrants
    const warrantData = almacenajeService.getWarrants()
    setWarrants(warrantData)

    // Cargar certificados (con filtros si existen)
    const certificadosData = almacenajeService.getCertificados(filtros)
    setCertificados(certificadosData)

    // Cargar depósitos
    const depositosData = almacenajeService.getDepositos()
    setDepositos(depositosData)

    // Cargar ingenios
    const ingeniosData = almacenajeService.getIngenios()
    setIngenios(ingeniosData)

    // Cargar estadísticas
    const estadisticasData = almacenajeService.getEstadisticas()
    setEstadisticas(estadisticasData)
  }, [filtros])

  // Función para cargar un warrant específico y sus certificados
  const cargarWarrant = useCallback((warrantId: string) => {
    setCargando(true)

    // Obtener el warrant
    const warrant = almacenajeService.getWarrantById(warrantId)
    if (warrant) {
      setWarrantSeleccionado(warrant)

      // Obtener los certificados asociados
      const certificadosWarrant = almacenajeService.getCertificadosByWarrantId(warrantId)
      setCertificados(certificadosWarrant)
    }

    setCargando(false)
  }, [])

  // Función para cargar un certificado específico
  const cargarCertificado = useCallback((certificadoId: string) => {
    setCargando(true)

    // Obtener el certificado
    const certificado = almacenajeService.getCertificadoById(certificadoId)
    if (certificado) {
      setCertificadoSeleccionado(certificado)

      // Obtener el warrant asociado
      const warrant = almacenajeService.getWarrantById(certificado.warrantId)
      if (warrant) {
        setWarrantSeleccionado(warrant)
      }
    }

    setCargando(false)
  }, [])

  // Función para actualizar los filtros
  const actualizarFiltros = useCallback((nuevosFiltros: Partial<FiltrosAlmacenaje>) => {
    setFiltros((prevFiltros) => ({
      ...prevFiltros,
      ...nuevosFiltros,
    }))
  }, [])

  // Función para limpiar los filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros({})
  }, [])

  // ======= Operaciones de estado de certificados =======

  // Función para reservar un certificado
  const reservarCertificado = useCallback(
    async (certificadoId: string, usuario: string, notas?: string) => {
      setCargando(true)

      try {
        const certificadoActualizado = await almacenajeService.reservarCertificado(certificadoId, usuario, notas)

        if (certificadoActualizado) {
          // Actualizar el certificado en la lista
          setCertificados((prevCertificados) =>
            prevCertificados.map((c) => (c.id === certificadoId ? certificadoActualizado : c)),
          )

          // Si el certificado seleccionado es el que se actualizó, actualizarlo también
          if (certificadoSeleccionado && certificadoSeleccionado.id === certificadoId) {
            setCertificadoSeleccionado(certificadoActualizado)
          }

          // Notificar al usuario
          toast({
            title: "Certificado reservado",
            description: `El certificado ${certificadoActualizado.numero} ha sido reservado exitosamente.`,
            variant: "default",
          })

          return true
        }
      } catch (error) {
        // Manejar el error
        toast({
          title: "Error al reservar certificado",
          description: "No se pudo reservar el certificado. Inténtelo de nuevo más tarde.",
          variant: "destructive",
        })

        return false
      } finally {
        setCargando(false)
      }
    },
    [certificadoSeleccionado],
  )

  // Función para marcar un certificado como disponible para carga
  const marcarDisponibleCarga = useCallback(
    async (certificadoId: string, usuario: string, notas?: string) => {
      setCargando(true)

      try {
        const certificadoActualizado = await almacenajeService.marcarDisponibleCarga(certificadoId, usuario, notas)

        if (certificadoActualizado) {
          // Actualizar el certificado en la lista
          setCertificados((prevCertificados) =>
            prevCertificados.map((c) => (c.id === certificadoId ? certificadoActualizado : c)),
          )

          // Si el certificado seleccionado es el que se actualizó, actualizarlo también
          if (certificadoSeleccionado && certificadoSeleccionado.id === certificadoId) {
            setCertificadoSeleccionado(certificadoActualizado)
          }

          // Notificar al usuario
          toast({
            title: "Certificado disponible para carga",
            description: `El certificado ${certificadoActualizado.numero} ha sido marcado como disponible para carga.`,
            variant: "default",
          })

          return true
        }
      } catch (error) {
        // Manejar el error
        toast({
          title: "Error al actualizar certificado",
          description: "No se pudo actualizar el estado del certificado. Inténtelo de nuevo más tarde.",
          variant: "destructive",
        })

        return false
      } finally {
        setCargando(false)
      }
    },
    [certificadoSeleccionado],
  )

  // Función para marcar un certificado como operación cargada
  const marcarOperacionCargada = useCallback(
    async (certificadoId: string, usuario: string, notas?: string) => {
      setCargando(true)

      try {
        const certificadoActualizado = await almacenajeService.marcarOperacionCargada(certificadoId, usuario, notas)

        if (certificadoActualizado) {
          // Actualizar el certificado en la lista
          setCertificados((prevCertificados) =>
            prevCertificados.map((c) => (c.id === certificadoId ? certificadoActualizado : c)),
          )

          // Si el certificado seleccionado es el que se actualizó, actualizarlo también
          if (certificadoSeleccionado && certificadoSeleccionado.id === certificadoId) {
            setCertificadoSeleccionado(certificadoActualizado)
          }

          // Notificar al usuario
          toast({
            title: "Operación cargada completada",
            description: `El certificado ${certificadoActualizado.numero} ha sido marcado como operación cargada.`,
            variant: "default",
          })

          return true
        }
      } catch (error) {
        // Manejar el error
        toast({
          title: "Error al actualizar certificado",
          description: "No se pudo actualizar el estado del certificado. Inténtelo de nuevo más tarde.",
          variant: "destructive",
        })

        return false
      } finally {
        setCargando(false)
      }
    },
    [certificadoSeleccionado],
  )

  // Función para liberar un certificado (volver a disponible)
  const liberarCertificado = useCallback(
    async (certificadoId: string, usuario: string, notas?: string) => {
      setCargando(true)

      try {
        const certificadoActualizado = await almacenajeService.liberarCertificado(certificadoId, usuario, notas)

        if (certificadoActualizado) {
          // Actualizar el certificado en la lista
          setCertificados((prevCertificados) =>
            prevCertificados.map((c) => (c.id === certificadoId ? certificadoActualizado : c)),
          )

          // Si el certificado seleccionado es el que se actualizó, actualizarlo también
          if (certificadoSeleccionado && certificadoSeleccionado.id === certificadoId) {
            setCertificadoSeleccionado(certificadoActualizado)
          }

          // Notificar al usuario
          toast({
            title: "Certificado liberado",
            description: `El certificado ${certificadoActualizado.numero} ha sido liberado y está disponible.`,
            variant: "default",
          })

          return true
        }
      } catch (error) {
        // Manejar el error
        toast({
          title: "Error al liberar certificado",
          description: "No se pudo liberar el certificado. Inténtelo de nuevo más tarde.",
          variant: "destructive",
        })

        return false
      } finally {
        setCargando(false)
      }
    },
    [certificadoSeleccionado],
  )

  // Función para verificar un código QR
  const verificarCodigoQR = useCallback(async (codigoQR: string) => {
    setCargando(true)

    try {
      const certificado = await almacenajeService.verificarCodigoQR(codigoQR)

      if (certificado) {
        // Seleccionar el certificado
        setCertificadoSeleccionado(certificado)

        // Obtener el warrant asociado
        const warrant = almacenajeService.getWarrantById(certificado.warrantId)
        if (warrant) {
          setWarrantSeleccionado(warrant)
        }

        // Notificar al usuario
        toast({
          title: "Código QR verificado",
          description: `Certificado ${certificado.numero} encontrado y seleccionado.`,
          variant: "default",
        })

        return certificado
      } else {
        // Notificar al usuario
        toast({
          title: "Código QR no encontrado",
          description: "No se encontró ningún certificado con ese código QR.",
          variant: "destructive",
        })

        return null
      }
    } catch (error) {
      // Manejar el error
      toast({
        title: "Error al verificar código QR",
        description: "No se pudo verificar el código QR. Inténtelo de nuevo más tarde.",
        variant: "destructive",
      })

      return null
    } finally {
      setCargando(false)
    }
  }, [])

  // Obtener el color según el estado del certificado
  const getColorEstado = useCallback((estado: CertificadoEstado): string => {
    switch (estado) {
      case "disponible":
        return "bg-green-500"
      case "reservado":
        return "bg-amber-500"
      case "disponible-carga":
        return "bg-blue-500"
      case "operacion-cargada":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }, [])

  // Obtener el texto descriptivo del estado
  const getTextoEstado = useCallback((estado: CertificadoEstado): string => {
    switch (estado) {
      case "disponible":
        return "Disponible"
      case "reservado":
        return "Reservado"
      case "disponible-carga":
        return "Disponible para Carga"
      case "operacion-cargada":
        return "Operación Cargada"
      default:
        return "Desconocido"
    }
  }, [])

  // Retornar todos los estados y funciones necesarios
  return {
    // Datos
    warrants,
    certificados,
    depositos,
    ingenios,
    certificadoSeleccionado,
    warrantSeleccionado,
    estadisticas,

    // Estados
    cargando,
    filtros,

    // Operaciones básicas
    cargarWarrant,
    cargarCertificado,
    setCertificadoSeleccionado,
    actualizarFiltros,
    limpiarFiltros,

    // Operaciones de estado de certificados
    reservarCertificado,
    marcarDisponibleCarga,
    marcarOperacionCargada,
    liberarCertificado,
    verificarCodigoQR,

    // Utilidades
    getColorEstado,
    getTextoEstado,
  }
}
