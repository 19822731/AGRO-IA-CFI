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
  Clock,
  Zap,
  Shield,
  DollarSign,
  AlertTriangle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
// Agregar estos imports adicionales
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

// Tipos para las operaciones
interface Operacion {
  id: string
  precio: number
  cantidad: number
  timestamp: number
  usuario: string
}

// Tipos para el portafolio del usuario
interface PortafolioUsuario {
  certificadosDisponibles: number
  certificadosEnGarantia: number
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

// Tipo para el historial de operaciones
interface HistorialOperacion {
  id: string
  tipo: "compra" | "venta"
  precio: number
  cantidad: number
  timestamp: number
  plazo: "inmediata" | "30dias"
  contraparteId: string
  contraparteNombre: string
  valorTotal: number
}

// Agregar estas interfaces nuevas en la sección de tipos:

// Tipo para la estrategia de operación
interface EstrategiaOperacion {
  id: string
  nombre: string
  descripcion: string
  precioObjetivo?: number
  stopLoss?: number
}

// Tipo para el historial de operaciones extendido
interface HistorialOperacionExtendido extends HistorialOperacion {
  estado: "completada" | "pendiente" | "cancelada"
  comision: number
  impuestos: number
  valorNeto: number
  estrategia?: string
  notas?: string
}

// Datos de ejemplo para las operaciones
const operacionesCompraIniciales: Operacion[] = [
  { id: "c1", precio: 19.7, cantidad: 34, timestamp: Date.now() - 120000, usuario: "trader1" },
  { id: "c2", precio: 19.65, cantidad: 70, timestamp: Date.now() - 180000, usuario: "trader2" },
  { id: "c3", precio: 19.6, cantidad: 62, timestamp: Date.now() - 240000, usuario: "trader3" },
  { id: "c4", precio: 19.55, cantidad: 51, timestamp: Date.now() - 300000, usuario: "trader4" },
  { id: "c5", precio: 19.5, cantidad: 28, timestamp: Date.now() - 360000, usuario: "trader5" },
]

const operacionesVentaIniciales: Operacion[] = [
  { id: "v1", precio: 20.0, cantidad: 90, timestamp: Date.now() - 150000, usuario: "trader6" },
  { id: "v2", precio: 19.95, cantidad: 58, timestamp: Date.now() - 210000, usuario: "trader7" },
  { id: "v3", precio: 19.9, cantidad: 102, timestamp: Date.now() - 270000, usuario: "trader8" },
  { id: "v4", precio: 19.85, cantidad: 70, timestamp: Date.now() - 330000, usuario: "trader9" },
  { id: "v5", precio: 19.8, cantidad: 69, timestamp: Date.now() - 390000, usuario: "trader10" },
]

// Datos de ejemplo para contrapartes
const contrapartesIniciales: Record<string, ContraparteOperacion> = {
  trader1: { id: "trader1", nombre: "Productor A", certificadosDisponibles: 150, dineroDisponible: 8000 },
  trader2: { id: "trader2", nombre: "Productor B", certificadosDisponibles: 200, dineroDisponible: 12000 },
  trader3: { id: "trader3", nombre: "Productor C", certificadosDisponibles: 80, dineroDisponible: 5000 },
  trader4: { id: "trader4", nombre: "Productor D", certificadosDisponibles: 120, dineroDisponible: 7500 },
  trader5: { id: "trader5", nombre: "Productor E", certificadosDisponibles: 90, dineroDisponible: 6000 },
  trader6: { id: "trader6", nombre: "Comprador F", certificadosDisponibles: 50, dineroDisponible: 15000 },
  trader7: { id: "trader7", nombre: "Comprador G", certificadosDisponibles: 30, dineroDisponible: 10000 },
  trader8: { id: "trader8", nombre: "Comprador H", certificadosDisponibles: 20, dineroDisponible: 18000 },
  trader9: { id: "trader9", nombre: "Comprador I", certificadosDisponibles: 40, dineroDisponible: 9000 },
  trader10: { id: "trader10", nombre: "Comprador J", certificadosDisponibles: 60, dineroDisponible: 14000 },
}

export default function CajaDePunta() {
  // Estados para las operaciones
  const [operacionesCompra, setOperacionesCompra] = useState<Operacion[]>(operacionesCompraIniciales)
  const [operacionesVenta, setOperacionesVenta] = useState<Operacion[]>(operacionesVentaIniciales)

  // Estado para el modo simulación
  const [modoSimulacion, setModoSimulacion] = useState(false)

  // Estados para la simulación de operaciones
  const [precioSimulado, setPrecioSimulado] = useState("")
  const [cantidadSimulada, setCantidadSimulada] = useState("")
  const [tipoOperacion, setTipoOperacion] = useState<"compra" | "venta">("compra")

  // Estado para rastrear operaciones con cambios recientes
  const [operacionesModificadas, setOperacionesModificadas] = useState<Set<string>>(new Set())
  const [operacionesNuevas, setOperacionesNuevas] = useState<Set<string>>(new Set())

  // Estado para la dirección del mercado
  const [direccionMercado, setDireccionMercado] = useState<"up" | "down" | "neutral">("neutral")
  const precioPromedioRef = useRef<number | null>(null)

  // Estado para la operación seleccionada para simular transacción
  const [operacionSeleccionada, setOperacionSeleccionada] = useState<Operacion | null>(null)
  const [filaSeleccionada, setFilaSeleccionada] = useState<number | null>(null)
  const [dialogoTransaccionAbierto, setDialogoTransaccionAbierto] = useState(false)
  const [cantidadTransaccion, setCantidadTransaccion] = useState("1")
  const [tipoTransaccion, setTipoTransaccion] = useState<"compra" | "venta">("compra")

  // Estado para el tipo de plazo
  const [tipoPlazo, setTipoPlazo] = useState<"inmediata" | "30dias">("inmediata")

  // Estado para el diálogo de operación
  const [dialogoOperarAbierto, setDialogoOperarAbierto] = useState(false)
  const [operacionExitosa, setOperacionExitosa] = useState<boolean | null>(null)
  const [procesandoOperacion, setProcesandoOperacion] = useState(false)

  // Estado para el portafolio del usuario (simulado)
  const [portafolioUsuario, setPortafolioUsuario] = useState<PortafolioUsuario>({
    certificadosDisponibles: 100,
    certificadosEnGarantia: 20,
    dineroDisponible: 5000,
    id: "user-123",
    nombre: "Usuario Demo",
  })

  // Estado para contrapartes
  const [contrapartes, setContrapartes] = useState<Record<string, ContraparteOperacion>>(contrapartesIniciales)

  // Estado para historial de operaciones
  const [historialOperaciones, setHistorialOperaciones] = useState<HistorialOperacion[]>([])

  // Añadir estados para errores de validación
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null)
  const [advertencias, setAdvertencias] = useState<string[]>([])

  // Agregar estos estados adicionales después de los estados existentes:

  // Estado para confirmación de operaciones grandes
  const [confirmacionOperacionGrande, setConfirmacionOperacionGrande] = useState(false)
  const [mostrarAlertaConfirmacion, setMostrarAlertaConfirmacion] = useState(false)

  // Estado para preferencias de operación
  const [confirmarTodasLasOperaciones, setConfirmarTodasLasOperaciones] = useState(true)
  const [modoAvanzado, setModoAvanzado] = useState(false)
  const [estrategiaSeleccionada, setEstrategiaSeleccionada] = useState<string | null>(null)
  const [mostrarIndicadores, setMostrarIndicadores] = useState(true)

  // Estado para operación programada
  const [operacionProgramada, setOperacionProgramada] = useState(false)
  const [precioActivacion, setPrecioActivacion] = useState("")
  const [fechaExpiracion, setFechaExpiracion] = useState<Date | null>(null)

  // Estado para notas de operación
  const [notasOperacion, setNotasOperacion] = useState("")

  // Estrategias predefinidas
  const [estrategias, setEstrategias] = useState<EstrategiaOperacion[]>([
    {
      id: "estrategia1",
      nombre: "Conservadora",
      descripcion: "Operaciones con mínimo riesgo, volúmenes pequeños",
      stopLoss: 5,
    },
    {
      id: "estrategia2",
      nombre: "Moderada",
      descripcion: "Balance entre riesgo y rendimiento",
      stopLoss: 10,
    },
    {
      id: "estrategia3",
      nombre: "Agresiva",
      descripcion: "Mayores rendimientos potenciales con mayor riesgo",
      stopLoss: 15,
    },
  ])

  // Estado para el historial extendido
  const [historialExtendido, setHistorialExtendido] = useState<HistorialOperacionExtendido[]>([])

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
  const calcularPrecioPromedio = (compras: Operacion[], ventas: Operacion[]) => {
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

    const nuevaOperacion: Operacion = {
      id: `sim-${Date.now()}`,
      precio,
      cantidad,
      timestamp: Date.now(),
      usuario: "usuario-simulación",
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
  const manejarClicOperacion = (operacion: Operacion, tipo: "compra" | "venta", index: number) => {
    if (!modoSimulacion) {
      // En modo normal, seleccionar la fila para operar
      setFilaSeleccionada(index)
      setOperacionSeleccionada(operacion)
      setTipoTransaccion(tipo === "compra" ? "venta" : "compra") // Invertir el tipo para la transacción
      setCantidadTransaccion("1") // Reiniciar a 1 por defecto

      // Mostrar un toast para indicar que se ha seleccionado una operación
      toast({
        title: "Operación seleccionada",
        description: `${tipo === "compra" ? "Compra" : "Venta"} a $${operacion.precio.toFixed(2)} seleccionada. Presione 'Operar' para continuar.`,
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
      title: "Transacción completada",
      description: `Se ha ${tipoTransaccion === "compra" ? "comprado" : "vendido"} ${cantidad} certificados a $${operacionSeleccionada.precio.toFixed(2)}`,
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

      // Verificar si el usuario tiene suficientes certificados disponibles
      if (cantidad > portafolioUsuario.certificadosDisponibles) {
        return {
          valido: false,
          mensaje: `Certificados insuficientes. Necesita ${cantidad} certificados pero solo tiene ${portafolioUsuario.certificadosDisponibles} disponibles.`,
          advertencias: [],
        }
      }

      // Verificar si la venta supera el 50% de los certificados disponibles (advertencia)
      if (cantidad > portafolioUsuario.certificadosDisponibles * 0.5) {
        nuevasAdvertencias.push(
          `Esta operación utilizará más del 50% de sus certificados disponibles (${((cantidad / portafolioUsuario.certificadosDisponibles) * 100).toFixed(1)}%).`,
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

  // Añadir esta función después de la función validarSaldos:

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

  // Modificar la función ejecutarOperacion para incluir la lógica de confirmación adicional y el historial extendido:

  // Modificar el llamado a ejecutarOperacion en la función actual añadiendo esta validación antes de setProcesandoOperacion(true):
  // Reemplazar el inicio de la función ejecutarOperacion con:

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
            certificadosDisponibles: prev.certificadosDisponibles + cantidad,
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
            certificadosDisponibles: prev.certificadosDisponibles - cantidad,
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
        const nuevaOperacionHistorial: HistorialOperacion = {
          id: `op-${Date.now()}`,
          tipo: tipoTransaccion,
          precio: operacionSeleccionada.precio,
          cantidad: cantidad,
          timestamp: Date.now(),
          plazo: tipoPlazo,
          contraparteId: operacionSeleccionada.usuario,
          contraparteNombre: contrapartes[operacionSeleccionada.usuario]?.nombre || "Desconocido",
          valorTotal: valorTotal,
        }

        // En la parte donde se registra la operación en el historial (dentro del if(exito)),
        // añadir después de crear nuevaOperacionHistorial:

        // Crear una versión extendida para el historial detallado
        const comision = valorTotal * 0.005 // 0.5% de comisión
        const impuestos = valorTotal * 0.16 // 16% de impuestos (ejemplo)
        const valorNeto = tipoTransaccion === "venta" ? valorTotal - comision - impuestos : -valorTotal - comision

        const nuevaOperacionExtendida: HistorialOperacionExtendido = {
          ...nuevaOperacionHistorial,
          estado: "completada",
          comision: comision,
          impuestos: impuestos,
          valorNeto: valorNeto,
          estrategia: estrategiaSeleccionada || undefined,
          notas: notasOperacion || undefined,
        }

        setHistorialExtendido((prev) => [nuevaOperacionExtendida, ...prev])

        // Limpiar notas de operación
        setNotasOperacion("")
      } else {
        // Mostrar notificación de error
        toast({
          title: "Error en la operación",
          description: "No se pudo completar la operación. Intente nuevamente.",
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
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              Caja de Punta
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
                className="ml-2"
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
            <CardDescription className="flex items-center mt-1 font-medium">
              Certificados de Depósito
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Los Certificados de Depósito son instrumentos financieros que representan azúcar almacenada en
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
              className={modoSimulacion ? "text-primary font-medium" : "text-muted-foreground"}
            >
              Modo Simulación
            </Label>
            <Switch id="modo-simulacion" checked={modoSimulacion} onCheckedChange={setModoSimulacion} />
            {modoSimulacion && (
              <Badge variant="outline" className="bg-secondary text-secondary-foreground border-secondary">
                Simulación Activa
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {modoSimulacion && (
          <div className="mb-4 p-3 bg-secondary/20 rounded-md border border-secondary">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-primary" />
              Simulador de Operaciones
            </h3>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-3">
                <Label htmlFor="tipo-operacion" className="text-xs mb-1 block">
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
              <div className="col-span-3">
                <Label htmlFor="precio-simulado" className="text-xs mb-1 block">
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
                  className="h-9"
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor="cantidad-simulada" className="text-xs mb-1 block">
                  Cantidad
                </Label>
                <Input
                  id="cantidad-simulada"
                  type="number"
                  min="1"
                  placeholder="Ej: 100"
                  value={cantidadSimulada}
                  onChange={(e) => setCantidadSimulada(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="col-span-3 flex items-end">
                <Button
                  onClick={simularOperacion}
                  className="w-full h-9"
                  disabled={!precioSimulado || !cantidadSimulada}
                >
                  Simular
                </Button>
              </div>
            </div>

            <div className="mt-2 text-xs text-primary">
              {modoSimulacion && <p>Haga clic en cualquier operación para simular una transacción</p>}
            </div>
          </div>
        )}

        {/* Selector de tipo de operación */}
        {!modoSimulacion && (
          <div className="mb-4">
            <Tabs
              defaultValue="inmediata"
              className="w-full"
              onValueChange={(value) => setTipoPlazo(value as "inmediata" | "30dias")}
            >
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="inmediata" className="flex items-center justify-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Operación Inmediata
                </TabsTrigger>
                <TabsTrigger value="30dias" className="flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-2" />
                  30 Días
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Tabla de Caja de Punta con nuevo diseño */}
        <div className="overflow-hidden rounded-md border border-border">
          {/* Encabezados de las columnas */}
          <div className="flex justify-center py-3 bg-secondary/20 border-b border-border">
            <div className="w-1/2 text-center">
              <h3 className="text-base font-bold text-green-600 uppercase">Compra</h3>
            </div>
            <div className="w-1/2 text-center">
              <h3 className="text-base font-bold text-red-600 uppercase">Venta</h3>
            </div>
          </div>

          {/* Encabezados de columnas de datos */}
          <div className="flex justify-center text-sm font-medium py-2 border-b border-border bg-secondary/10">
            <div className="w-1/2 flex">
              <div className="w-1/2 text-center">Cantidad</div>
              <div className="w-1/2 text-center">Precio</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-1/2 text-center">Precio</div>
              <div className="w-1/2 text-center">Cantidad</div>
            </div>
          </div>

          {/* Filas de datos */}
          <div className="max-h-[400px] overflow-auto">
            {Array.from({ length: Math.max(operacionesCompra.length, operacionesVenta.length) }).map((_, index) => (
              <div
                key={index}
                className={`flex justify-center border-b border-border/30 last:border-0 ${
                  filaSeleccionada === index ? "bg-secondary/30" : ""
                }`}
              >
                {/* Fila de compra */}
                <div
                  className={`w-1/2 flex py-3 ${
                    index < operacionesCompra.length ? "cursor-pointer hover:bg-green-50/10" : ""
                  }`}
                  onClick={() =>
                    index < operacionesCompra.length && manejarClicOperacion(operacionesCompra[index], "compra", index)
                  }
                >
                  {index < operacionesCompra.length ? (
                    <motion.div
                      className="w-full flex"
                      initial={{ opacity: 0.5 }}
                      animate={{
                        opacity: 1,
                        backgroundColor: operacionesNuevas.has(operacionesCompra[index].id)
                          ? ["rgba(22, 163, 74, 0.3)", "rgba(22, 163, 74, 0.1)", "rgba(0, 0, 0, 0)"]
                          : operacionesModificadas.has(operacionesCompra[index].id)
                            ? ["rgba(22, 163, 74, 0.2)", "rgba(0, 0, 0, 0)"]
                            : "rgba(0, 0, 0, 0)",
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-1/2 text-center font-medium">
                        {operacionesCompra[index].cantidad}
                        {operacionesCompra[index].id.startsWith("sim-") && (
                          <Badge variant="outline" className="h-4 w-4 p-0 ml-1 inline-flex items-center justify-center">
                            S
                          </Badge>
                        )}
                      </div>
                      <div className="w-1/2 text-center font-medium text-green-600">
                        ${operacionesCompra[index].precio.toFixed(2)}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-full flex">
                      <div className="w-1/2 text-center"></div>
                      <div className="w-1/2 text-center"></div>
                    </div>
                  )}
                </div>

                {/* Fila de venta */}
                <div
                  className={`w-1/2 flex py-3 ${
                    index < operacionesVenta.length ? "cursor-pointer hover:bg-red-50/10" : ""
                  }`}
                  onClick={() =>
                    index < operacionesVenta.length && manejarClicOperacion(operacionesVenta[index], "venta", index)
                  }
                >
                  {index < operacionesVenta.length ? (
                    <motion.div
                      className="w-full flex"
                      initial={{ opacity: 0.5 }}
                      animate={{
                        opacity: 1,
                        backgroundColor: operacionesNuevas.has(operacionesVenta[index].id)
                          ? ["rgba(220, 38, 38, 0.3)", "rgba(220, 38, 38, 0.1)", "rgba(0, 0, 0, 0)"]
                          : operacionesModificadas.has(operacionesVenta[index].id)
                            ? ["rgba(220, 38, 38, 0.2)", "rgba(0, 0, 0, 0)"]
                            : "rgba(0, 0, 0, 0)",
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-1/2 text-center font-medium text-red-600">
                        ${operacionesVenta[index].precio.toFixed(2)}
                      </div>
                      <div className="w-1/2 text-center font-medium">
                        {operacionesVenta[index].cantidad}
                        {operacionesVenta[index].id.startsWith("sim-") && (
                          <Badge variant="outline" className="h-4 w-4 p-0 ml-1 inline-flex items-center justify-center">
                            S
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-full flex">
                      <div className="w-1/2 text-center"></div>
                      <div className="w-1/2 text-center"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Operar */}
        {!modoSimulacion && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={abrirDialogoOperar}
              className={`px-12 py-3 font-medium text-lg rounded-md relative ${
                operacionSeleccionada
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }`}
              disabled={!operacionSeleccionada}
            >
              Operar
              {operacionSeleccionada && (
                <span className="absolute top-1 right-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </span>
              )}
            </Button>
          </div>
        )}

        {/* Añadir un componente para mostrar el resumen del portafolio */}
        {!modoSimulacion && (
          <div className="mt-4 p-4 bg-black/80 rounded-md border border-gray-700">
            <h3 className="text-base font-medium mb-3 text-white">Resumen de Portafolio</h3>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Operaciones Realizadas:</span>
                <span className="font-medium text-white">{historialOperaciones.length}</span>
              </div>
            </div>
            {errorValidacion && (
              <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded text-sm text-red-300">
                {errorValidacion}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t text-xs text-center text-muted-foreground">
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>

      {/* Diálogo para simular transacciones */}
      <Dialog open={dialogoTransaccionAbierto} onOpenChange={setDialogoTransaccionAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Simular {tipoTransaccion === "compra" ? "Compra" : "Venta"} de Certificados</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precio-transaccion" className="text-sm">
                  Precio
                </Label>
                <div className="p-2 border rounded-md mt-1 bg-secondary/20">
                  ${operacionSeleccionada?.precio.toFixed(2) || "--"}
                </div>
              </div>
              <div>
                <Label htmlFor="cantidad-disponible" className="text-sm">
                  Cantidad Disponible
                </Label>
                <div className="p-2 border rounded-md mt-1 bg-secondary/20">
                  {operacionSeleccionada?.cantidad || "--"}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="cantidad-transaccion" className="text-sm">
                Cantidad a {tipoTransaccion === "compra" ? "Comprar" : "Vender"}
              </Label>
              <Input
                id="cantidad-transaccion"
                type="number"
                value={cantidadTransaccion}
                onChange={(e) => setCantidadTransaccion(e.target.value)}
                min="1"
                max={operacionSeleccionada?.cantidad}
                className="mt-1"
              />
              {Number.parseInt(cantidadTransaccion) > (operacionSeleccionada?.cantidad || 0) && (
                <p className="text-xs text-destructive mt-1">La cantidad no puede exceder la disponible</p>
              )}
            </div>

            <div className="p-3 bg-secondary/20 rounded-md border border-secondary">
              <p className="text-sm">
                Esta es una simulación. En un entorno real, esta operación representaría una
                {tipoTransaccion === "compra" ? " compra" : " venta"} de certificados de depósito de azúcar por un valor
                total de $
                {((operacionSeleccionada?.precio || 0) * Number.parseInt(cantidadTransaccion || "0")).toFixed(2)}.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoTransaccionAbierto(false)}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Operación</DialogTitle>
            <DialogDescription>Revise los detalles de la operación antes de confirmar</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {operacionExitosa === null ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Tipo de Operación</Label>
                    <div className="p-2 border rounded-md mt-1 bg-secondary/20 font-medium">
                      {tipoTransaccion === "venta" ? "Venta" : "Compra"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Plazo</Label>
                    <div className="p-2 border rounded-md mt-1 bg-secondary/20 font-medium">
                      {tipoPlazo === "inmediata" ? "Inmediata" : "30 Días"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Precio</Label>
                    <div className="p-2 border rounded-md mt-1 bg-secondary/20 font-medium">
                      ${operacionSeleccionada?.precio.toFixed(2) || "--"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Cantidad</Label>
                    <div className="relative">
                      <Label className="text-sm">
                        Cantidad a {tipoTransaccion === "compra" ? "Comprar" : "Vender"}
                      </Label>
                      <Input
                        type="number"
                        value={cantidadTransaccion}
                        onChange={(e) => actualizarCantidadTransaccion(e.target.value)}
                        min="1"
                        max={operacionSeleccionada?.cantidad}
                        className="mt-1"
                        disabled={procesandoOperacion}
                      />
                      <div className="mt-2">
                        <Label className="text-xs text-muted-foreground">Ajustar cantidad:</Label>
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
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1</span>
                        <span>Máx: {operacionSeleccionada?.cantidad}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Valor Total</Label>
                  <div className="p-2 border rounded-md mt-1 bg-secondary/20 font-medium">
                    $
                    {operacionSeleccionada
                      ? (operacionSeleccionada.precio * Number.parseInt(cantidadTransaccion || "1")).toFixed(2)
                      : "--"}
                  </div>
                </div>

                {/* Información del portafolio */}
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-primary" />
                    Estado de su Portafolio
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Certificados Disponibles:</span>
                      <span className="float-right font-medium">{portafolioUsuario.certificadosDisponibles}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dinero Disponible:</span>
                      <span className="float-right font-medium">${portafolioUsuario.dineroDisponible.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Impacto en el portafolio */}
                  <div className="mt-2 pt-2 border-t">
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-primary" />
                      Después de esta operación:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Certificados Disponibles:</span>
                        <span
                          className={`float-right font-medium ${
                            tipoTransaccion === "compra" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {tipoTransaccion === "compra"
                            ? portafolioUsuario.certificadosDisponibles + Number.parseInt(cantidadTransaccion || "1")
                            : portafolioUsuario.certificadosDisponibles - Number.parseInt(cantidadTransaccion || "1")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dinero Disponible:</span>
                        <span
                          className={`float-right font-medium ${
                            tipoTransaccion === "compra" ? "text-red-600" : "text-green-600"
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
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <h4 className="text-sm font-medium mb-1 flex items-center text-amber-800">
                      <AlertTriangle className="h-4 w-4 mr-1 text-amber-600" />
                      Advertencias
                    </h4>
                    <ul className="text-xs text-amber-700 space-y-1 ml-5 list-disc">
                      {advertencias.map((advertencia, index) => (
                        <li key={index}>{advertencia}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Error de validación */}
                {errorValidacion && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="text-sm font-medium mb-1 flex items-center text-red-800">
                      <X className="h-4 w-4 mr-1 text-red-600" />
                      Error de Validación
                    </h4>
                    <p className="text-xs text-red-700">{errorValidacion}</p>
                  </div>
                )}

                <div className="p-3 bg-secondary/20 rounded-md border border-secondary">
                  <p className="text-sm">
                    Al confirmar, usted acepta {tipoTransaccion === "venta" ? "vender" : "comprar"}{" "}
                    {cantidadTransaccion} certificado(s) de depósito de azúcar a $
                    {operacionSeleccionada?.precio.toFixed(2) || "--"} con entrega{" "}
                    {tipoPlazo === "inmediata" ? "inmediata" : "en 30 días"}.
                  </p>
                </div>
                {/* Sección de opciones avanzadas */}
                {modoAvanzado && (
                  <>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium flex items-center">
                          <Settings className="h-4 w-4 mr-1 text-primary" />
                          Opciones Avanzadas
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setModoAvanzado(false)}
                        >
                          Ocultar
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {/* Selección de estrategia */}
                        <div>
                          <Label className="text-sm">Estrategia</Label>
                          <Select
                            value={estrategiaSeleccionada || ""}
                            onValueChange={setEstrategiaSeleccionada}
                            disabled={procesandoOperacion}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Seleccionar estrategia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ninguna">Ninguna</SelectItem>
                              {estrategias.map((estrategia) => (
                                <SelectItem key={estrategia.id} value={estrategia.id}>
                                  {estrategia.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {estrategiaSeleccionada && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {estrategias.find((e) => e.id === estrategiaSeleccionada)?.descripcion}
                            </p>
                          )}
                        </div>

                        {/* Notas de operación */}
                        <div>
                          <Label className="text-sm">Notas de Operación</Label>
                          <textarea
                            className="w-full mt-1 p-2 text-sm rounded-md border min-h-[60px] bg-background"
                            placeholder="Añada notas o comentarios sobre esta operación..."
                            value={notasOperacion}
                            onChange={(e) => setNotasOperacion(e.target.value)}
                            disabled={procesandoOperacion}
                          />
                        </div>

                        {/* Programar operación */}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="programar-operacion"
                              checked={operacionProgramada}
                              onCheckedChange={(checked) => setOperacionProgramada(checked === true)}
                              disabled={procesandoOperacion}
                            />
                            <label
                              htmlFor="programar-operacion"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Programar operación
                            </label>
                          </div>

                          {operacionProgramada && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Precio de activación</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Ej: 19.85"
                                  value={precioActivacion}
                                  onChange={(e) => setPrecioActivacion(e.target.value)}
                                  disabled={procesandoOperacion}
                                  className="mt-1 h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Expira</Label>
                                <Input
                                  type="date"
                                  className="mt-1 h-8 text-sm"
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
                  <div className="flex justify-center mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setModoAvanzado(true)}>
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
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-center">Operación Exitosa</h3>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Su operación ha sido procesada correctamente
                    </p>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md w-full">
                      <h4 className="text-sm font-medium text-green-800 mb-1">Portafolio Actualizado</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-green-700">Certificados:</span>
                          <span className="float-right font-medium">
                            {tipoTransaccion === "compra"
                              ? portafolioUsuario.certificadosDisponibles
                              : portafolioUsuario.certificadosDisponibles}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700">Dinero:</span>
                          <span className="float-right font-medium">
                            ${portafolioUsuario.dineroDisponible.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                      <X className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-center">Error en la Operación</h3>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      No se pudo procesar su operación. Intente nuevamente.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {operacionExitosa === null ? (
              <>
                <Button variant="outline" onClick={() => setDialogoOperarAbierto(false)} disabled={procesandoOperacion}>
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
                      : "bg-green-600 hover:bg-green-700 text-white"
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
                    "Confirmar"
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setDialogoOperarAbierto(false)}>Cerrar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de alerta para confirmación de operaciones grandes */}
      <AlertDialog open={mostrarAlertaConfirmacion} onOpenChange={setMostrarAlertaConfirmacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Operación de Alto Valor</AlertDialogTitle>
            <AlertDialogDescription>
              Esta operación involucra un monto significativo:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  Valor total:{" "}
                  <span className="font-semibold">
                    $
                    {operacionSeleccionada
                      ? (operacionSeleccionada.precio * Number.parseInt(cantidadTransaccion || "1")).toFixed(2)
                      : "0.00"}
                  </span>
                </li>
                <li>
                  Certificados: <span className="font-semibold">{cantidadTransaccion || "0"}</span>
                </li>
                <li>
                  Tipo: <span className="font-semibold">{tipoTransaccion === "compra" ? "Compra" : "Venta"}</span>
                </li>
              </ul>
              <p className="mt-4">¿Está seguro de que desea continuar con esta operación?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmacionOperacionGrande(true)
                ejecutarOperacion()
              }}
              className={
                tipoTransaccion === "venta" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              }
            >
              Confirmar Operación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
