"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import { almacenajeService } from "@/app/utilidades/almacenaje/services/almacenaje-service"
import type {
  Warrant,
  CertificadoDeposito,
  Deposito,
  Ingenio,
  FiltrosAlmacenaje,
} from "@/app/utilidades/almacenaje/types"

// Tipos adicionales para el ingreso de mercadería
export interface IngresoMercaderia {
  id: string
  tipoIngreso: "maquila" | "entrega_directa"
  ingenioId: string
  depositoId: string
  cantidadBolsas: number
  fechaIngreso: string
  codigoQR: string
  numeroAutorizacion: string
  estado: "pendiente" | "recibido" | "procesado" | "completado"
  usuarioId: string
  warrantId?: string
  certificadoId?: string
}

export interface MovimientoHistorico {
  id: string
  fecha: string
  tipo:
    | "ingreso"
    | "generacion_warrant"
    | "generacion_certificado"
    | "cambio_estado"
    | "operacion_caja_punta"
    | "operacion_canje"
  descripcion: string
  entidadId: string // ID del warrant, certificado, etc.
  entidadTipo: "warrant" | "certificado" | "ingreso"
  usuarioId: string
  usuarioNombre: string
  detalles?: Record<string, any>
}

// Hook para manejar las operaciones de warrants
export function useWarrants() {
  // Estados para los datos principales
  const [warrants, setWarrants] = useState<Warrant[]>([])
  const [certificados, setCertificados] = useState<CertificadoDeposito[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [ingresos, setIngresos] = useState<IngresoMercaderia[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoHistorico[]>([])

  // Estados para los filtros
  const [filtros, setFiltros] = useState<FiltrosAlmacenaje>({})

  // Estados para el warrant/certificado seleccionado y sus detalles
  const [warrantSeleccionado, setWarrantSeleccionado] = useState<Warrant | null>(null)
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState<CertificadoDeposito | null>(null)

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

    // Simular carga de ingresos (en una implementación real, esto vendría de una API)
    setIngresos(simularIngresos())

    // Simular carga de movimientos históricos
    setMovimientos(simularMovimientos())
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

  // Función para crear un nuevo ingreso de mercadería
  const crearIngresoMercaderia = useCallback(
    async (datos: {
      tipoIngreso: "maquila" | "entrega_directa"
      ingenioId: string
      depositoId: string
      cantidadBolsas: number
    }) => {
      setCargando(true)

      try {
        // Generar un código QR y número de autorización únicos
        const codigoQR = `QR-ING-${Date.now()}`
        const numeroAutorizacion = `AUT-${Date.now().toString().substring(7)}`

        // Crear el nuevo ingreso
        const nuevoIngreso: IngresoMercaderia = {
          id: `ing-${Date.now()}`,
          tipoIngreso: datos.tipoIngreso,
          ingenioId: datos.ingenioId,
          depositoId: datos.depositoId,
          cantidadBolsas: datos.cantidadBolsas,
          fechaIngreso: new Date().toISOString(),
          codigoQR,
          numeroAutorizacion,
          estado: "pendiente",
          usuarioId: "user-123", // En una implementación real, esto vendría del usuario autenticado
        }

        // Actualizar el estado
        setIngresos((prev) => [nuevoIngreso, ...prev])

        // Registrar el movimiento
        const nuevoMovimiento: MovimientoHistorico = {
          id: `mov-${Date.now()}`,
          fecha: new Date().toISOString(),
          tipo: "ingreso",
          descripcion: `Ingreso de mercadería creado: ${datos.cantidadBolsas} bolsas`,
          entidadId: nuevoIngreso.id,
          entidadTipo: "ingreso",
          usuarioId: "user-123",
          usuarioNombre: "Usuario Demo",
          detalles: {
            tipoIngreso: datos.tipoIngreso,
            ingenioId: datos.ingenioId,
            depositoId: datos.depositoId,
            cantidadBolsas: datos.cantidadBolsas,
          },
        }

        setMovimientos((prev) => [nuevoMovimiento, ...prev])

        // Notificar al usuario
        toast({
          title: "Ingreso creado",
          description: `Se ha generado un nuevo ingreso con número de autorización ${numeroAutorizacion}`,
          variant: "default",
        })

        // Simular la recepción automática después de un tiempo (solo para demostración)
        setTimeout(() => {
          recibirMercaderia(nuevoIngreso.id)
        }, 5000)

        return nuevoIngreso
      } catch (error) {
        // Manejar el error
        toast({
          title: "Error al crear ingreso",
          description: "No se pudo crear el ingreso de mercadería. Inténtelo de nuevo más tarde.",
          variant: "destructive",
        })

        return null
      } finally {
        setCargando(false)
      }
    },
    [],
  )

  // Función para simular la recepción de mercadería en el depósito
  const recibirMercaderia = useCallback(
    async (ingresoId: string) => {
      // Buscar el ingreso
      const ingreso = ingresos.find((i) => i.id === ingresoId)
      if (!ingreso) return false

      // Actualizar el estado del ingreso
      const ingresoActualizado: IngresoMercaderia = {
        ...ingreso,
        estado: "recibido",
      }

      // Actualizar el estado
      setIngresos((prev) => prev.map((i) => (i.id === ingresoId ? ingresoActualizado : i)))

      // Registrar el movimiento
      const nuevoMovimiento: MovimientoHistorico = {
        id: `mov-${Date.now()}`,
        fecha: new Date().toISOString(),
        tipo: "ingreso",
        descripcion: `Mercadería recibida en depósito: ${ingreso.cantidadBolsas} bolsas`,
        entidadId: ingreso.id,
        entidadTipo: "ingreso",
        usuarioId: "deposito-1",
        usuarioNombre: "Operador Depósito",
      }

      setMovimientos((prev) => [nuevoMovimiento, ...prev])

      // Notificar al usuario
      toast({
        title: "Mercadería recibida",
        description: `La mercadería ha sido recibida en el depósito. Se procederá a generar el warrant y certificado.`,
        variant: "default",
      })

      // Generar warrant y certificado automáticamente
      setTimeout(() => {
        generarWarrantYCertificado(ingresoId)
      }, 3000)

      return true
    },
    [ingresos],
  )

  // Función para generar warrant y certificado a partir de un ingreso
  const generarWarrantYCertificado = useCallback(
    async (ingresoId: string) => {
      // Buscar el ingreso
      const ingreso = ingresos.find((i) => i.id === ingresoId)
      if (!ingreso || ingreso.estado !== "recibido") return false

      try {
        // Generar un nuevo warrant
        const nuevoWarrant: Warrant = {
          id: `war-${Date.now()}`,
          numero: `W-${Date.now().toString().substring(7)}`,
          bolsasTotal: ingreso.cantidadBolsas,
          fechaEmision: new Date().toISOString(),
          fechaVencimiento: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 días
          estado: "activo",
          usuarioId: "user-123", // En una implementación real, esto vendría del usuario autenticado
          certificados: [],
        }

        // Generar un nuevo certificado
        const nuevoCertificado: CertificadoDeposito = {
          id: `cert-${Date.now()}`,
          numero: `CD-${Date.now().toString().substring(7)}`,
          codigoQR: `QR-CD-${Date.now().toString().substring(7)}`,
          bolsas: ingreso.cantidadBolsas,
          ingenio: ingenios.find((i) => i.id === ingreso.ingenioId)?.nombre || "Desconocido",
          deposito: depositos.find((d) => d.id === ingreso.depositoId)?.nombre || "Desconocido",
          estado: "disponible",
          tipo: "normal",
          fechaCreacion: new Date().toISOString(),
          fechaModificacion: new Date().toISOString(),
          warrantId: nuevoWarrant.id,
          usuarioId: "user-123", // En una implementación real, esto vendría del usuario autenticado
          historial: [
            {
              id: `hist-${Date.now()}`,
              fecha: new Date().toISOString(),
              estadoAnterior: null,
              estadoNuevo: "disponible",
              accion: "Certificado creado",
              usuario: "Sistema",
            },
          ],
        }

        // Actualizar el warrant con el ID del certificado
        nuevoWarrant.certificados = [nuevoCertificado.id]

        // Actualizar el ingreso
        const ingresoActualizado: IngresoMercaderia = {
          ...ingreso,
          estado: "completado",
          warrantId: nuevoWarrant.id,
          certificadoId: nuevoCertificado.id,
        }

        // Actualizar los estados
        setWarrants((prev) => [nuevoWarrant, ...prev])
        setCertificados((prev) => [nuevoCertificado, ...prev])
        setIngresos((prev) => prev.map((i) => (i.id === ingresoId ? ingresoActualizado : i)))

        // Registrar los movimientos
        const movimientoWarrant: MovimientoHistorico = {
          id: `mov-${Date.now()}-1`,
          fecha: new Date().toISOString(),
          tipo: "generacion_warrant",
          descripcion: `Warrant generado: ${nuevoWarrant.numero}`,
          entidadId: nuevoWarrant.id,
          entidadTipo: "warrant",
          usuarioId: "sistema",
          usuarioNombre: "Sistema",
        }

        const movimientoCertificado: MovimientoHistorico = {
          id: `mov-${Date.now()}-2`,
          fecha: new Date().toISOString(),
          tipo: "generacion_certificado",
          descripcion: `Certificado generado: ${nuevoCertificado.numero}`,
          entidadId: nuevoCertificado.id,
          entidadTipo: "certificado",
          usuarioId: "sistema",
          usuarioNombre: "Sistema",
        }

        setMovimientos((prev) => [movimientoCertificado, movimientoWarrant, ...prev])

        // Notificar al usuario
        toast({
          title: "Warrant y Certificado generados",
          description: `Se ha generado el warrant ${nuevoWarrant.numero} y el certificado ${nuevoCertificado.numero}`,
          variant: "default",
        })

        // Actualizar estadísticas
        const estadisticasActualizadas = almacenajeService.getEstadisticas()
        setEstadisticas(estadisticasActualizadas)

        return { warrant: nuevoWarrant, certificado: nuevoCertificado }
      } catch (error) {
        // Manejar el error
        toast({
          title: "Error al generar documentos",
          description: "No se pudieron generar el warrant y certificado. Inténtelo de nuevo más tarde.",
          variant: "destructive",
        })

        return null
      }
    },
    [ingresos, ingenios, depositos],
  )

  // Función para descargar un certificado en PDF
  const descargarCertificadoPDF = useCallback(
    (certificadoId: string) => {
      const certificado = certificados.find((c) => c.id === certificadoId)
      if (!certificado) return false

      // En una implementación real, aquí se generaría un PDF
      // Para esta simulación, solo mostraremos un mensaje
      toast({
        title: "Descarga iniciada",
        description: `Se ha iniciado la descarga del certificado ${certificado.numero} en formato PDF.`,
        variant: "default",
      })

      return true
    },
    [certificados],
  )

  // Función para obtener los movimientos de una entidad específica
  const obtenerMovimientosEntidad = useCallback(
    (entidadId: string, entidadTipo: "warrant" | "certificado" | "ingreso") => {
      return movimientos.filter((m) => m.entidadId === entidadId && m.entidadTipo === entidadTipo)
    },
    [movimientos],
  )

  // Funciones auxiliares para simular datos
  function simularIngresos(): IngresoMercaderia[] {
    return [
      {
        id: "ing-1",
        tipoIngreso: "maquila",
        ingenioId: "ingenio-1",
        depositoId: "deposito-1",
        cantidadBolsas: 500,
        fechaIngreso: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        codigoQR: "QR-ING-001",
        numeroAutorizacion: "AUT-001",
        estado: "completado",
        usuarioId: "user-123",
        warrantId: "warrant-1",
        certificadoId: "cert-1",
      },
      {
        id: "ing-2",
        tipoIngreso: "entrega_directa",
        ingenioId: "ingenio-2",
        depositoId: "deposito-2",
        cantidadBolsas: 300,
        fechaIngreso: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        codigoQR: "QR-ING-002",
        numeroAutorizacion: "AUT-002",
        estado: "completado",
        usuarioId: "user-123",
        warrantId: "warrant-2",
        certificadoId: "cert-2",
      },
      {
        id: "ing-3",
        tipoIngreso: "maquila",
        ingenioId: "ingenio-3",
        depositoId: "deposito-1",
        cantidadBolsas: 200,
        fechaIngreso: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        codigoQR: "QR-ING-003",
        numeroAutorizacion: "AUT-003",
        estado: "recibido",
        usuarioId: "user-123",
      },
    ]
  }

  function simularMovimientos(): MovimientoHistorico[] {
    return [
      {
        id: "mov-1",
        fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        tipo: "ingreso",
        descripcion: "Ingreso de mercadería creado: 500 bolsas",
        entidadId: "ing-1",
        entidadTipo: "ingreso",
        usuarioId: "user-123",
        usuarioNombre: "Usuario Demo",
      },
      {
        id: "mov-2",
        fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
        tipo: "ingreso",
        descripcion: "Mercadería recibida en depósito: 500 bolsas",
        entidadId: "ing-1",
        entidadTipo: "ingreso",
        usuarioId: "deposito-1",
        usuarioNombre: "Operador Depósito",
      },
      {
        id: "mov-3",
        fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        tipo: "generacion_warrant",
        descripcion: "Warrant generado: W-001",
        entidadId: "warrant-1",
        entidadTipo: "warrant",
        usuarioId: "sistema",
        usuarioNombre: "Sistema",
      },
      {
        id: "mov-4",
        fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        tipo: "generacion_certificado",
        descripcion: "Certificado generado: CD-001",
        entidadId: "cert-1",
        entidadTipo: "certificado",
        usuarioId: "sistema",
        usuarioNombre: "Sistema",
      },
      {
        id: "mov-5",
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tipo: "ingreso",
        descripcion: "Ingreso de mercadería creado: 300 bolsas",
        entidadId: "ing-2",
        entidadTipo: "ingreso",
        usuarioId: "user-123",
        usuarioNombre: "Usuario Demo",
      },
      {
        id: "mov-6",
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
        tipo: "ingreso",
        descripcion: "Mercadería recibida en depósito: 300 bolsas",
        entidadId: "ing-2",
        entidadTipo: "ingreso",
        usuarioId: "deposito-2",
        usuarioNombre: "Operador Depósito",
      },
      {
        id: "mov-7",
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        tipo: "generacion_warrant",
        descripcion: "Warrant generado: W-002",
        entidadId: "warrant-2",
        entidadTipo: "warrant",
        usuarioId: "sistema",
        usuarioNombre: "Sistema",
      },
      {
        id: "mov-8",
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        tipo: "generacion_certificado",
        descripcion: "Certificado generado: CD-002",
        entidadId: "cert-2",
        entidadTipo: "certificado",
        usuarioId: "sistema",
        usuarioNombre: "Sistema",
      },
      {
        id: "mov-9",
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tipo: "ingreso",
        descripcion: "Ingreso de mercadería creado: 200 bolsas",
        entidadId: "ing-3",
        entidadTipo: "ingreso",
        usuarioId: "user-123",
        usuarioNombre: "Usuario Demo",
      },
      {
        id: "mov-10",
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
        tipo: "ingreso",
        descripcion: "Mercadería recibida en depósito: 200 bolsas",
        entidadId: "ing-3",
        entidadTipo: "ingreso",
        usuarioId: "deposito-1",
        usuarioNombre: "Operador Depósito",
      },
    ]
  }

  return {
    // Datos
    warrants,
    certificados,
    depositos,
    ingenios,
    ingresos,
    movimientos,
    warrantSeleccionado,
    certificadoSeleccionado,
    estadisticas,

    // Estados
    cargando,
    filtros,

    // Operaciones básicas
    cargarWarrant,
    cargarCertificado,
    setWarrantSeleccionado,
    setCertificadoSeleccionado,
    actualizarFiltros,
    limpiarFiltros,

    // Operaciones de ingreso y generación
    crearIngresoMercaderia,
    recibirMercaderia,
    generarWarrantYCertificado,
    descargarCertificadoPDF,
    obtenerMovimientosEntidad,
  }
}
