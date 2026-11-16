"use client"

import { useEffect, useMemo } from "react"
import { useWarrantsStore, type ProductoType } from "@/store/warrants-store"

export interface PortafolioItem {
  id: string
  tipo: "warrant" | "certificado"
  numero: string
  producto: string
  cantidad: number
  valor: number
  estado: string
}

export function useWarrantsPortafolio() {
  // Acceder al store
  const {
    warrants = [],
    certificados = [],
    estadisticas = {
      warrants: { valor: 0, subtexto: "Total: 0" },
      certificados: { valor: 0, subtexto: "Disponibles: 0" },
      bolsas: { valor: 0, subtexto: "BLS" },
      certificadosCanje: { valor: 0, subtexto: "Disponibles para canje" },
      operacionesMes: { valor: 0, subtexto: "En el último mes" },
      valorPortafolio: { valor: 0, subtexto: "Valor total" },
    },
    addWarrant = () => "",
    updateWarrant = () => {},
    addCertificado = () => "",
    updateCertificado = () => {},
    transferirWarrant = () => {},
    utilizarCertificado = () => {},
    calcularEstadisticas = () => {},
  } = useWarrantsStore()

  // Verificar si estamos en el cliente
  const isClient = typeof window !== "undefined"

  // Calcular estadísticas al cargar el componente (solo en el cliente)
  useEffect(() => {
    if (isClient && calcularEstadisticas) {
      calcularEstadisticas()
    }
  }, [isClient, calcularEstadisticas])

  // Convertir warrants y certificados a formato de portafolio
  const itemsPortafolio = useMemo(() => {
    if (!isClient) return []

    const warrantsItems: PortafolioItem[] = warrants
      .filter((w) => w.estado === "activo")
      .map((w) => ({
        id: w.id,
        tipo: "warrant",
        numero: w.numero,
        producto: formatProducto(w.producto),
        cantidad: w.cantidad,
        valor: w.valor,
        estado: formatEstadoWarrant(w.estado),
      }))

    const certificadosItems: PortafolioItem[] = certificados
      .filter((c) => c.estado === "disponible")
      .map((c) => ({
        id: c.id,
        tipo: "certificado",
        numero: c.numero,
        producto: formatProducto(c.producto),
        cantidad: c.cantidad,
        valor: c.valor,
        estado: formatEstadoCertificado(c.estado),
      }))

    return [...warrantsItems, ...certificadosItems]
  }, [isClient, warrants, certificados])

  // Calcular valor total del portafolio
  const valorTotalPortafolio = useMemo(() => {
    if (!isClient) return 0
    return itemsPortafolio.reduce((sum, item) => sum + item.valor, 0)
  }, [isClient, itemsPortafolio])

  // Función para crear un nuevo ingreso (warrant + certificado)
  const crearNuevoIngreso = (datos: {
    producto: ProductoType
    cantidad: number
    deposito: string
    valor: number
  }) => {
    if (!isClient) return ""

    const fecha = new Date().toLocaleDateString("es-AR")

    // Crear warrant
    const warrantId = addWarrant({
      numero: `W-${1000 + warrants.length + 1}`,
      fecha,
      producto: datos.producto,
      cantidad: datos.cantidad,
      deposito: datos.deposito,
      estado: "activo",
      valor: datos.valor,
      propietario: "Usuario Actual",
      fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("es-AR"),
    })

    // Crear certificado de depósito asociado
    addCertificado({
      numero: `CD-${2000 + certificados.length + 1}`,
      fecha,
      tipo: "deposito",
      producto: datos.producto,
      cantidad: datos.cantidad,
      estado: "disponible",
      warrantId,
      valor: datos.valor,
    })

    return warrantId
  }

  return {
    warrants,
    certificados,
    estadisticas,
    itemsPortafolio,
    valorTotalPortafolio,
    crearNuevoIngreso,
    transferirWarrant,
    utilizarCertificado,
    updateWarrant,
    updateCertificado,
  }
}

// Funciones auxiliares para formatear datos
function formatProducto(producto: string): string {
  const map: Record<string, string> = {
    azucar_blanco: "Azúcar Blanco",
    azucar_crudo: "Azúcar Crudo",
    azucar_organico: "Azúcar Orgánico",
  }
  return map[producto] || producto
}

function formatEstadoWarrant(estado: string): string {
  const map: Record<string, string> = {
    pendiente: "Pendiente",
    activo: "Activo",
    vencido: "Vencido",
    canjeado: "Canjeado",
  }
  return map[estado] || estado
}

function formatEstadoCertificado(estado: string): string {
  const map: Record<string, string> = {
    disponible: "Disponible",
    en_proceso: "En Proceso",
    utilizado: "Utilizado",
    canjeado: "Canjeado",
  }
  return map[estado] || estado
}
