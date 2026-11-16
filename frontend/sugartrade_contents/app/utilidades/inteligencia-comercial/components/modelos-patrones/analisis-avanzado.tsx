"use client"

import type React from "react"

import { useState } from "react"
import { useModeloAnalisis } from "@/hooks/use-modelo-analisis"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorDisplay } from "@/components/error-display"
import ErrorBoundary from "@/components/error-boundary"
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
import { Brain, LineChart, BarChart } from "lucide-react"
import MLPredicciones from "./ml-predicciones"

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

// Componentes auxiliares para simplificar el código principal
function LoadingState() {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando análisis avanzado...</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <p className="text-center text-muted-foreground">No hay datos disponibles</p>
      </CardContent>
    </Card>
  )
}

// Componente principal
interface AnalisisAvanzadoProps {
  mercadoInicial?: string
}

export default function AnalisisAvanzado({ mercadoInicial = "contract11" }: AnalisisAvanzadoProps) {
  const [mercadoSeleccionado, setMercadoSeleccionado] = useState(mercadoInicial)
  const { analisis, loading, error, refetch } = useModeloAnalisis(mercadoSeleccionado)

  // Función para manejar errores en el componente
  const handleComponentError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error("Error en componente AnalisisAvanzado:", error, errorInfo)
    // Aquí se podría implementar un servicio de registro de errores
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} title="Error al cargar el análisis" />
  }

  if (!analisis) {
    return <EmptyState />
  }

  // Validar datos críticos antes de renderizar
  if (!analisis.predicciones || !Array.isArray(analisis.predicciones) || analisis.predicciones.length === 0) {
    return <ErrorDisplay error="Los datos de predicciones no son válidos" variant="outline" title="Datos incompletos" />
  }

  // Preparar datos para gráficos de predicciones
  const prediccionesData = {
    labels: analisis.predicciones.map((p) => p.fecha),
    datasets: [
      {
        label: "Predicción",
        data: analisis.predicciones.map((p) => p.prediccion),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.3,
      },
      {
        label: "Límite Superior",
        data: analisis.predicciones.map((p) => p.intervalo[1]),
        borderColor: "rgba(53, 162, 235, 0.3)",
        backgroundColor: "transparent",
        borderDash: [5, 5],
        pointRadius: 0,
      },
      {
        label: "Límite Inferior",
        data: analisis.predicciones.map((p) => p.intervalo[0]),
        borderColor: "rgba(53, 162, 235, 0.3)",
        backgroundColor: "transparent",
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  }

  // Preparar datos para gráfico de estacionalidad
  const estacionalidadData = {
    labels: analisis.analisisHistorico?.estacionalidad?.map((e) => e.periodo) || [],
    datasets: [
      {
        label: "Tendencia Estacional (%)",
        data: analisis.analisisHistorico?.estacionalidad?.map((e) => e.tendenciaEstacional) || [],
        backgroundColor:
          analisis.analisisHistorico?.estacionalidad?.map((e) =>
            e.tendenciaEstacional > 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)",
          ) || [],
        borderColor:
          analisis.analisisHistorico?.estacionalidad?.map((e) =>
            e.tendenciaEstacional > 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
          ) || [],
        borderWidth: 1,
      },
    ],
  }

  // Preparar datos para gráfico de correlaciones
  const correlacionesData = {
    labels: [
      ...(analisis.analisisHistorico?.correlaciones?.mercados?.map((c) => c.mercado) || []),
      ...(analisis.analisisHistorico?.correlaciones?.commodities?.map((c) => c.commodity) || []),
      ...(analisis.analisisHistorico?.correlaciones?.factoresEconomicos?.map((c) => c.factor) || []),
    ],
    datasets: [
      {
        label: "Correlación",
        data: [
          ...(analisis.analisisHistorico?.correlaciones?.mercados?.map((c) => c.correlacion) || []),
          ...(analisis.analisisHistorico?.correlaciones?.commodities?.map((c) => c.correlacion) || []),
          ...(analisis.analisisHistorico?.correlaciones?.factoresEconomicos?.map((c) => c.correlacion) || []),
        ],
        backgroundColor: [
          ...(analisis.analisisHistorico?.correlaciones?.mercados?.map((c) =>
            c.correlacion > 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)",
          ) || []),
          ...(analisis.analisisHistorico?.correlaciones?.commodities?.map((c) =>
            c.correlacion > 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)",
          ) || []),
          ...(analisis.analisisHistorico?.correlaciones?.factoresEconomicos?.map((c) =>
            c.correlacion > 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)",
          ) || []),
        ],
        borderColor: [
          ...(analisis.analisisHistorico?.correlaciones?.mercados?.map((c) =>
            c.correlacion > 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
          ) || []),
          ...(analisis.analisisHistorico?.correlaciones?.commodities?.map((c) =>
            c.correlacion > 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
          ) || []),
          ...(analisis.analisisHistorico?.correlaciones?.factoresEconomicos?.map((c) =>
            c.correlacion > 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
          ) || []),
        ],
        borderWidth: 1,
      },
    ],
  }

  // Opciones comunes para los gráficos
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  }

  // Renderizar el componente principal dentro de un ErrorBoundary
  return (
    <ErrorBoundary onError={handleComponentError}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Análisis Avanzado y Predicción</h2>
            <p className="text-gray-400">Modelos predictivos y análisis avanzado del mercado azucarero</p>
          </div>
        </div>

        <Tabs defaultValue="predicciones" className="space-y-4">
          <TabsList className="bg-[#111936] border-[#1a2040]">
            <TabsTrigger
              value="predicciones"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <Brain className="h-4 w-4 mr-2" />
              Predicciones
            </TabsTrigger>
            <TabsTrigger
              value="tendencias"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <LineChart className="h-4 w-4 mr-2" />
              Tendencias
            </TabsTrigger>
            <TabsTrigger
              value="recomendaciones"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <BarChart className="h-4 w-4 mr-2" />
              Recomendaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predicciones" className="space-y-4">
            <MLPredicciones />

            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Modelos Adicionales</CardTitle>
                <CardDescription className="text-gray-400">Funcionalidades en desarrollo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 opacity-70">
                    <h3 className="text-white font-medium mb-2">Análisis de Sentimiento</h3>
                    <p className="text-sm text-gray-400">
                      Análisis de noticias y redes sociales para predecir movimientos del mercado
                    </p>
                  </div>
                  <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 opacity-70">
                    <h3 className="text-white font-medium mb-2">Modelos Climáticos</h3>
                    <p className="text-sm text-gray-400">
                      Predicción de impactos climáticos en la producción de azúcar
                    </p>
                  </div>
                  <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 opacity-70">
                    <h3 className="text-white font-medium mb-2">Análisis de Riesgo</h3>
                    <p className="text-sm text-gray-400">Evaluación de riesgos en diferentes escenarios de mercado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tendencias" className="space-y-4">
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Análisis de Tendencias</CardTitle>
                <CardDescription className="text-gray-400">En desarrollo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">El análisis detallado de tendencias estará disponible próximamente.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recomendaciones" className="space-y-4">
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recomendaciones Comerciales</CardTitle>
                <CardDescription className="text-gray-400">En desarrollo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Las recomendaciones comerciales basadas en análisis avanzado estarán disponibles próximamente.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}
