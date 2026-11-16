"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Thermometer, AlertTriangle, Calendar, Download } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { ErrorDisplay } from "@/components/error-display"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default function PatronesClimaticos() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [climatePatterns, setClimatePatterns] = useState(null)
  const [selectedStation, setSelectedStation] = useState("SMT")
  const [activeTab, setActiveTab] = useState("promedios-mensuales")

  // Cargar datos de patrones climáticos
  useEffect(() => {
    const fetchClimatePatterns = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/climate-patterns?station=${selectedStation}`)

        if (!response.ok) {
          throw new Error(`Error al cargar patrones climáticos: ${response.status}`)
        }

        const data = await response.json()
        setClimatePatterns(data)
        setError(null)
      } catch (err) {
        console.error("Error al cargar patrones climáticos:", err)
        setError("No se pudieron cargar los patrones climáticos. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchClimatePatterns()
  }, [selectedStation])

  // Renderizar componente de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
      </div>
    )
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        title="Error al cargar patrones climáticos"
        action={<Button onClick={() => window.location.reload()}>Reintentar</Button>}
      />
    )
  }

  // Si no hay datos
  if (!climatePatterns) {
    return (
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardContent className="p-6">
          <p className="text-gray-400">No hay datos de patrones climáticos disponibles.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Patrones Climáticos y Cultivo</h2>
          <p className="text-sm text-gray-400">Análisis de patrones climáticos históricos para la región de Tucumán</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-[200px] bg-[#0a0f29] border-[#1a2040]">
              <SelectValue placeholder="Seleccionar estación" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f29] border-[#1a2040]">
              <SelectItem value="SMT">San Miguel de Tucumán</SelectItem>
              <SelectItem value="FAM">Famaillá</SelectItem>
              <SelectItem value="MON">Monteros</SelectItem>
              <SelectItem value="CON">Concepción</SelectItem>
              <SelectItem value="TAF">Tafí Viejo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
      </div>

      <Card className="bg-[#111936] border-[#1a2040]">
        <CardContent className="p-6">
          <p className="text-white">Componente de Patrones Climáticos cargado correctamente.</p>
          <p className="text-gray-400 mt-2">Estación seleccionada: {selectedStation}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="promedios-mensuales" onValueChange={setActiveTab}>
        <TabsList className="bg-[#0a0f29]">
          <TabsTrigger
            value="promedios-mensuales"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <Thermometer className="h-4 w-4 mr-2" />
            Promedios Mensuales
          </TabsTrigger>
          <TabsTrigger
            value="resumen-estacional"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Resumen Estacional
          </TabsTrigger>
          <TabsTrigger
            value="eventos-extremos"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Eventos Extremos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promedios-mensuales" className="space-y-6 mt-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Temperatura Mensual</CardTitle>
              <CardDescription className="text-gray-400">Promedios históricos de temperatura (°C)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Datos de temperatura mensual cargados correctamente.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumen-estacional" className="space-y-6 mt-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Resumen Estacional</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Datos de resumen estacional cargados correctamente.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eventos-extremos" className="space-y-6 mt-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Eventos Extremos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Datos de eventos extremos cargados correctamente.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
