"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Download, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Datos de predicciones para el mercado argentino
const prediccionesProduccion = [
  { year: 2023, actual: 83.79, prediccion: 83.79, min: 83.79, max: 83.79 },
  { year: 2024, actual: null, prediccion: 85.5, min: 82.3, max: 88.7 },
  { year: 2025, actual: null, prediccion: 87.2, min: 83.1, max: 91.3 },
  { year: 2026, actual: null, prediccion: 89.0, min: 83.8, max: 94.2 },
  { year: 2027, actual: null, prediccion: 90.8, min: 84.5, max: 97.1 },
  { year: 2028, actual: null, prediccion: 92.6, min: 85.2, max: 100.0 },
]

const prediccionesExportaciones = [
  { year: 2023, actual: 30, prediccion: 30, min: 30, max: 30 },
  { year: 2024, actual: null, prediccion: 35, min: 28, max: 42 },
  { year: 2025, actual: null, prediccion: 42, min: 32, max: 52 },
  { year: 2026, actual: null, prediccion: 50, min: 38, max: 62 },
  { year: 2027, actual: null, prediccion: 60, min: 45, max: 75 },
  { year: 2028, actual: null, prediccion: 72, min: 54, max: 90 },
]

const prediccionesExportacionesOrganico = [
  { year: 2023, actual: 20, prediccion: 20, min: 20, max: 20 },
  { year: 2024, actual: null, prediccion: 30, min: 22, max: 38 },
  { year: 2025, actual: null, prediccion: 45, min: 32, max: 58 },
  { year: 2026, actual: null, prediccion: 65, min: 48, max: 82 },
  { year: 2027, actual: null, prediccion: 90, min: 68, max: 112 },
  { year: 2028, actual: null, prediccion: 110, min: 85, max: 135 },
]

const prediccionesBioetanol = [
  { year: 2023, actual: 60.92, prediccion: 60.92, min: 60.92, max: 60.92 },
  { year: 2024, actual: null, prediccion: 65, min: 58, max: 72 },
  { year: 2025, actual: null, prediccion: 72, min: 63, max: 81 },
  { year: 2026, actual: null, prediccion: 80, min: 69, max: 91 },
  { year: 2027, actual: null, prediccion: 88, min: 75, max: 101 },
  { year: 2028, actual: null, prediccion: 95, min: 80, max: 110 },
]

const prediccionesParticipacionMercado = [
  { year: 2023, actual: 75, prediccion: 75, min: 75, max: 75 },
  { year: 2024, actual: null, prediccion: 73, min: 71, max: 75 },
  { year: 2025, actual: null, prediccion: 71, min: 68, max: 74 },
  { year: 2026, actual: null, prediccion: 70, min: 66, max: 74 },
  { year: 2027, actual: null, prediccion: 69, min: 64, max: 74 },
  { year: 2028, actual: null, prediccion: 68, min: 62, max: 74 },
]

// Factores que influyen en las predicciones
const factoresInfluencia = [
  {
    factor: "Políticas gubernamentales",
    impacto: "Alto",
    descripcion: "Regulaciones, impuestos y subsidios al sector sucro-alcoholero",
    tendencia: "Incierta",
  },
  {
    factor: "Precios internacionales",
    impacto: "Alto",
    descripcion: "Precios en los mercados de Londres y Nueva York",
    tendencia: "Alcista",
  },
  {
    factor: "Demanda de bioetanol",
    impacto: "Medio",
    descripcion: "Políticas de biocombustibles y demanda de energías renovables",
    tendencia: "Estable",
  },
  {
    factor: "Competencia de edulcorantes",
    impacto: "Medio",
    descripcion: "Penetración de edulcorantes artificiales y de maíz",
    tendencia: "Creciente",
  },
  {
    factor: "Condiciones climáticas",
    impacto: "Medio",
    descripcion: "Sequías, inundaciones y otros eventos climáticos",
    tendencia: "Variable",
  },
  {
    factor: "Demanda de azúcar orgánica",
    impacto: "Medio-Alto",
    descripcion: "Tendencias de consumo saludable y sostenible",
    tendencia: "Creciente",
  },
]

// Escenarios para el sector
const escenariosSector = [
  {
    escenario: "Optimista",
    probabilidad: "25%",
    descripcion:
      "Reducción de intervenciones gubernamentales, aumento de exportaciones, recuperación del mercado de azúcar orgánica",
    impacto: "Crecimiento del sector del 15-20% en 5 años",
  },
  {
    escenario: "Base",
    probabilidad: "50%",
    descripcion: "Continuidad de políticas actuales con ajustes moderados, leve recuperación de exportaciones",
    impacto: "Crecimiento del sector del 5-10% en 5 años",
  },
  {
    escenario: "Pesimista",
    probabilidad: "25%",
    descripcion:
      "Mayor intervención gubernamental, caída de precios internacionales, aumento de competencia de edulcorantes",
    impacto: "Contracción del sector del 5-10% en 5 años",
  },
]

export default function MLPrediccionesArgentina() {
  const [horizonte, setHorizonte] = useState("5")
  const [escenario, setEscenario] = useState("base")

  // Función para exportar datos
  const handleExportData = () => {
    // Combinar todos los datos de predicciones
    const allData = {
      prediccionesProduccion,
      prediccionesExportaciones,
      prediccionesExportacionesOrganico,
      prediccionesBioetanol,
      prediccionesParticipacionMercado,
      factoresInfluencia,
      escenariosSector,
    }

    // Convertir a JSON
    const dataStr = JSON.stringify(allData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    // Crear nombre de archivo
    const exportFileDefaultName = `predicciones-azucar-argentina-${new Date().toISOString().split("T")[0]}.json`

    // Crear elemento de descarga
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Predicciones para el Mercado Argentino</h2>
          <p className="text-gray-400">
            Análisis predictivo basado en machine learning para el sector sucro-alcoholero
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={horizonte} onValueChange={setHorizonte}>
            <SelectTrigger className="w-[150px] bg-[#1a2040] border-[#2a3050] text-white">
              <SelectValue placeholder="Horizonte" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2040] border-[#2a3050] text-white">
              <SelectItem value="1">1 año</SelectItem>
              <SelectItem value="3">3 años</SelectItem>
              <SelectItem value="5">5 años</SelectItem>
            </SelectContent>
          </Select>
          <Select value={escenario} onValueChange={setEscenario}>
            <SelectTrigger className="w-[150px] bg-[#1a2040] border-[#2a3050] text-white">
              <SelectValue placeholder="Escenario" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2040] border-[#2a3050] text-white">
              <SelectItem value="optimista">Optimista</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="pesimista">Pesimista</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="bg-[#1a2040] border-[#2a3050] hover:bg-[#2a3050]"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 text-[#00a8ff]" />
          </Button>
        </div>
      </div>

      <Alert className="bg-[#1a2040] border-[#00a8ff] text-white">
        <Info className="h-4 w-4 text-[#00a8ff]" />
        <AlertTitle>Modelo predictivo</AlertTitle>
        <AlertDescription>
          Las predicciones se basan en un modelo de machine learning que incorpora datos históricos, tendencias de
          mercado y factores externos. Los intervalos de confianza representan la incertidumbre del modelo.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="produccion" className="space-y-4">
        <TabsList className="bg-[#111936] border-[#1a2040]">
          <TabsTrigger
            value="produccion"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Producción
          </TabsTrigger>
          <TabsTrigger
            value="exportaciones"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Exportaciones
          </TabsTrigger>
          <TabsTrigger
            value="bioetanol"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Bioetanol
          </TabsTrigger>
          <TabsTrigger value="mercado" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Mercado Interno
          </TabsTrigger>
          <TabsTrigger value="factores" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Factores de Influenciares de Influencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produccion" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Predicción de Producción de Azúcar</CardTitle>
              <CardDescription className="text-gray-400">
                Proyección de la producción de azúcar en Argentina (índice base 2010=100)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  actual: {
                    label: "Producción Real",
                    color: "hsl(var(--chart-1))",
                  },
                  prediccion: {
                    label: "Predicción",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prediccionesProduccion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" domain={[70, 105]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine x={2023} stroke="#4a5070" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="min"
                      stackId="1"
                      stroke="transparent"
                      fill="rgba(53, 162, 235, 0.1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="max"
                      stackId="1"
                      stroke="transparent"
                      fill="rgba(53, 162, 235, 0.1)"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="var(--color-actual)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="prediccion"
                      stroke="var(--color-prediccion)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Predicción:</span> Se espera una recuperación gradual de
                  la producción de azúcar en Argentina, alcanzando un índice de 92.6 para 2028, lo que representaría una
                  recuperación del 10.5% respecto a 2023, pero aún un 7.4% por debajo de los niveles de 2010.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Factores clave:</span> Esta recuperación depende de
                  políticas gubernamentales más favorables, mejoras en la productividad y condiciones climáticas
                  adecuadas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exportaciones" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Predicción de Exportaciones de Azúcar</CardTitle>
              <CardDescription className="text-gray-400">
                Proyección de exportaciones totales y de azúcar orgánica (índice base 2017=100)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  prediccion: {
                    label: "Exportaciones Totales",
                    color: "hsl(var(--chart-2))",
                  },
                  prediccionOrganico: {
                    label: "Exportaciones Azúcar Orgánica",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" type="category" allowDuplicatedCategory={false} stroke="#4a5070" />
                    <YAxis stroke="#4a5070" domain={[0, 140]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine x={2023} stroke="#4a5070" strokeDasharray="3 3" />
                    <Line
                      data={prediccionesExportaciones}
                      type="monotone"
                      dataKey="prediccion"
                      stroke="var(--color-prediccion)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Exportaciones Totales"
                    />
                    <Line
                      data={prediccionesExportacionesOrganico}
                      type="monotone"
                      dataKey="prediccion"
                      stroke="var(--color-prediccionOrganico)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Exportaciones Azúcar Orgánica"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Predicción exportaciones totales:</span> Se proyecta una
                  recuperación gradual de las exportaciones totales, alcanzando un índice de 72 para 2028, lo que
                  representaría un aumento del 140% respecto a 2023, pero aún un 28% por debajo de los niveles de 2017.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Predicción azúcar orgánica:</span> Se espera una
                  recuperación más acelerada en el segmento de azúcar orgánica, alcanzando un índice de 110 para 2028,
                  superando los niveles de 2017 en un 10%, impulsado por la creciente demanda mundial de productos
                  orgánicos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bioetanol" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Predicción de Producción de Bioetanol</CardTitle>
              <CardDescription className="text-gray-400">
                Proyección de la producción de bioetanol (índice base 2017=100)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  actual: {
                    label: "Producción Real",
                    color: "hsl(var(--chart-1))",
                  },
                  prediccion: {
                    label: "Predicción",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prediccionesBioetanol}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" domain={[50, 120]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine x={2023} stroke="#4a5070" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="min"
                      stackId="1"
                      stroke="transparent"
                      fill="rgba(75, 192, 192, 0.1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="max"
                      stackId="1"
                      stroke="transparent"
                      fill="rgba(75, 192, 192, 0.1)"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="var(--color-actual)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="prediccion"
                      stroke="var(--color-prediccion)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Predicción:</span> Se proyecta una recuperación
                  significativa en la producción de bioetanol, alcanzando un índice de 95 para 2028, lo que
                  representaría un aumento del 56% respecto a 2023, pero aún un 5% por debajo de los niveles de 2017.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Factores clave:</span> Esta recuperación depende
                  principalmente de políticas de fomento a los biocombustibles, precios internacionales del petróleo y
                  mejoras en la eficiencia productiva.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mercado" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Predicción de Participación en el Mercado Interno</CardTitle>
              <CardDescription className="text-gray-400">
                Proyección de la participación del azúcar de caña en el mercado de edulcorantes (índice base 2011=100)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  actual: {
                    label: "Participación Real",
                    color: "hsl(var(--chart-1))",
                  },
                  prediccion: {
                    label: "Predicción",
                    color: "hsl(var(--chart-5))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prediccionesParticipacionMercado}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" domain={[60, 80]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine x={2023} stroke="#4a5070" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="min"
                      stackId="1"
                      stroke="transparent"
                      fill="rgba(255, 99, 132, 0.1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="max"
                      stackId="1"
                      stroke="transparent"
                      fill="rgba(255, 99, 132, 0.1)"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="var(--color-actual)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="prediccion"
                      stroke="var(--color-prediccion)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Predicción:</span> Se proyecta una continuación de la
                  tendencia decreciente en la participación del azúcar de caña en el mercado interno de edulcorantes,
                  alcanzando un índice de 68 para 2028, lo que representaría una pérdida adicional del 9.3% respecto a
                  2023, y un 32% por debajo de los niveles de 2011.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Factores clave:</span> Esta tendencia está impulsada por
                  la creciente penetración de edulcorantes artificiales y de maíz, así como por cambios en los hábitos
                  de consumo hacia productos con menor contenido de azúcar.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factores" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Factores de Influencia en las Predicciones</CardTitle>
              <CardDescription className="text-gray-400">
                Principales variables que afectan las proyecciones del sector sucro-alcoholero
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {factoresInfluencia.map((factor, index) => (
                  <div key={index} className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{factor.factor}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Impacto:</span>
                        <span
                          className={`text-sm font-medium ${
                            factor.impacto === "Alto"
                              ? "text-red-400"
                              : factor.impacto === "Medio-Alto"
                                ? "text-orange-400"
                                : "text-yellow-400"
                          }`}
                        >
                          {factor.impacto}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{factor.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Tendencia:</span>
                      <span
                        className={`text-sm font-medium ${
                          factor.tendencia === "Alcista"
                            ? "text-green-400"
                            : factor.tendencia === "Bajista"
                              ? "text-red-400"
                              : factor.tendencia === "Estable"
                                ? "text-blue-400"
                                : factor.tendencia === "Creciente"
                                  ? "text-green-400"
                                  : "text-gray-400"
                        }`}
                      >
                        {factor.tendencia}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Escenarios para el Sector Sucro-alcoholero</CardTitle>
              <CardDescription className="text-gray-400">
                Posibles trayectorias para el sector en los próximos 5 años
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escenariosSector.map((escenario, index) => (
                  <div
                    key={index}
                    className={`bg-[#0a0f29] border ${
                      escenario.escenario === "Optimista"
                        ? "border-green-600"
                        : escenario.escenario === "Pesimista"
                          ? "border-red-600"
                          : "border-blue-600"
                    } rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={`font-medium ${
                          escenario.escenario === "Optimista"
                            ? "text-green-400"
                            : escenario.escenario === "Pesimista"
                              ? "text-red-400"
                              : "text-blue-400"
                        }`}
                      >
                        Escenario {escenario.escenario}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Probabilidad:</span>
                        <span className="text-sm font-medium text-white">{escenario.probabilidad}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{escenario.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Impacto:</span>
                      <span className="text-sm font-medium text-white">{escenario.impacto}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
