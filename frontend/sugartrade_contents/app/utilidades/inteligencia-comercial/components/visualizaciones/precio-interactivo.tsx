"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Brush,
  Bar,
  ComposedChart,
} from "recharts"
import {
  Download,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  Maximize2,
  Minimize2,
  Settings,
  Info,
  Activity,
  BarChart2,
} from "lucide-react"

import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateStochastic,
} from "../../utils/technical-indicators"

// Datos de ejemplo para precios históricos
const generatePriceData = () => {
  const data = []
  const startDate = new Date(2020, 0, 1)
  const endDate = new Date(2023, 11, 31)

  // Precios base para diferentes mercados
  const baseNY = 14.5
  const baseLondon = 400
  const baseBrasil = 90
  const baseIndia = 32

  // Tendencia general (creciente)
  const trend = 0.01

  // Estacionalidad (ciclo anual)
  const seasonality = 0.15

  // Volatilidad
  const volatility = 0.05

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
    const t = (d - startDate) / (1000 * 60 * 60 * 24) // días desde el inicio
    const year = d.getFullYear()
    const month = d.getMonth()

    // Factor estacional (más alto en Q4, más bajo en Q2)
    const seasonalFactor = Math.sin((month / 12) * 2 * Math.PI + Math.PI / 2) * seasonality

    // Tendencia a largo plazo
    const trendFactor = (trend * t) / 365

    // Componente aleatorio
    const randomNY = (Math.random() - 0.5) * volatility * baseNY
    const randomLondon = (Math.random() - 0.5) * volatility * baseLondon
    const randomBrasil = (Math.random() - 0.5) * volatility * baseBrasil
    const randomIndia = (Math.random() - 0.5) * volatility * baseIndia

    // Eventos especiales (shocks)
    let shockFactor = 0
    if (year === 2021 && month === 7) shockFactor = 0.15 // Shock de agosto 2021
    if (year === 2022 && month === 2) shockFactor = 0.1 // Shock de marzo 2022
    if (year === 2023 && month === 5) shockFactor = -0.08 // Shock negativo de junio 2023

    // Calcular precios finales
    const nyPrice = baseNY * (1 + trendFactor + seasonalFactor + shockFactor) + randomNY
    const londonPrice = baseLondon * (1 + trendFactor + seasonalFactor + shockFactor) + randomLondon
    const brasilPrice = baseBrasil * (1 + trendFactor + seasonalFactor + shockFactor * 0.8) + randomBrasil
    const indiaPrice = baseIndia * (1 + trendFactor + seasonalFactor + shockFactor * 0.7) + randomIndia

    data.push({
      date: d.toISOString().split("T")[0],
      nyPrice: Number.parseFloat(nyPrice.toFixed(2)),
      londonPrice: Number.parseFloat(londonPrice.toFixed(2)),
      brasilPrice: Number.parseFloat(brasilPrice.toFixed(2)),
      indiaPrice: Number.parseFloat(indiaPrice.toFixed(2)),
      month: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
    })
  }

  return data
}

// Datos de precios históricos
const priceData = generatePriceData()

// Datos de eventos importantes del mercado
const marketEvents = [
  { date: "2021-08-15", description: "Sequía en Brasil", impact: "Alza de precios del 15%" },
  { date: "2022-03-10", description: "Conflicto Rusia-Ucrania", impact: "Aumento de costos energéticos" },
  { date: "2023-06-05", description: "Superávit de producción en India", impact: "Caída de precios del 8%" },
]

// Definición de los indicadores técnicos disponibles
const technicalIndicators = [
  {
    id: "sma",
    name: "Media Móvil Simple (SMA)",
    description: "Promedio de precios durante un período específico",
    color: "#4CAF50",
  },
  {
    id: "ema",
    name: "Media Móvil Exponencial (EMA)",
    description: "Promedio ponderado que da más importancia a los precios recientes",
    color: "#2196F3",
  },
  {
    id: "bollinger",
    name: "Bandas de Bollinger",
    description: "Bandas que indican volatilidad basadas en desviación estándar",
    color: "#9C27B0",
  },
  {
    id: "rsi",
    name: "Índice de Fuerza Relativa (RSI)",
    description: "Indicador de momentum que mide la velocidad y cambio de los movimientos de precios",
    color: "#FF9800",
    separate: true,
  },
  {
    id: "macd",
    name: "MACD",
    description: "Indicador de tendencia que muestra la relación entre dos medias móviles",
    color: "#E91E63",
    separate: true,
  },
  {
    id: "stochastic",
    name: "Oscilador Estocástico",
    description: "Compara el precio de cierre con el rango de precios durante un período",
    color: "#00BCD4",
    separate: true,
  },
]

export default function PrecioInteractivo() {
  const [activeTab, setActiveTab] = useState("ny")
  const [timeRange, setTimeRange] = useState("all")
  const [zoomState, setZoomState] = useState({ left: 0, right: 100, refAreaLeft: "", refAreaRight: "" })
  const [showEvents, setShowEvents] = useState(true)
  const [smoothing, setSmoothing] = useState(0)
  const [filteredData, setFilteredData] = useState(priceData)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Estados para indicadores técnicos
  const [activeIndicators, setActiveIndicators] = useState<string[]>([])
  const [indicatorSettings, setIndicatorSettings] = useState({
    sma: { period: 20 },
    ema: { period: 20 },
    bollinger: { period: 20, stdDev: 2 },
    rsi: { period: 14 },
    macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    stochastic: { kPeriod: 14, dPeriod: 3 },
  })
  const [showSecondaryCharts, setShowSecondaryCharts] = useState(true)

  // Obtener el campo de precio según la pestaña activa
  const getPriceField = () => {
    switch (activeTab) {
      case "ny":
        return "nyPrice"
      case "london":
        return "londonPrice"
      case "brasil":
        return "brasilPrice"
      case "india":
        return "indiaPrice"
      default:
        return "nyPrice"
    }
  }

  // Aplicar indicadores técnicos a los datos
  const applyTechnicalIndicators = (data: any[]) => {
    const priceField = getPriceField()
    let result = [...data]

    if (activeIndicators.includes("sma")) {
      result = calculateSMA(result, priceField, indicatorSettings.sma.period)
    }

    if (activeIndicators.includes("ema")) {
      result = calculateEMA(result, priceField, indicatorSettings.ema.period)
    }

    if (activeIndicators.includes("bollinger")) {
      result = calculateBollingerBands(
        result,
        priceField,
        indicatorSettings.bollinger.period,
        indicatorSettings.bollinger.stdDev,
      )
    }

    if (activeIndicators.includes("rsi")) {
      result = calculateRSI(result, priceField, indicatorSettings.rsi.period)
    }

    if (activeIndicators.includes("macd")) {
      result = calculateMACD(
        result,
        priceField,
        indicatorSettings.macd.fastPeriod,
        indicatorSettings.macd.slowPeriod,
        indicatorSettings.macd.signalPeriod,
      )
    }

    if (activeIndicators.includes("stochastic")) {
      result = calculateStochastic(
        result,
        priceField,
        indicatorSettings.stochastic.kPeriod,
        indicatorSettings.stochastic.dPeriod,
      )
    }

    return result
  }

  // Filtrar datos según el rango de tiempo seleccionado
  useEffect(() => {
    let filtered = [...priceData]

    if (timeRange === "1y") {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      filtered = priceData.filter((item) => new Date(item.date) >= oneYearAgo)
    } else if (timeRange === "2y") {
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      filtered = priceData.filter((item) => new Date(item.date) >= twoYearsAgo)
    } else if (timeRange === "ytd") {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1)
      filtered = priceData.filter((item) => new Date(item.date) >= startOfYear)
    }

    // Aplicar suavizado si es necesario
    if (smoothing > 0) {
      const windowSize = Math.ceil(smoothing * 10)
      filtered = applyMovingAverage(filtered, windowSize)
    }

    // Aplicar indicadores técnicos
    filtered = applyTechnicalIndicators(filtered)

    setFilteredData(filtered)
  }, [timeRange, smoothing, activeTab, activeIndicators, indicatorSettings])

  // Función para aplicar media móvil (suavizado)
  const applyMovingAverage = (data: any[], windowSize: number) => {
    if (windowSize <= 1) return data

    const result = [...data]
    const priceField = getPriceField()

    for (let i = 0; i < result.length; i++) {
      let sum = 0
      let count = 0

      for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
        sum += data[j][priceField]
        count++
      }

      result[i][priceField] = Number.parseFloat((sum / count).toFixed(2))
    }

    return result
  }

  // Funciones para el zoom
  const handleZoomIn = () => {
    if (filteredData.length <= 10) return

    const middle = Math.floor(filteredData.length / 2)
    const quarter = Math.floor(filteredData.length / 4)

    setFilteredData(filteredData.slice(middle - quarter, middle + quarter))
  }

  const handleZoomOut = () => {
    // Reiniciar los datos filtrados
    let filtered = [...priceData]

    if (timeRange === "1y") {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      filtered = priceData.filter((item) => new Date(item.date) >= oneYearAgo)
    } else if (timeRange === "2y") {
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      filtered = priceData.filter((item) => new Date(item.date) >= twoYearsAgo)
    } else if (timeRange === "ytd") {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1)
      filtered = priceData.filter((item) => new Date(item.date) >= startOfYear)
    }

    // Aplicar suavizado si es necesario
    if (smoothing > 0) {
      const windowSize = Math.ceil(smoothing * 10)
      filtered = applyMovingAverage(filtered, windowSize)
    }

    // Aplicar indicadores técnicos
    filtered = applyTechnicalIndicators(filtered)

    setFilteredData(filtered)
  }

  const handleMouseDown = (e: any) => {
    if (!e) return
    setZoomState({
      ...zoomState,
      refAreaLeft: e.activeLabel,
    })
  }

  const handleMouseMove = (e: any) => {
    if (!e || !zoomState.refAreaLeft) return
    setZoomState({
      ...zoomState,
      refAreaRight: e.activeLabel,
    })
  }

  const handleMouseUp = () => {
    if (!zoomState.refAreaLeft || !zoomState.refAreaRight) {
      setZoomState({
        ...zoomState,
        refAreaLeft: "",
        refAreaRight: "",
      })
      return
    }

    // Asegurarse de que refAreaLeft es anterior a refAreaRight
    let left = zoomState.refAreaLeft
    let right = zoomState.refAreaRight

    if (left > right) {
      ;[left, right] = [right, left]
    }

    // Encontrar los índices correspondientes
    const leftIndex = filteredData.findIndex((item) => item.date === left)
    const rightIndex = filteredData.findIndex((item) => item.date === right)

    if (leftIndex !== -1 && rightIndex !== -1 && rightIndex - leftIndex > 5) {
      setFilteredData(filteredData.slice(leftIndex, rightIndex + 1))
    }

    setZoomState({
      ...zoomState,
      refAreaLeft: "",
      refAreaRight: "",
    })
  }

  // Función para exportar datos
  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `sugar-prices-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Función para alternar pantalla completa
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Obtener el precio actual y el cambio porcentual
  const getCurrentPrice = () => {
    if (filteredData.length === 0) return { price: 0, change: 0 }

    const currentPrice = filteredData[filteredData.length - 1]
    const previousPrice = filteredData.length > 30 ? filteredData[filteredData.length - 31] : filteredData[0]

    const priceField = getPriceField()
    const price = currentPrice[priceField]
    const previousValue = previousPrice[priceField]

    const change = ((price - previousValue) / previousValue) * 100

    return { price, change: Number.parseFloat(change.toFixed(2)) }
  }

  const { price, change } = getCurrentPrice()

  // Obtener el color según el cambio
  const getChangeColor = () => {
    if (change > 0) return "text-green-500"
    if (change < 0) return "text-red-500"
    return "text-gray-400"
  }

  // Obtener la unidad según el mercado
  const getPriceUnit = () => {
    switch (activeTab) {
      case "ny":
        return "¢/lb"
      case "london":
        return "$/ton"
      case "brasil":
        return "R$/bag"
      case "india":
        return "₹/kg"
      default:
        return ""
    }
  }

  // Renderizar líneas de eventos importantes
  const renderEventLines = () => {
    if (!showEvents) return null

    return marketEvents.map((event) => {
      const eventDate = event.date
      if (filteredData.some((item) => item.date === eventDate)) {
        return (
          <ReferenceLine
            key={eventDate}
            x={eventDate}
            stroke="#FFD700"
            strokeDasharray="3 3"
            label={{
              value: event.description,
              position: "insideTopRight",
              fill: "#FFD700",
              fontSize: 12,
            }}
          />
        )
      }
      return null
    })
  }

  // Renderizar indicadores técnicos en el gráfico principal
  const renderTechnicalIndicators = () => {
    const indicators = []

    if (activeIndicators.includes("sma")) {
      indicators.push(
        <Line
          key="sma"
          type="monotone"
          dataKey={`sma${indicatorSettings.sma.period}`}
          stroke={technicalIndicators.find((i) => i.id === "sma")?.color || "#4CAF50"}
          strokeWidth={1.5}
          dot={false}
          name={`SMA (${indicatorSettings.sma.period})`}
        />,
      )
    }

    if (activeIndicators.includes("ema")) {
      indicators.push(
        <Line
          key="ema"
          type="monotone"
          dataKey={`ema${indicatorSettings.ema.period}`}
          stroke={technicalIndicators.find((i) => i.id === "ema")?.color || "#2196F3"}
          strokeWidth={1.5}
          dot={false}
          name={`EMA (${indicatorSettings.ema.period})`}
        />,
      )
    }

    if (activeIndicators.includes("bollinger")) {
      indicators.push(
        <Line
          key="upperBand"
          type="monotone"
          dataKey="upperBand"
          stroke={technicalIndicators.find((i) => i.id === "bollinger")?.color || "#9C27B0"}
          strokeWidth={1.5}
          dot={false}
          name="Banda Superior"
          strokeDasharray="3 3"
        />,
      )

      indicators.push(
        <Line
          key="sma20"
          type="monotone"
          dataKey={`sma${indicatorSettings.bollinger.period}`}
          stroke={technicalIndicators.find((i) => i.id === "bollinger")?.color || "#9C27B0"}
          strokeWidth={1}
          dot={false}
          name={`SMA (${indicatorSettings.bollinger.period})`}
          opacity={0.8}
        />,
      )

      indicators.push(
        <Line
          key="lowerBand"
          type="monotone"
          dataKey="lowerBand"
          stroke={technicalIndicators.find((i) => i.id === "bollinger")?.color || "#9C27B0"}
          strokeWidth={1.5}
          dot={false}
          name="Banda Inferior"
          strokeDasharray="3 3"
        />,
      )
    }

    return indicators
  }

  // Renderizar gráficos secundarios para indicadores que necesitan su propio espacio
  const renderSecondaryCharts = () => {
    if (!showSecondaryCharts) return null

    const secondaryIndicators = activeIndicators.filter((id) => technicalIndicators.find((i) => i.id === id)?.separate)

    if (secondaryIndicators.length === 0) return null

    return (
      <div className="space-y-4 mt-4">
        {secondaryIndicators.map((id) => {
          const indicator = technicalIndicators.find((i) => i.id === id)

          if (id === "rsi") {
            return (
              <Card key={id} className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-[#FF9800]" />
                    RSI ({indicatorSettings.rsi.period})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                      <XAxis
                        dataKey="date"
                        stroke="#4a5070"
                        tick={{ fill: "#4a5070" }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                        }}
                      />
                      <YAxis
                        stroke="#4a5070"
                        tick={{ fill: "#4a5070" }}
                        domain={[0, 100]}
                        ticks={[0, 30, 50, 70, 100]}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}`, "RSI"]}
                        labelFormatter={(label) => `Fecha: ${label}`}
                      />
                      <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />
                      <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="rsi" stroke={indicator?.color || "#FF9800"} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )
          }

          if (id === "macd") {
            return (
              <Card key={id} className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-[#E91E63]" />
                    MACD ({indicatorSettings.macd.fastPeriod}, {indicatorSettings.macd.slowPeriod},{" "}
                    {indicatorSettings.macd.signalPeriod})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={120}>
                    <ComposedChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                      <XAxis
                        dataKey="date"
                        stroke="#4a5070"
                        tick={{ fill: "#4a5070" }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                        }}
                      />
                      <YAxis stroke="#4a5070" tick={{ fill: "#4a5070" }} />
                      <Tooltip formatter={(value) => [`${value}`, ""]} labelFormatter={(label) => `Fecha: ${label}`} />
                      <ReferenceLine y={0} stroke="#4a5070" />
                      <Bar
                        dataKey="histogram"
                        fill={(value) => (value >= 0 ? "#4CAF50" : "#F44336")}
                        name="Histograma"
                      />
                      <Line type="monotone" dataKey="macdLine" stroke="#E91E63" dot={false} name="MACD" />
                      <Line type="monotone" dataKey="signalLine" stroke="#2196F3" dot={false} name="Señal" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )
          }

          if (id === "stochastic") {
            return (
              <Card key={id} className="bg-[#0a0f29] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-[#00BCD4]" />
                    Estocástico ({indicatorSettings.stochastic.kPeriod}, {indicatorSettings.stochastic.dPeriod})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                      <XAxis
                        dataKey="date"
                        stroke="#4a5070"
                        tick={{ fill: "#4a5070" }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                        }}
                      />
                      <YAxis
                        stroke="#4a5070"
                        tick={{ fill: "#4a5070" }}
                        domain={[0, 100]}
                        ticks={[0, 20, 50, 80, 100]}
                      />
                      <Tooltip formatter={(value) => [`${value}`, ""]} labelFormatter={(label) => `Fecha: ${label}`} />
                      <ReferenceLine y={80} stroke="red" strokeDasharray="3 3" />
                      <ReferenceLine y={20} stroke="green" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="k" stroke="#00BCD4" dot={false} name="%K" />
                      <Line type="monotone" dataKey="d" stroke="#FF9800" dot={false} name="%D" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )
          }

          return null
        })}
      </div>
    )
  }

  // Función para alternar indicadores técnicos
  const toggleIndicator = (id: string) => {
    if (activeIndicators.includes(id)) {
      setActiveIndicators(activeIndicators.filter((i) => i !== id))
    } else {
      setActiveIndicators([...activeIndicators, id])
    }
  }

  // Función para actualizar la configuración de un indicador
  const updateIndicatorSetting = (id: string, setting: string, value: number) => {
    setIndicatorSettings({
      ...indicatorSettings,
      [id]: {
        ...indicatorSettings[id as keyof typeof indicatorSettings],
        [setting]: value,
      },
    })
  }

  return (
    <Card
      className={`bg-[#111936] border-[#1a2040] ${isFullscreen ? "fixed inset-0 z-50 m-0 rounded-none overflow-auto" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl">Evolución de Precios del Azúcar</CardTitle>
            <CardDescription className="text-gray-400">
              Análisis interactivo de precios en diferentes mercados
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="bg-[#1a2040] border-[#2a3050] hover:bg-[#2a3050]">
                  <Settings className="h-4 w-4 text-[#00a8ff]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-[#1a2040] border-[#2a3050] text-white">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Indicadores Técnicos</h4>
                  <div className="space-y-2">
                    {technicalIndicators.map((indicator) => (
                      <div key={indicator.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`indicator-${indicator.id}`}
                              checked={activeIndicators.includes(indicator.id)}
                              onCheckedChange={() => toggleIndicator(indicator.id)}
                            />
                            <Label htmlFor={`indicator-${indicator.id}`} className="text-sm font-medium cursor-pointer">
                              {indicator.name}
                            </Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Info className="h-3 w-3 text-gray-400" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-60 bg-[#2a3050] border-[#3a4060] text-white text-xs">
                                {indicator.description}
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: indicator.color }} />
                        </div>

                        {activeIndicators.includes(indicator.id) && (
                          <div className="pl-6 space-y-2">
                            {indicator.id === "sma" && (
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Período:</Label>
                                <Select
                                  value={indicatorSettings.sma.period.toString()}
                                  onValueChange={(value) =>
                                    updateIndicatorSetting("sma", "period", Number.parseInt(value))
                                  }
                                >
                                  <SelectTrigger className="w-20 h-7 text-xs bg-[#2a3050] border-[#3a4060]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#2a3050] border-[#3a4060] text-white">
                                    {[5, 10, 20, 50, 100, 200].map((p) => (
                                      <SelectItem key={p} value={p.toString()} className="text-xs">
                                        {p}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {indicator.id === "ema" && (
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Período:</Label>
                                <Select
                                  value={indicatorSettings.ema.period.toString()}
                                  onValueChange={(value) =>
                                    updateIndicatorSetting("ema", "period", Number.parseInt(value))
                                  }
                                >
                                  <SelectTrigger className="w-20 h-7 text-xs bg-[#2a3050] border-[#3a4060]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#2a3050] border-[#3a4060] text-white">
                                    {[5, 10, 20, 50, 100, 200].map((p) => (
                                      <SelectItem key={p} value={p.toString()} className="text-xs">
                                        {p}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {indicator.id === "bollinger" && (
                              <>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Período:</Label>
                                  <Select
                                    value={indicatorSettings.bollinger.period.toString()}
                                    onValueChange={(value) =>
                                      updateIndicatorSetting("bollinger", "period", Number.parseInt(value))
                                    }
                                  >
                                    <SelectTrigger className="w-20 h-7 text-xs bg-[#2a3050] border-[#3a4060]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#2a3050] border-[#3a4060] text-white">
                                      {[10, 20, 30, 50].map((p) => (
                                        <SelectItem key={p} value={p.toString()} className="text-xs">
                                          {p}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Desv. Estándar:</Label>
                                  <Select
                                    value={indicatorSettings.bollinger.stdDev.toString()}
                                    onValueChange={(value) =>
                                      updateIndicatorSetting("bollinger", "stdDev", Number.parseFloat(value))
                                    }
                                  >
                                    <SelectTrigger className="w-20 h-7 text-xs bg-[#2a3050] border-[#3a4060]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#2a3050] border-[#3a4060] text-white">
                                      {[1, 1.5, 2, 2.5, 3].map((p) => (
                                        <SelectItem key={p} value={p.toString()} className="text-xs">
                                          {p}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            )}

                            {indicator.id === "rsi" && (
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Período:</Label>
                                <Select
                                  value={indicatorSettings.rsi.period.toString()}
                                  onValueChange={(value) =>
                                    updateIndicatorSetting("rsi", "period", Number.parseInt(value))
                                  }
                                >
                                  <SelectTrigger className="w-20 h-7 text-xs bg-[#2a3050] border-[#3a4060]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#2a3050] border-[#3a4060] text-white">
                                    {[7, 9, 14, 21, 25].map((p) => (
                                      <SelectItem key={p} value={p.toString()} className="text-xs">
                                        {p}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {indicator.id === "macd" && (
                              <>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Período Rápido:</Label>
                                  <Select
                                    value={indicatorSettings.macd.fastPeriod.toString()}
                                    onValueChange={(value) =>
                                      updateIndicatorSetting("macd", "fastPeriod", Number.parseInt(value))
                                    }
                                  >
                                    <SelectTrigger className="w-20 h-7 text-xs bg-[#2a3050] border-[#3a4060]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#2a3050] border-[#3a4060] text-white">
                                      {[8, 9, 12, 15].map((p) => (
                                        <SelectItem key={p} value={p.toString()} className="text-xs">
                                          {p}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Período Lento:</Label>
                                  <Select
                                    value={indicatorSettings.macd.slowPeriod.toString()}
                                    onValueChange={(value) =>
                                      updateIndicatorSetting("macd", "slowPeriod", Number.parseInt(value))
                                    }
                                  >
                                    <SelectTrigger className="w-20 h-7 text-xs bg-[#2a3050] border-[#3a4060]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#2a3050] border-[#3a4060] text-white">
                                      {[21, 26, 30, 35].map((p) => (
                                        <SelectItem key={p} value={p.toString()} className="text-xs">
                                          {p}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Período Señal:</Label>
                                  <Select
                                    value={indicatorSettings.macd.signalPeriod.toString()}
                                    onValueChange={(value) =>
                                      updateIndicatorSetting("macd", "signalPeriod", Number.parseInt(value))
                                    }
                                  >
                                    <SelectTrigger className="w-20 h-7 text-xs bg-[#2a3050] border-[#3a4060]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#2a3050] border-[#3a4060] text-white">
                                      {[5, 7, 9, 12].map((p) => (
                                        <SelectItem key={p} value={p.toString()} className="text-xs">
                                          {p}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            )}

                            {indicator.id === "stochastic" && (
                              <>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Período %K:</Label>
                                  <Select
                                    value={indicatorSettings.stochastic.kPeriod.toString()}
                                    onValueChange={(value) =>
                                      updateIndicatorSetting("stochastic", "kPeriod", Number.parseInt(value))
                                    }
                                  >
                                    <SelectTrigger className="w-20 h-7 text-xs bg-[#2a3050] border-[#3a4060]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#2a3050] border-[#3a4060] text-white">
                                      {[5, 9, 14, 21].map((p) => (
                                        <SelectItem key={p} value={p.toString()} className="text-xs">
                                          {p}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Período %D:</Label>
                                  <Select
                                    value={indicatorSettings.stochastic.dPeriod.toString()}
                                    onValueChange={(value) =>
                                      updateIndicatorSetting("stochastic", "dPeriod", Number.parseInt(value))
                                    }
                                  >
                                    <SelectTrigger className="w-20 h-7 text-xs bg-[#2a3050] border-[#3a4060]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#2a3050] border-[#3a4060] text-white">
                                      {[3, 5, 7, 9].map((p) => (
                                        <SelectItem key={p} value={p.toString()} className="text-xs">
                                          {p}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2a3050]">
                    <Label className="text-sm">Mostrar gráficos secundarios</Label>
                    <Switch checked={showSecondaryCharts} onCheckedChange={setShowSecondaryCharts} />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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
        <div className="space-y-4">
          {/* Panel de control */}
          <div className="flex flex-wrap gap-3 items-center justify-between bg-[#0a0f29] p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-[#00a8ff]" />
              <div>
                <div className="text-xl font-bold text-white">
                  {price.toFixed(2)} {getPriceUnit()}
                </div>
                <div className={`text-sm ${getChangeColor()}`}>
                  {change > 0 ? "+" : ""}
                  {change}% (30d)
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[100px] bg-[#1a2040] border-[#2a3050] text-white">
                  <Calendar className="h-4 w-4 mr-2 text-[#00a8ff]" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2040] border-[#2a3050] text-white">
                  <SelectItem value="all">Todo</SelectItem>
                  <SelectItem value="ytd">Año actual</SelectItem>
                  <SelectItem value="1y">1 año</SelectItem>
                  <SelectItem value="2y">2 años</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#1a2040] border-[#2a3050] hover:bg-[#2a3050]"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="h-4 w-4 text-[#00a8ff]" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#1a2040] border-[#2a3050] hover:bg-[#2a3050]"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="h-4 w-4 text-[#00a8ff]" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#1a2040] border-[#2a3050] hover:bg-[#2a3050]"
                  onClick={() => setFilteredData(priceData)}
                >
                  <RefreshCw className="h-4 w-4 text-[#00a8ff]" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Suavizado:</span>
              <Slider
                value={[smoothing]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => setSmoothing(value[0])}
                className="w-24"
              />
              <Button
                variant="outline"
                size="sm"
                className={`${showEvents ? "bg-[#2a3050]" : "bg-[#1a2040]"} border-[#2a3050] hover:bg-[#2a3050] text-xs`}
                onClick={() => setShowEvents(!showEvents)}
              >
                {showEvents ? "Ocultar Eventos" : "Mostrar Eventos"}
              </Button>
            </div>
          </div>

          {/* Tabs para diferentes mercados */}
          <Tabs defaultValue="ny" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#0a0f29] w-full">
              <TabsTrigger value="ny" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
                Nueva York (Raw)
              </TabsTrigger>
              <TabsTrigger
                value="london"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Londres (White)
              </TabsTrigger>
              <TabsTrigger
                value="brasil"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                Brasil (Doméstico)
              </TabsTrigger>
              <TabsTrigger
                value="india"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                India (Doméstico)
              </TabsTrigger>
            </TabsList>

            {/* Contenido de las pestañas */}
            <TabsContent value="ny" className="mt-4">
              <ChartContainer
                config={{
                  nyPrice: {
                    label: "Precio NY (¢/lb)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredData}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis
                      dataKey="date"
                      stroke="#4a5070"
                      tick={{ fill: "#4a5070" }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                      }}
                    />
                    <YAxis stroke="#4a5070" tick={{ fill: "#4a5070" }} domain={["auto", "auto"]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="nyPrice"
                      stroke="var(--color-nyPrice)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: "#00a8ff" }}
                    />
                    {renderTechnicalIndicators()}
                    {renderEventLines()}
                    {zoomState.refAreaLeft && zoomState.refAreaRight ? (
                      <ReferenceArea
                        x1={zoomState.refAreaLeft}
                        x2={zoomState.refAreaRight}
                        strokeOpacity={0.3}
                        fill="#2a3050"
                      />
                    ) : null}
                    <Brush
                      dataKey="date"
                      height={30}
                      stroke="#4a5070"
                      fill="#0a0f29"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="london" className="mt-4">
              <ChartContainer
                config={{
                  londonPrice: {
                    label: "Precio Londres ($/ton)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredData}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis
                      dataKey="date"
                      stroke="#4a5070"
                      tick={{ fill: "#4a5070" }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                      }}
                    />
                    <YAxis stroke="#4a5070" tick={{ fill: "#4a5070" }} domain={["auto", "auto"]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="londonPrice"
                      stroke="var(--color-londonPrice)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: "#00a8ff" }}
                    />
                    {renderTechnicalIndicators()}
                    {renderEventLines()}
                    {zoomState.refAreaLeft && zoomState.refAreaRight ? (
                      <ReferenceArea
                        x1={zoomState.refAreaLeft}
                        x2={zoomState.refAreaRight}
                        strokeOpacity={0.3}
                        fill="#2a3050"
                      />
                    ) : null}
                    <Brush
                      dataKey="date"
                      height={30}
                      stroke="#4a5070"
                      fill="#0a0f29"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="brasil" className="mt-4">
              <ChartContainer
                config={{
                  brasilPrice: {
                    label: "Precio Brasil (R$/bag)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredData}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis
                      dataKey="date"
                      stroke="#4a5070"
                      tick={{ fill: "#4a5070" }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                      }}
                    />
                    <YAxis stroke="#4a5070" tick={{ fill: "#4a5070" }} domain={["auto", "auto"]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="brasilPrice"
                      stroke="var(--color-brasilPrice)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: "#00a8ff" }}
                    />
                    {renderTechnicalIndicators()}
                    {renderEventLines()}
                    {zoomState.refAreaLeft && zoomState.refAreaRight ? (
                      <ReferenceArea
                        x1={zoomState.refAreaLeft}
                        x2={zoomState.refAreaRight}
                        strokeOpacity={0.3}
                        fill="#2a3050"
                      />
                    ) : null}
                    <Brush
                      dataKey="date"
                      height={30}
                      stroke="#4a5070"
                      fill="#0a0f29"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="india" className="mt-4">
              <ChartContainer
                config={{
                  indiaPrice: {
                    label: "Precio India (₹/kg)",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredData}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis
                      dataKey="date"
                      stroke="#4a5070"
                      tick={{ fill: "#4a5070" }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                      }}
                    />
                    <YAxis stroke="#4a5070" tick={{ fill: "#4a5070" }} domain={["auto", "auto"]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="indiaPrice"
                      stroke="var(--color-indiaPrice)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: "#00a8ff" }}
                    />
                    {renderTechnicalIndicators()}
                    {renderEventLines()}
                    {zoomState.refAreaLeft && zoomState.refAreaRight ? (
                      <ReferenceArea
                        x1={zoomState.refAreaLeft}
                        x2={zoomState.refAreaRight}
                        strokeOpacity={0.3}
                        fill="#2a3050"
                      />
                    ) : null}
                    <Brush
                      dataKey="date"
                      height={30}
                      stroke="#4a5070"
                      fill="#0a0f29"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
          </Tabs>

          {/* Gráficos secundarios para indicadores técnicos */}
          {renderSecondaryCharts()}

          {/* Análisis de eventos y correlaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Eventos Significativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketEvents.map((event, index) => (
                    <div key={index} className="flex items-start p-2 rounded-md bg-[#1a2040]">
                      <div className="h-6 w-6 rounded-full bg-[#111936] flex items-center justify-center text-[#00a8ff] text-xs mr-2 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-white text-sm font-medium">{event.date}</span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-[#00a8ff] text-sm">{event.description}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{event.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0f29] border-[#1a2040]">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Guía de Indicadores Técnicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>
                    <span className="text-[#4CAF50] font-medium">SMA (Media Móvil Simple):</span> Promedio de precios
                    durante un período específico. Útil para identificar la dirección de la tendencia.
                  </p>
                  <p>
                    <span className="text-[#2196F3] font-medium">EMA (Media Móvil Exponencial):</span> Similar a SMA
                    pero da más peso a los datos recientes. Reacciona más rápido a los cambios de precio.
                  </p>
                  <p>
                    <span className="text-[#9C27B0] font-medium">Bandas de Bollinger:</span> Miden la volatilidad del
                    mercado. Precios cerca de la banda superior pueden indicar sobrecompra, mientras que precios cerca
                    de la banda inferior pueden indicar sobreventa.
                  </p>
                  <p>
                    <span className="text-[#FF9800] font-medium">RSI (Índice de Fuerza Relativa):</span> Mide la
                    velocidad y cambio de los movimientos de precios. Valores por encima de 70 indican sobrecompra,
                    mientras que valores por debajo de 30 indican sobreventa.
                  </p>
                  <p>
                    <span className="text-[#E91E63] font-medium">MACD:</span> Muestra la relación entre dos medias
                    móviles. El cruce de la línea MACD por encima de la línea de señal puede indicar una tendencia
                    alcista, mientras que un cruce por debajo puede indicar una tendencia bajista.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
