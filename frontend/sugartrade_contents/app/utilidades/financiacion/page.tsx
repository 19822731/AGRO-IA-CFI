"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { SGRCard } from "./components/sgr-card"
import { ECheqCard } from "./components/echeq-card"
import { SimuladorFinanciamiento } from "./components/simulador-financiamiento"
import { HistorialFinanciamiento } from "./components/historial-financiamiento"
import { AgroinsumoCard } from "./components/agroinsumo-card"
import { PreVentaCard } from "./components/preventa-card"
import { ExplicacionFuncionalidades } from "./components/explicacion-funcionalidades"

// Datos de ejemplo para SGRs
const sgrs = [
  {
    id: 1,
    nombre: "Garantizar SGR",
    tasaAnual: 18.5,
    montoMaximo: 50000000,
    plazoMaximo: 36,
    requisitos: ["Certificados de depósito", "Estados contables", "Declaración jurada de bienes"],
    estado: "disponible",
  },
  {
    id: 2,
    nombre: "Afianzar SGR",
    tasaAnual: 19.2,
    montoMaximo: 75000000,
    plazoMaximo: 48,
    requisitos: ["Certificados de depósito", "Garantías reales", "Flujo de fondos proyectado"],
    estado: "disponible",
  },
  {
    id: 3,
    nombre: "Campo Aval SGR",
    tasaAnual: 17.8,
    montoMaximo: 60000000,
    plazoMaximo: 36,
    requisitos: ["Warrants", "Certificados de depósito", "Declaración jurada de bienes"],
    estado: "disponible",
  },
]

// Datos de ejemplo para eCheqs
const echeqs = [
  {
    id: 1,
    numero: "ECH-001-23456789",
    monto: 2500000,
    fechaEmision: "2023-10-15",
    fechaVencimiento: "2024-01-15",
    emisor: "Ingenio San Martín",
    estado: "pendiente",
  },
  {
    id: 2,
    numero: "ECH-002-34567890",
    monto: 1800000,
    fechaEmision: "2023-11-05",
    fechaVencimiento: "2024-02-05",
    emisor: "Distribuidora Azucarera Norte",
    estado: "pendiente",
  },
  {
    id: 3,
    numero: "ECH-003-45678901",
    monto: 3200000,
    fechaEmision: "2023-09-20",
    fechaVencimiento: "2023-12-20",
    emisor: "Cooperativa Agrícola del Sur",
    estado: "descontado",
  },
]

// Datos de ejemplo para entidades financieras
const entidadesFinancieras = [
  {
    id: 1,
    nombre: "Banco Nación",
    tasaDescuento: 22.5,
    plazoMaximo: 180,
    montoMinimo: 500000,
  },
  {
    id: 2,
    nombre: "Banco Galicia",
    tasaDescuento: 24.8,
    plazoMaximo: 120,
    montoMinimo: 300000,
  },
  {
    id: 3,
    nombre: "Banco Macro",
    tasaDescuento: 23.2,
    plazoMaximo: 150,
    montoMinimo: 400000,
  },
]

// Datos de ejemplo para historial de financiamiento
const historialFinanciamiento = [
  {
    id: 1,
    tipo: "SGR",
    entidad: "Garantizar SGR",
    monto: 15000000,
    fechaSolicitud: "2023-08-10",
    estado: "aprobado",
    plazo: 24,
    tasaAnual: 18.5,
  },
  {
    id: 2,
    tipo: "eCheq",
    entidad: "Banco Galicia",
    monto: 2800000,
    fechaSolicitud: "2023-09-15",
    estado: "procesado",
    tasaDescuento: 24.8,
  },
  {
    id: 3,
    tipo: "Agroinsumos",
    entidad: "Sugar Trade",
    monto: 5200000,
    fechaSolicitud: "2023-07-20",
    estado: "en curso",
    plazo: 6,
    tasaAnual: 20.5,
  },
]

// Datos de ejemplo para agroinsumos
const agroinsumos = [
  {
    id: 1,
    nombre: "Fertilizante Premium",
    proveedor: "AgroInsumos SA",
    precio: 1200000,
    unidad: "Tonelada",
    disponibilidad: true,
  },
  {
    id: 2,
    nombre: "Herbicida Selectivo",
    proveedor: "Química Agrícola",
    precio: 850000,
    unidad: "1000 litros",
    disponibilidad: true,
  },
  {
    id: 3,
    nombre: "Semillas Certificadas",
    proveedor: "SemillasTech",
    precio: 1500000,
    unidad: "Tonelada",
    disponibilidad: false,
  },
]

// Datos de ejemplo para pre-venta
const preventas = [
  {
    id: 1,
    empresa: "Distribuidora Nacional",
    demandaAnual: 5000,
    precioFuturo: 950000,
    plazoEntrega: "6 meses",
    condicionesPago: "50% anticipado, 50% contra entrega",
  },
  {
    id: 2,
    empresa: "Exportadora del Sur",
    demandaAnual: 8000,
    precioFuturo: 980000,
    plazoEntrega: "8 meses",
    condicionesPago: "30% anticipado, 70% contra entrega",
  },
  {
    id: 3,
    empresa: "Industria Alimenticia",
    demandaAnual: 3500,
    precioFuturo: 920000,
    plazoEntrega: "4 meses",
    condicionesPago: "40% anticipado, 60% contra entrega",
  },
]

export default function FinanciacionPage() {
  const [activeTab, setActiveTab] = useState("sgr")
  const [showSimulador, setShowSimulador] = useState(false)
  const [simuladorData, setSimuladorData] = useState({
    tipo: "",
    monto: 0,
    plazo: 0,
    tasa: 0,
  })
  const [showExplicacion, setShowExplicacion] = useState(false)

  const handleSimular = (tipo: string, monto: number, plazo: number, tasa: number) => {
    setSimuladorData({ tipo, monto, plazo, tasa })
    setShowSimulador(true)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financiación</h1>
          <p className="text-muted-foreground">Gestione sus opciones de financiamiento y liquidez</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowExplicacion(!showExplicacion)}>
            {showExplicacion ? "Ocultar Explicación" : "¿Cómo funciona?"}
          </Button>
          <Button onClick={() => (window.location.href = "/utilidades/financiacion/dashboard")}>Dashboard</Button>
        </div>
      </div>

      {showExplicacion && (
        <div className="mb-6">
          <ExplicacionFuncionalidades />
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financiamiento Total</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(23000000)}</div>
            <p className="text-xs text-muted-foreground">+15% respecto al mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Promedio</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 16v-8M12 16v-4M8 16v-2M4 16v-1" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19.8%</div>
            <p className="text-xs text-muted-foreground">-2.3% respecto al mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 SGR, 1 Agroinsumos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidad Disponible</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(45000000)}</div>
            <p className="text-xs text-muted-foreground">Basado en certificados disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="sgr">SGR</TabsTrigger>
          <TabsTrigger value="echeqs">eCheqs</TabsTrigger>
          <TabsTrigger value="agroinsumos">Agroinsumos</TabsTrigger>
          <TabsTrigger value="preventa">Pre-Venta</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        {/* Contenido de SGR */}
        <TabsContent value="sgr" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sgrs &&
              sgrs.map((sgr) => (
                <SGRCard
                  key={sgr.id}
                  sgr={sgr}
                  onSimular={(monto, plazo) => handleSimular("SGR", monto, plazo, sgr.tasaAnual)}
                />
              ))}
          </div>
        </TabsContent>

        {/* Contenido de eCheqs */}
        <TabsContent value="echeqs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {echeqs &&
              echeqs
                .filter((e) => e.estado === "pendiente")
                .map((echeq) => (
                  <ECheqCard
                    key={echeq.id}
                    echeq={echeq}
                    entidades={entidadesFinancieras}
                    onSimular={(monto, tasa) => handleSimular("eCheq", monto, 0, tasa)}
                  />
                ))}
          </div>
        </TabsContent>

        {/* Contenido de Agroinsumos */}
        <TabsContent value="agroinsumos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agroinsumos &&
              agroinsumos
                .filter((a) => a.disponibilidad)
                .map((agroinsumo) => (
                  <AgroinsumoCard
                    key={agroinsumo.id}
                    agroinsumo={agroinsumo}
                    onSimular={(monto) => handleSimular("Agroinsumo", monto, 6, 20.5)}
                  />
                ))}
          </div>
        </TabsContent>

        {/* Contenido de Pre-Venta */}
        <TabsContent value="preventa" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {preventas &&
              preventas.map((preventa) => (
                <PreVentaCard
                  key={preventa.id}
                  preventa={preventa}
                  onSimular={(monto) => handleSimular("Pre-Venta", monto, 0, 0)}
                />
              ))}
          </div>
        </TabsContent>

        {/* Contenido de Historial */}
        <TabsContent value="historial">
          <HistorialFinanciamiento historial={historialFinanciamiento} />
        </TabsContent>
      </Tabs>

      {/* Simulador de Financiamiento */}
      {showSimulador && (
        <SimuladorFinanciamiento isOpen={showSimulador} onClose={() => setShowSimulador(false)} data={simuladorData} />
      )}
    </div>
  )
}
