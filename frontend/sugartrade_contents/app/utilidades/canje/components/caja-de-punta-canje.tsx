"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"
import {
  Info,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  Shield,
  DollarSign,
  AlertTriangle,
  Shuffle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings } from "lucide-react"

// Tipos para las operaciones de canje
interface OperacionCanje {
  id: string
  precio: number
  cantidad: number
  timestamp: number
  usuario: string
  tipoAzucar: string
  tipoEntrega: "inmediata" | "programada"
  lugarEntrega?: string
  fechaEntrega?: string
}

// Tipos para el portafolio del usuario
interface PortafolioUsuario {
  certificadosDisponibles: number
  certificadosEnGarantia: number
  certificadosParaCanje: number
  dineroDisponible: number
  id: string
  nombre: string
}

// Tipo para la contraparte en una operación
interface ContraparteOperacion {
  id: string
  nombre: string
  certificadosDisponibles: number
  dineroDisponible: number
}

// Tipo para el historial de operaciones de canje
interface HistorialOperacionCanje {
  id: string
  tipo: "compra" | "venta"
  precio: number
  cantidad: number
  timestamp: number
  estadoCertificado: "reservado" | "disponible-carga" | "operacion-cargada"
  contraparteId: string
  contraparteNombre: string
  valorTotal: number
  tipoAzucar: string
  tipoEntrega: "inmediata" | "programada"
  lugarEntrega?: string
  fechaEntrega?: string
}

// Tipo para la estrategia de operación
interface EstrategiaCanje {
  id: string
  nombre: string
  descripcion: string
  tipoAzucar?: string
  lugarEntrega?: string
}

// Tipo para el historial de operaciones extendido
interface HistorialOperacionCanjeExtendido extends HistorialOperacionCanje {
  estado: "completada" | "pendiente" | "cancelada" | "reservado" | "disponible-carga" | "operacion-cargada"
  comision: number
  impuestos: number
  valorNeto: number
  estrategia?: string
  notas?: string
}

// Datos de ejemplo para las operaciones
const operacionesCompraIniciales: OperacionCanje[] = [
  {
    id: "c1",
    precio: 19.85,
    cantidad: 30,
    timestamp: Date.now() - 120000,
    usuario: "trader1",
    tipoAzucar: "Blanco Refinado",
    tipoEntrega: "inmediata",
  },
  {
    id: "c2",
    precio: 19.75,
    cantidad: 65,
    timestamp: Date.now() - 180000,
    usuario: "trader2",
    tipoAzucar: "Crudo",
    tipoEntrega: "programada",
    lugarEntrega: "Tucumán",
    fechaEntrega: "15/05/2024",
  },
  {
    id: "c3",
    precio: 19.65,
    cantidad: 55,
    timestamp: Date.now() - 240000,
    usuario: "trader3",
    tipoAzucar: "Blanco Estándar",
    tipoEntrega: "inmediata",
  },
  {
    id: "c4",
    precio: 19.5,
    cantidad: 45,
    timestamp: Date.now() - 300000,
    usuario: "trader4",
    tipoAzucar: "Blanco Refinado",
    tipoEntrega: "programada",
    lugarEntrega: "Salta",
    fechaEntrega: "10/04/2024",
  },
  {
    id: "c5",
    precio: 19.45,
    cantidad: 25,
    timestamp: Date.now() - 360000,
    usuario: "trader5",
    tipoAzucar: "Crudo",
    tipoEntrega: "inmediata",
  },
]

const operacionesVentaIniciales: OperacionCanje[] = [
  {
    id: "v1",
    precio: 20.05,
    cantidad: 85,
    timestamp: Date.now() - 150000,
    usuario: "trader6",
    tipoAzucar: "Blanco Refinado",
    tipoEntrega: "programada",
    lugarEntrega: "Jujuy",
    fechaEntrega: "20/04/2024",
  },
  {
    id: "v2",
    precio: 20.0,
    cantidad: 52,
    timestamp: Date.now() - 210000,
    usuario: "trader7",
    tipoAzucar: "Crudo",
    tipoEntrega: "inmediata",
  },
  {
    id: "v3",
    precio: 19.95,
    cantidad: 95,
    timestamp: Date.now() - 270000,
    usuario: "trader8",
    tipoAzucar: "Blanco Estándar",
    tipoEntrega: "programada",
    lugarEntrega: "Santa Fe",
    fechaEntrega: "05/05/2024",
  },
  {
    id: "v4",
    precio: 19.9,
    cantidad: 63,
    timestamp: Date.now() - 330000,
    usuario: "trader9",
    tipoAzucar: "Blanco Refinado",
    tipoEntrega: "inmediata",
  },
  {
    id: "v5",
    precio: 19.85,
    cantidad: 60,
    timestamp: Date.now() - 390000,
    usuario: "trader10",
    tipoAzucar: "Crudo",
    tipoEntrega: "programada",
    lugarEntrega: "Córdoba",
    fechaEntrega: "18/04/2024",
  },
]

// Datos de ejemplo para contrapartes
const contrapartesIniciales: Record<string, ContraparteOperacion> = {
  trader1: { id: "trader1", nombre: "Ingenio Ledesma", certificadosDisponibles: 150, dineroDisponible: 8500 },
  trader2: { id: "trader2", nombre: "Ingenio La Fronterita", certificadosDisponibles: 200, dineroDisponible: 12000 },
  trader3: { id: "trader3", nombre: "Ingenio La Trinidad", certificadosDisponibles: 80, dineroDisponible: 5000 },
  trader4: { id: "trader4", nombre: "Ingenio Bella Vista", certificadosDisponibles: 120, dineroDisponible: 7500 },
  trader5: { id: "trader5", nombre: "Ingenio San Martín", certificadosDisponibles: 90, dineroDisponible: 6000 },
  trader6: { id: "trader6", nombre: "Distribuidor Central", certificadosDisponibles: 50, dineroDisponible: 15000 },
  trader7: { id: "trader7", nombre: "Exportadora Azucarera", certificadosDisponibles: 30, dineroDisponible: 10000 },
  trader8: { id: "trader8", nombre: "Mayorista Norte", certificadosDisponibles: 20, dineroDisponible: 18000 },
  trader9: { id: "trader9", nombre: "Empaquetadora Sur", certificadosDisponibles: 40, dineroDisponible: 9000 },
  trader10: { id: "trader10", nombre: "Distribuidora Nacional", certificadosDisponibles: 60, dineroDisponible: 14000 },
}

export default function CajaDePuntaCanje() {
  // Estados para las operaciones
  const [operacionesCompra, setOperacionesCompra] = useState<OperacionCanje[]>(operacionesCompraIniciales)
  const [operacionesVenta, setOperacionesVenta] = useState<OperacionCanje[]>(operacionesVentaIniciales)

  // Estado para el modo simulación
  const [modoSimulacion, setModoSimulacion] = useState(false)

  // Estados para la simulación de operaciones
  const [precioSimulado, setPrecioSimulado] = useState("")
  const [cantidadSimulada, setCantidadSimulada] = useState("")
  const [tipoOperacion, setTipoOperacion] = useState<"compra" | "venta">("compra")
  const [tipoAzucarSimulado, setTipoAzucarSimulado] = useState("Blanco Refinado")
  const [tipoEntregaSimulado, setTipoEntregaSimulado] = useState<"inmediata" | "programada">("inmediata")
  const [lugarEntregaSimulado, setLugarEntregaSimulado] = useState("")
  const [fechaEntregaSimulado, setFechaEntregaSimulado] = useState("")

  // Estado para rastrear operaciones con cambios recientes
  const [operacionesModificadas, setOperacionesModificadas] = useState<Set<string>>(new Set())
  const [operacionesNuevas, setOperacionesNuevas] = useState<Set<string>>(new Set())

  // Estado para la dirección del mercado
  const [direccionMercado, setDireccionMercado] = useState<"up" | "down" | "neutral">("neutral")
  const precioPromedioRef = useRef<number | null>(null)

  // Estado para la operación seleccionada para simular transacción
  const [operacionSeleccionada, setOperacionSeleccionada] = useState<OperacionCanje | null>(null)
  const [filaSeleccionada, setFilaSeleccionada] = useState<number | null>(null)
  const [dialogoTransaccionAbierto, setDialogoTransaccionAbierto] = useState(false)
  const [cantidadTransaccion, setCantidadTransaccion] = useState("1")
  const [tipoTransaccion, setTipoTransaccion] = useState<"compra" | "venta">("compra")

  // Estado para el diálogo de operación
  const [dialogoOperarAbierto, setDialogoOperarAbierto] = useState(false)
  const [operacionExitosa, setOperacionExitosa] = useState<boolean | null>(null)
  const [procesandoOperacion, setProcesandoOperacion] = useState(false)

  // Estado para el portafolio del usuario (simulado)
  const [portafolioUsuario, setPortafolioUsuario] = useState<PortafolioUsuario>({
    certificadosDisponibles: 100,
    certificadosEnGarantia: 20,
    certificadosParaCanje: 30,
    dineroDisponible: 5500,
    id: "user-123",
    nombre: "Usuario Demo",
  })

  // Estado para contrapartes
  const [contrapartes, setContrapartes] = useState<Record<string, ContraparteOperacion>>(contrapartesIniciales)

  // Estado para historial de operaciones
  const [historialOperaciones, setHistorialOperaciones] = useState<HistorialOperacionCanje[]>([])

  // Añadir estados para errores de validación
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null)
  const [advertencias, setAdvertencias] = useState<string[]>([])

  // Estado para confirmación de operaciones grandes
  const [confirmacionOperacionGrande, setConfirmacionOperacionGrande] = useState(false)
  const [mostrarAlertaConfirmacion, setMostrarAlertaConfirmacion] = useState(false)

  // Estado para preferencias de operación
  const [confirmarTodasLasOperaciones, setConfirmarTodasLasOperaciones] = useState(true)
  const [modoAvanzado, setModoAvanzado] = useState(false)
  const [estrategiaSeleccionada, setEstrategiaSeleccionada] = useState<string | null>(null)
  const [mostrarIndicadores, setMostrarIndicadores] = useState(true)

  // Estados específicos para canje
  const [estadoCertificado, setEstadoCertificado] = useState<"reservado" | "disponible-carga" | "operacion-cargada">(
    "reservado",
  )
  const [lugarEntrega, setLugarEntrega] = useState("")
  const [fechaEntrega, setFechaEntrega] = useState("")
  const [tipoAzucar, setTipoAzucar] = useState("Blanco Refinado")
  const [tipoEntrega, setTipoEntrega] = useState<"inmediata" | "programada">("inmediata")

  // Estado para filtros de canje
  const [filtroTipoAzucar, setFiltroTipoAzucar] = useState<string | null>(null)
  const [filtroTipoEntrega, setFiltroTipoEntrega] = useState<"inmediata" | "programada" | null>(null)

  // Estado para operación programada
  const [operacionProgramada, setOperacionProgramada] = useState(false)
  const [precioActivacion, setPrecioActivacion] = useState("")
  const [fechaExpiracion, setFechaExpiracion] = useState<Date | null>(null)

  // Estado para notas de operación
  const [notasOperacion, setNotasOperacion] = useState("")

  // Estrategias predefinidas para canje
  const [estrategias, setEstrategias] = useState<EstrategiaCanje[]>([
    {
      id: "estrategia1",
      nombre: "Canje Inmediato",
      descripcion: "Operaciones de canje con entrega inmediata de azúcar",
      tipoAzucar: "Blanco Refinado",
    },
    {
      id: "estrategia2",
      nombre: "Programado a 30 días",
      descripcion: "Canje programado con entrega en 30 días",
      tipoAzucar: "Crudo",
    },
    {
      id: "estrategia3",
      nombre: "Exportación",
      descripcion: "Operaciones de canje para azúcar de exportación",
      lugarEntrega: "Puerto",
    },
  ])

  // Estado para el historial extendido
  const [historialExtendido, setHistorialExtendido] = useState<HistorialOperacionCanjeExtendido[]>([])

  // Efecto para calcular la dirección del mercado
  useEffect(() => {
    // Calcular el precio promedio actual
    const precioPromedioActual = calcularPrecioPromedio(operacionesCompra, operacionesVenta)

    if (precioPromedioRef.current === null) {
      precioPromedioRef.current = precioPromedioActual
      setDireccionMercado("neutral")
    } else {
      if (precioPromedioActual > precioPromedioRef.current) {
        setDireccionMercado("up")
      } else if (precioPromedioActual < precioPromedioRef.current) {
        setDireccionMercado("down")
      }
      precioPromedioRef.current = precioPromedioActual
    }
  }, [operacionesCompra, operacionesVenta])

  // Función para calcular el precio promedio
  const calcularPrecioPromedio = (compras: OperacionCanje[], ventas: OperacionCanje[]) => {
    const todasLasOperaciones = [...compras, ...ventas]
    if (todasLasOperaciones.length === 0) return 0

    const sumaPrecio = todasLasOperaciones.reduce((acc, op) => acc + op.precio, 0)
    return sumaPrecio / todasLasOperaciones.length
  }

  // Efecto para simular actividad del mercado
  useEffect(() => {
    if (modoSimulacion) return // No simular actividad en modo simulación

    const interval = setInterval(() => {
      // Simular cambios aleatorios en las operaciones
      const shouldUpdateCompra = Math.random() > 0.5
      const shouldUpdateVenta = Math.random() > 0.5

      if (shouldUpdateCompra) {
        const indexToUpdate = Math.floor(Math.random() * operacionesCompra.length)
        const updatedOperaciones = [...operacionesCompra]
        const operacion = { ...updatedOperaciones[indexToUpdate] }

        // Modificar precio o cantidad aleatoriamente
        if (Math.random() > 0.5) {
          operacion.precio = +(operacion.precio + (Math.random() * 0.1 - 0.05)).toFixed(2)
        } else {
          operacion.cantidad = Math.max(10, Math.floor(operacion.cantidad + (Math.random() * 20 - 10)))
        }

        operacion.timestamp = Date.now()
        updatedOperaciones[indexToUpdate] = operacion

        // Marcar como modificada para efectos visuales
        setOperacionesModificadas((prev) => new Set(prev).add(operacion.id))

        // Actualizar estado
        setOperacionesCompra(updatedOperaciones.sort((a, b) => b.precio - a.precio))
      }

      if (shouldUpdateVenta) {
        const indexToUpdate = Math.floor(Math.random() * operacionesVenta.length)
        const updatedOperaciones = [...operacionesVenta]
        const operacion = { ...updatedOperaciones[indexToUpdate] }

        // Modificar precio o cantidad aleatoriamente
        if (Math.random() > 0.5) {
          operacion.precio = +(operacion.precio + (Math.random() * 0.1 - 0.05)).toFixed(2)
        } else {
          operacion.cantidad = Math.max(10, Math.floor(operacion.cantidad + (Math.random() * 20 - 10)))
        }

        operacion.timestamp = Date.now()
        updatedOperaciones[indexToUpdate] = operacion

        // Marcar como modificada para efectos visuales
        setOperacionesModificadas((prev) => new Set(prev).add(operacion.id))

        // Actualizar estado
        setOperacionesVenta(updatedOperaciones.sort((a, b) => a.precio - b.precio))
      }
    }, 3000) // Actualizar cada 3 segundos

    // Limpiar efectos visuales después de un tiempo
    const cleanupInterval = setInterval(() => {
      setOperacionesModificadas(new Set())
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(cleanupInterval)
    }
  }, [operacionesCompra, operacionesVenta, modoSimulacion])

  // Función para simular una operación
  const simularOperacion = () => {
    if (!precioSimulado || !cantidadSimulada) return

    const precio = Number.parseFloat(precioSimulado)
    const cantidad = Number.parseInt(cantidadSimulada)

    if (isNaN(precio) || isNaN(cantidad) || precio <= 0 || cantidad <= 0) return

    const nuevaOperacion: OperacionCanje = {
      id: `sim-${Date.now()}`,
      precio,
      cantidad,
      timestamp: Date.now(),
      usuario: "usuario-simulación",
      tipoAzucar: tipoAzucarSimulado,
      tipoEntrega: tipoEntregaSimulado,
      ...(tipoEntregaSimulado === "programada" && lugarEntregaSimulado ? { lugarEntrega: lugarEntregaSimulado } : {}),
      ...(tipoEntregaSimulado === "programada" && fechaEntregaSimulado ? { fechaEntrega: fechaEntregaSimulado } : {}),
    }

    // Marcar como nueva para efectos visuales
    setOperacionesNuevas((prev) => new Set(prev).add(nuevaOperacion.id))

    // Limpiar el efecto después de un tiempo
    setTimeout(() => {
      setOperacionesNuevas((prev) => {
        const newSet = new Set(prev)
        newSet.delete(nuevaOperacion.id)
        return newSet
      })
    }, 2000)

    if (tipoOperacion === "compra") {
      setOperacionesCompra(
        (prev) => [...prev, nuevaOperacion].sort((a, b) => b.precio - a.precio).slice(0, 10), // Mantener solo las 10 mejores ofertas
      )
    } else {
      setOperacionesVenta(
        (prev) => [...prev, nuevaOperacion].sort((a, b) => a.precio - b.precio).slice(0, 10), // Mantener solo las 10 mejores ofertas
      )
    }

    // Limpiar campos después de simular
    setPrecioSimulado("")
    setCantidadSimulada("")
  }

  // Función para formatear el tiempo
  const formatearTiempo = (timestamp: number) => {
    const ahora = Date.now()
    const segundosTranscurridos = Math.floor((ahora - timestamp) / 1000)

    if (segundosTranscurridos < 60) {
      return `${segundosTranscurridos}s`
    } else if (segundosTranscurridos < 3600) {
      return `${Math.floor(segundosTranscurridos / 60)}m`
    } else {
      return `${Math.floor(segundosTranscurridos / 3600)}h`
    }
  }

  // Función para manejar el clic en una operación
  const manejarClicOperacion = (operacion: OperacionCanje, tipo: "compra" | "venta", index: number) => {
    if (!modoSimulacion) {
      // En modo normal, seleccionar la fila para operar
      setFilaSeleccionada(index)
      setOperacionSeleccionada(operacion)
      setTipoTransaccion(tipo === "compra" ? "venta" : "compra") // Invertir el tipo para la transacción
      setCantidadTransaccion("1") // Reiniciar a 1 por defecto

      // Actualizar estados específicos de canje
      setTipoAzucar(operacion.tipoAzucar)
      setTipoEntrega(operacion.tipoEntrega)
      if (operacion.lugarEntrega) setLugarEntrega(operacion.lugarEntrega)
      if (operacion.fechaEntrega) setFechaEntrega(operacion.fechaEntrega)

      // Mostrar un toast para indicar que se ha seleccionado una operación
      toast({
        title: "Operación seleccionada",
        description: `${tipo === "compra" ? "Compra" : "Venta"} de ${operacion.tipoAzucar} a $${operacion.precio.toFixed(2)} seleccionada. Presione 'Operar' para continuar.`,
        variant: "default",
      })
      return
    }

    // En modo simulación, abrir el diálogo de transacción
    setOperacionSeleccionada(operacion)
    setTipoTransaccion(tipo === "compra" ? "venta" : "compra") // Invertir el tipo para la transacción
    setCantidadTransaccion("1") // Iniciar con 1 por defecto
    setDialogoTransaccionAbierto(true)
  }

  // Función para ejecutar una transacción simulada
  const ejecutarTransaccion = () => {
    if (!operacionSeleccionada) return

    const cantidad = Number.parseInt(cantidadTransaccion)
    if (isNaN(cantidad) || cantidad <= 0 || cantidad > operacionSeleccionada.cantidad) return

    // Actualizar la cantidad de la operación
    if (tipoTransaccion === "compra") {
      const updatedOperaciones = operacionesVenta
        .map((op) =>
          op.id === operacionSeleccionada.id ? { ...op, cantidad: op.cantidad - cantidad, timestamp: Date.now() } : op,
        )
        .filter((op) => op.cantidad > 0)

      setOperacionesVenta(updatedOperaciones.sort((a, b) => a.precio - b.precio))
    } else {
      const updatedOperaciones = operacionesCompra
        .map((op) =>
          op.id === operacionSeleccionada.id ? { ...op, cantidad: op.cantidad - cantidad, timestamp: Date.now() } : op,
        )
        .filter((op) => op.cantidad > 0)

      setOperacionesCompra(updatedOperaciones.sort((a, b) => b.precio - a.precio))
    }

    setDialogoTransaccionAbierto(false)
    setOperacionSeleccionada(null)
    setCantidadTransaccion("1")

    // Mostrar notificación de éxito
    toast({
      title: "Transacción de canje completada",
      description: `Se ha ${tipoTransaccion === "compra" ? "comprado" : "vendido"} ${cantidad} certificados para canje de ${operacionSeleccionada.tipoAzucar} a $${operacionSeleccionada.precio.toFixed(2)}`,
      variant: "default",
    })
  }

  // Función para validar saldos
  const validarSaldos = (cantidad: number): { valido: boolean; mensaje: string | null; advertencias: string[] } => {
    const nuevasAdvertencias: string[] = []

    if (!operacionSeleccionada) {
      return { valido: false, mensaje: "No hay operación seleccionada", advertencias: [] }
    }

    // Validar saldos según el tipo de operación
    if (tipoTransaccion === "compra") {
      // Validar saldo de dinero para compra
      const costoTotal = operacionSeleccionada.precio * cantidad

      // Verificar si el usuario tiene suficiente dinero
      if (costoTotal > portafolioUsuario.dineroDisponible) {
        return {
          valido: false,
          mensaje: `Saldo insuficiente. Necesita $${costoTotal.toFixed(2)} pero solo tiene $${portafolioUsuario.dineroDisponible.toFixed(2)} disponible.`,
          advertencias: [],
        }
      }

      // Verificar si la compra supera el 50% del dinero disponible (advertencia)
      if (costoTotal > portafolioUsuario.dineroDisponible * 0.5) {
        nuevasAdvertencias.push(
          `Esta operación utilizará más del 50% de su dinero disponible (${((costoTotal / portafolioUsuario.dineroDisponible) * 100).toFixed(1)}%).`,
        )
      }

      // Verificar si la contraparte tiene suficientes certificados
      const contraparte = contrapartes[operacionSeleccionada.usuario]
      if (contraparte && cantidad > contraparte.certificadosDisponibles) {
        nuevasAdvertencias.push(
          `La contraparte podría no tener suficientes certificados para completar esta operación.`,
        )
      }
    } else {
      // Validar saldo de certificados para venta

      // Verificar si el usuario tiene suficientes certificados disponibles para canje
      if (cantidad > portafolioUsuario.certificadosParaCanje) {
        return {
          valido: false,
          mensaje: `Certificados para canje insuficientes. Necesita ${cantidad} certificados pero solo tiene ${portafolioUsuario.certificadosParaCanje} disponibles para canje.`,
          advertencias: [],
        }
      }

      // Verificar si la venta supera el 50% de los certificados disponibles (advertencia)
      if (cantidad > portafolioUsuario.certificadosParaCanje * 0.5) {
        nuevasAdvertencias.push(
          `Esta operación utilizará más del 50% de sus certificados disponibles para canje (${((cantidad / portafolioUsuario.certificadosParaCanje) * 100).toFixed(1)}%).`,
        )
      }

      // Verificar si la contraparte tiene suficiente dinero
      const contraparte = contrapartes[operacionSeleccionada.usuario]
      const costoTotal = operacionSeleccionada.precio * cantidad
      if (contraparte && costoTotal > contraparte.dineroDisponible) {
        nuevasAdvertencias.push(`La contraparte podría no tener suficiente dinero para completar esta operación.`)
      }
    }

    // Si hay certificados en garantía, mostrar advertencia
    if (portafolioUsuario.certificadosEnGarantia > 0 && tipoTransaccion === "venta") {
      nuevasAdvertencias.push(
        `Tiene ${portafolioUsuario.certificadosEnGarantia} certificados en garantía que no pueden ser vendidos.`,
      )
    }

    return { valido: true, mensaje: null, advertencias: nuevasAdvertencias }
  }

  // Función para verificar si una operación necesita confirmación adicional
  const verificarConfirmacionAdicional = (cantidad: number, precio: number): boolean => {
    const valorTotal = cantidad * precio

    // Verificar si el valor total excede cierto umbral
    if (valorTotal > 3000) {
      return true
    }

    // Verificar si la cantidad excede cierto umbral
    if (cantidad > 50) {
      return true
    }

    // Verificar si el precio está fuera del rango normal
    const precioPromedio = calcularPrecioPromedio(operacionesCompra, operacionesVenta)
    const desviacion = Math.abs(precio - precioPromedio) / precioPromedio
    if (desviacion > 0.1) {
      // Si el precio difiere más del 10% del promedio
      return true
    }

    return false
  }

  // Función para abrir el diálogo de operar
  const abrirDialogoOperar = () => {
    if (!operacionSeleccionada) {
      toast({
        title: "Seleccione una operación",
        description: "Debe seleccionar una operación de la tabla para continuar",
        variant: "destructive",
      })
      return
    }

    // Validar saldos para la cantidad inicial (1)
    const cantidadInicial = Number.parseInt(cantidadTransaccion) || 1
    const { valido, mensaje, advertencias } = validarSaldos(cantidadInicial)

    if (!valido) {
      setErrorValidacion(mensaje)
      toast({
        title: "Error de validación",
        description: mensaje || "No se puede realizar esta operación",
        variant: "destructive",
      })
      return
    }

    // Guardar advertencias
    setAdvertencias(advertencias)

    // Limpiar error de validación si todo está bien
    setErrorValidacion(null)
    setDialogoOperarAbierto(true)
  }

  // Función para actualizar la cantidad de la transacción
  const actualizarCantidadTransaccion = (nuevaCantidad: string) => {
    const cantidad = Number.parseInt(nuevaCantidad)

    // Validar que la cantidad sea válida
    if (isNaN(cantidad) || cantidad <= 0) {
      setCantidadTransaccion(nuevaCantidad)
      return
    }

    // Validar que no exceda la cantidad disponible en la operación
    if (operacionSeleccionada && cantidad > operacionSeleccionada.cantidad) {
      setCantidadTransaccion(operacionSeleccionada.cantidad.toString())
      return
    }

    // Actualizar la cantidad
    setCantidadTransaccion(nuevaCantidad)

    // Validar saldos para la nueva cantidad
    if (operacionSeleccionada) {
      const { valido, mensaje, advertencias } = validarSaldos(cantidad)

      if (!valido) {
        setErrorValidacion(mensaje)
      } else {
        setErrorValidacion(null)
        setAdvertencias(advertencias)
      }
    }
  }

  // Función para ejecutar operación
  const ejecutarOperacion = () => {
    if (!operacionSeleccionada) return

    // Convertir cantidad a número
    const cantidad = Number.parseInt(cantidadTransaccion)
    if (isNaN(cantidad) || cantidad <= 0 || cantidad > operacionSeleccionada.cantidad) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad debe ser un número positivo y no puede exceder la cantidad disponible.",
        variant: "destructive",
      })
      return
    }

    // Validar saldos una última vez
    const { valido, mensaje } = validarSaldos(cantidad)
    if (!valido) {
      setErrorValidacion(mensaje)
      toast({
        title: "Error de validación",
        description: mensaje,
        variant: "destructive",
      })
      return
    }

    // Verificar si la operación necesita confirmación adicional
    const valorTotal = operacionSeleccionada.precio * cantidad
    if (
      confirmarTodasLasOperaciones &&
      !confirmacionOperacionGrande &&
      verificarConfirmacionAdicional(cantidad, operacionSeleccionada.precio)
    ) {
      setMostrarAlertaConfirmacion(true)
      return
    }

    // Resetear el estado de confirmación para futuras operaciones
    setConfirmacionOperacionGrande(false)

    // Iniciar procesamiento
    setProcesandoOperacion(true)
    setOperacionExitosa(null)

    // Simular tiempo de procesamiento
    setTimeout(() => {
      // Simular éxito o error aleatorio (95% éxito)
      const exito = Math.random() > 0.05
      setOperacionExitosa(exito)
      setProcesandoOperacion(false)

      if (exito) {
        // Calcular el valor total de la operación
        const valorTotal = operacionSeleccionada.precio * cantidad

        // Actualizar la cantidad de la operación
        if (tipoTransaccion === "compra") {
          // Actualizar operaciones de venta
          const updatedOperaciones = operacionesVenta
            .map((op) =>
              op.id === operacionSeleccionada.id
                ? { ...op, cantidad: op.cantidad - cantidad, timestamp: Date.now() }
                : op,
            )
            .filter((op) => op.cantidad > 0)

          setOperacionesVenta(updatedOperaciones.sort((a, b) => a.precio - b.precio))

          // Actualizar el portafolio del usuario (compra)
          setPortafolioUsuario((prev) => ({
            ...prev,
            certificadosParaCanje: prev.certificadosParaCanje + cantidad,
            dineroDisponible: prev.dineroDisponible - valorTotal,
          }))

          // Actualizar el portafolio de la contraparte (venta)
          setContrapartes((prev) => {
            const contraparteId = operacionSeleccionada.usuario
            if (!prev[contraparteId]) return prev

            return {
              ...prev,
              [contraparteId]: {
                ...prev[contraparteId],
                certificadosDisponibles: prev[contraparteId].certificadosDisponibles - cantidad,
                dineroDisponible: prev[contraparteId].dineroDisponible + valorTotal,
              },
            }
          })
        } else {
          // Actualizar operaciones de compra
          const updatedOperaciones = operacionesCompra
            .map((op) =>
              op.id === operacionSeleccionada.id
                ? { ...op, cantidad: op.cantidad - cantidad, timestamp: Date.now() }
                : op,
            )
            .filter((op) => op.cantidad > 0)

          setOperacionesCompra(updatedOperaciones.sort((a, b) => b.precio - a.precio))

          // Actualizar el portafolio del usuario (venta)
          setPortafolioUsuario((prev) => ({
            ...prev,
            certificadosParaCanje: prev.certificadosParaCanje - cantidad,
            dineroDisponible: prev.dineroDisponible + valorTotal,
          }))

          // Actualizar el portafolio de la contraparte (compra)
          setContrapartes((prev) => {
            const contraparteId = operacionSeleccionada.usuario
            if (!prev[contraparteId]) return prev

            return {
              ...prev,
              [contraparteId]: {
                ...prev[contraparteId],
                certificadosDisponibles: prev[contraparteId].certificadosDisponibles + cantidad,
                dineroDisponible: prev[contraparteId].dineroDisponible - valorTotal,
              },
            }
          })
        }

        // Registrar la operación en el historial
        const nuevaOperacionHistorial: HistorialOperacionCanje = {
          id: `op-${Date.now()}`,
          tipo: tipoTransaccion,
          precio: operacionSeleccionada.precio,
          cantidad: cantidad,
          timestamp: Date.now(),
          estadoCertificado: "reservado", // Estado inicial
          contraparteId: operacionSeleccionada.usuario,
          contraparteNombre: contrapartes[operacionSeleccionada.usuario]?.nombre || "Desconocido",
          valorTotal: valorTotal,
          tipoAzucar: operacionSeleccionada.tipoAzucar,
          tipoEntrega: operacionSeleccionada.tipoEntrega,
          lugarEntrega: operacionSeleccionada.lugarEntrega,
          fechaEntrega: operacionSeleccionada.fechaEntrega,
        }

        setHistorialOperaciones((prev) => [nuevaOperacionHistorial, ...prev])

        // Crear una versión extendida para el historial detallado
        const comision = valorTotal * 0.005 // 0.5% de comisión
        const impuestos = valorTotal * 0.16 // 16% de impuestos (ejemplo)
        const valorNeto = tipoTransaccion === "venta" ? valorTotal - comision - impuestos : -valorTotal - comision

        const nuevaOperacionExtendida: HistorialOperacionCanjeExtendido = {
          ...nuevaOperacionHistorial,
          estado: "reservado",
          comision: comision,
          impuestos: impuestos,
          valorNeto: valorNeto,
          estrategia: estrategiaSeleccionada || undefined,
          notas: notasOperacion || undefined,
        }

        setHistorialExtendido((prev) => [nuevaOperacionExtendida, ...prev])

        // Mostrar notificación de estado de custodia
        toast({
          title: "Certificado Reservado",
          description: `El certificado ha sido reservado para canje. Se retendrán los fondos hasta completar la operación.`,
          variant: "default",
        })

        // Simular cambio de estado después de un tiempo (solo para demostración)
        setTimeout(() => {
          // Actualizar estado a "disponible para carga"
          setHistorialExtendido((prev) =>
            prev.map((op) =>
              op.id === nuevaOperacionExtendida.id ? { ...op, estado: "disponible-carga" as const } : op,
            ),
          )

          // Mostrar notificación
          toast({
            title: "Disponible para Carga",
            description: `El certificado está ahora disponible para carga. Por favor coordinar con el depósito.`,
            variant: "default",
          })

          // Simular completado final
          setTimeout(() => {
            // Actualizar estado a "operación cargada"
            setHistorialExtendido((prev) =>
              prev.map((op) =>
                op.id === nuevaOperacionExtendida.id ? { ...op, estado: "operacion-cargada" as const } : op,
              ),
            )

            // Mostrar notificación
            toast({
              title: "Operación Completada",
              description: `La operación de canje ha sido completada exitosamente.`,
              variant: "default",
            })
          }, 10000) // 10 segundos después
        }, 8000) // 8 segundos después

        // Limpiar notas de operación
        setNotasOperacion("")
      } else {
        // Mostrar notificación de error
        toast({
          title: "Error en la operación",
          description: "No se pudo completar la operación de canje. Intente nuevamente.",
          variant: "destructive",
        })
      }

      // Cerrar el diálogo después de 3 segundos si fue exitoso
      if (exito) {
        setTimeout(() => {
          setDialogoOperarAbierto(false)
          setOperacionExitosa(null)
          setOperacionSeleccionada(null)
          setFilaSeleccionada(null)
          setCantidadTransaccion("1")
          setAdvertencias([])
        }, 3000)
      }
    }, 2000)
  }

  return (
    <Card className="w-full shadow-md bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center text-white">
              Caja de Punta de Canje
              {direccionMercado === "up" && (
                <span className="ml-2 text-green-600 inline-flex items-center">
                  <TrendingUp className="h-4 w-4" />
                </span>
              )}
              {direccionMercado === "down" && (
                <span className="ml-2 text-red-600 inline-flex items-center">
                  <TrendingDown className="h-4 w-4" />
                </span>
              )}
              <Badge
                variant={direccionMercado === "up" ? "outline" : direccionMercado === "down" ? "outline" : "outline"}
                className={`ml-2 ${
                  direccionMercado === "up"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : direccionMercado === "down"
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-gray-100 text-gray-800 border-gray-300"
                }`}
              >
                {direccionMercado === "up" ? "Alcista" : direccionMercado === "down" ? "Bajista" : "Estable"}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center mt-1 font-medium text-gray-400">
              Certificados de Depósito para Canje
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-[#111936] text-white border-[#1a2040]">
                    <p>
                      Los Certificados de Depósito para Canje son instrumentos financieros que permiten intercambiar
                      azúcar almacenada por certificados negociables. Están respaldados por reservas físicas en
                      depósitos autorizados.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label
              htmlFor="modo-simulacion"
              className={modoSimulacion ? "text-[#00a8ff] font-medium" : "text-gray-400"}
            >
              Modo Simulación
            </Label>
            <Switch id="modo-simulacion" checked={modoSimulacion} onCheckedChange={setModoSimulacion} />
            {modoSimulacion && (
              <Badge variant="outline" className="bg-[#1a2040] text-[#00a8ff] border-[#00a8ff]">
                Simulación Activa
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {modoSimulacion && (
          <div className="mb-4 p-3 bg-[#0a0f29] rounded-md border border-[#1a2040]">
            <h3 className="text-sm font-medium mb-2 flex items-center text-white">
              <AlertCircle className="h-4 w-4 mr-1 text-[#00a8ff]" />
              Simulador de Operaciones de Canje
            </h3>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-2">
                <Label htmlFor="tipo-operacion" className="text-xs mb-1 block text-gray-400">
                  Tipo
                </Label>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={tipoOperacion === "compra" ? "default" : "outline"}
                    className={tipoOperacion === "compra" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    onClick={() => setTipoOperacion("compra")}
                  >
                    Compra
                  </Button>
                  <Button
                    size="sm"
                    variant={tipoOperacion === "venta" ? "default" : "outline"}
                    className={tipoOperacion === "venta" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                    onClick={() => setTipoOperacion("venta")}
                  >
                    Venta
                  </Button>
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor="precio-simulado" className="text-xs mb-1 block text-gray-400">
                  Precio
                </Label>
                <Input
                  id="precio-simulado"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 19.70"
                  value={precioSimulado}
                  onChange={(e) => setPrecioSimulado(e.target.value)}
                  className="h-9 bg-[#0a0f29] border-[#1a2040] text-white"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="cantidad-simulada" className="text-xs mb-1 block text-gray-400">
                  Cantidad
                </Label>
                <Input
                  id="cantidad-simulada"
                  type="number"
                  min="1"
                  placeholder="Ej: 100"
                  value={cantidadSimulada}
                  onChange={(e) => setCantidadSimulada(e.target.value)}
                  className="h-9 bg-[#0a0f29] border-[#1a2040] text-white"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="tipo-azucar" className="text-xs mb-1 block text-gray-400">
                  Tipo de Azúcar
                </Label>
                <Select value={tipoAzucarSimulado} onValueChange={setTipoAzucarSimulado}>
                  <SelectTrigger className="h-9 bg-[#0a0f29] border-[#1a2040] text-white">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                    <SelectItem value="Blanco Refinado">Blanco Refinado</SelectItem>
                    <SelectItem value="Blanco Estándar">Blanco Estándar</SelectItem>
                    <SelectItem value="Crudo">Crudo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="tipo-entrega" className="text-xs mb-1 block text-gray-400">
                  Entrega
                </Label>
                <Select
                  value={tipoEntregaSimulado}
                  onValueChange={(val) => setTipoEntregaSimulado(val as "inmediata" | "programada")}
                >
                  <SelectTrigger className="h-9 bg-[#0a0f29] border-[#1a2040] text-white">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                    <SelectItem value="inmediata">Inmediata</SelectItem>
                    <SelectItem value="programada">Programada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Button
                  onClick={simularOperacion}
                  className="w-full h-9 mt-[18px]"
                  disabled={!precioSimulado || !cantidadSimulada}
                >
                  Simular
                </Button>
              </div>
            </div>

            {tipoEntregaSimulado === "programada" && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="lugar-entrega" className="text-xs mb-1 block text-gray-400">
                    Lugar de Entrega
                  </Label>
                  <Input
                    id="lugar-entrega"
                    placeholder="Ej: Tucumán"
                    value={lugarEntregaSimulado}
                    onChange={(e) => setLugarEntregaSimulado(e.target.value)}
                    className="h-9 bg-[#0a0f29] border-[#1a2040] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="fecha-entrega" className="text-xs mb-1 block text-gray-400">
                    Fecha de Entrega
                  </Label>
                  <Input
                    id="fecha-entrega"
                    placeholder="Ej: 15/05/2024"
                    value={fechaEntregaSimulado}
                    onChange={(e) => setFechaEntregaSimulado(e.target.value)}
                    className="h-9 bg-[#0a0f29] border-[#1a2040] text-white"
                  />
                </div>
              </div>
            )}

            <div className="mt-2 text-xs text-[#00a8ff]">
              {modoSimulacion && <p>Haga clic en cualquier operación para simular una transacción de canje</p>}
            </div>
          </div>
        )}

        {/* Filtros de Canje */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div>
            <Label htmlFor="filtro-tipo-azucar" className="text-xs text-gray-400">
              Tipo de Azúcar
            </Label>
            <Select
              value={filtroTipoAzucar || "todos"}
              onValueChange={(val) => setFiltroTipoAzucar(val === "todos" ? null : val)}
            >
              <SelectTrigger className="h-8 w-36 bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Blanco Refinado">Blanco Refinado</SelectItem>
                <SelectItem value="Blanco Estándar">Blanco Estándar</SelectItem>
                <SelectItem value="Crudo">Crudo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filtro-tipo-entrega" className="text-xs text-gray-400">
              Tipo de Entrega
            </Label>
            <Select
              value={filtroTipoEntrega || "todos"}
              onValueChange={(val) =>
                setFiltroTipoEntrega(val === "todos" ? null : (val as "inmediata" | "programada"))
              }
            >
              <SelectTrigger className="h-8 w-36 bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="inmediata">Inmediata</SelectItem>
                <SelectItem value="programada">Programada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabla de Caja de Punta con nuevo diseño */}
        <div className="overflow-hidden rounded-md border border-[#1a2040]">
          {/* Encabezados de las columnas */}
          <div className="flex justify-center py-3 bg-[#0a0f29] border-b border-[#1a2040]">
            <div className="w-1/2 text-center">
              <h3 className="text-base font-bold text-green-600 uppercase">Compra (Ofertas)</h3>
            </div>
            <div className="w-1/2 text-center">
              <h3 className="text-base font-bold text-red-600 uppercase">Venta (Demandas)</h3>
            </div>
          </div>

          {/* Encabezados de columnas de datos */}
          <div className="flex justify-center text-sm font-medium py-2 border-b border-[#1a2040] bg-[#0a0f29]">
            <div className="w-1/2 flex">
              <div className="w-1/4 text-center text-gray-400">Cantidad</div>
              <div className="w-1/4 text-center text-gray-400">Precio</div>
              <div className="w-1/4 text-center text-gray-400">Tipo Azúcar</div>
              <div className="w-1/4 text-center text-gray-400">Entrega</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-1/4 text-center text-gray-400">Precio</div>
              <div className="w-1/4 text-center text-gray-400">Cantidad</div>
              <div className="w-1/4 text-center text-gray-400">Tipo Azúcar</div>
              <div className="w-1/4 text-center text-gray-400">Entrega</div>
            </div>
          </div>

          {/* Filas de datos */}
          <div className="max-h-[400px] overflow-auto">
            {Array.from({
              length: Math.max(
                operacionesCompra.filter(
                  (op) =>
                    (!filtroTipoAzucar || op.tipoAzucar === filtroTipoAzucar) &&
                    (!filtroTipoEntrega || op.tipoEntrega === filtroTipoEntrega),
                ).length,
                operacionesVenta.filter(
                  (op) =>
                    (!filtroTipoAzucar || op.tipoAzucar === filtroTipoAzucar) &&
                    (!filtroTipoEntrega || op.tipoEntrega === filtroTipoEntrega),
                ).length,
              ),
            }).map((_, index) => {
              // Filtrar operaciones según los filtros aplicados
              const operacionesCompraFiltradas = operacionesCompra.filter(
                (op) =>
                  (!filtroTipoAzucar || op.tipoAzucar === filtroTipoAzucar) &&
                  (!filtroTipoEntrega || op.tipoEntrega === filtroTipoEntrega),
              )

              const operacionesVentaFiltradas = operacionesVenta.filter(
                (op) =>
                  (!filtroTipoAzucar || op.tipoAzucar === filtroTipoAzucar) &&
                  (!filtroTipoEntrega || op.tipoEntrega === filtroTipoEntrega),
              )

              return (
                <div
                  key={index}
                  className={`flex justify-center border-b border-[#1a2040]/30 last:border-0 ${
                    filaSeleccionada === index ? "bg-[#1a2040]" : ""
                  }`}
                >
                  {/* Fila de compra */}
                  <div
                    className={`w-1/2 flex py-3 ${
                      index < operacionesCompraFiltradas.length ? "cursor-pointer hover:bg-[#1a2040]/50" : ""
                    }`}
                    onClick={() =>
                      index < operacionesCompraFiltradas.length &&
                      manejarClicOperacion(operacionesCompraFiltradas[index], "compra", index)
                    }
                  >
                    {index < operacionesCompraFiltradas.length ? (
                      <motion.div
                        className="w-full flex"
                        initial={{ opacity: 0.5 }}
                        animate={{
                          opacity: 1,
                          backgroundColor: operacionesNuevas.has(operacionesCompraFiltradas[index].id)
                            ? ["rgba(22, 163, 74, 0.3)", "rgba(22, 163, 74, 0.1)", "rgba(0, 0, 0, 0)"]
                            : operacionesModificadas.has(operacionesCompraFiltradas[index].id)
                              ? ["rgba(22, 163, 74, 0.2)", "rgba(0, 0, 0, 0)"]
                              : "rgba(0, 0, 0, 0)",
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="w-1/4 text-center font-medium text-white">
                          {operacionesCompraFiltradas[index].cantidad}
                          {operacionesCompraFiltradas[index].id.startsWith("sim-") && (
                            <Badge
                              variant="outline"
                              className="h-4 w-4 p-0 ml-1 inline-flex items-center justify-center"
                            >
                              S
                            </Badge>
                          )}
                        </div>
                        <div className="w-1/4 text-center font-medium text-green-600">
                          ${operacionesCompraFiltradas[index].precio.toFixed(2)}
                        </div>
                        <div className="w-1/4 text-center text-white text-sm">
                          {operacionesCompraFiltradas[index].tipoAzucar}
                        </div>
                        <div className="w-1/4 text-center text-white text-sm">
                          {operacionesCompraFiltradas[index].tipoEntrega === "inmediata" ? (
                            <span className="text-green-500">Inmediata</span>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-amber-500 cursor-help">Programada</span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="bg-[#111936] text-white border-[#1a2040]">
                                  <p>Lugar: {operacionesCompraFiltradas[index].lugarEntrega || "No especificado"}</p>
                                  <p>Fecha: {operacionesCompraFiltradas[index].fechaEntrega || "No especificada"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-full flex">
                        <div className="w-1/4 text-center"></div>
                        <div className="w-1/4 text-center"></div>
                        <div className="w-1/4 text-center"></div>
                        <div className="w-1/4 text-center"></div>
                      </div>
                    )}
                  </div>

                  {/* Fila de venta */}
                  <div
                    className={`w-1/2 flex py-3 ${
                      index < operacionesVentaFiltradas.length ? "cursor-pointer hover:bg-[#1a2040]/50" : ""
                    }`}
                    onClick={() =>
                      index < operacionesVentaFiltradas.length &&
                      manejarClicOperacion(operacionesVentaFiltradas[index], "venta", index)
                    }
                  >
                    {index < operacionesVentaFiltradas.length ? (
                      <motion.div
                        className="w-full flex"
                        initial={{ opacity: 0.5 }}
                        animate={{
                          opacity: 1,
                          backgroundColor: operacionesNuevas.has(operacionesVentaFiltradas[index].id)
                            ? ["rgba(220, 38, 38, 0.3)", "rgba(220, 38, 38, 0.1)", "rgba(0, 0, 0, 0)"]
                            : operacionesModificadas.has(operacionesVentaFiltradas[index].id)
                              ? ["rgba(220, 38, 38, 0.2)", "rgba(0, 0, 0, 0)"]
                              : "rgba(0, 0, 0, 0)",
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="w-1/4 text-center font-medium text-red-600">
                          ${operacionesVentaFiltradas[index].precio.toFixed(2)}
                        </div>
                        <div className="w-1/4 text-center font-medium text-white">
                          {operacionesVentaFiltradas[index].cantidad}
                          {operacionesVentaFiltradas[index].id.startsWith("sim-") && (
                            <Badge
                              variant="outline"
                              className="h-4 w-4 p-0 ml-1 inline-flex items-center justify-center"
                            >
                              S
                            </Badge>
                          )}
                        </div>
                        <div className="w-1/4 text-center text-white text-sm">
                          {operacionesVentaFiltradas[index].tipoAzucar}
                        </div>
                        <div className="w-1/4 text-center text-white text-sm">
                          {operacionesVentaFiltradas[index].tipoEntrega === "inmediata" ? (
                            <span className="text-green-500">Inmediata</span>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-amber-500 cursor-help">Programada</span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="bg-[#111936] text-white border-[#1a2040]">
                                  <p>Lugar: {operacionesVentaFiltradas[index].lugarEntrega || "No especificado"}</p>
                                  <p>Fecha: {operacionesVentaFiltradas[index].fechaEntrega || "No especificada"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-full flex">
                        <div className="w-1/4 text-center"></div>
                        <div className="w-1/4 text-center"></div>
                        <div className="w-1/4 text-center"></div>
                        <div className="w-1/4 text-center"></div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Botón Operar */}
        {!modoSimulacion && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={abrirDialogoOperar}
              className={`px-12 py-3 font-medium text-lg rounded-md relative ${
                operacionSeleccionada
                  ? "bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }`}
              disabled={!operacionSeleccionada}
            >
              Operar Canje
              {operacionSeleccionada && (
                <span className="absolute top-1 right-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                </span>
              )}
            </Button>
          </div>
        )}

        {/* Añadir un componente para mostrar el resumen del portafolio */}
        {!modoSimulacion && (
          <div className="mt-4 p-4 bg-[#0a0f29] rounded-md border border-[#1a2040]">
            <h3 className="text-base font-medium mb-3 text-white">Resumen de Portafolio</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Certificados para Canje:</span>
                <span className="font-medium text-white">{portafolioUsuario.certificadosParaCanje}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Certificados Disponibles:</span>
                <span className="font-medium text-white">{portafolioUsuario.certificadosDisponibles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Dinero Disponible:</span>
                <span className="font-medium text-white">${portafolioUsuario.dineroDisponible.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Certificados en Garantía:</span>
                <span className="font-medium text-white">{portafolioUsuario.certificadosEnGarantia}</span>
              </div>
            </div>
            {errorValidacion && (
              <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded text-sm text-red-300">
                {errorValidacion}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-[#1a2040] text-xs text-center text-gray-400">
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>

      {/* Diálogo para simular transacciones */}
      <Dialog open={dialogoTransaccionAbierto} onOpenChange={setDialogoTransaccionAbierto}>
        <DialogContent className="sm:max-w-md bg-[#111936] text-white border-[#1a2040]">
          <DialogHeader>
            <DialogTitle>Simular {tipoTransaccion === "compra" ? "Compra" : "Venta"} para Canje</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precio-transaccion" className="text-sm text-gray-300">
                  Precio
                </Label>
                <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29]">
                  ${operacionSeleccionada?.precio.toFixed(2) || "--"}
                </div>
              </div>
              <div>
                <Label htmlFor="cantidad-disponible" className="text-sm text-gray-300">
                  Cantidad Disponible
                </Label>
                <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29]">
                  {operacionSeleccionada?.cantidad || "--"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo-azucar-transaccion" className="text-sm text-gray-300">
                  Tipo de Azúcar
                </Label>
                <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29]">
                  {operacionSeleccionada?.tipoAzucar || "--"}
                </div>
              </div>
              <div>
                <Label htmlFor="entrega-transaccion" className="text-sm text-gray-300">
                  Tipo de Entrega
                </Label>
                <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29]">
                  {operacionSeleccionada?.tipoEntrega === "inmediata" ? "Inmediata" : "Programada"}
                </div>
              </div>
            </div>

            {operacionSeleccionada?.tipoEntrega === "programada" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lugar-entrega-transaccion" className="text-sm text-gray-300">
                    Lugar de Entrega
                  </Label>
                  <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29]">
                    {operacionSeleccionada?.lugarEntrega || "No especificado"}
                  </div>
                </div>
                <div>
                  <Label htmlFor="fecha-entrega-transaccion" className="text-sm text-gray-300">
                    Fecha de Entrega
                  </Label>
                  <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29]">
                    {operacionSeleccionada?.fechaEntrega || "No especificada"}
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="cantidad-transaccion" className="text-sm text-gray-300">
                Cantidad a {tipoTransaccion === "compra" ? "Comprar" : "Vender"}
              </Label>
              <Input
                id="cantidad-transaccion"
                type="number"
                value={cantidadTransaccion}
                onChange={(e) => setCantidadTransaccion(e.target.value)}
                min="1"
                max={operacionSeleccionada?.cantidad}
                className="mt-1 bg-[#0a0f29] border-[#1a2040] text-white"
              />
              {Number.parseInt(cantidadTransaccion) > (operacionSeleccionada?.cantidad || 0) && (
                <p className="text-xs text-red-400 mt-1">La cantidad no puede exceder la disponible</p>
              )}
            </div>

            <div className="p-3 bg-[#0a0f29] rounded-md border border-[#1a2040]">
              <p className="text-sm text-gray-300">
                Esta es una simulación. En un entorno real, esta operación representaría una
                {tipoTransaccion === "compra" ? " compra" : " venta"} de certificados de depósito para canje de azúcar
                por un valor total de $
                {((operacionSeleccionada?.precio || 0) * Number.parseInt(cantidadTransaccion || "0")).toFixed(2)}.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogoTransaccionAbierto(false)}
              className="border-[#1a2040] text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={ejecutarTransaccion}
              disabled={
                !operacionSeleccionada ||
                Number.parseInt(cantidadTransaccion) <= 0 ||
                Number.parseInt(cantidadTransaccion) > operacionSeleccionada.cantidad
              }
              className={
                tipoTransaccion === "compra"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              Simular {tipoTransaccion === "compra" ? "Compra" : "Venta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para operar */}
      <Dialog
        open={dialogoOperarAbierto}
        onOpenChange={(open) => {
          // Solo permitir cerrar el diálogo si no está procesando
          if (!procesandoOperacion) {
            setDialogoOperarAbierto(open)
            if (!open) {
              setErrorValidacion(null)
              setAdvertencias([])
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-[#111936] text-white border-[#1a2040]">
          <DialogHeader>
            <DialogTitle>Confirmar Operación de Canje</DialogTitle>
            <DialogDescription className="text-gray-400">Revise los detalles antes de confirmar</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {operacionExitosa === null ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-300">Tipo de Operación</Label>
                    <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29] font-medium">
                      {tipoTransaccion === "venta" ? "Venta" : "Compra"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-300">Tipo de Azúcar</Label>
                    <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29] font-medium">
                      {operacionSeleccionada?.tipoAzucar || "--"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-300">Tipo de Entrega</Label>
                    <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29] font-medium">
                      {operacionSeleccionada?.tipoEntrega === "inmediata" ? "Inmediata" : "Programada"}
                    </div>
                  </div>
                  {operacionSeleccionada?.tipoEntrega === "programada" && (
                    <div>
                      <Label className="text-sm text-gray-300">Lugar/Fecha</Label>
                      <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29] font-medium">
                        {operacionSeleccionada?.lugarEntrega || "--"} / {operacionSeleccionada?.fechaEntrega || "--"}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-300">Precio</Label>
                    <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29] font-medium">
                      ${operacionSeleccionada?.precio.toFixed(2) || "--"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-300">
                      Cantidad a {tipoTransaccion === "compra" ? "Comprar" : "Vender"}
                    </Label>
                    <Input
                      type="number"
                      value={cantidadTransaccion}
                      onChange={(e) => actualizarCantidadTransaccion(e.target.value)}
                      min="1"
                      max={operacionSeleccionada?.cantidad}
                      className="mt-1 bg-[#0a0f29] border-[#1a2040] text-white"
                      disabled={procesandoOperacion}
                    />
                    <div className="mt-2">
                      <Label className="text-xs text-gray-400">Ajustar cantidad:</Label>
                      <Slider
                        value={[Number.parseInt(cantidadTransaccion) || 1]}
                        min={1}
                        max={operacionSeleccionada?.cantidad || 1}
                        step={1}
                        onValueChange={(value) => actualizarCantidadTransaccion(value[0].toString())}
                        disabled={procesandoOperacion}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1</span>
                      <span>Máx: {operacionSeleccionada?.cantidad}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-300">Valor Total</Label>
                  <div className="p-2 border border-[#1a2040] rounded-md mt-1 bg-[#0a0f29] font-medium">
                    $
                    {operacionSeleccionada
                      ? (operacionSeleccionada.precio * Number.parseInt(cantidadTransaccion || "1")).toFixed(2)
                      : "--"}
                  </div>
                </div>

                {/* Estado de custodia */}
                <div className="p-3 bg-[#0a0f29] rounded-md border border-[#1a2040]">
                  <h4 className="text-sm font-medium mb-2 flex items-center text-[#00a8ff]">
                    <Shuffle className="h-4 w-4 mr-1" />
                    Información de Custodia
                  </h4>
                  <p className="text-sm text-gray-300">
                    En las operaciones de canje, los fondos quedarán retenidos en custodia hasta completar el proceso:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-300 list-disc pl-5">
                    <li>
                      <span className="text-amber-500 font-medium">Reservado:</span> Certificado reservado para canje
                    </li>
                    <li>
                      <span className="text-amber-500 font-medium">Disponible para Carga:</span> Listo para cargar en
                      depósito
                    </li>
                    <li>
                      <span className="text-green-500 font-medium">Operación Cargada:</span> Proceso completado
                    </li>
                  </ul>
                </div>

                {/* Información del portafolio */}
                <div className="border border-[#1a2040] rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center text-white">
                    <Shield className="h-4 w-4 mr-1 text-[#00a8ff]" />
                    Estado de su Portafolio
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Certificados para Canje:</span>
                      <span className="float-right font-medium text-white">
                        {portafolioUsuario.certificadosParaCanje}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Dinero Disponible:</span>
                      <span className="float-right font-medium text-white">
                        ${portafolioUsuario.dineroDisponible.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Impacto en el portafolio */}
                  <div className="mt-2 pt-2 border-t border-[#1a2040]">
                    <h4 className="text-sm font-medium mb-1 flex items-center text-white">
                      <DollarSign className="h-4 w-4 mr-1 text-[#00a8ff]" />
                      Después de esta operación:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Certificados para Canje:</span>
                        <span
                          className={`float-right font-medium ${
                            tipoTransaccion === "compra" ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {tipoTransaccion === "compra"
                            ? portafolioUsuario.certificadosParaCanje + Number.parseInt(cantidadTransaccion || "1")
                            : portafolioUsuario.certificadosParaCanje - Number.parseInt(cantidadTransaccion || "1")}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Dinero Disponible:</span>
                        <span
                          className={`float-right font-medium ${
                            tipoTransaccion === "compra" ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          $
                          {tipoTransaccion === "compra"
                            ? (
                                portafolioUsuario.dineroDisponible -
                                (operacionSeleccionada?.precio || 0) * Number.parseInt(cantidadTransaccion || "1")
                              ).toFixed(2)
                            : (
                                portafolioUsuario.dineroDisponible +
                                (operacionSeleccionada?.precio || 0) * Number.parseInt(cantidadTransaccion || "1")
                              ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advertencias */}
                {advertencias.length > 0 && (
                  <div className="p-3 bg-amber-900/30 border border-amber-800/50 rounded-md">
                    <h4 className="text-sm font-medium mb-1 flex items-center text-amber-400">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Advertencias
                    </h4>
                    <ul className="text-xs text-amber-300 space-y-1 ml-5 list-disc">
                      {advertencias.map((advertencia, index) => (
                        <li key={index}>{advertencia}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Error de validación */}
                {errorValidacion && (
                  <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-md">
                    <h4 className="text-sm font-medium mb-1 flex items-center text-red-400">
                      <X className="h-4 w-4 mr-1" />
                      Error de Validación
                    </h4>
                    <p className="text-xs text-red-300">{errorValidacion}</p>
                  </div>
                )}

                <div className="p-3 bg-[#0a0f29] rounded-md border border-[#1a2040]">
                  <p className="text-sm text-gray-300">
                    Al confirmar, usted acepta {tipoTransaccion === "venta" ? "vender" : "comprar"}{" "}
                    {cantidadTransaccion} certificado(s) para canje de {operacionSeleccionada?.tipoAzucar || "--"} a $
                    {operacionSeleccionada?.precio.toFixed(2) || "--"} con entrega{" "}
                    {operacionSeleccionada?.tipoEntrega === "inmediata" ? "inmediata" : "programada"}.
                  </p>
                </div>
                {/* Sección de opciones avanzadas */}
                {modoAvanzado && (
                  <>
                    <div className="border-t border-[#1a2040] pt-3 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium flex items-center text-white">
                          <Settings className="h-4 w-4 mr-1 text-[#00a8ff]" />
                          Opciones Avanzadas
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-gray-300 hover:text-white"
                          onClick={() => setModoAvanzado(false)}
                        >
                          Ocultar
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {/* Selección de estrategia */}
                        <div>
                          <Label className="text-sm text-gray-300">Estrategia de Canje</Label>
                          <Select
                            value={estrategiaSeleccionada || ""}
                            onValueChange={setEstrategiaSeleccionada}
                            disabled={procesandoOperacion}
                          >
                            <SelectTrigger className="mt-1 bg-[#0a0f29] border-[#1a2040] text-white">
                              <SelectValue placeholder="Seleccionar estrategia" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                              <SelectItem value="ninguna">Ninguna</SelectItem>
                              {estrategias.map((estrategia) => (
                                <SelectItem key={estrategia.id} value={estrategia.id}>
                                  {estrategia.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {estrategiaSeleccionada && estrategiaSeleccionada !== "ninguna" && (
                            <p className="text-xs text-gray-400 mt-1">
                              {estrategias.find((e) => e.id === estrategiaSeleccionada)?.descripcion}
                            </p>
                          )}
                        </div>

                        {/* Notas de operación */}
                        <div>
                          <Label className="text-sm text-gray-300">Notas de Operación</Label>
                          <textarea
                            className="w-full mt-1 p-2 text-sm rounded-md border border-[#1a2040] min-h-[60px] bg-[#0a0f29] text-white"
                            placeholder="Añada notas o comentarios sobre esta operación de canje..."
                            value={notasOperacion}
                            onChange={(e) => setNotasOperacion(e.target.value)}
                            disabled={procesandoOperacion}
                          />
                        </div>

                        {/* Programar operación */}
                        <div className="border-t border-[#1a2040] pt-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="programar-operacion"
                              checked={operacionProgramada}
                              onCheckedChange={(checked) => setOperacionProgramada(checked === true)}
                              disabled={procesandoOperacion}
                            />
                            <label
                              htmlFor="programar-operacion"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                            >
                              Programar operación
                            </label>
                          </div>

                          {operacionProgramada && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs text-gray-300">Precio de activación</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Ej: 19.85"
                                  value={precioActivacion}
                                  onChange={(e) => setPrecioActivacion(e.target.value)}
                                  disabled={procesandoOperacion}
                                  className="mt-1 h-8 text-sm bg-[#0a0f29] border-[#1a2040] text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-300">Expira</Label>
                                <Input
                                  type="date"
                                  className="mt-1 h-8 text-sm bg-[#0a0f29] border-[#1a2040] text-white"
                                  disabled={procesandoOperacion}
                                  min={new Date().toISOString().split("T")[0]}
                                  onChange={(e) => setFechaExpiracion(e.target.valueAsDate)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!modoAvanzado && (
                  <div className="flex justify-center mt-3 pt-3 border-t border-[#1a2040]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#1a2040] text-gray-300 hover:text-white"
                      onClick={() => setModoAvanzado(true)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Opciones Avanzadas
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                {operacionExitosa ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-500 flex items-center justify-center mb-4">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-center text-white">Operación de Canje Iniciada</h3>
                    <p className="text-sm text-gray-400 text-center mt-2">
                      Su operación ha sido procesada correctamente. El certificado ha sido reservado.
                    </p>
                    <div className="mt-4 p-3 bg-[#0a0f29] border border-[#1a2040] rounded-md w-full">
                      <h4 className="text-sm font-medium text-[#00a8ff] mb-1">
                        Estado de la Operación: <span className="text-amber-500">Reservado</span>
                      </h4>
                      <p className="text-xs text-gray-400 mb-2">
                        Los fondos quedarán en custodia hasta completar el proceso de canje.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Certificados:</span>
                          <span className="float-right font-medium text-white">
                            {tipoTransaccion === "compra"
                              ? portafolioUsuario.certificadosParaCanje + Number.parseInt(cantidadTransaccion || "1")
                              : portafolioUsuario.certificadosParaCanje - Number.parseInt(cantidadTransaccion || "1")}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Dinero:</span>
                          <span className="float-right font-medium text-white">
                            ${portafolioUsuario.dineroDisponible.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-500 flex items-center justify-center mb-4">
                      <X className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-center text-white">Error en la Operación</h3>
                    <p className="text-sm text-gray-400 text-center mt-2">
                      No se pudo procesar su operación de canje. Intente nuevamente.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {operacionExitosa === null ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setDialogoOperarAbierto(false)}
                  disabled={procesandoOperacion}
                  className="border-[#1a2040] text-gray-300 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={ejecutarOperacion}
                  disabled={
                    procesandoOperacion ||
                    !!errorValidacion ||
                    !operacionSeleccionada ||
                    Number.parseInt(cantidadTransaccion) <= 0 ||
                    Number.parseInt(cantidadTransaccion) > operacionSeleccionada.cantidad
                  }
                  className={
                    tipoTransaccion === "venta"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white"
                  }
                >
                  {procesandoOperacion ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : (
                    "Confirmar Canje"
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setDialogoOperarAbierto(false)}
                className="bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white"
              >
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de alerta para confirmación de operaciones grandes */}
      <AlertDialog open={mostrarAlertaConfirmacion} onOpenChange={setMostrarAlertaConfirmacion}>
        <AlertDialogContent className="bg-[#111936] text-white border-[#1a2040]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Operación de Canje de Alto Valor</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta operación de canje involucra un monto significativo:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  Valor total:{" "}
                  <span className="font-semibold text-white">
                    $
                    {operacionSeleccionada
                      ? (operacionSeleccionada.precio * Number.parseInt(cantidadTransaccion || "1")).toFixed(2)
                      : "0.00"}
                  </span>
                </li>
                <li>
                  Certificados: <span className="font-semibold text-white">{cantidadTransaccion || "0"}</span>
                </li>
                <li>
                  Tipo:{" "}
                  <span className="font-semibold text-white">{tipoTransaccion === "compra" ? "Compra" : "Venta"}</span>
                </li>
                <li>
                  Azúcar: <span className="font-semibold text-white">{operacionSeleccionada?.tipoAzucar || "--"}</span>
                </li>
              </ul>
              <p className="mt-4">
                Los fondos serán retenidos en custodia hasta completar el proceso de canje. ¿Está seguro de que desea
                continuar?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#0a0f29] text-white border-[#1a2040] hover:bg-[#1a2040]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmacionOperacionGrande(true)
                ejecutarOperacion()
              }}
              className={
                tipoTransaccion === "venta"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-[#00a8ff] hover:bg-[#00a8ff]/90 text-white"
              }
            >
              Confirmar Operación de Canje
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
