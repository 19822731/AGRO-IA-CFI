"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  ComposedChart,
  Line,
} from "recharts"
import { Download, BarChart2, PieChartIcon, TrendingUp, Maximize2, Minimize2, Filter } from "lucide-react"

// Datos de producción mundial por año
const globalProductionData = [
  { year: "2018/19", value: 179.7 },
  { year: "2019/20", value: 171.5 },
  { year: "2020/21", value: 179.9 },
  { year: "2021/22", value: 181.1 },
  { year: "2022/23", value: 182.3 },
  { year: "2023/24", value: 187.2 },
  { year: "2024/25", value: 184.8 },
]

// Datos de producción por país para 2023/24
const countryProductionData = [
  { name: "Brasil", value: 41.5, color: "#00a8ff" },
  { name: "India", value: 33.0, color: "#ff9500" },
  { name: "UE", value: 15.5, color: "#00c853" },
  { name: "Tailandia", value: 11.0, color: "#d500f9" },
  { name: "China", value: 10.5, color: "#ff3d00" },
  { name: "EE.UU.", value: 8.2, color: "#2979ff" },
  { name: "México", value: 6.0, color: "#ffea00" },
  { name: "Pakistán", value: 5.8, color: "#76ff03" },
  { name: "Rusia", value: 5.5, color: "#f50057" },
  { name: "Otros", value: 50.2, color: "#8d8d8d" },
]

// Datos de producción por país y año
const countryYearlyProductionData = [
  { year: "2020/21", Brasil: 38.5, India: 31.2, UE: 14.5, Tailandia: 7.6, China: 10.5, EEUU: 7.7 },
  { year: "2021/22", Brasil: 36.0, India: 35.8, UE: 14.8, Tailandia: 10.1, China: 10.0, EEUU: 8.0 },
  { year: "2022/23", Brasil: 37.4, India: 34.2, UE: 15.0, Tailandia: 10.5, China: 10.2, EEUU: 8.1 },
  { year: "2023/24", Brasil: 41.5, India: 33.0, UE: 15.5, Tailandia: 11.0, China: 10.5, EEUU: 8.2 },
  { year: "2024/25", Brasil: 40.0, India: 31.5, UE: 15.3, Tailandia: 11.5, China: 10.7, EEUU: 8.0 },
]

// Datos de producción vs consumo
const productionVsConsumptionData = [
  { year: "2020/21", produccion: 179.9, consumo: 174.5, balance: 5.4 },
  { year: "2021/22", produccion: 181.1, consumo: 176.8, balance: 4.3 },
  { year: "2022/23", produccion: 182.3, consumo: 178.5, balance: 3.8 },
  { year: "2023/24", produccion: 187.2, consumo: 180.2, balance: 7.0 },
  { year: "2024/25", produccion: 184.8, consumo: 182.0, balance: 2.8 },
]

export default function ProduccionInteractiva() {
  const [activeTab, setActiveTab] = useState("global")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedYear, setSelectedYear] = useState("2023/24")

  // Función para exportar datos
  const handleExportData = () => {
    let dataToExport

    switch (activeTab) {
      case "global":
        dataToExport = globalProductionData
        break
      case "paises":
        dataToExport = countryProductionData
        break
      case "comparativa":
        dataToExport = countryYearlyProductionData
        break
      case "balance":
        dataToExport = productionVsConsumptionData
        break
      default:
        dataToExport = []
    }

    const dataStr = JSON.stringify(dataToExport, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `sugar-production-${activeTab}-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Función para alternar pantalla completa
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Función para renderizar el sector activo del gráfico de torta
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

    return (
      <g>
        <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill="#fff" fontSize={16}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#00a8ff" fontSize={20}>
          {value.toFixed(1)}
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill="#8d8d8d" fontSize={14}>
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  // Filtrar datos de países por año seleccionado
  const filteredCountryData = countryYearlyProductionData.find((item) => item.year === selectedYear)

  // Preparar datos para el gráfico de barras de países
  const prepareCountryBarData = () => {
    if (!filteredCountryData) return []

    return Object.entries(filteredCountryData)
      .filter(([key]) => key !== "year")
      .map(([country, value]) => ({
        country,
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }

  const countryBarData = prepareCountryBarData()

  return (
    <Card
      className={`bg-[#111936] border-[#1a2040] ${isFullscreen ? "fixed inset-0 z-50 m-0 rounded-none overflow-auto" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl">Evolución de la Producción de Azúcar</CardTitle>
            <CardDescription className="text-gray-400">
              Análisis interactivo de la producción mundial y por país
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-[#1a2040] border-[#2a3050] hover:bg-[#2a3050]"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-[#00a8ff]" />
              ) : (
                <Maximize2 className="h-4 w-4 text-[#00a8ff]" />
              )}
            </Button>
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
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="global" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0a0f29] w-full">
            <TabsTrigger value="global" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
              <BarChart2 className="h-4 w-4 mr-2" />
              Producción Global
            </TabsTrigger>
            <TabsTrigger value="paises" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Distribución por País
            </TabsTrigger>
            <TabsTrigger
              value="comparativa"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <Filter className="h-4 w-4 mr-2" />
              Comparativa por País
            </TabsTrigger>
            <TabsTrigger
              value="balance"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Balance Mundial
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Producción Global */}
          <TabsContent value="global" className="mt-4">
            <ChartContainer
              config={{
                value: {
                  label: "Producción (mill. ton)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={globalProductionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                  <XAxis dataKey="year" stroke="#4a5070" tick={{ fill: "#4a5070" }} />
                  <YAxis stroke="#4a5070" tick={{ fill: "#4a5070" }} domain={[160, 190]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[4, 4, 0, 0]}
                    label={{
                      position: "top",
                      fill: "#fff",
                      fontSize: 12,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-4 bg-[#0a0f29] p-3 rounded-lg">
              <p className="text-sm text-white font-medium mb-2">Análisis de Tendencia</p>
              <p className="text-xs text-gray-300">
                La producción mundial de azúcar muestra una tendencia creciente desde 2019/20 hasta 2023/24, con un
                incremento acumulado del 9.2%. Sin embargo, se proyecta una ligera disminución para 2024/25,
                principalmente debido a reducciones esperadas en Brasil e India. Esta tendencia refleja los ciclos
                naturales de producción y las condiciones climáticas variables en las principales regiones productoras.
              </p>
            </div>
          </TabsContent>

          {/* Pestaña de Distribución por País */}
          <TabsContent value="paises" className="mt-4">
            <ChartContainer className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={countryProductionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                  >
                    {countryProductionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value.toFixed(1)} mill. ton`, "Producción"]}
                    labelFormatter={(name) => `País: ${name}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
              {countryProductionData.map((country, index) => (
                <div
                  key={index}
                  className="bg-[#0a0f29] p-2 rounded-lg flex items-center"
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: country.color }}></div>
                  <div>
                    <p className="text-xs text-white">{country.name}</p>
                    <p className="text-xs text-gray-400">{country.value} mill. ton</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-[#0a0f29] p-3 rounded-lg">
              <p className="text-sm text-white font-medium mb-2">Análisis de Distribución</p>
              <p className="text-xs text-gray-300">
                Brasil e India dominan la producción mundial de azúcar, representando aproximadamente el 40% del total.
                La concentración de la producción en estos dos países hace que el mercado sea particularmente sensible a
                las condiciones climáticas y políticas en estas regiones. La Unión Europea, Tailandia y China completan
                el top 5 de productores mundiales.
              </p>
            </div>
          </TabsContent>

          {/* Pestaña de Comparativa por País */}
          <TabsContent value="comparativa" className="mt-4">
            <div className="flex justify-between items-center mb-4 bg-[#0a0f29] p-3 rounded-lg">
              <p className="text-sm text-white">Seleccione un año para ver la distribución por país:</p>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] bg-[#1a2040] border-[#2a3050] text-white">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2040] border-[#2a3050] text-white">
                  {countryYearlyProductionData.map((item) => (
                    <SelectItem key={item.year} value={item.year}>
                      {item.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ChartContainer
              config={{
                value: {
                  label: "Producción (mill. ton)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                  <XAxis dataKey="country" stroke="#4a5070" tick={{ fill: "#4a5070" }} />
                  <YAxis stroke="#4a5070" tick={{ fill: "#4a5070" }} domain={[0, 45]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[4, 4, 0, 0]}
                    label={{
                      position: "top",
                      fill: "#fff",
                      fontSize: 12,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-4 bg-[#0a0f29] p-3 rounded-lg">
              <p className="text-sm text-white font-medium mb-2">Evolución por País</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-white mb-1">Brasil</p>
                  <p className="text-xs text-gray-300">
                    Muestra una recuperación significativa en 2023/24 tras dos temporadas de menor producción, pero se
                    proyecta una ligera disminución para 2024/25.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white mb-1">India</p>
                  <p className="text-xs text-gray-300">
                    Alcanzó un pico en 2021/22 y desde entonces ha mostrado una tendencia a la baja, que se espera
                    continúe en 2024/25 debido a condiciones climáticas adversas.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white mb-1">Tailandia</p>
                  <p className="text-xs text-gray-300">
                    Muestra una tendencia de recuperación constante desde 2020/21, con proyecciones positivas para
                    2024/25, consolidando su posición como tercer exportador mundial.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de Balance Mundial */}
          <TabsContent value="balance" className="mt-4">
            <ChartContainer
              config={{
                produccion: {
                  label: "Producción (mill. ton)",
                  color: "hsl(var(--chart-1))",
                },
                consumo: {
                  label: "Consumo (mill. ton)",
                  color: "hsl(var(--chart-2))",
                },
                balance: {
                  label: "Balance (mill. ton)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={productionVsConsumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                  <XAxis dataKey="year" stroke="#4a5070" tick={{ fill: "#4a5070" }} />
                  <YAxis stroke="#4a5070" tick={{ fill: "#4a5070" }} domain={[170, 190]} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#4a5070"
                    tick={{ fill: "#4a5070" }}
                    domain={[0, 10]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="produccion" fill="var(--color-produccion)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="consumo" fill="var(--color-consumo)" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--color-balance)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-balance)", r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-4 bg-[#0a0f29] p-3 rounded-lg">
              <p className="text-sm text-white font-medium mb-2">Análisis de Balance</p>
              <p className="text-xs text-gray-300">
                El mercado mundial del azúcar ha mantenido un superávit constante desde 2020/21, con un pico
                significativo en 2023/24. Sin embargo, se proyecta una reducción importante del superávit para 2024/25,
                lo que podría generar presiones alcistas en los precios. El consumo muestra un crecimiento constante y
                sostenido, mientras que la producción presenta mayor volatilidad.
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#1a2040] p-2 rounded-lg">
                  <p className="text-xs text-white mb-1">Implicaciones para Precios</p>
                  <p className="text-xs text-gray-300">
                    La reducción proyectada del superávit en 2024/25 podría generar un entorno de precios más firmes,
                    especialmente si se materializan riesgos climáticos en las principales regiones productoras.
                  </p>
                </div>
                <div className="bg-[#1a2040] p-2 rounded-lg">
                  <p className="text-xs text-white mb-1">Factores a Monitorear</p>
                  <p className="text-xs text-gray-300">
                    Condiciones climáticas en Brasil e India, políticas de exportación en India y Tailandia, y la
                    evolución del consumo en mercados emergentes como Indonesia y China.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
