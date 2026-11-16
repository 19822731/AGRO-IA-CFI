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
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts"
import { Download, Info, TrendingUp, BarChart3, PieChartIcon, ArrowUpDown } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useGlobalSugarMarketHistory } from "@/hooks/use-global-sugar-market-history"

// Colores para los gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658", "#8dd1e1"]
const COUNTRY_COLORS = {
  brazil: "#0088FE",
  india: "#00C49F",
  thailand: "#FFBB28",
  eu: "#FF8042",
  usa: "#8884D8",
  china: "#82ca9d",
  mexico: "#ffc658",
  australia: "#8dd1e1",
  pakistan: "#a4de6c",
  indonesia: "#d0ed57",
  bangladesh: "#83a6ed",
  others: "#8a8a8a",
}

export default function AnalisisHistoricoGlobal() {
  const { data, loading, error } = useGlobalSugarMarketHistory()
  const [activeTab, setActiveTab] = useState("produccion")
  const [viewType, setViewType] = useState("grafico")
  const [selectedYear, setSelectedYear] = useState("2023/24")

  if (loading)
    return <div className="text-center p-8 text-white">Cargando datos históricos del mercado mundial del azúcar...</div>
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>
  if (!data) return <div className="text-center p-8 text-white">No hay datos disponibles</div>

  // Función para exportar datos
  const handleExportData = () => {
    // Convertir a JSON
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    // Crear nombre de archivo
    const exportFileDefaultName = `mercado-mundial-azucar-historico-${new Date().toISOString().split("T")[0]}.json`

    // Crear elemento de descarga
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Preparar datos para gráficos de producción
  const prepareProductionChartData = () => {
    return data.production.map((year) => ({
      year: year.year,
      total: year.total,
      brazil: year.brazil,
      india: year.india,
      thailand: year.thailand,
      eu: year.eu,
      usa: year.usa,
      china: year.china,
      mexico: year.mexico,
      pakistan: year.pakistan || 0,
      australia: year.australia || 0,
      others: year.others,
    }))
  }

  // Preparar datos para gráficos de consumo
  const prepareConsumptionChartData = () => {
    return data.consumption.map((year) => ({
      year: year.year,
      total: year.total,
      india: year.india,
      eu: year.eu,
      china: year.china,
      usa: year.usa,
      brazil: year.brazil,
      indonesia: year.indonesia,
      others: year.others,
    }))
  }

  // Preparar datos para gráficos de exportaciones
  const prepareExportsChartData = () => {
    return data.exports.map((year) => ({
      year: year.year,
      total: year.total,
      brazil: year.brazil,
      thailand: year.thailand,
      india: year.india,
      australia: year.australia,
      eu: year.eu,
      others: year.others,
    }))
  }

  // Preparar datos para gráficos de importaciones
  const prepareImportsChartData = () => {
    return data.imports.map((year) => ({
      year: year.year,
      total: year.total,
      indonesia: year.indonesia,
      china: year.china,
      usa: year.usa,
      bangladesh: year.bangladesh,
      eu: year.eu,
      others: year.others,
    }))
  }

  // Preparar datos para gráficos de precios
  const preparePricesChartData = () => {
    return data.prices.map((year) => ({
      year: year.year,
      rawSugarNY11: year.rawSugarNY11,
      whiteSugarLondon5: year.whiteSugarLondon5,
      usRawSugar: year.usRawSugar,
      usRefinedSugar: year.usRefinedSugar,
      euRefinedSugar: year.euRefinedSugar,
    }))
  }

  // Preparar datos para gráficos de pastel
  const preparePieChartData = (type: string) => {
    let selectedData
    let countries: string[] = []

    switch (type) {
      case "produccion":
        selectedData = data.production.find((item) => item.year === selectedYear)
        if (!selectedData) return []
        countries = ["brazil", "india", "thailand", "eu", "usa", "china", "mexico"]
        if (selectedData.pakistan) countries.push("pakistan")
        if (selectedData.australia) countries.push("australia")
        countries.push("others")
        return countries.map((country) => ({
          name: country.charAt(0).toUpperCase() + country.slice(1),
          value: selectedData[country as keyof typeof selectedData] as number,
          color: COUNTRY_COLORS[country as keyof typeof COUNTRY_COLORS],
        }))
      case "consumo":
        selectedData = data.consumption.find((item) => item.year === selectedYear)
        if (!selectedData) return []
        countries = ["india", "eu", "china", "usa", "brazil", "indonesia", "others"]
        return countries.map((country) => ({
          name: country.charAt(0).toUpperCase() + country.slice(1),
          value: selectedData[country as keyof typeof selectedData] as number,
          color: COUNTRY_COLORS[country as keyof typeof COUNTRY_COLORS],
        }))
      case "exportaciones":
        selectedData = data.exports.find((item) => item.year === selectedYear)
        if (!selectedData) return []
        countries = ["brazil", "thailand", "india", "australia", "eu", "others"]
        return countries.map((country) => ({
          name: country.charAt(0).toUpperCase() + country.slice(1),
          value: selectedData[country as keyof typeof selectedData] as number,
          color: COUNTRY_COLORS[country as keyof typeof COUNTRY_COLORS],
        }))
      case "importaciones":
        selectedData = data.imports.find((item) => item.year === selectedYear)
        if (!selectedData) return []
        countries = ["indonesia", "china", "usa", "bangladesh", "eu", "others"]
        return countries.map((country) => ({
          name: country.charAt(0).toUpperCase() + country.slice(1),
          value: selectedData[country as keyof typeof selectedData] as number,
          color: COUNTRY_COLORS[country as keyof typeof COUNTRY_COLORS],
        }))
      default:
        return []
    }
  }

  // Preparar datos para gráficos de balance
  const prepareBalanceChartData = () => {
    return data.production.map((prod, index) => {
      const cons = data.consumption[index]
      return {
        year: prod.year,
        produccion: prod.total,
        consumo: cons.total,
        balance: prod.total - cons.total,
      }
    })
  }

  // Preparar datos para tabla
  const prepareTableData = (type: string) => {
    switch (type) {
      case "produccion":
        return data.production
      case "consumo":
        return data.consumption
      case "exportaciones":
        return data.exports
      case "importaciones":
        return data.imports
      case "precios":
        return data.prices
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Análisis Histórico del Mercado Mundial del Azúcar</h2>
          <p className="text-gray-400">Datos históricos de producción, consumo, comercio y precios (2020-2024)</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px] bg-[#1a2040] border-[#2a3050] text-white">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2040] border-[#2a3050] text-white">
              {data.production.map((year) => (
                <SelectItem key={year.year} value={year.year}>
                  {year.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-[150px] bg-[#1a2040] border-[#2a3050] text-white">
              <SelectValue placeholder="Vista" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2040] border-[#2a3050] text-white">
              <SelectItem value="grafico">Gráfico</SelectItem>
              <SelectItem value="tabla">Tabla</SelectItem>
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
        <AlertTitle>Fuente de datos</AlertTitle>
        <AlertDescription>
          Datos basados en informes "Sugar: World Markets and Trade" del USDA (Departamento de Agricultura de los
          Estados Unidos) y otras fuentes oficiales. Última actualización: {data.lastUpdate}.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="produccion" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="bg-[#111936] border-[#1a2040]">
          <TabsTrigger
            value="produccion"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Producción
          </TabsTrigger>
          <TabsTrigger value="consumo" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            <BarChart3 className="h-4 w-4 mr-2" />
            Consumo
          </TabsTrigger>
          <TabsTrigger value="comercio" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Comercio
          </TabsTrigger>
          <TabsTrigger value="precios" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            <TrendingUp className="h-4 w-4 mr-2" />
            Precios
          </TabsTrigger>
          <TabsTrigger value="balance" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Balance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produccion" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Producción Mundial de Azúcar</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución de la producción por principales países (millones de toneladas métricas, valor bruto)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewType === "grafico" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ChartContainer
                    config={{
                      total: {
                        label: "Total Mundial",
                        color: "hsl(var(--chart-1))",
                      },
                      brazil: {
                        label: "Brasil",
                        color: "hsl(var(--chart-2))",
                      },
                      india: {
                        label: "India",
                        color: "hsl(var(--chart-3))",
                      },
                      thailand: {
                        label: "Tailandia",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={prepareProductionChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                        <XAxis dataKey="year" stroke="#4a5070" />
                        <YAxis stroke="#4a5070" domain={[0, "auto"]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="var(--color-total)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Bar dataKey="brazil" fill="var(--color-brazil)" />
                        <Bar dataKey="india" fill="var(--color-india)" />
                        <Bar dataKey="thailand" fill="var(--color-thailand)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Producción",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={preparePieChartData("produccion")}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {preparePieChartData("produccion").map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-[#0a0f29] text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Año
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Brasil
                        </th>
                        <th scope="col" className="px-6 py-3">
                          India
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Tailandia
                        </th>
                        <th scope="col" className="px-6 py-3">
                          UE
                        </th>
                        <th scope="col" className="px-6 py-3">
                          EE.UU.
                        </th>
                        <th scope="col" className="px-6 py-3">
                          China
                        </th>
                        <th scope="col" className="px-6 py-3">
                          México
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Otros
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prepareTableData("produccion").map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-[#111936]" : "bg-[#0a0f29]"}>
                          <td className="px-6 py-4 font-medium">{row.year}</td>
                          <td className="px-6 py-4">{row.total.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.brazil.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.india.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.thailand.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.eu.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.usa.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.china.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.mexico.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.others.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Tendencia:</span> La producción mundial de azúcar ha
                  mostrado fluctuaciones en los últimos años, con un mínimo de 174.5 millones de toneladas en 2021/22 y
                  un máximo de 185.4 millones en 2023/24.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Principales productores:</span> Brasil e India se
                  mantienen como los mayores productores mundiales, seguidos por Tailandia, la Unión Europea y China.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Factores clave:</span> Las condiciones climáticas,
                  especialmente en Brasil, han sido determinantes en las fluctuaciones de la producción global.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumo" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Consumo Mundial de Azúcar</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución del consumo por principales países (millones de toneladas métricas, valor bruto)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewType === "grafico" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ChartContainer
                    config={{
                      total: {
                        label: "Total Mundial",
                        color: "hsl(var(--chart-1))",
                      },
                      india: {
                        label: "India",
                        color: "hsl(var(--chart-2))",
                      },
                      eu: {
                        label: "UE",
                        color: "hsl(var(--chart-3))",
                      },
                      china: {
                        label: "China",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={prepareConsumptionChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                        <XAxis dataKey="year" stroke="#4a5070" />
                        <YAxis stroke="#4a5070" domain={[0, "auto"]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="var(--color-total)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Bar dataKey="india" fill="var(--color-india)" />
                        <Bar dataKey="eu" fill="var(--color-eu)" />
                        <Bar dataKey="china" fill="var(--color-china)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Consumo",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={preparePieChartData("consumo")}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {preparePieChartData("consumo").map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-[#0a0f29] text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Año
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3">
                          India
                        </th>
                        <th scope="col" className="px-6 py-3">
                          UE
                        </th>
                        <th scope="col" className="px-6 py-3">
                          China
                        </th>
                        <th scope="col" className="px-6 py-3">
                          EE.UU.
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Brasil
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Indonesia
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Otros
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prepareTableData("consumo").map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-[#111936]" : "bg-[#0a0f29]"}>
                          <td className="px-6 py-4 font-medium">{row.year}</td>
                          <td className="px-6 py-4">{row.total.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.india.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.eu.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.china.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.usa.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.brazil.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.indonesia.toFixed(1)}</td>
                          <td className="px-6 py-4">{row.others.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Tendencia:</span> El consumo mundial de azúcar muestra un
                  crecimiento constante, aumentando de 171.0 millones de toneladas en 2020/21 a 179.7 millones
                  proyectados para 2024/25.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Principales consumidores:</span> India es el mayor
                  consumidor mundial, seguido por la Unión Europea, China y Estados Unidos.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Factores clave:</span> El crecimiento poblacional y el
                  aumento del poder adquisitivo en mercados emergentes como India e Indonesia impulsan el incremento del
                  consumo global.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comercio" className="space-y-4">
          <Tabs defaultValue="exportaciones" className="space-y-4">
            <TabsList className="bg-[#0a0f29] border-[#1a2040]">
              <TabsTrigger
                value="exportaciones"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Exportaciones
              </TabsTrigger>
              <TabsTrigger
                value="importaciones"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Importaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="exportaciones" className="space-y-4">
              <Card className="bg-[#111936] border-[#1a2040]">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Exportaciones Mundiales de Azúcar</CardTitle>
                  <CardDescription className="text-gray-400">
                    Evolución de las exportaciones por principales países (millones de toneladas métricas, valor bruto)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viewType === "grafico" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ChartContainer
                        config={{
                          total: {
                            label: "Total Mundial",
                            color: "hsl(var(--chart-1))",
                          },
                          brazil: {
                            label: "Brasil",
                            color: "hsl(var(--chart-2))",
                          },
                          thailand: {
                            label: "Tailandia",
                            color: "hsl(var(--chart-3))",
                          },
                          india: {
                            label: "India",
                            color: "hsl(var(--chart-4))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={prepareExportsChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                            <XAxis dataKey="year" stroke="#4a5070" />
                            <YAxis stroke="#4a5070" domain={[0, "auto"]} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="total"
                              stroke="var(--color-total)"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Bar dataKey="brazil" fill="var(--color-brazil)" />
                            <Bar dataKey="thailand" fill="var(--color-thailand)" />
                            <Bar dataKey="india" fill="var(--color-india)" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <ChartContainer
                        config={{
                          value: {
                            label: "Exportaciones",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={preparePieChartData("exportaciones")}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {preparePieChartData("exportaciones").map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase bg-[#0a0f29] text-gray-400">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              Año
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Total
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Brasil
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Tailandia
                            </th>
                            <th scope="col" className="px-6 py-3">
                              India
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Australia
                            </th>
                            <th scope="col" className="px-6 py-3">
                              UE
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Otros
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {prepareTableData("exportaciones").map((row, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-[#111936]" : "bg-[#0a0f29]"}>
                              <td className="px-6 py-4 font-medium">{row.year}</td>
                              <td className="px-6 py-4">{row.total.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.brazil.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.thailand.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.india.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.australia.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.eu.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.others.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-4 space-y-2 text-sm text-gray-300">
                    <p>
                      <span className="font-medium text-[#00a8ff]">Tendencia:</span> Las exportaciones mundiales han
                      fluctuado entre 57.7 y 64.4 millones de toneladas en el período analizado.
                    </p>
                    <p>
                      <span className="font-medium text-[#00a8ff]">Principal exportador:</span> Brasil domina el mercado
                      de exportación, representando aproximadamente el 45% del total mundial.
                    </p>
                    <p>
                      <span className="font-medium text-[#00a8ff]">Factores clave:</span> Las condiciones climáticas en
                      Brasil y Tailandia, así como las políticas de exportación de India, son determinantes en el
                      comercio mundial.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="importaciones" className="space-y-4">
              <Card className="bg-[#111936] border-[#1a2040]">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Importaciones Mundiales de Azúcar</CardTitle>
                  <CardDescription className="text-gray-400">
                    Evolución de las importaciones por principales países (millones de toneladas métricas, valor bruto)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viewType === "grafico" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ChartContainer
                        config={{
                          total: {
                            label: "Total Mundial",
                            color: "hsl(var(--chart-1))",
                          },
                          indonesia: {
                            label: "Indonesia",
                            color: "hsl(var(--chart-2))",
                          },
                          china: {
                            label: "China",
                            color: "hsl(var(--chart-3))",
                          },
                          usa: {
                            label: "EE.UU.",
                            color: "hsl(var(--chart-4))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={prepareImportsChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                            <XAxis dataKey="year" stroke="#4a5070" />
                            <YAxis stroke="#4a5070" domain={[0, "auto"]} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="total"
                              stroke="var(--color-total)"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Bar dataKey="indonesia" fill="var(--color-indonesia)" />
                            <Bar dataKey="china" fill="var(--color-china)" />
                            <Bar dataKey="usa" fill="var(--color-usa)" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <ChartContainer
                        config={{
                          value: {
                            label: "Importaciones",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={preparePieChartData("importaciones")}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {preparePieChartData("importaciones").map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase bg-[#0a0f29] text-gray-400">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              Año
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Total
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Indonesia
                            </th>
                            <th scope="col" className="px-6 py-3">
                              China
                            </th>
                            <th scope="col" className="px-6 py-3">
                              EE.UU.
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Bangladesh
                            </th>
                            <th scope="col" className="px-6 py-3">
                              UE
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Otros
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {prepareTableData("importaciones").map((row, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-[#111936]" : "bg-[#0a0f29]"}>
                              <td className="px-6 py-4 font-medium">{row.year}</td>
                              <td className="px-6 py-4">{row.total.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.indonesia.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.china.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.usa.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.bangladesh.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.eu.toFixed(1)}</td>
                              <td className="px-6 py-4">{row.others.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-4 space-y-2 text-sm text-gray-300">
                    <p>
                      <span className="font-medium text-[#00a8ff]">Tendencia:</span> Las importaciones mundiales han
                      fluctuado en línea con las exportaciones, reflejando la dinámica del mercado global.
                    </p>
                    <p>
                      <span className="font-medium text-[#00a8ff]">Principales importadores:</span> China e Indonesia
                      son los mayores importadores, seguidos por Estados Unidos y Bangladesh.
                    </p>
                    <p>
                      <span className="font-medium text-[#00a8ff]">Factores clave:</span> El crecimiento económico en
                      Asia y las políticas de seguridad alimentaria influyen significativamente en los patrones de
                      importación.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="precios" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Precios Mundiales del Azúcar</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución de los precios en diferentes mercados (2020-2024)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewType === "grafico" ? (
                <div className="space-y-6">
                  <ChartContainer
                    config={{
                      rawSugarNY11: {
                        label: "Azúcar Crudo (NY N°11, ¢/lb)",
                        color: "hsl(var(--chart-1))",
                      },
                      usRawSugar: {
                        label: "Azúcar Crudo EE.UU. (¢/lb)",
                        color: "hsl(var(--chart-2))",
                      },
                      usRefinedSugar: {
                        label: "Azúcar Refinado EE.UU. (¢/lb)",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={preparePricesChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                        <XAxis dataKey="year" stroke="#4a5070" />
                        <YAxis stroke="#4a5070" domain={[0, "auto"]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="rawSugarNY11"
                          stroke="var(--color-rawSugarNY11)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="usRawSugar"
                          stroke="var(--color-usRawSugar)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="usRefinedSugar"
                          stroke="var(--color-usRefinedSugar)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <ChartContainer
                    config={{
                      whiteSugarLondon5: {
                        label: "Azúcar Blanco (Londres N°5, $/ton)",
                        color: "hsl(var(--chart-4))",
                      },
                      euRefinedSugar: {
                        label: "Azúcar Refinado UE (€/ton)",
                        color: "hsl(var(--chart-5))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={preparePricesChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                        <XAxis dataKey="year" stroke="#4a5070" />
                        <YAxis stroke="#4a5070" domain={[0, "auto"]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="whiteSugarLondon5"
                          stroke="var(--color-whiteSugarLondon5)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="euRefinedSugar"
                          stroke="var(--color-euRefinedSugar)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-[#0a0f29] text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Año
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Azúcar Crudo (NY N°11, ¢/lb)
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Azúcar Blanco (Londres N°5, $/ton)
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Azúcar Crudo EE.UU. (¢/lb)
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Azúcar Refinado EE.UU. (¢/lb)
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Azúcar Refinado UE (€/ton)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prepareTableData("precios").map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-[#111936]" : "bg-[#0a0f29]"}>
                          <td className="px-6 py-4 font-medium">{row.year}</td>
                          <td className="px-6 py-4">{row.rawSugarNY11.toFixed(2)}</td>
                          <td className="px-6 py-4">{row.whiteSugarLondon5.toFixed(2)}</td>
                          <td className="px-6 py-4">{row.usRawSugar.toFixed(2)}</td>
                          <td className="px-6 py-4">{row.usRefinedSugar.toFixed(2)}</td>
                          <td className="px-6 py-4">{row.euRefinedSugar.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Tendencia:</span> Los precios del azúcar han mostrado una
                  tendencia alcista desde 2020, con un pico en 2021 y una estabilización posterior.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Diferencial de precios:</span> Los precios en Estados
                  Unidos y la Unión Europea se mantienen consistentemente por encima de los precios mundiales debido a
                  políticas de protección del mercado interno.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Factores clave:</span> La oferta y demanda global, las
                  condiciones climáticas en los principales países productores y las políticas comerciales son los
                  principales determinantes de los precios.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Balance Mundial de Azúcar</CardTitle>
              <CardDescription className="text-gray-400">
                Comparativa entre producción y consumo global (millones de toneladas métricas, valor bruto)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  produccion: {
                    label: "Producción",
                    color: "hsl(var(--chart-1))",
                  },
                  consumo: {
                    label: "Consumo",
                    color: "hsl(var(--chart-2))",
                  },
                  balance: {
                    label: "Balance",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={prepareBalanceChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="year" stroke="#4a5070" />
                    <YAxis yAxisId="left" stroke="#4a5070" domain={[0, "auto"]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#4a5070" domain={[-10, 10]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="produccion" fill="var(--color-produccion)" />
                    <Bar yAxisId="left" dataKey="consumo" fill="var(--color-consumo)" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="balance"
                      stroke="var(--color-balance)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Tendencia del balance:</span> El mercado mundial del
                  azúcar ha mostrado un superávit en los últimos años, con la producción superando al consumo.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Implicaciones:</span> El superávit ha contribuido a
                  mantener los precios relativamente estables, aunque con una tendencia alcista debido a otros factores
                  como los costos de producción y las políticas comerciales.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Perspectivas:</span> Se espera que el balance se mantenga
                  positivo en el corto plazo, aunque con una tendencia a reducirse debido al crecimiento constante del
                  consumo.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
