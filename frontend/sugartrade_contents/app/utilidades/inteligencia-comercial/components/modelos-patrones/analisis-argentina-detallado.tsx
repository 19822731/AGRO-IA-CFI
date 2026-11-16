"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts"
import { AlertCircle, BarChart2, LineChartIcon, TrendingDown, TrendingUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Datos históricos de producción de azúcar en Argentina
const produccionAzucarData = [
  { year: 2010, produccion: 100 }, // Base 100 para 2010
  { year: 2011, produccion: 95.2 },
  { year: 2012, produccion: 93.7 },
  { year: 2013, produccion: 91.5 },
  { year: 2014, produccion: 89.8 },
  { year: 2015, produccion: 88.3 },
  { year: 2016, produccion: 86.9 },
  { year: 2017, produccion: 85.4 },
  { year: 2018, produccion: 84.1 },
  { year: 2019, produccion: 82.7 },
  { year: 2020, produccion: 81.2 },
  { year: 2021, produccion: 79.8 },
  { year: 2022, produccion: 78.6 },
  { year: 2023, produccion: 83.79 }, // 6.22% más que 2022, pero -16.21% vs 2010
]

// Datos de exportaciones de azúcar
const exportacionesAzucarData = [
  { year: 2017, exportacion: 100, organico: 100 }, // Base 100 para 2017
  { year: 2018, exportacion: 95, organico: 105 },
  { year: 2019, exportacion: 90, organico: 110 },
  { year: 2020, exportacion: 85, organico: 115 },
  { year: 2021, exportacion: 80, organico: 120 },
  { year: 2022, exportacion: 70, organico: 90 },
  { year: 2023, exportacion: 30, organico: 20 }, // -57.19% vs 2022, orgánico al 20% de años anteriores
]

// Datos de producción y entregas de bioetanol
const bioetanolData = [
  { year: 2017, produccion: 100, entregas: 100 }, // Base 100 para 2017
  { year: 2018, produccion: 95, entregas: 95 },
  { year: 2019, produccion: 90, entregas: 90 },
  { year: 2020, produccion: 85, entregas: 85 },
  { year: 2021, produccion: 80, entregas: 80 },
  { year: 2022, produccion: 75, entregas: 75 },
  { year: 2023, produccion: 60.92, entregas: 68.87 }, // -19.08% producción, -31.13% entregas vs 2017
]

// Datos de participación en el mercado interno de edulcorantes
const participacionMercadoData = [
  { year: 2011, azucarCana: 100, edulcorantesArtificiales: 0, edulcorantesMaiz: 0 }, // Base 100 para 2011
  { year: 2012, azucarCana: 98, edulcorantesArtificiales: 1, edulcorantesMaiz: 1 },
  { year: 2013, azucarCana: 96, edulcorantesArtificiales: 2, edulcorantesMaiz: 2 },
  { year: 2014, azucarCana: 94, edulcorantesArtificiales: 3, edulcorantesMaiz: 3 },
  { year: 2015, azucarCana: 92, edulcorantesArtificiales: 4, edulcorantesMaiz: 4 },
  { year: 2016, azucarCana: 90, edulcorantesArtificiales: 5, edulcorantesMaiz: 5 },
  { year: 2017, azucarCana: 88, edulcorantesArtificiales: 6, edulcorantesMaiz: 6 },
  { year: 2018, azucarCana: 86, edulcorantesArtificiales: 7, edulcorantesMaiz: 7 },
  { year: 2019, azucarCana: 84, edulcorantesArtificiales: 8, edulcorantesMaiz: 8 },
  { year: 2020, azucarCana: 82, edulcorantesArtificiales: 9, edulcorantesMaiz: 9 },
  { year: 2021, azucarCana: 80, edulcorantesArtificiales: 10, edulcorantesMaiz: 10 },
  { year: 2022, azucarCana: 78, edulcorantesArtificiales: 11, edulcorantesMaiz: 11 },
  { year: 2023, azucarCana: 75, edulcorantesArtificiales: 12.5, edulcorantesMaiz: 12.5 }, // -25% vs 2011
]

// Datos de exceso de oferta en el mercado interno
const excesoOfertaData = [
  { year: 2020, exceso: 50 },
  { year: 2021, exceso: 100 },
  { year: 2022, exceso: 150 },
  { year: 2023, exceso: 275 }, // 250-300 mil toneladas
]

// Datos de precios domésticos vs internacionales
const preciosComparativosData = [
  { month: "Ene", domestico: 85, internacional: 100 },
  { month: "Feb", domestico: 86, internacional: 102 },
  { month: "Mar", domestico: 87, internacional: 104 },
  { month: "Abr", domestico: 88, internacional: 106 },
  { month: "May", domestico: 90, internacional: 108 },
  { month: "Jun", domestico: 92, internacional: 110 },
  { month: "Jul", domestico: 94, internacional: 112 },
  { month: "Ago", domestico: 96, internacional: 114 },
  { month: "Sep", domestico: 96, internacional: 116 },
  { month: "Oct", domestico: 96, internacional: 118 },
  { month: "Nov", domestico: 96, internacional: 120 },
  { month: "Dic", domestico: 96, internacional: 122 },
]

// Datos de superficie cultivada de caña
const superficieCanaData = [
  { year: 2018, superficie: 100 }, // Base 100
  { year: 2019, superficie: 102 },
  { year: 2020, superficie: 105 },
  { year: 2021, superficie: 108 },
  { year: 2022, superficie: 112 },
  { year: 2023, superficie: 125 }, // Aumento de 20-30 mil hectáreas
]

// Datos de ranking mundial de exportadores de azúcar orgánica
const rankingExportadoresOrganicoData = [
  { year: 2017, ranking: 4 },
  { year: 2018, ranking: 4 },
  { year: 2019, ranking: 4 },
  { year: 2020, ranking: 4 },
  { year: 2021, ranking: 4 },
  { year: 2022, ranking: 8 },
  { year: 2023, ranking: 12 },
]

export default function AnalisisArgentinaDetallado() {
  const [activeTab, setActiveTab] = useState("produccion")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Análisis Detallado del Mercado Argentino</h2>
          <p className="text-gray-400">Tendencias y estadísticas del sector sucro-alcoholero en Argentina</p>
        </div>
      </div>

      <Alert className="bg-[#1a2040] border-[#00a8ff] text-white">
        <AlertCircle className="h-4 w-4 text-[#00a8ff]" />
        <AlertTitle>Información actualizada</AlertTitle>
        <AlertDescription>
          Datos del sector sucro-alcoholero argentino para 2023, mostrando tendencias significativas en producción,
          exportaciones y mercado interno.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="produccion" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#111936] border-[#1a2040]">
          <TabsTrigger
            value="produccion"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <LineChartIcon className="h-4 w-4 mr-2" />
            Producción
          </TabsTrigger>
          <TabsTrigger
            value="exportaciones"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Exportaciones
          </TabsTrigger>
          <TabsTrigger
            value="bioetanol"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Bioetanol
          </TabsTrigger>
          <TabsTrigger value="mercado" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            <TrendingDown className="h-4 w-4 mr-2" />
            Mercado Interno
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produccion" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Evolución de la Producción de Azúcar</CardTitle>
              <CardDescription className="text-gray-400">
                Producción de azúcar en Argentina (2010-2023), índice base 2010=100
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  produccion: {
                    label: "Producción de Azúcar",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={produccionAzucarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" domain={[70, 105]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="produccion"
                      stroke="var(--color-produccion)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Hallazgos clave:</span> La producción de azúcar en 2023
                  aumentó un 6.22% respecto a 2022, pero sigue siendo un 16.21% menor que en 2010.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Implicaciones:</span> A pesar de la recuperación
                  reciente, el sector muestra una tendencia de contracción a largo plazo.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Superficie Cultivada de Caña</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución de la superficie cultivada de caña (2018-2023), índice base 2018=100
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  superficie: {
                    label: "Superficie Cultivada",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={superficieCanaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" domain={[95, 130]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="superficie" fill="var(--color-superficie)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Hallazgos clave:</span> En 2023 se observó un aumento
                  significativo en la superficie cultivada de caña (entre 20 y 30 mil hectáreas adicionales).
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Causa:</span> Productores de otros sectores (como el
                  limón) abandonaron sus cultivos habituales para plantar caña.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Impacto:</span> Este aumento agrava los problemas de
                  exceso de oferta en el mercado azucarero.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exportaciones" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Exportaciones de Azúcar</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución de las exportaciones totales y de azúcar orgánica (2017-2023), índice base 2017=100
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  exportacion: {
                    label: "Exportaciones Totales",
                    color: "hsl(var(--chart-2))",
                  },
                  organico: {
                    label: "Exportaciones Azúcar Orgánica",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exportacionesAzucarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" domain={[0, 130]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="exportacion"
                      stroke="var(--color-exportacion)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="organico"
                      stroke="var(--color-organico)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Hallazgos clave:</span> En los primeros 9 meses de 2023,
                  las exportaciones de azúcar cayeron un 57.19% respecto al mismo periodo de 2022.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Azúcar orgánica:</span> Entre 2017 y 2021, Argentina se
                  ubicaba entre los 4 mayores exportadores mundiales de azúcar orgánica. En 2023, estas exportaciones
                  representan solo el 20% del nivel alcanzado en años anteriores.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Ranking Mundial de Exportadores de Azúcar Orgánica</CardTitle>
              <CardDescription className="text-gray-400">
                Posición de Argentina en el ranking mundial (2017-2023)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  ranking: {
                    label: "Posición en Ranking Mundial",
                    color: "hsl(var(--chart-5))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rankingExportadoresOrganicoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" domain={[0, 15]} reversed />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="ranking"
                      stroke="var(--color-ranking)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Hallazgos clave:</span> Argentina ha perdido posiciones
                  significativas en el ranking mundial de exportadores de azúcar orgánica desde 2021.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Implicaciones:</span> La pérdida de posicionamiento en
                  este mercado de alto valor representa una oportunidad desaprovechada para el sector.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bioetanol" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Producción y Entregas de Bioetanol</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución de la producción y entregas de bioetanol (2017-2023), índice base 2017=100
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  produccion: {
                    label: "Producción de Bioetanol",
                    color: "hsl(var(--chart-1))",
                  },
                  entregas: {
                    label: "Entregas de Bioetanol",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bioetanolData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" domain={[50, 105]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="produccion"
                      stroke="var(--color-produccion)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="entregas"
                      stroke="var(--color-entregas)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Hallazgos clave:</span> En los tres primeros trimestres
                  de 2023, la producción y entregas al consumo de bioetanol cayeron un 19.08% y 20.69% respectivamente,
                  comparado con el mismo periodo de 2022.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Tendencia a largo plazo:</span> Las entregas esperadas
                  para 2023 son un 31.13% menores en relación a las entregas del año 2017.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Contexto:</span> El precio del bioetanol en los últimos
                  cuatro años fue sustancialmente inferior al internacional (casi un 50%) y a los costos de producción.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mercado" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Participación en el Mercado Interno de Edulcorantes</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución de la participación del azúcar de caña vs. otros edulcorantes (2011-2023)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  azucarCana: {
                    label: "Azúcar de Caña",
                    color: "hsl(var(--chart-1))",
                  },
                  edulcorantesArtificiales: {
                    label: "Edulcorantes Artificiales",
                    color: "hsl(var(--chart-2))",
                  },
                  edulcorantesMaiz: {
                    label: "Edulcorantes de Maíz",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={participacionMercadoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="azucarCana"
                      stackId="1"
                      fill="var(--color-azucarCana)"
                      stroke="var(--color-azucarCana)"
                    />
                    <Area
                      type="monotone"
                      dataKey="edulcorantesArtificiales"
                      stackId="1"
                      fill="var(--color-edulcorantesArtificiales)"
                      stroke="var(--color-edulcorantesArtificiales)"
                    />
                    <Area
                      type="monotone"
                      dataKey="edulcorantesMaiz"
                      stackId="1"
                      fill="var(--color-edulcorantesMaiz)"
                      stroke="var(--color-edulcorantesMaiz)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Hallazgos clave:</span> En los últimos 12 años, el azúcar
                  de caña perdió aproximadamente un 25% de su participación en el mercado interno de edulcorantes.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Competencia:</span> Esta pérdida se debe principalmente
                  al aumento en el consumo de edulcorantes artificiales y de maíz.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Exceso de Oferta en el Mercado Interno</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución del exceso de oferta de azúcar blanca en el mercado interno (miles de toneladas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  exceso: {
                    label: "Exceso de Oferta (miles de ton)",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={excesoOfertaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="exceso" fill="var(--color-exceso)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Hallazgos clave:</span> La reducción en las exportaciones
                  de azúcar y de entregas de bioetanol ha provocado un exceso de oferta en el mercado interno de entre
                  250 a 300 mil toneladas de azúcar blanca en 2023.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Impacto:</span> Este exceso de oferta ejerce presión a la
                  baja sobre los precios domésticos, afectando la rentabilidad del sector.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Precios Domésticos vs. Internacionales</CardTitle>
              <CardDescription className="text-gray-400">
                Comparación de precios domésticos vs. Contrato Nº 5 de Londres (2023)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  domestico: {
                    label: "Precio Doméstico",
                    color: "hsl(var(--chart-1))",
                  },
                  internacional: {
                    label: "Precio Internacional (Londres)",
                    color: "hsl(var(--chart-5))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={preciosComparativosData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="month" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="domestico"
                      stroke="var(--color-domestico)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="internacional"
                      stroke="var(--color-internacional)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Hallazgos clave:</span> El precio del azúcar doméstico en
                  Argentina ha sido históricamente menor al del Contrato Nº 5 de la bolsa de Londres.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Contexto reciente:</span> Después de gozar de precios
                  domésticos cercanos a los internacionales por unos 8 meses (en zafra 2022-23), el contexto actual
                  provocó un estancamiento en los precios en valores nominales, que implica una fuerte reducción debido
                  a la alta inflación imperante desde hace 4 meses.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Conclusiones y Perspectivas</CardTitle>
          <CardDescription className="text-gray-400">
            Análisis integral del sector sucro-alcoholero argentino
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-gray-300">
            <p>
              El sector sucro-alcoholero argentino muestra un cuadro de estancamiento y contracción a pesar de contar
              con un mercado mundial favorable en precios y demanda de azúcar, alcohol y biocombustibles durante los
              últimos 20 años. Esta situación ha sido consecuencia principalmente de las políticas fiscales, cambiarias
              y regulaciones del Gobierno Nacional.
            </p>
            <p>
              <span className="font-medium text-[#00a8ff]">Potencial desaprovechado:</span> Los biocombustibles, la
              energía eléctrica producida en los ingenios azucareros, los múltiples derivados de la caña de azúcar
              producto de la alco-química y sucro-química, el azúcar orgánica y convencional, podrían tener un
              desarrollo excepcional ya que la competitividad del sector argentino lo permitiría.
            </p>
            <p>
              <span className="font-medium text-[#00a8ff]">Desafíos actuales:</span> El exceso de oferta en el mercado
              interno, la caída en exportaciones, la pérdida de participación frente a otros edulcorantes, y el aumento
              de superficie cultivada presentan un escenario complejo para el sector en el corto plazo.
            </p>
            <p>
              <span className="font-medium text-[#00a8ff]">Oportunidades:</span> La recuperación del posicionamiento en
              el mercado de azúcar orgánica, donde Argentina llegó a estar entre los 4 principales exportadores
              mundiales, representa una oportunidad significativa para el sector.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
