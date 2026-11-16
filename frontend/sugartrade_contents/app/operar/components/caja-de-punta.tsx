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
import { motion, AnimatePresence } from "framer-motion"
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
  Handshake,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import { useWebSocket } from "@/hooks/use-websocket"
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
  id: number | null
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
const operacionesCompraIniciales: Operacion[] = []
const operacionesVentaIniciales: Operacion[] = []

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Estado para animación de match
  const [lastMatch, setLastMatch] = useState<{ price: number; timestamp: number; isEpic: boolean; isUserMatch?: boolean } | null>(null)
  const [showMatchAnim, setShowMatchAnim] = useState(false)
  const lastTradeIdRef = useRef<number | null>(null)
  const isFirstLoadRef = useRef(true)
  const animationTimerRef = useRef<any>(null)

  // Estados para la entrada manual de órdenes
  const [precioManual, setPrecioManual] = useState("")
  const [cantidadManual, setCantidadManual] = useState("1")
  const [tipoOrdenManual, setTipoOrdenManual] = useState<"compra" | "venta">("compra")
  const [sliderValue, setSliderValue] = useState([0])

  // Estado para la dirección del mercado
  const [direccionMercado, setDireccionMercado] = useState<"up" | "down" | "neutral">("neutral")
  const precioPromedioRef = useRef<number | null>(null)

  // Estado para la operación seleccionada para simular transacción
  const [operacionSeleccionada, setOperacionSeleccionada] = useState<Operacion | null>(null)
  const [filaSeleccionada, setFilaSeleccionada] = useState<number | null>(null)

  const [cantidadTransaccion, setCantidadTransaccion] = useState("1")
  const [tipoTransaccion, setTipoTransaccion] = useState<"compra" | "venta">("compra")

  // Estado para la modalidad de orden (Nueva funcionalidad)
  const [modalidadOrden, setModalidadOrden] = useState<"limit" | "market">("limit")

  // Estado para el diálogo de operación
  const [dialogoOperarAbierto, setDialogoOperarAbierto] = useState(false)
  const [operacionExitosa, setOperacionExitosa] = useState<boolean | null>(null)
  const [procesandoOperacion, setProcesandoOperacion] = useState(false)

  // Estado para el portafolio del usuario (simulado -> real)
  const [portafolioUsuario, setPortafolioUsuario] = useState<PortafolioUsuario>({
    certificadosDisponibles: 0,
    certificadosEnGarantia: 0,
    dineroDisponible: 0,
    id: null,
    nombre: "Usuario",
  })

  // Fetch real wallet summary
  useEffect(() => {
    const fetchWalletSummary = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

        const response = await fetch(`${apiUrl}/api/wallet/summary`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        })

        if (response.ok) {
          const data = await response.json()

          // Warrants hardcoded to match Portfolio page
          const warrants = [
            { id: "W001", totalBags: 600 },
            { id: "W002", totalBags: 600 },
            { id: "W003", totalBags: 600 },
          ]
          const totalWarrantBags = warrants.reduce((acc, w) => acc + w.totalBags, 0)

          // Calculate consolidated balance
          let totalBags = 0
          let totalLockedBags = 0

          if (data.assets) {
            Object.values(data.assets).forEach((asset: any) => {
              // Convert tons to bags (1 ton = 20 bags of 50kg)
              totalBags += (asset.total || 0) * 20
              totalLockedBags += (asset.locked || 0) * 20
            })
          }

          // Available = Total - Locked in Orders - Warrants
          const realAvailable = totalBags - totalLockedBags - totalWarrantBags

          setPortafolioUsuario(prev => ({
            ...prev,
            dineroDisponible: data.fiat?.available || 0,
            certificadosDisponibles: Math.max(0, realAvailable),
            certificadosEnGarantia: totalLockedBags + totalWarrantBags,
            id: data.user_id // Capture real DB User ID
          }))
        } else if (response.status === 401) {
          console.error("Session expired, redirecting to login")
          localStorage.removeItem("auth_token")
          window.location.href = "/login"
        } else {
          console.error("Failed to fetch wallet summary:", response.status, response.statusText)
        }
      } catch (error) {
        console.error("Error fetching wallet summary:", error)
      }
    }

    fetchWalletSummary()
    const interval = setInterval(fetchWalletSummary, 5000)
    return () => clearInterval(interval)
  }, [])

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
    const todasLasOperaciones = [...ventas, ...compras]
    if (todasLasOperaciones.length === 0) return 0
    const sumaPrecio = todasLasOperaciones.reduce((acc, op) => acc + op.precio, 0)
    return sumaPrecio / todasLasOperaciones.length
  }

  // Estado para las órdenes del usuario (para resaltar)
  const [misOrdenes, setMisOrdenes] = useState<any[]>([])

  // WebSocket Integration
  const { isConnected } = useWebSocket({
    url: `${process.env.NEXT_PUBLIC_WS_URL}/ws/market/2`,
    onMessage: (data: any) => {
      if (data.type === "ORDER_BOOK_UPDATE") {
        const mapOrder = (order: any, type: string): Operacion => ({
          id: `${type}-${order.precio}`, // Stable ID based on price
          precio: Number(order.precio) / 20,
          cantidad: Number(order.cantidad),
          timestamp: Date.now(),
          usuario: "market"
        })

        setOperacionesCompra(data.bids.map((o: any) => mapOrder(o, 'bid')))
        setOperacionesVenta(data.asks.map((o: any) => mapOrder(o, 'ask')))

        if (data.last_trade) {
          const tradeId = data.last_trade.id
          const price = data.last_trade.price / 20; // Convert to bags
          const buyerId = Number(data.last_trade.buyer_id);
          const sellerId = Number(data.last_trade.seller_id);
          const currentUserId = portafolioUsuario.id;

          // Check if current user is involved
          const isUserMatch = currentUserId !== null && (buyerId === currentUserId || sellerId === currentUserId);

          // Only animate if this is a NEW trade (different ID)
          if (tradeId !== lastTradeIdRef.current) {

            // On first load, just sync the ID but don't animate history
            if (isFirstLoadRef.current) {
              lastTradeIdRef.current = tradeId
              isFirstLoadRef.current = false
              return
            }

            lastTradeIdRef.current = tradeId

            // Clear existing timer to prevent early dismissal of new animation
            if (animationTimerRef.current) {
              clearTimeout(animationTimerRef.current)
            }

            setLastMatch({ price, timestamp: Date.now(), isEpic: true, isUserMatch })

            // Force re-render cycle if needed, though key change handles it
            setShowMatchAnim(true)

            animationTimerRef.current = setTimeout(() => {
              setShowMatchAnim(false)
              animationTimerRef.current = null
            }, 1500)  // Reduced to 1.5s for faster fade out

            // Force refresh user orders on trade
            fetchMyOrders()
          }
        }
      }
    }
  })

  // Function to fetch user's own orders
  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${apiUrl}/mercado/historial/ordenes`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        // Filter only active orders for product 2
        const active = data.filter((o: any) => o.estado === "pendiente" && o.producto_id === 2)
        setMisOrdenes(active)
      }
    } catch (error) {
      console.error("Error fetching my orders:", error)
    }
  }

  // Initial fetch and Polling Fallback
  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
        const productId = 2
        const response = await fetch(`${apiUrl}/mercado/productos/${productId}/orderbook`)

        if (response.ok) {
          const data = await response.json()
          const mapOrder = (order: any, type: string): Operacion => ({
            id: `${type}-${order.precio}`,
            precio: Number(order.precio) / 20,
            cantidad: Number(order.cantidad),
            timestamp: Date.now(),
            usuario: "market"
          })
          setOperacionesCompra(data.bids.map((o: any) => mapOrder(o, 'bid')))
          setOperacionesVenta(data.asks.map((o: any) => mapOrder(o, 'ask')))
        }
      } catch (error) {
        console.error("Error fetching order book:", error)
      }
    }

    fetchOrderBook()
    fetchMyOrders()

    const interval = setInterval(() => {
      fetchOrderBook()
      fetchMyOrders()
    }, 3000)

    return () => clearInterval(interval)
  }, [])


  // Función para colocar una orden manual
  const colocarOrdenManual = async () => {
    console.log("=== COLOCAR ORDEN MANUAL INICIADO ===")
    console.log("modalidadOrden:", modalidadOrden)
    console.log("tipoOrdenManual:", tipoOrdenManual)
    console.log("precioManual:", precioManual)
    console.log("cantidadManual:", cantidadManual)
    console.log("operacionesVenta.length:", operacionesVenta.length)
    console.log("operacionesCompra.length:", operacionesCompra.length)
    console.log("portafolioUsuario:", portafolioUsuario)

    // 1. Determinar precio efectivo
    let precioEfectivo = Number.parseFloat(precioManual)

    // Si es "A Mercado" ("market"), calculamos el mejor precio disponible
    if (modalidadOrden === "market") {
      console.log("Modo MARKET detectado")
      if (tipoOrdenManual === "compra") {
        if (operacionesVenta.length > 0) {
          precioEfectivo = operacionesVenta[0].precio
          console.log("Precio efectivo (mejor Ask):", precioEfectivo)
        } else {
          console.log("ERROR: No hay vendedores")
          toast({ title: "Sin liquidez", description: "No hay vendedores para operar a mercado.", variant: "destructive" })
          return
        }
      } else {
        if (operacionesCompra.length > 0) {
          precioEfectivo = operacionesCompra[0].precio
          console.log("Precio efectivo (mejor Bid):", precioEfectivo)
        } else {
          console.log("ERROR: No hay compradores")
          toast({ title: "Sin liquidez", description: "No hay compradores para operar a mercado.", variant: "destructive" })
          return
        }
      }
    } else {
      console.log("Modo LIMITE detectado, precio manual:", precioEfectivo)
    }

    // 2. Validaciones básicas
    if (!cantidadManual) {
      console.log("ERROR: Falta cantidad")
      toast({ title: "Falta Cantidad", description: "Ingrese la cantidad.", variant: "destructive" })
      return
    }

    const cantidad = Number.parseInt(cantidadManual)
    console.log("Cantidad parseada:", cantidad)
    console.log("precioEfectivo final:", precioEfectivo)

    // Validación específica para cantidad
    if (isNaN(cantidad) || cantidad <= 0) {
      console.log("ERROR: Cantidad inválida o cero")
      toast({
        title: "Ingrese una Cantidad",
        description: "La cantidad debe ser mayor a 0. Use el slider o escriba manualmente.",
        variant: "destructive",
      })
      return
    }

    // Validación para precio (solo en modo límite)
    if (modalidadOrden === "limit" && (isNaN(precioEfectivo) || precioEfectivo <= 0)) {
      console.log("ERROR: Precio inválido en modo límite")
      toast({
        title: "Ingrese un Precio",
        description: "El precio debe ser mayor a 0 para órdenes límite.",
        variant: "destructive",
      })
      return
    }

    // 3. Validar Saldos
    let saldoValido = true
    let mensajeError = ""

    if (tipoOrdenManual === "compra") {
      const costoTotal = precioEfectivo * cantidad
      if (costoTotal > portafolioUsuario.dineroDisponible) {
        saldoValido = false
        mensajeError = `Saldo insuficiente. Requiere aprox $${costoTotal.toFixed(2)}`
      }
    } else {
      if (cantidad > portafolioUsuario.certificadosDisponibles) {
        saldoValido = false
        mensajeError = `Certificados insuficientes. Tiene ${portafolioUsuario.certificadosDisponibles}`
      }
    }

    if (!saldoValido) {
      toast({ title: "Fondos Insuficientes", description: mensajeError, variant: "destructive" })
      return
    }

    setProcesandoOperacion(true)

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No autenticado")

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

      const orderData = {
        producto_id: 2,
        tipo_orden: tipoOrdenManual,
        tipo_ejecucion: "limite", // Siempre LIMITE porque el backend rechaza 'mercado' en compra
        cantidad_original: cantidad,
        // Precio ya está en la unidad correcta (por bolsa), no multiplicar por 20
        precio_limite: precioEfectivo
      }

      console.log("Enviando Orden (Pseudo-Market):", orderData)

      const response = await fetch(`${apiUrl}/mercado/ordenes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData)
        throw new Error(errorData.detail || `Error del servidor (${response.status})`)
      }

      toast({
        title: "¡Orden Creada!",
        description: `${tipoOrdenManual === "compra" ? "Compra" : "Venta"} de ${cantidad} a $${precioEfectivo} procesada.`,
        variant: "default",
        className: "bg-green-600 text-white border-green-700"
      })

      // Limpiar campos
      setPrecioManual("")
      setCantidadManual("")

      // Refresh Data immediately
      fetchMyOrders()

    } catch (error: any) {
      console.error("Error creating manual order:", error)
      toast({
        title: "No se pudo crear la orden",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcesandoOperacion(false)
    }
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
    // Seleccionar la fila para operar
    setFilaSeleccionada(index)
    setOperacionSeleccionada(operacion)
    setTipoTransaccion(tipo === "compra" ? "venta" : "compra") // Invertir el tipo para la transacción
    setCantidadTransaccion("1") // Reiniciar a 1 por defecto

    toast({
      title: "Operación seleccionada",
      description: `${tipo === "compra" ? "Compra" : "Venta"} a $${operacion.precio.toFixed(2)} seleccionada. Presione 'Operar' para continuar.`,
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
      if (cantidad > portafolioUsuario.certificadosDisponibles) {
        return {
          valido: false,
          mensaje: `Certificados insuficientes. Necesita ${cantidad} certificados pero solo tiene ${portafolioUsuario.certificadosDisponibles} disponibles.`,
          advertencias: [],
        }
      }

      if (cantidad > portafolioUsuario.certificadosDisponibles * 0.5) {
        nuevasAdvertencias.push(
          `Esta operación utilizará más del 50% de sus certificados disponibles (${((cantidad / portafolioUsuario.certificadosDisponibles) * 100).toFixed(1)}%).`,
        )
      }

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

  // Smart Slider Logic
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value)
    const porcentaje = value[0] / 100

    // Determinar el precio efectivo según el modo
    let precioEfectivo: number

    if (modalidadOrden === "market") {
      // En modo Market: usar el mejor precio del order book
      if (tipoOrdenManual === "compra") {
        precioEfectivo = operacionesVenta.length > 0 ? operacionesVenta[0].precio : 0
      } else {
        precioEfectivo = operacionesCompra.length > 0 ? operacionesCompra[0].precio : 0
      }
    } else {
      // En modo Límite: usar el precio manual
      precioEfectivo = Number.parseFloat(precioManual)
    }

    if (tipoOrdenManual === "compra") {
      if (!precioEfectivo || precioEfectivo <= 0) {
        setCantidadManual("0")
        return
      }
      const maxMoney = portafolioUsuario.dineroDisponible * porcentaje
      const priceWithBuffer = precioEfectivo * 1.05 // Buffer 5% para comisiones
      const maxQty = Math.floor(maxMoney / priceWithBuffer)
      setCantidadManual(maxQty > 0 ? maxQty.toString() : "0")
    } else {
      // Para venta: calcular basado en certificados disponibles
      const maxQty = Math.floor(portafolioUsuario.certificadosDisponibles * porcentaje)
      setCantidadManual(maxQty > 0 ? maxQty.toString() : "0")
    }
  }

  // Función para verificar si una operación necesita confirmación adicional
  const verificarConfirmacionAdicional = (cantidad: number, precio: number): boolean => {
    const valorTotal = cantidad * precio
    if (valorTotal > 3000) return true
    if (cantidad > 50) return true
    const precioPromedio = calcularPrecioPromedio(operacionesCompra, operacionesVenta)
    const desviacion = Math.abs(precio - precioPromedio) / precioPromedio
    if (desviacion > 0.1) return true
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

    setAdvertencias(advertencias)
    setErrorValidacion(null)
    setDialogoOperarAbierto(true)
  }

  // Función para actualizar la cantidad de la transacción
  const actualizarCantidadTransaccion = (nuevaCantidad: string) => {
    const cantidad = Number.parseInt(nuevaCantidad)

    if (isNaN(cantidad) || cantidad <= 0) {
      setCantidadTransaccion(nuevaCantidad)
      return
    }

    if (operacionSeleccionada && cantidad > operacionSeleccionada.cantidad) {
      setCantidadTransaccion(operacionSeleccionada.cantidad.toString())
      return
    }

    setCantidadTransaccion(nuevaCantidad)

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

  const ejecutarOperacion = async () => {
    if (!operacionSeleccionada) return

    const cantidad = Number.parseInt(cantidadTransaccion)
    if (isNaN(cantidad) || cantidad <= 0 || cantidad > operacionSeleccionada.cantidad) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad debe ser un número positivo y no puede exceder la cantidad disponible.",
        variant: "destructive",
      })
      return
    }

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

    const valorTotal = operacionSeleccionada.precio * cantidad
    if (
      confirmarTodasLasOperaciones &&
      !confirmacionOperacionGrande &&
      verificarConfirmacionAdicional(cantidad, operacionSeleccionada.precio)
    ) {
      setMostrarAlertaConfirmacion(true)
      return
    }

    setConfirmacionOperacionGrande(false)
    setProcesandoOperacion(true)
    setOperacionExitosa(null)

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No autenticado")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

      const orderData = {
        producto_id: 2, // Hardcoded for now
        tipo_orden: tipoTransaccion,
        tipo_ejecucion: "limite",
        cantidad_original: cantidad,
        precio_limite: operacionSeleccionada.precio * 20 // Convertir Bolsa a TN (multiplicar por 20)
      }

      const response = await fetch(`${apiUrl}/mercado/ordenes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al procesar la orden")
      }

      setOperacionExitosa(true)

      toast({
        title: "Orden enviada exitosamente",
        description: `Orden de ${tipoTransaccion} por ${cantidad} unidades a $${operacionSeleccionada.precio} creada.`,
        variant: "default",
      })

      const nuevaOperacionHistorial: HistorialOperacion = {
        id: `op-${Date.now()}`,
        tipo: tipoTransaccion,
        precio: operacionSeleccionada.precio,
        cantidad: cantidad,
        timestamp: Date.now(),
        plazo: "inmediata",
        contraparteId: operacionSeleccionada.usuario,
        contraparteNombre: contrapartes[operacionSeleccionada.usuario]?.nombre || "Desconocido",
        valorTotal: valorTotal,
      }

      const comision = valorTotal * 0.005
      const impuestos = valorTotal * 0.16
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
      setNotasOperacion("")

      setTimeout(() => {
        setDialogoOperarAbierto(false)
        setOperacionExitosa(null)
        setOperacionSeleccionada(null)
        setFilaSeleccionada(null)
        setCantidadTransaccion("1")
        setAdvertencias([])
      }, 3000)

    } catch (error: any) {
      console.error("Error submitting order:", error)
      setOperacionExitosa(false)
      toast({
        title: "Error en la operación",
        description: error.message || "No se pudo completar la operación",
        variant: "destructive",
      })
    } finally {
      setProcesandoOperacion(false)
    }
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* SECCIÓN SUPERIOR: CLÁSICA (TABS) + SLIDER */}
      <div className="grid grid-cols-1 gap-6">

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground px-1">
          <div className="flex items-center gap-1"><span className="text-gray-400">Dinero:</span> <span className="text-white font-mono font-bold">${portafolioUsuario.dineroDisponible.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <div className="flex items-center gap-1"><span className="text-gray-400">Bolsas:</span> <span className="text-white font-mono font-bold">{portafolioUsuario.certificadosDisponibles.toLocaleString()}</span></div>
          {portafolioUsuario.certificadosEnGarantia > 0 && <div className="flex items-center gap-1"><span className="text-gray-400">Garantía:</span> <span className="text-amber-500 font-mono">{portafolioUsuario.certificadosEnGarantia}</span></div>}
        </div>

        {/* TARJETA DE ORDEN TIPO 'STABLE' */}
        <Card className="bg-[#111936] border-[#1a2040]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Colocar Orden</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="compra" onValueChange={(v) => setTipoOrdenManual(v as "compra" | "venta")}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#0a0f29]">
                <TabsTrigger value="compra" className="data-[state=active]:bg-green-700 data-[state=active]:text-white text-gray-400">Comprar</TabsTrigger>
                <TabsTrigger value="venta" className="data-[state=active]:bg-red-700 data-[state=active]:text-white text-gray-400">Vender</TabsTrigger>
              </TabsList>

              {/* FORMULARIO ÚNICO ADAPTADO AL ESTADO CON MODALIDAD */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Tipo de Orden</Label>
                    <Select value={modalidadOrden} onValueChange={(v) => {
                      setModalidadOrden(v as "limit" | "market")
                      if (v === "market") {
                        // Set current estimated price for display or keep empty
                        const bestPrice = tipoOrdenManual === "compra"
                          ? (operacionesVenta.length > 0 ? operacionesVenta[operacionesVenta.length - 1].precio : 0)
                          : (operacionesCompra.length > 0 ? operacionesCompra[0].precio : 0)
                        if (bestPrice > 0) setPrecioManual(bestPrice.toFixed(2))
                      }
                    }}>
                      <SelectTrigger className="bg-[#0a0f29] border-[#1a2040] text-white">
                        <SelectValue placeholder="Tipo de Orden" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                        <SelectItem value="limit">Límite</SelectItem>
                        <SelectItem value="market">Mercado (Inmediata)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Precio (USD/Bolsa)</Label>
                    <Input
                      type="number"
                      placeholder={modalidadOrden === "market" ? "A mercado" : "0.00"}
                      value={modalidadOrden === "market" ? "" : precioManual}
                      onChange={(e) => setPrecioManual(e.target.value)}
                      disabled={modalidadOrden === "market"}
                      className={`bg-[#0a0f29] border-[#1a2040] text-white ${modalidadOrden === "market" ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Cantidad (Bolsas)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={cantidadManual}
                      onChange={(e) => setCantidadManual(e.target.value)}
                      className="bg-[#0a0f29] border-[#1a2040] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Total Est.</Label>
                    <Input
                      type="text"
                      value={`$${((Number(precioManual) || 0) * (Number(cantidadManual) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      disabled
                      className="bg-[#0a0f29] border-[#1a2040] text-white"
                    />
                  </div>
                </div>

                {/* SMART SLIDER INTEGRADO */}
                <div className="space-y-2 pt-2 px-1">
                  <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    <span>Smart Amount</span>
                    <span>{sliderValue[0]}%</span>
                  </div>
                  <Slider value={sliderValue} max={100} step={25} className="py-2" onValueChange={handleSliderChange} />
                  <div className="text-[10px] text-right text-muted-foreground">
                    {tipoOrdenManual === "compra"
                      ? `Max: ${Math.floor((portafolioUsuario.dineroDisponible * (sliderValue[0] / 100)) / ((Number(precioManual) || 1) * (modalidadOrden === "market" ? 1.05 : 1)))} u`
                      : `Max: ${Math.floor(portafolioUsuario.certificadosDisponibles * (sliderValue[0] / 100))} u`}
                  </div>
                </div>

                <Button
                  onClick={colocarOrdenManual}
                  disabled={procesandoOperacion}
                  className={`w-full text-white font-bold h-10 ${tipoOrdenManual === "compra" ? "bg-green-700 hover:bg-green-800" : "bg-red-700 hover:bg-red-800"}`}
                >
                  {procesandoOperacion ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : (
                    <>
                      {tipoOrdenManual === "compra" ? "Comprar" : "Vender"}
                      {modalidadOrden === "market" ? " AHORA" : ""}
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN INFERIOR: CAJA DE PUNTA */}
      <Card className="w-full shadow-lg border-t-4 border-t-blue-500/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold flex items-center">
                Caja de Punta
                {direccionMercado === "up" && (<span className="ml-2 text-green-600 inline-flex items-center"><TrendingUp className="h-4 w-4" /></span>)}
                {direccionMercado === "down" && (<span className="ml-2 text-red-600 inline-flex items-center"><TrendingDown className="h-4 w-4" /></span>)}
              </CardTitle>
              <CardDescription className="flex items-center mt-1 font-medium">Certificados de Depósito <Info className="h-4 w-4 ml-1 text-muted-foreground" /></CardDescription>
            </div>
            <div className="bg-secondary/40 text-xs px-3 py-1 rounded-full border border-border flex items-center gap-2 font-mono">
              <span className="text-muted-foreground">Spread:</span>
              <span className="font-bold text-foreground">${operacionesVenta.length > 0 && operacionesCompra.length > 0 ? (operacionesVenta[operacionesVenta.length - 1].precio - operacionesCompra[0].precio).toFixed(2) : "0.00"}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Tabla de Caja de Punta */}
          <div className="overflow-hidden rounded-md border border-border bg-[#0f172a]/50">
            <div className="flex justify-center py-3 bg-secondary/20 border-b border-border">
              <div className="w-1/2 text-center"><h3 className="text-base font-bold text-green-500 uppercase tracking-wider text-shadow-sm">Compra</h3></div>
              <div className="w-1/2 text-center"><h3 className="text-base font-bold text-red-500 uppercase tracking-wider text-shadow-sm">Venta</h3></div>
            </div>

            <div className="flex justify-center text-xs text-muted-foreground font-medium py-2 border-b border-white/5 bg-secondary/10 uppercase tracking-wide">
              <div className="w-1/2 flex"><div className="w-1/2 text-center">Cant.</div><div className="w-1/2 text-center">Precio</div></div>
              <div className="w-1/2 flex"><div className="w-1/2 text-center">Precio</div><div className="w-1/2 text-center">Cant.</div></div>
            </div>

            <div className="flex max-h-[400px] overflow-hidden relative font-mono text-sm">


              {/* Columna Compra */}
              <div className="w-1/2 border-r border-white/5 overflow-y-auto scrollbar-hide relative">
                <AnimatePresence mode="popLayout">
                  {operacionesCompra.map((op, index) => {
                    const maxVol = Math.max(...operacionesCompra.map(o => o.cantidad), 1);
                    const widthPct = (op.cantidad / maxVol) * 100;
                    const isUserOrder = misOrdenes.some(myOp => myOp.tipo_orden === "compra" && Math.abs((myOp.precio_limite / 20) - op.precio) < 0.01);
                    return (
                      <motion.div key={op.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className={`flex py-2 cursor-pointer hover:bg-white/5 relative group ${filaSeleccionada === index && tipoTransaccion === "venta" ? "bg-white/10" : ""}`} onClick={() => manejarClicOperacion(op, "compra", index)}>
                        <div className="absolute right-0 top-0 bottom-0 bg-green-500/10 transition-all duration-500 ease-out" style={{ width: `${widthPct}%` }} />
                        {isUserOrder && <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse" />}
                        <div className="w-1/2 text-center font-medium z-10 text-gray-300 relative">{op.cantidad.toLocaleString()}{isUserOrder && <span className="ml-2 text-[10px] bg-cyan-500 text-black font-black px-1.5 py-0.5 rounded-sm shadow-sm">TU ORDEN</span>}</div>
                        <div className="w-1/2 text-center font-bold text-green-500 z-10 relative">${op.precio.toFixed(2)}</div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {operacionesCompra.length === 0 && <div className="py-12 text-center text-muted-foreground text-xs italic">Vacío</div>}
              </div>

              {/* Columna Venta */}
              <div className="w-1/2 overflow-y-auto scrollbar-hide relative">
                <AnimatePresence mode="popLayout">
                  {operacionesVenta.map((op, index) => {
                    const maxVol = Math.max(...operacionesVenta.map(o => o.cantidad), 1);
                    const widthPct = (op.cantidad / maxVol) * 100;
                    const isUserOrder = misOrdenes.some(myOp => myOp.tipo_orden === "venta" && Math.abs((myOp.precio_limite / 20) - op.precio) < 0.01);
                    return (
                      <motion.div key={op.id} layout initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className={`flex py-2 cursor-pointer hover:bg-white/5 relative group ${filaSeleccionada === index && tipoTransaccion === "compra" ? "bg-white/10" : ""}`} onClick={() => manejarClicOperacion(op, "venta", index)}>
                        <div className="absolute left-0 top-0 bottom-0 bg-red-500/10 transition-all duration-500 ease-out" style={{ width: `${widthPct}%` }} />
                        {isUserOrder && <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse" />}
                        <div className="w-1/2 text-center font-bold text-red-500 z-10 relative">${op.precio.toFixed(2)}</div>
                        <div className="w-1/2 text-center font-medium z-10 text-gray-300 relative">{op.cantidad.toLocaleString()}{isUserOrder && <span className="ml-2 text-[10px] bg-cyan-500 text-black font-black px-1.5 py-0.5 rounded-sm shadow-sm">TU ORDEN</span>}</div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {operacionesVenta.length === 0 && <div className="py-12 text-center text-muted-foreground text-xs italic">Vacío</div>}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Button onClick={abrirDialogoOperar} className={`px-12 py-3 font-medium text-lg rounded-md relative ${operacionSeleccionada ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-gray-500 hover:bg-gray-600 text-white"}`} disabled={!operacionSeleccionada}>
              Operar Selección
              {operacionSeleccionada && (<span className="absolute top-1 right-1"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span></span>)}
            </Button>
          </div>

        </CardContent>

        {/* Dialogs */}
        <Dialog open={dialogoOperarAbierto} onOpenChange={(open) => { if (!procesandoOperacion) { setDialogoOperarAbierto(open); if (!open) { setErrorValidacion(null); setAdvertencias([]); } } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Confirmar Operación</DialogTitle><DialogDescription>Revise los detalles de la operación antes de confirmar</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              {operacionExitosa === null ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-sm">Tipo</Label><div className="p-2 border rounded-md mt-1 bg-secondary/20 font-medium">{tipoTransaccion === "venta" ? "Venta" : "Compra"}</div></div>
                    <div><Label className="text-sm">Precio</Label><div className="p-2 border rounded-md mt-1 bg-secondary/20 font-medium">${operacionSeleccionada?.precio.toFixed(2) || "--"}</div></div>
                  </div>
                  <div><Label className="text-sm">Cantidad</Label><Input type="number" value={cantidadTransaccion} onChange={(e) => actualizarCantidadTransaccion(e.target.value)} min="1" max={operacionSeleccionada?.cantidad} className="mt-1" disabled={procesandoOperacion} /></div>
                  <div><Label className="text-sm">Valor Total</Label><div className="p-2 border rounded-md mt-1 bg-secondary/20 font-medium">${operacionSeleccionada ? (operacionSeleccionada.precio * Number.parseInt(cantidadTransaccion || "1")).toFixed(2) : "--"}</div></div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  {operacionExitosa ? <><Check className="h-8 w-8 text-green-600 mb-4" /><h3 className="text-lg font-medium">Operación Exitosa</h3></> : <><X className="h-8 w-8 text-red-600 mb-4" /><h3 className="text-lg font-medium">Error</h3></>}
                </div>
              )}
            </div>
            <DialogFooter>
              {operacionExitosa === null ? (
                <><Button variant="outline" onClick={() => setDialogoOperarAbierto(false)}>Cancelar</Button><Button onClick={ejecutarOperacion} disabled={procesandoOperacion} className={tipoTransaccion === "venta" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}>{procesandoOperacion ? "Procesando..." : "Confirmar"}</Button></>
              ) : (<Button onClick={() => setDialogoOperarAbierto(false)}>Cerrar</Button>)}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={mostrarAlertaConfirmacion} onOpenChange={setMostrarAlertaConfirmacion}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Operación de Alto Valor</AlertDialogTitle>
              <AlertDialogDescription>Esta operación involucra un monto significativo. ¿Está seguro?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { setConfirmacionOperacionGrande(true); ejecutarOperacion(); }} className="bg-red-600">Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>

      {/* NON-INTRUSIVE FLOATING MATCH NOTIFICATION */}
      <AnimatePresence>
        {showMatchAnim && lastMatch && (
          <motion.div
            key={`match-${lastMatch.timestamp}-${lastMatch.price}`}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-[50] pointer-events-none"
          >
            <div className={`w-80 p-4 rounded-xl border-t shadow-2xl backdrop-blur-md flex flex-row items-center gap-4 ${lastMatch.isUserMatch ? "bg-[#0b1221]/90 border-cyan-500 shadow-cyan-500/20" : (lastMatch.isEpic ? "bg-[#18120b]/90 border-amber-500 shadow-amber-500/20" : "bg-[#0f172a]/90 border-white/10")}`}>
              {/* Icon/Image */}
              <div className="flex-shrink-0">
                <img
                  src="/handshake_match.png"
                  alt="Match"
                  className={`w-16 h-16 object-contain ${lastMatch.isUserMatch ? "drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" : "drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"}`}
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="text-lg font-black italic tracking-tighter leading-none">
                  {lastMatch.isUserMatch ?
                    <span className="text-cyan-400 drop-shadow-sm uppercase">¡Orden Cerrada!</span> :
                    (lastMatch.isEpic ? <span className="text-amber-400 uppercase">Epic Match!</span> : <span className="text-white uppercase">Match!</span>)
                  }
                </div>
                <div className={`text-2xl font-mono font-bold mt-1 ${lastMatch.isUserMatch ? "text-cyan-50" : "text-white"}`}>
                  ${lastMatch.price.toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
