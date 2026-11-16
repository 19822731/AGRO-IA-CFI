"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  ReferenceLine,
} from "recharts"
import { Download, Info, TrendingUp, BarChart3, Calendar, ArrowUpDown } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useDomesticSugarPrices } from "@/hooks/use-domestic-sugar-prices"

export default function PreciosInternosHistoricos() {
  const { data, loading, error } = useDomesticSugarPrices()
  const [activeTab, setActiveTab] = useState("tendencia")
  const [viewType, setViewType] = useState("grafico")
  const [timeRange, setTimeRange] = useState("todo")
  const [yearFilter, setYearFilter] = useState("todos")
  const [filteredPrices, setFilteredPrices] = useState<any[]>([])
  const [yearFilteredPrices, setYearFilteredPrices] = useState<any[]>([])

  const trendChartData = useMemo(() => {
    if (!data) return []
    return prepareTrendChartData()
  }, [data, yearFilteredPrices])

  const monthlyChartData = useMemo(() => {
    if (!data) return []
    return prepareMonthlyChartData()
  }, [data, yearFilter])

  const yearlyChartData = useMemo(() => {
    if (!data) return []
    return prepareYearlyChartData()
  }, [data])

  const variationChartData = useMemo(() => {
    if (!data) return []
    return prepareVariationChartData()
  }, [data])

  const tableData = useMemo(() => {
    if (!data) return []
    return prepareTableData()
  }, [data, activeTab, yearFilteredPrices])

  const availableYears = useMemo(() => {
    if (!data) return []
    const years = new Set<number>()
    data.prices.forEach((price) => {
      years.add(price.date.getFullYear())
    })
    return Array.from(years).sort((a, b) => a - b)
  }, [data])

  // Filtrar datos según el rango de tiempo seleccionado
  useEffect(() => {
    if (!data) {
      setFilteredPrices([])
      return
    }

    if (timeRange === "todo") {
      setFilteredPrices(data.prices)
      return
    }

    const currentDate = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "1y":
        startDate.setFullYear(currentDate.getFullYear() - 1)
        break
      case "2y":
        startDate.setFullYear(currentDate.getFullYear() - 2)
        break
      case "3y":
        startDate.setFullYear(currentDate.getFullYear() - 3)
        break
      case "5y":
        startDate.setFullYear(currentDate.getFullYear() - 5)
        break
      case "7y":
        startDate.setFullYear(currentDate.getFullYear() - 7)
        break
      case "10y":
        startDate.setFullYear(currentDate.getFullYear() - 10)
        break
      case "15y":
        startDate.setFullYear(currentDate.getFullYear() - 15)
        break
      case "19y":
        startDate.setFullYear(currentDate.getFullYear() - 19)
        break
      default:
        setFilteredPrices(data.prices)
        return
    }

    setFilteredPrices(data.prices.filter((price) => price.date >= startDate))
  }, [data, timeRange])

  // Filtrar datos por año específico
  useEffect(() => {
    if (!data || !filteredPrices.length) {
      setYearFilteredPrices([])
      return
    }

    if (yearFilter === "todos") {
      setYearFilteredPrices(filteredPrices)
      return
    }

    const year = Number.parseInt(yearFilter)
    setYearFilteredPrices(filteredPrices.filter((price) => price.date.getFullYear() === year))
  }, [filteredPrices, yearFilter, data])

  if (loading)
    return <div className="text-center p-8 text-white">Cargando datos históricos de precios internos del azúcar...</div>
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>
  if (!data) return <div className="text-center p-8 text-white">No hay datos disponibles</div>

  // Función para exportar datos
  const handleExportData = () => {
    // Convertir a JSON
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    // Crear nombre de archivo
    const exportFileDefaultName = `precios-internos-azucar-historico-${new Date().toISOString().split("T")[0]}.json`

    // Crear elemento de descarga
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Preparar datos para gráficos de tendencia
  function prepareTrendChartData() {
    return yearFilteredPrices.map((item) => ({
      date: item.date.toISOString().split("T")[0],
      precio: item.price,
    }))
  }

  // Preparar datos para gráficos mensuales
  function prepareMonthlyChartData() {
    const shouldFilterByYear = yearFilter !== "todos"

    let monthlyAverages = data.monthlyAverages

    if (shouldFilterByYear) {
      const year = Number.parseInt(yearFilter)
      monthlyAverages = monthlyAverages.filter((item) => item.month.startsWith(year.toString()))
    }

    return monthlyAverages.map((item) => ({
      mes: item.month.split("-")[1],
      precio: item.price,
    }))
  }

  // Preparar datos para gráficos anuales
  function prepareYearlyChartData() {
    return data.yearlyAverages.map((item) => ({
      año: item.year,
      precio: item.price,
    }))
  }

  // Preparar datos para gráficos de variación
  function prepareVariationChartData() {
    const monthlyData = data.monthlyAverages
    const result = []

    for (let i = 1; i < monthlyData.length; i++) {
      const prevMonth = monthlyData[i - 1]
      const currMonth = monthlyData[i]
      const variation = Number.parseFloat((((currMonth.price - prevMonth.price) / prevMonth.price) * 100).toFixed(2))

      result.push({
        mes: currMonth.month,
        variacion: variation,
      })
    }

    return result
  }

  // Preparar datos para tabla
  function prepareTableData() {
    let tableData = []

    if (activeTab === "tendencia") {
      tableData = yearFilteredPrices.map((item) => ({
        fecha: item.date.toISOString().split("T")[0],
        precio: item.price.toFixed(2),
      }))
    } else if (activeTab === "mensual") {
      const shouldFilterByYear = yearFilter !== "todos"
      let monthlyAverages = data.monthlyAverages

      if (shouldFilterByYear) {
        const year = Number.parseInt(yearFilter)
        monthlyAverages = monthlyAverages.filter((item) => item.month.startsWith(year.toString()))
      }
      tableData = monthlyAverages.map((item) => ({
        mes: item.month,
        precio: item.price.toFixed(2),
      }))
    } else if (activeTab === "anual") {
      tableData = data.yearlyAverages.map((item) => ({
        año: item.year.toString(),
        precio: item.price.toFixed(2),
      }))
    } else if (activeTab === "variacion") {
      const monthlyData = data.monthlyAverages
      const result = []

      for (let i = 1; i < monthlyData.length; i++) {
        const prevMonth = monthlyData[i - 1]
        const currMonth = monthlyData[i]
        const variation = Number.parseFloat((((currMonth.price - prevMonth.price) / prevMonth.price) * 100).toFixed(2))

        result.push({
          periodo: `${prevMonth.month} → ${currMonth.month}`,
          variacion: `${variation.toFixed(2)}%`,
        })
      }

      tableData = result
    }

    return tableData
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Precios Históricos del Azúcar (Mercado Interno)</h2>
          <p className="text-gray-400">Análisis de precios por bolsa de 50kg (2007-2025)</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] bg-[#1a2040] border-[#2a3050] text-white">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2040] border-[#2a3050] text-white">
              <SelectItem value="todo">Todo el período</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
              <SelectItem value="2y">Últimos 2 años</SelectItem>
              <SelectItem value="3y">Últimos 3 años</SelectItem>
              <SelectItem value="5y">Últimos 5 años</SelectItem>
              <SelectItem value="7y">Últimos 7 años</SelectItem>
              <SelectItem value="10y">Últimos 10 años</SelectItem>
              <SelectItem value="15y">Últimos 15 años</SelectItem>
              <SelectItem value="19y">Últimos 19 años</SelectItem>
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[150px] bg-[#1a2040] border-[#2a3050] text-white">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2040] border-[#2a3050] text-white">
              <SelectItem value="todos">Todos los años</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
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
        <AlertTitle>Información de precios</AlertTitle>
        <AlertDescription>
          Precios históricos del azúcar en el mercado interno por bolsa de 50kg. Datos actualizados con información
          precisa para 2007-2025. Última actualización: {data.lastUpdate}.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="tendencia" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="bg-[#111936] border-[#1a2040]">
          <TabsTrigger
            value="tendencia"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Tendencia
          </TabsTrigger>
          <TabsTrigger value="mensual" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            <Calendar className="h-4 w-4 mr-2" />
            Promedio Mensual
          </TabsTrigger>
          <TabsTrigger value="anual" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            <BarChart3 className="h-4 w-4 mr-2" />
            Promedio Anual
          </TabsTrigger>
          <TabsTrigger
            value="variacion"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Variación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tendencia" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Tendencia de Precios del Azúcar</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución histórica de precios por bolsa de 50kg
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewType === "grafico" ? (
                <ChartContainer
                  config={{
                    precio: {
                      label: "Precio (por bolsa 50kg)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                      <XAxis
                        dataKey="date"
                        stroke="#4a5070"
                        tickFormatter={(value) => {
                          const dateObj = new Date(value)
                          return `${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`
                        }}
                        minTickGap={50}
                      />
                      <YAxis stroke="#4a5070" domain={["auto", "auto"]} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        labelFormatter={(value) => {
                          const dateObj = new Date(value)
                          return dateObj.toLocaleDateString()
                        }}
                      />
                      <Legend />
                      <ReferenceLine y={data.avgPrice} stroke="#FF8042" strokeDasharray="3 3" />
                      <Area
                        type="monotone"
                        dataKey="precio"
                        stroke="var(--color-precio)"
                        fill="var(--color-precio)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-[#0a0f29] text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Fecha
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Precio (por bolsa 50kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-[#111936]" : "bg-[#0a0f29]"}>
                          <td className="px-6 py-4 font-medium">{row.fecha}</td>
                          <td className="px-6 py-4">{row.precio}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Precio mínimo:</span> {data.minPrice.toFixed(2)} (por
                  bolsa 50kg)
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Precio máximo:</span> {data.maxPrice.toFixed(2)} (por
                  bolsa 50kg)
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Precio promedio:</span> {data.avgPrice.toFixed(2)} (por
                  bolsa 50kg)
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Tendencia:</span> Los precios del azúcar en el mercado
                  interno mostraron un aumento significativo entre 2009-2011, seguido de una caída en 2012-2013, una
                  recuperación en 2014-2015, y un incremento histórico en 2016-2022. En 2023 se observó una volatilidad
                  extrema con un pico histórico de más de 30,000 pesos por bolsa, seguido de una estabilización relativa
                  en 2024. Los datos de 2025 muestran una consolidación de precios en el rango de 23,200-23,850 pesos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mensual" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Promedio Mensual de Precios</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución de precios promedio mensuales por bolsa de 50kg
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewType === "grafico" ? (
                <ChartContainer
                  config={{
                    precio: {
                      label: "Precio Promedio (por bolsa 50kg)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                      <XAxis dataKey="mes" stroke="#4a5070" />
                      <YAxis stroke="#4a5070" domain={["auto", "auto"]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="precio" fill="var(--color-precio)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-[#0a0f29] text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Mes
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Precio Promedio (por bolsa 50kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-[#111936]" : "bg-[#0a0f29]"}>
                          <td className="px-6 py-4 font-medium">{row.mes}</td>
                          <td className="px-6 py-4">{row.precio}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Estacionalidad:</span> Se observa un patrón estacional en
                  los precios, con aumentos típicos durante los meses de septiembre a diciembre, especialmente notable
                  en los años 2016-2023.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Volatilidad:</span> La volatilidad de precios alcanzó
                  niveles sin precedentes en 2023, con fluctuaciones mensuales extremas que superaron cualquier patrón
                  histórico anterior. En 2024 se observa una tendencia hacia la estabilización, que se consolida en 2025
                  con variaciones mensuales mínimas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anual" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Promedio Anual de Precios</CardTitle>
              <CardDescription className="text-gray-400">
                Evolución de precios promedio anuales por bolsa de 50kg
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewType === "grafico" ? (
                <ChartContainer
                  config={{
                    precio: {
                      label: "Precio Promedio (por bolsa 50kg)",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                      <XAxis dataKey="año" stroke="#4a5070" />
                      <YAxis stroke="#4a5070" domain={[0, "auto"]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="precio" fill="var(--color-precio)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-[#0a0f29] text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Año
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Precio Promedio (por bolsa 50kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-[#111936]" : "bg-[#0a0f29]"}>
                          <td className="px-6 py-4 font-medium">{row.año}</td>
                          <td className="px-6 py-4">{row.precio}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Tendencia a largo plazo:</span> Los precios muestran una
                  clara tendencia alcista a lo largo de los años analizados, con picos en 2011, 2014, 2016, 2019, y
                  aumentos extraordinarios en 2022-2023.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Ciclos de mercado:</span> Se observan ciclos de
                  aproximadamente 2-3 años hasta 2018, pero a partir de 2019 se rompe este patrón con un aumento
                  sostenido y acelerado que alcanza su máximo en 2023.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Crecimiento anual:</span> El mayor incremento interanual
                  se observó entre 2022 y 2023, con un aumento de aproximadamente 200% en el precio promedio. En 2025 se
                  observa una estabilización significativa, con precios promedio consistentes alrededor de los 23,500
                  pesos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variacion" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Variación Mensual de Precios</CardTitle>
              <CardDescription className="text-gray-400">
                Variación porcentual mes a mes en los precios del azúcar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewType === "grafico" ? (
                <ChartContainer
                  config={{
                    variacion: {
                      label: "Variación Mensual (%)",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={variationChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                      <XAxis
                        dataKey="mes"
                        stroke="#4a5070"
                        tickFormatter={(value) => {
                          const [year, month] = value.split("-")
                          return `${month}/${year.slice(2)}`
                        }}
                        minTickGap={30}
                      />
                      <YAxis stroke="#4a5070" domain={["auto", "auto"]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <ReferenceLine y={0} stroke="#4a5070" />
                      <Bar dataKey="variacion" fill="var(--color-variacion)" />
                      <Line type="monotone" dataKey="variacion" stroke="#FF8042" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-[#0a0f29] text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Período
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Variación (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-[#111936]" : "bg-[#0a0f29]"}>
                          <td className="px-6 py-4 font-medium">{row.periodo}</td>
                          <td className="px-6 py-4">{row.variacion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Volatilidad extrema:</span> Los períodos de mayor
                  volatilidad se observaron en 2023, con variaciones mensuales que superaron el 100% en algunos casos,
                  especialmente en enero-febrero de 2023.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Picos de variación:</span> Los mayores incrementos
                  mensuales superaron el 150% en 2023, mientras que las mayores caídas fueron de aproximadamente -70% en
                  períodos de corrección de precios.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Estabilización 2025:</span> Los datos de 2025 muestran
                  variaciones mensuales mínimas, con cambios porcentuales que rara vez superan el 1%, lo que indica una
                  consolidación del mercado después de la extrema volatilidad de 2023-2024.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
