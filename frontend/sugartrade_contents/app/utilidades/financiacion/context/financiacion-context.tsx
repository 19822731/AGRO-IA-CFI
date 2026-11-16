"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type TipoFinanciamiento = "sgr" | "echeq" | "agroinsumos" | "pre-venta"

interface ItemFinanciamiento {
  id: string
  tipo: TipoFinanciamiento
  descripcion: string
  monto: number
  plazo: number
  tasa: number
  estado?: "pendiente" | "aprobado" | "rechazado" | "completado"
}

interface ItemCarrito {
  id: string
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

interface FinanciacionContextType {
  // Estado
  financiamientosActivos: ItemFinanciamiento[]
  historialFinanciamientos: ItemFinanciamiento[]
  carritoAgroinsumos: ItemCarrito[]
  montoTotalCarrito: number

  // Métodos
  agregarFinanciamiento: (item: Omit<ItemFinanciamiento, "id">) => void
  actualizarEstadoFinanciamiento: (id: string, estado: ItemFinanciamiento["estado"]) => void
  agregarAlCarrito: (item: Omit<ItemCarrito, "id" | "subtotal">) => void
  eliminarDelCarrito: (id: string) => void
  vaciarCarrito: () => void
  simularFinanciamiento: (
    monto: number,
    plazo: number,
    tasa: number,
  ) => {
    cuotaMensual: number
    costoTotal: number
    interesTotal: number
    certificadosRequeridos: number
  }
}

// Funciones de cálculo financiero
function calcularCuotaMensual(monto: number, tasa: number, plazo: number): number {
  const tasaMensual = tasa / 100 / 12
  return (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo))
}

function calcularTotales(monto: number, cuotaMensual: number, plazo: number) {
  const costoTotal = cuotaMensual * plazo
  const interesTotal = costoTotal - monto
  return { costoTotal, interesTotal }
}

function calcularCertificadosRequeridos(monto: number, valorPorCertificado = 2500000, porcentaje = 0.5): number {
  return Math.ceil((monto / valorPorCertificado) * porcentaje)
}

// Crear el contexto con un valor inicial definido para evitar undefined
const initialContext: FinanciacionContextType = {
  financiamientosActivos: [],
  historialFinanciamientos: [],
  carritoAgroinsumos: [],
  montoTotalCarrito: 0,
  agregarFinanciamiento: () => {},
  actualizarEstadoFinanciamiento: () => {},
  agregarAlCarrito: () => {},
  eliminarDelCarrito: () => {},
  vaciarCarrito: () => {},
  simularFinanciamiento: () => ({ cuotaMensual: 0, costoTotal: 0, interesTotal: 0, certificadosRequeridos: 0 }),
}

const FinanciacionContext = createContext<FinanciacionContextType>(initialContext)

export function FinanciacionProvider({ children }: { children: ReactNode }) {
  const [financiamientosActivos, setFinanciamientosActivos] = useState<ItemFinanciamiento[]>([])
  const [historialFinanciamientos, setHistorialFinanciamientos] = useState<ItemFinanciamiento[]>([])
  const [carritoAgroinsumos, setCarritoAgroinsumos] = useState<ItemCarrito[]>([])
  const [montoTotalCarrito, setMontoTotalCarrito] = useState(0)

  // Actualizar monto total del carrito cuando cambia el carrito
  useEffect(() => {
    const total = carritoAgroinsumos.reduce((sum, item) => sum + item.subtotal, 0)
    setMontoTotalCarrito(total)
  }, [carritoAgroinsumos])

  // Agregar un nuevo financiamiento
  const agregarFinanciamiento = (item: Omit<ItemFinanciamiento, "id">) => {
    const nuevoItem: ItemFinanciamiento = {
      ...item,
      id: `fin-${Date.now()}`,
      estado: "pendiente",
    }
    setFinanciamientosActivos((prev) => [...prev, nuevoItem])
  }

  // Actualizar estado de un financiamiento
  const actualizarEstadoFinanciamiento = (id: string, estado: ItemFinanciamiento["estado"]) => {
    setFinanciamientosActivos((prev) => prev.map((item) => (item.id === id ? { ...item, estado } : item)))

    // Si está completado o rechazado, moverlo al historial
    if (estado === "completado" || estado === "rechazado") {
      const item = financiamientosActivos.find((i) => i.id === id)
      if (item) {
        setHistorialFinanciamientos((prev) => [...prev, { ...item, estado }])
        setFinanciamientosActivos((prev) => prev.filter((i) => i.id !== id))
      }
    }
  }

  // Agregar item al carrito
  const agregarAlCarrito = (item: Omit<ItemCarrito, "id" | "subtotal">) => {
    const subtotal = item.cantidad * item.precioUnitario
    const nuevoItem: ItemCarrito = {
      ...item,
      id: `cart-${Date.now()}`,
      subtotal,
    }
    setCarritoAgroinsumos((prev) => [...prev, nuevoItem])
  }

  // Eliminar item del carrito
  const eliminarDelCarrito = (id: string) => {
    setCarritoAgroinsumos((prev) => prev.filter((item) => item.id !== id))
  }

  // Vaciar carrito
  const vaciarCarrito = () => {
    setCarritoAgroinsumos([])
  }

  // Simular financiamiento
  const simularFinanciamiento = (monto: number, plazo: number, tasa: number) => {
    const cuotaMensual = calcularCuotaMensual(monto, tasa, plazo)
    const { costoTotal, interesTotal } = calcularTotales(monto, cuotaMensual, plazo)
    const certificadosRequeridos = calcularCertificadosRequeridos(monto)

    return {
      cuotaMensual,
      costoTotal,
      interesTotal,
      certificadosRequeridos,
    }
  }

  const value = {
    financiamientosActivos,
    historialFinanciamientos,
    carritoAgroinsumos,
    montoTotalCarrito,
    agregarFinanciamiento,
    actualizarEstadoFinanciamiento,
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
    simularFinanciamiento,
  }

  return <FinanciacionContext.Provider value={value}>{children}</FinanciacionContext.Provider>
}

export function useFinanciacion() {
  const context = useContext(FinanciacionContext)
  return context
}
