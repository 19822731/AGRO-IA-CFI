"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { FinanciamientoChart } from "../components/financiamiento-chart"
import { CalendarioPagos } from "../components/calendario-pagos"
import { NotificacionesFinanciamiento } from "../components/notificaciones-financiamiento"
import { ResumenCertificados } from "../components/resumen-certificados"

// Datos de ejemplo para el dashboard
const resumenFinanciamiento = {
  totalFinanciado: 45000000,
  totalDisponible: 30000000,
  totalPendiente: 12000000,
  totalVencido: 0,
  capacidadTotal: 75000000,
  distribucion: [
    { tipo: "SGR", monto: 25000000, porcentaje: 55.6 },
    { tipo: "eCheqs", monto: 8000000, porcentaje: 17.8 },
    { tipo: "Agroinsumos", monto: 7000000, porcentaje: 15.6 },
    { tipo: "Pre-Venta", monto: 5000000, porcentaje: 11.1 },
  ],
  historico: [
    { mes: "Ene", sgr: 15000000, echeqs: 5000000, agroinsumos: 3000000, preventa: 2000000 },
    { mes: "Feb", sgr: 18000000, echeqs: 6000000, agroinsumos: 4000000, preventa: 2500000 },
    { mes: "Mar", sgr: 20000000, echeqs: 7000000, agroinsumos: 5000000, preventa: 3000000 },
    { mes: "Abr", sgr: 22000000, echeqs: 7500000, agroinsumos: 6000000, preventa: 3500000 },
    { mes: "May", sgr: 25000000, echeqs: 8000000, agroinsumos: 7000000, preventa: 5000000 },
  ],
}

// Datos de ejemplo para pagos próximos
const pagosPróximos = [
  {
    id: 1,
    tipo: "SGR",
    entidad: "Garantizar SGR",
    concepto: "Cuota 3/24",
    monto: 850000,
    fechaVencimiento: "2023-07-15",
    estado: "pendiente",
  },
  {
    id: 2,
    tipo: "Agroinsumos",
    entidad: "Sugar Trade",
    concepto: "Cuota 2/6",
    monto: 950000,
    fechaVencimiento: "2023-07-20",
    estado: "pendiente",
  },
  {
    id: 3,
    tipo: "SGR",
    entidad: "Campo Aval SGR",
    concepto: "Cuota 5/12",
    monto: 1200000,
    fechaVencimiento: "2023-07-25",
    estado: "pendiente",
  },
  {
    id: 4,
    tipo: "Pre-Venta",
    entidad: "Distribuidora Nacional",
    concepto: "Entrega programada",
    monto: 4750000,
    fechaVencimiento: "2023-08-10",
    estado: "programado",
  },
]

// Datos de ejemplo para notificaciones
const notificaciones = [
  {
    id: 1,
    tipo: "alerta",
    mensaje: "Vencimiento próximo: Cuota SGR Garantizar por $850.000 vence en 5 días",
    fecha: "2023-07-10",
    leida: false,
  },
  {
    id: 2,
    tipo: "info",
    mensaje: "Su solicitud de financiamiento para agroinsumos ha sido aprobada",
    fecha: "2023-07-08",
    leida: true,
  },
  {
    id: 3,
    tipo: "exito",
    mensaje: "Pago de cuota procesado correctamente: $950.000 a Sugar Trade",
    fecha: "2023-06-20",
    leida: true,
  },
  {
    id: 4,
    tipo: "alerta",
    mensaje: "Nueva tasa promocional disponible para descuento de eCheqs: 18.5%",
    fecha: "2023-07-05",
    leida: false,
  },
]

// Datos de ejemplo para certificados
const certificados = [
  {
    id: 1,
    tipo: "Depósito",
    numero: "CD-001-12345",
    cantidad: 500,
    valorEstimado: 12500000,
    estado: "disponible",
    fechaEmision: "2023-05-10",
    almacen: "Almacén Central",
  },
  {
    id: 2,
    tipo: "Depósito",
    numero: "CD-002-23456",
    cantidad: 300,
    valorEstimado: 7500000,
    estado: "en garantía",
    fechaEmision: "2023-06-05",
    almacen: "Almacén Norte",
  },
  {
    id: 3,
    tipo: "Warrant",
    numero: "WR-001-34567",
    cantidad: 200,
    valorEstimado: 5000000,
    estado: "disponible",
    fechaEmision: "2023-06-15",
    almacen: "Almacén Sur",
  },
]

export default function FinanciamientoDashboardPage() {
  const [activeTab, setActiveTab] = useState("resumen")

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Financiación</h1>
          <p className="text-muted-foreground">Visualice y gestione su posición financiera actual</p>
        </div>
        <Button onClick={() => (window.location.href = "/utilidades/financiacion")}>Volver a Financiación</Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Financiado</CardTitle>
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
            <div className="text-2xl font-bold">{formatCurrency(resumenFinanciamiento.totalFinanciado)}</div>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${(resumenFinanciamiento.totalFinanciado / resumenFinanciamiento.capacidadTotal) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((resumenFinanciamiento.totalFinanciado / resumenFinanciamiento.capacidadTotal) * 100).toFixed(1)}% de
              capacidad utilizada
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponible para Financiar</CardTitle>
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
            <div className="text-2xl font-bold">{formatCurrency(resumenFinanciamiento.totalDisponible)}</div>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${(resumenFinanciamiento.totalDisponible / resumenFinanciamiento.capacidadTotal) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((resumenFinanciamiento.totalDisponible / resumenFinanciamiento.capacidadTotal) * 100).toFixed(1)}% de
              capacidad disponible
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
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
            <div className="text-2xl font-bold">{formatCurrency(resumenFinanciamiento.totalPendiente)}</div>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500"
                style={{
                  width: `${(resumenFinanciamiento.totalPendiente / resumenFinanciamiento.totalFinanciado) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((resumenFinanciamiento.totalPendiente / resumenFinanciamiento.totalFinanciado) * 100).toFixed(1)}% del
              total financiado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Vencimiento</CardTitle>
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
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pagosPróximos[0].monto)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vence el{" "}
              {new Date(pagosPróximos[0].fechaVencimiento).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
            <p className="text-xs font-medium mt-1">
              {pagosPróximos[0].entidad} - {pagosPróximos[0].concepto}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="pagos">Calendario de Pagos</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="certificados">Certificados en Garantía</TabsTrigger>
        </TabsList>

        {/* Contenido de Resumen */}
        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Evolución del Financiamiento</CardTitle>
                <CardDescription>Histórico de financiamiento por tipo en los últimos 5 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <FinanciamientoChart data={resumenFinanciamiento.historico} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
                <CardDescription>Distribución actual del financiamiento por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resumenFinanciamiento.distribucion.map((item) => (
                    <div key={item.tipo} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.tipo}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(item.monto)} ({item.porcentaje}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            item.tipo === "SGR"
                              ? "bg-blue-500"
                              : item.tipo === "eCheqs"
                                ? "bg-green-500"
                                : item.tipo === "Agroinsumos"
                                  ? "bg-yellow-500"
                                  : "bg-purple-500"
                          }`}
                          style={{ width: `${item.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Vencimientos</CardTitle>
                <CardDescription>Pagos programados para los próximos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pagosPróximos.slice(0, 3).map((pago) => (
                    <div
                      key={pago.id}
                      className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{pago.entidad}</p>
                        <p className="text-sm text-muted-foreground">{pago.concepto}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pago.fechaVencimiento).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(pago.monto)}</p>
                        <Badge variant={pago.estado === "pendiente" ? "outline" : "secondary"} className="mt-1">
                          {pago.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contenido de Calendario de Pagos */}
        <TabsContent value="pagos">
          <CalendarioPagos pagos={pagosPróximos} />
        </TabsContent>

        {/* Contenido de Notificaciones */}
        <TabsContent value="notificaciones">
          <NotificacionesFinanciamiento notificaciones={notificaciones} />
        </TabsContent>

        {/* Contenido de Certificados en Garantía */}
        <TabsContent value="certificados">
          <ResumenCertificados certificados={certificados} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
