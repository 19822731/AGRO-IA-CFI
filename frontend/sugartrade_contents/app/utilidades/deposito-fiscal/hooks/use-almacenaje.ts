"use client"

import { useState, useEffect } from "react"
import type { Almacenaje, Mercancia, Warrant, Certificado, EstadisticasAlmacenaje } from "../types"
import { v4 as uuidv4 } from "uuid"

// Datos de ejemplo
const datosMercanciaIniciales: Mercancia[] = [
  {
    id: "1",
    descripcion: "Azúcar a granel",
    cantidad: 1000,
    unidad: "kg",
    peso: 1000,
    volumen: 2,
    valor: 5000,
    fechaIngreso: new Date("2023-01-15"),
    fechaEstimadaSalida: new Date("2023-04-15"),
    fechaSalida: null,
    estado: "ingresada",
    cliente: "Azucarera del Norte S.A.",
    numeroWarrant: "W-2023-001",
    ubicacion: "Sector A, Estante 3",
  },
  {
    id: "2",
    descripcion: "Café en sacos",
    cantidad: 50,
    unidad: "sacos",
    peso: 2500,
    volumen: 5,
    valor: 12500,
    fechaIngreso: new Date("2023-02-10"),
    fechaEstimadaSalida: new Date("2023-05-10"),
    fechaSalida: null,
    estado: "en-proceso",
    cliente: "Cafeteros Unidos",
    numeroWarrant: "W-2023-002",
    ubicacion: "Sector B, Estante 1",
  },
  {
    id: "3",
    descripcion: "Arroz procesado",
    cantidad: 200,
    unidad: "sacos",
    peso: 10000,
    volumen: 15,
    valor: 20000,
    fechaIngreso: new Date("2023-01-05"),
    fechaEstimadaSalida: new Date("2023-03-05"),
    fechaSalida: new Date("2023-03-02"),
    estado: "retirada",
    cliente: "Arrocera Central",
    numeroWarrant: null,
    ubicacion: "Sector C, Estante 2",
  },
  {
    id: "4",
    descripcion: "Trigo",
    cantidad: 500,
    unidad: "kg",
    peso: 500,
    volumen: 1,
    valor: 2500,
    fechaIngreso: new Date("2023-03-01"),
    fechaEstimadaSalida: null,
    fechaSalida: null,
    estado: "en-inspección",
    cliente: "Molinos del Sur",
    numeroWarrant: null,
    ubicacion: "Sector D, Estante 4",
  },
]

const datosWarrantIniciales: Warrant[] = [
  {
    id: "1",
    numero: "W-2023-001",
    fechaEmision: new Date("2023-01-20"),
    fechaVencimiento: new Date("2023-07-20"),
    estado: "vigente",
    mercanciaId: "1",
    valorGarantia: 4000,
    beneficiario: "Banco Agrícola",
  },
  {
    id: "2",
    numero: "W-2023-002",
    fechaEmision: new Date("2023-02-15"),
    fechaVencimiento: new Date("2023-08-15"),
    estado: "vigente",
    mercanciaId: "2",
    valorGarantia: 10000,
    beneficiario: "Financiera Rural",
  },
  {
    id: "3",
    numero: "W-2023-003",
    fechaEmision: new Date("2022-11-10"),
    fechaVencimiento: new Date("2023-02-10"),
    estado: "vencido",
    mercanciaId: "3",
    valorGarantia: 15000,
    beneficiario: "Cooperativa Agrícola",
  },
  {
    id: "4",
    numero: "W-2023-004",
    fechaEmision: new Date("2022-10-05"),
    fechaVencimiento: new Date("2023-01-05"),
    estado: "ejecutado",
    mercanciaId: "4",
    valorGarantia: 2000,
    beneficiario: "Banco del Campo",
  },
  {
    id: "5",
    numero: "W-2023-005",
    fechaEmision: new Date("2022-09-15"),
    fechaVencimiento: new Date("2023-03-15"),
    estado: "cancelado",
    mercanciaId: "5",
    valorGarantia: 8000,
    beneficiario: "Financiera Agroindustrial",
  },
]

const datosCertificadoIniciales: Certificado[] = [
  {
    id: "1",
    numero: "C-2023-001",
    fechaEmision: new Date("2023-01-20"),
    mercanciaId: "1",
    descripcion: "Certificado de depósito para azúcar a granel",
    valor: 5000,
  },
  {
    id: "2",
    numero: "C-2023-002",
    fechaEmision: new Date("2023-02-15"),
    mercanciaId: "2",
    descripcion: "Certificado de depósito para café en sacos",
    valor: 12500,
  },
  {
    id: "3",
    numero: "C-2023-003",
    fechaEmision: new Date("2023-01-05"),
    mercanciaId: "3",
    descripcion: "Certificado de depósito para arroz procesado",
    valor: 20000,
  },
]

export type EstadoMercancia = "ingresada" | "en-proceso" | "retirada" | "en-inspección"

export function useAlmacenaje() {
  const [almacenaje, setAlmacenaje] = useState<Almacenaje>({
    mercancias: datosMercanciaIniciales,
    warrants: datosWarrantIniciales,
    certificados: datosCertificadoIniciales,
  })

  const [estadisticas, setEstadisticas] = useState<EstadisticasAlmacenaje | null>(null)

  // Calcular estadísticas
  useEffect(() => {
    const mercanciasPorEstado: Record<string, number> = {
      ingresada: 0,
      "en-proceso": 0,
      retirada: 0,
      "en-inspección": 0,
    }

    const warrantsPorEstado: Record<string, number> = {
      vigente: 0,
      vencido: 0,
      ejecutado: 0,
      cancelado: 0,
    }

    // Contar mercancías por estado
    almacenaje.mercancias.forEach((mercancia) => {
      mercanciasPorEstado[mercancia.estado]++
    })

    // Contar warrants por estado
    almacenaje.warrants.forEach((warrant) => {
      warrantsPorEstado[warrant.estado]++
    })

    // Generar datos de tendencia mensual (simulados)
    const tendenciaMensual = [
      { mes: "Ene", ingresos: 3, salidas: 1 },
      { mes: "Feb", ingresos: 5, salidas: 2 },
      { mes: "Mar", ingresos: 4, salidas: 3 },
      { mes: "Abr", ingresos: 6, salidas: 4 },
      { mes: "May", ingresos: 8, salidas: 5 },
      { mes: "Jun", ingresos: 7, salidas: 6 },
    ]

    // Calcular totales
    const totalMercancias = almacenaje.mercancias.length
    const pesoTotal = almacenaje.mercancias.reduce((sum, m) => sum + m.peso, 0)
    const valorTotal = almacenaje.mercancias.reduce((sum, m) => sum + m.valor, 0)
    const warrantsVigentes = almacenaje.warrants.filter((w) => w.estado === "vigente").length
    const certificadosEmitidos = almacenaje.certificados.length

    setEstadisticas({
      totalMercancias,
      pesoTotal,
      valorTotal,
      mercanciasPorEstado: mercanciasPorEstado as Record<EstadoMercancia, number>,
      warrantsVigentes,
      warrantsPorEstado,
      certificadosEmitidos,
      tendenciaMensual,
    })
  }, [almacenaje])

  // Función para registrar nueva mercancía
  const registrarMercancia = (mercancia: Omit<Mercancia, "id">) => {
    const nuevaMercancia: Mercancia = {
      ...mercancia,
      id: uuidv4(),
    }

    setAlmacenaje((prev) => ({
      ...prev,
      mercancias: [...prev.mercancias, nuevaMercancia],
    }))

    return nuevaMercancia
  }

  // Función para actualizar el estado de una mercancía
  const actualizarEstadoMercancia = (id: string, estado: EstadoMercancia) => {
    setAlmacenaje((prev) => ({
      ...prev,
      mercancias: prev.mercancias.map((m) => (m.id === id ? { ...m, estado } : m)),
    }))
  }

  // Función para emitir un warrant
  const emitirWarrant = (warrant: Omit<Warrant, "id">) => {
    const nuevoWarrant: Warrant = {
      ...warrant,
      id: uuidv4(),
    }

    setAlmacenaje((prev) => ({
      ...prev,
      warrants: [...prev.warrants, nuevoWarrant],
      mercancias: prev.mercancias.map((m) =>
        m.id === warrant.mercanciaId ? { ...m, numeroWarrant: warrant.numero } : m,
      ),
    }))

    return nuevoWarrant
  }

  // Función para emitir un certificado
  const emitirCertificado = (certificado: Omit<Certificado, "id">) => {
    const nuevoCertificado: Certificado = {
      ...certificado,
      id: uuidv4(),
    }

    setAlmacenaje((prev) => ({
      ...prev,
      certificados: [...prev.certificados, nuevoCertificado],
    }))

    return nuevoCertificado
  }

  // Función para retirar mercancía
  const retirarMercancia = (id: string) => {
    setAlmacenaje((prev) => ({
      ...prev,
      mercancias: prev.mercancias.map((m) => (m.id === id ? { ...m, estado: "retirada", fechaSalida: new Date() } : m)),
    }))
  }

  return {
    mercancias: almacenaje.mercancias,
    warrants: almacenaje.warrants,
    certificados: almacenaje.certificados,
    estadisticas,
    registrarMercancia,
    actualizarEstadoMercancia,
    emitirWarrant,
    emitirCertificado,
    retirarMercancia,
  }
}
