"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, AlertCircle } from "lucide-react"
import { useArgentinaMarketData } from "@/hooks/use-argentina-market-data"
import { useBrazilMarketData } from "@/hooks/use-brazil-market-data"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function ComparativaRegional() {
  const { data: argentinaData, loading: argentinaLoading, error: argentinaError } = useArgentinaMarketData()
  const { data: brazilData, loading: brazilLoading, error: brazilError } = useBrazilMarketData()
  const [activeTab, setActiveTab] = useState("produccion")

  if (argentinaLoading || brazilLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (argentinaError || brazilError || !argentinaData || !brazilData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {argentinaError || brazilError || "No se pudieron cargar los datos de comparación regional"}
        </AlertDescription>
      </Alert>
    )
  }

  // Preparar datos para la comparación
  const produccionComparativa = [
    {
      name: "2022/23",
      Argentina: 78.6, // Índice de producción (2010 = 100)
      Brasil: 38775.3, // Miles de toneladas
    },
    {
      name: "2023/24",
      Argentina: 83.79,
      Brasil: 45678.7,
    },
  ]

  // Datos para el gráfico de participación en el mercado global
  const participacionGlobal = [
    { name: "Brasil", value: 46292.2 },
    { name: "India", value: 33000 },
    { name: "Tailandia", value: 11000 },
    { name: "China", value: 10000 },
    { name: "EE.UU.", value: 8000 },
    { name: "México", value: 6000 },
    { name: "Pakistán", value: 5500 },
    { name: "Argentina", value: 2100 },
    { name: "Otros", value: 28000 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#F44336", "#9C27B0"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Comparativa Regional: Argentina vs Brasil</CardTitle>
              <CardDescription>
                Análisis comparativo de los principales indicadores del mercado azucarero
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              <InfoIcon className="h-3.5 w-3.5 mr-1" />
              Actualizado: 2024
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="produccion" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-[#111936] border-[#1a2040]">
              <TabsTrigger
                value="produccion"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Producción
              </TabsTrigger>
              <TabsTrigger
                value="exportacion"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Exportación
              </TabsTrigger>
              <TabsTrigger
                value="participacion"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Participación Global
              </TabsTrigger>
              <TabsTrigger
                value="tendencias"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Tendencias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="produccion" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Producción de Azúcar Comparativa</CardTitle>
                    <CardDescription>
                      Comparación de la producción de azúcar entre Argentina y Brasil (2022-2024)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={produccionComparativa} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" stroke="#FF6B6B" />
                          <YAxis yAxisId="right" orientation="right" stroke="#0088FE" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="Argentina" fill="#FF6B6B" name="Argentina (Índice 2010=100)" />
                          <Bar yAxisId="right" dataKey="Brasil" fill="#0088FE" name="Brasil (Miles de toneladas)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-sm text-gray-400">
                      <p>
                        <strong>Nota:</strong> Los datos de Argentina se muestran como un índice (2010=100), mientras
                        que los datos de Brasil se muestran en miles de toneladas.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="exportacion" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Exportaciones de Argentina</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={argentinaData.exportacionAzucar}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="exportacion" stroke="#FF6B6B" name="Exportación Total" />
                          <Line type="monotone" dataKey="organico" stroke="#82CA9D" name="Azúcar Orgánico" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Ranking de Exportadores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={argentinaData.rankingExportadores}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis reversed domain={[1, 14]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="ranking" stroke="#FF6B6B" name="Posición en Ranking Mundial" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-sm text-gray-400">
                      <p>
                        <strong>Nota:</strong> Argentina ha caído del puesto 4 al 12 en el ranking mundial de
                        exportadores de azúcar.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="participacion" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Participación en el Mercado Global (2024/25)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={participacionGlobal}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          >
                            {participacionGlobal.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} mil toneladas`, "Producción"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis de Participación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold">Brasil</h3>
                      <p className="text-sm text-gray-400">
                        Brasil continúa siendo el mayor productor mundial de azúcar, con una producción estimada de 46.3
                        millones de toneladas para la zafra 2024/25, lo que representa aproximadamente el 20% de la
                        producción mundial.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold">Argentina</h3>
                      <p className="text-sm text-gray-400">
                        Argentina representa menos del 1% de la producción mundial, con aproximadamente 2.1 millones de
                        toneladas. Sin embargo, es un actor importante en el mercado de azúcar orgánico, aunque ha
                        perdido posiciones en los últimos años.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold">Tendencia Regional</h3>
                      <p className="text-sm text-gray-400">
                        Mientras Brasil muestra un crecimiento sostenido en su producción de azúcar (+1.3% en 2024/25),
                        Argentina ha experimentado una recuperación moderada (+6.22% en 2023) después de años de
                        contracción.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tendencias" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendencias Comparativas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-bold text-lg">Mercado Brasileño</h3>
                        <ul className="space-y-2 list-disc pl-5">
                          <li className="text-sm">
                            <span className="font-medium">Área plantada:</span> Aumento del 4.1% en 2024/25
                          </li>
                          <li className="text-sm">
                            <span className="font-medium">Productividad:</span> Disminución del 4.1% en 2024/25
                          </li>
                          <li className="text-sm">
                            <span className="font-medium">Producción total:</span> Disminución del 3.8% en 2024/25
                          </li>
                          <li className="text-sm">
                            <span className="font-medium">Producción de azúcar:</span> Aumento del 1.3% en 2024/25
                          </li>
                          <li className="text-sm">
                            <span className="font-medium">ATR:</span> Aumento del 1.1% en 2024/25
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-bold text-lg">Mercado Argentino</h3>
                        <ul className="space-y-2 list-disc pl-5">
                          <li className="text-sm">
                            <span className="font-medium">Producción de azúcar:</span> Aumento del 6.22% en 2023, pero
                            -16.21% vs 2010
                          </li>
                          <li className="text-sm">
                            <span className="font-medium">Exportaciones:</span> Caída del 57.19% en 2023
                          </li>
                          <li className="text-sm">
                            <span className="font-medium">Bioetanol:</span> Caída del 19.08% en producción y 31.13% en
                            entregas vs 2017
                          </li>
                          <li className="text-sm">
                            <span className="font-medium">Participación en mercado interno:</span> Pérdida del 25% desde
                            2011
                          </li>
                          <li className="text-sm">
                            <span className="font-medium">Superficie de caña:</span> Aumento del 11.6% en 2023
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <h3 className="font-bold text-lg mb-4">Conclusiones Comparativas</h3>
                      <p className="text-sm text-gray-400">
                        Brasil mantiene su posición dominante en el mercado global, con una producción estable y
                        creciente de azúcar, a pesar de una ligera disminución en la productividad. Argentina, por su
                        parte, muestra signos de recuperación en la producción, pero enfrenta desafíos significativos en
                        exportaciones y participación de mercado. La diferencia de escala entre ambos mercados es
                        notable: Brasil produce aproximadamente 22 veces más azúcar que Argentina.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Mientras Brasil ha diversificado su producción entre azúcar y etanol, manteniendo un equilibrio
                        que le permite adaptarse a las condiciones del mercado, Argentina ha experimentado una
                        contracción en ambos sectores, con una caída significativa en la producción de bioetanol y en
                        las exportaciones de azúcar.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
