"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

// Datos de ejemplo para el gráfico
const generarDatosHistoricos = (dias = 30, volatilidad = 0.02) => {
  const datos = []
  let precio = 28000 // Base price adjusted to real market (~28k)
  let volumen = 1000

  const fechaFinal = new Date()
  const fechaInicial = new Date()
  fechaInicial.setDate(fechaFinal.getDate() - dias)

  for (let i = 0; i <= dias; i++) {
    const fecha = new Date(fechaInicial)
    fecha.setDate(fechaInicial.getDate() + i)

    // Simular cambios de precio con algo de volatilidad
    const cambio = (Math.random() - 0.5) * volatilidad * precio
    precio = Math.max(26000, Math.min(30000, precio + cambio))

    // Simular cambios en el volumen
    volumen = Math.max(500, Math.min(2000, volumen + (Math.random() - 0.5) * 300))

    datos.push({
      fecha: fecha.toISOString().split("T")[0],
      precio: Number.parseFloat(precio.toFixed(2)),
      volumen: Math.round(volumen),
    })
  }

  return datos
}

export default function GraficoPrecios() {
  const [periodo, setPeriodo] = useState("30d")
  const [datos, setDatos] = useState<any[]>([])
  const [zoom, setZoom] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Referencia para el contenedor del gráfico
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Función para obtener datos históricos de la API
  const obtenerDatosHistoricos = async (dias = 30) => {
    try {
      const token = localStorage.getItem("auth_token")
      const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {}

      // Mapear periodo a limit (aprox)
      let limit = 100
      if (dias <= 7) limit = 50
      else if (dias <= 30) limit = 100
      else if (dias <= 90) limit = 300
      else limit = 1000

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/mercado/productos/2/historial?limit=${limit}`, {
        headers
      })

      if (!response.ok) throw new Error("Error al obtener historial")

      const data = await response.json()

      // Transformar datos para el gráfico
      return data.map((item: any) => ({
        fecha: item.timestamp.split("T")[0],
        precio: item.precio / 20, // Convertir TN a Bolsa
        volumen: item.cantidad
      }))

    } catch (error) {
      console.error("Error fetching history:", error)
      return []
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true)
      const nuevosDatos = await obtenerDatosHistoricos(30)
      if (nuevosDatos.length > 0) {
        setDatos(nuevosDatos)
      }
      setCargando(false)
    }
    cargarDatos()
  }, [])

  // Función para cambiar el período
  const cambiarPeriodo = async (nuevoPeriodo: string) => {
    setCargando(true)
    const diasPorPeriodo: Record<string, number> = {
      "7d": 7, "30d": 30, "90d": 90, "180d": 180, "1y": 365,
    }
    const dias = diasPorPeriodo[nuevoPeriodo] || 30

    const nuevosDatos = await obtenerDatosHistoricos(dias)
    if (nuevosDatos.length > 0) {
      setDatos(nuevosDatos)
    }
    setPeriodo(nuevoPeriodo)
    setCargando(false)
  }

  // Función para formatear fechas en el eje X
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  // Función para formatear valores en el tooltip
  const formatearTooltip = (value: number, name: string) => {
    if (name === "precio") return `$${value.toFixed(2)}`
    if (name === "volumen") return value.toLocaleString()
    return value
  }

  // Función para acercar/alejar el gráfico
  const cambiarZoom = (factor: number) => {
    const nuevoZoom = Math.max(0.5, Math.min(2, zoom + factor))
    setZoom(nuevoZoom)
  }

  // Función para refrescar los datos
  const refrescarDatos = async () => {
    setCargando(true)
    const diasPorPeriodo: Record<string, number> = {
      "7d": 7, "30d": 30, "90d": 90, "180d": 180, "1y": 365,
    }
    const dias = diasPorPeriodo[periodo] || 30
    const nuevosDatos = await obtenerDatosHistoricos(dias)
    if (nuevosDatos.length > 0) {
      setDatos(nuevosDatos)
    }
    setCargando(false)
  }

  if (!isMounted) {
    return <div className="w-full h-[300px] bg-muted animate-pulse rounded-lg" />
  }

  return (
    <Card className="w-full h-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Gráfico de Precios</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={periodo} onValueChange={cambiarPeriodo}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 días</SelectItem>
                <SelectItem value="30d">30 días</SelectItem>
                <SelectItem value="90d">90 días</SelectItem>
                <SelectItem value="180d">6 meses</SelectItem>
                <SelectItem value="1y">1 año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => cambiarZoom(0.1)} title="Acercar">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => cambiarZoom(-0.1)} title="Alejar">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={refrescarDatos} disabled={cargando} title="Refrescar">
              <RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="precio" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="precio">Precio</TabsTrigger>
            <TabsTrigger value="volumen">Volumen</TabsTrigger>
          </TabsList>
          <TabsContent value="precio" className="h-[300px]">
            <div ref={chartContainerRef} style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={datos} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="fecha"
                    tickFormatter={formatearFecha}
                    tick={{ fill: "rgba(255,255,255,0.7)" }}
                    tickCount={Math.max(5, Math.floor(10 * zoom))}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fill: "rgba(255,255,255,0.7)" }}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip
                    formatter={formatearTooltip}
                    contentStyle={{ backgroundColor: "rgba(22, 27, 34, 0.9)", border: "1px solid #30363d" }}
                    labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="precio"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: "#16a34a", stroke: "#fff" }}
                    name="Precio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="volumen" className="h-[300px]">
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={datos} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="fecha"
                    tickFormatter={formatearFecha}
                    tick={{ fill: "rgba(255,255,255,0.7)" }}
                    tickCount={Math.max(5, Math.floor(10 * zoom))}
                  />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "rgba(255,255,255,0.7)" }} />
                  <Tooltip
                    formatter={formatearTooltip}
                    contentStyle={{ backgroundColor: "rgba(22, 27, 34, 0.9)", border: "1px solid #30363d" }}
                    labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volumen"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff" }}
                    name="Volumen"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
