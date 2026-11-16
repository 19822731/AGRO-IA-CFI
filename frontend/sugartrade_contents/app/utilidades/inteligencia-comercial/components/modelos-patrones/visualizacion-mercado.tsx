"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, Calendar, ArrowUpDown, BarChart2, LineChartIcon, Network } from "lucide-react"

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
  ArcElement,
} from "chart.js"
import { Bar, Line, Pie, Scatter } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
)

// Tipos de datos
interface MarketData {
  date: string
  price: number
  volume: number
  openInterest: number
}

interface CorrelationData {
  factorA: string
  factorB: string
  correlation: number
  description: string
}

interface SeasonalPattern {
  month: string
  averagePrice: number
  priceChange: number
  volatility: number
  tradingVolume: number
}

interface PriceDistribution {
  priceRange: string
  frequency: number
  percentage: number
}

// Componente principal
export default function VisualizacionMercado() {
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("1y")
  const [dataType, setDataType] = useState("price")
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([])
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPattern[]>([])
  const [priceDistribution, setPriceDistribution] = useState<PriceDistribution[]>([])

  // Cargar datos simulados
  useEffect(() => {
    setLoading(true)

    // Simular carga de datos
    setTimeout(() => {
      setMarketData(generateMarketData())
      setCorrelationData(generateCorrelationData())
      setSeasonalPatterns(generateSeasonalPatterns())
      setPriceDistribution(generatePriceDistribution())
      setLoading(false)
    }, 1000)
  }, [timeframe])

  // Generar datos de mercado simulados
  const generateMarketData = (): MarketData[] => {
    const data: MarketData[] = []
    const dataPoints = timeframe === "1m" ? 30 : timeframe === "3m" ? 90 : timeframe === "6m" ? 180 : 365
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - dataPoints)

    let price = 400 // Precio inicial

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      // Simular cambios de precio con algo de volatilidad
      const change = (Math.random() - 0.5) * 10
      price += change

      // Asegurar que el precio no baje demasiado
      if (price < 350) price = 350 + Math.random() * 20

      // Simular volumen con variación
      const volume = 5000 + Math.random() * 3000

      // Simular interés abierto
      const openInterest = 15000 + Math.random() * 5000

      data.push({
        date: date.toISOString().split("T")[0],
        price: Math.round(price * 100) / 100,
        volume: Math.round(volume),
        openInterest: Math.round(openInterest),
      })
    }

    return data
  }

  // Generar datos de correlación simulados
  const generateCorrelationData = (): CorrelationData[] => {
    return [
      {
        factorA: "Precio del azúcar",
        factorB: "Producción de Brasil",
        correlation: -0.78,
        description:
          "Fuerte correlación negativa: cuando aumenta la producción en Brasil, tiende a bajar el precio global.",
      },
      {
        factorA: "Precio del azúcar",
        factorB: "Precio del petróleo",
        correlation: 0.65,
        description:
          "Correlación positiva: el aumento en los precios del petróleo suele coincidir con aumentos en el precio del azúcar.",
      },
      {
        factorA: "Precio del azúcar",
        factorB: "Valor del dólar",
        correlation: -0.52,
        description:
          "Correlación negativa moderada: un dólar más fuerte tiende a presionar a la baja los precios del azúcar.",
      },
      {
        factorA: "Precio del azúcar",
        factorB: "Consumo global",
        correlation: 0.48,
        description: "Correlación positiva moderada: el aumento del consumo global tiende a impulsar los precios.",
      },
      {
        factorA: "Precio del azúcar",
        factorB: "Inventarios globales",
        correlation: -0.82,
        description: "Fuerte correlación negativa: niveles altos de inventario presionan los precios a la baja.",
      },
      {
        factorA: "Volumen de comercio",
        factorB: "Volatilidad de precios",
        correlation: 0.71,
        description: "Correlación positiva fuerte: mayor volatilidad suele coincidir con mayor volumen de operaciones.",
      },
    ]
  }

  // Generar patrones estacionales simulados
  const generateSeasonalPatterns = (): SeasonalPattern[] => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    return months.map((month, index) => {
      // Simular patrones estacionales basados en el ciclo de producción de azúcar
      let averagePrice, priceChange, volatility, tradingVolume

      // Cosecha en Brasil (mayo-noviembre) - precios más bajos
      if (index >= 4 && index <= 10) {
        averagePrice = 380 + Math.random() * 20
        priceChange = -1 - Math.random() * 2
        volatility = 2 + Math.random() * 1
        tradingVolume = 7000 + Math.random() * 1000
      }
      // Fuera de temporada de cosecha - precios más altos
      else {
        averagePrice = 420 + Math.random() * 30
        priceChange = 1 + Math.random() * 2
        volatility = 3 + Math.random() * 2
        tradingVolume = 5000 + Math.random() * 1000
      }

      return {
        month,
        averagePrice: Math.round(averagePrice * 100) / 100,
        priceChange: Math.round(priceChange * 100) / 100,
        volatility: Math.round(volatility * 100) / 100,
        tradingVolume: Math.round(tradingVolume),
      }
    })
  }

  // Generar distribución de precios simulada
  const generatePriceDistribution = (): PriceDistribution[] => {
    // Crear rangos de precios
    const ranges = ["350-370", "370-390", "390-410", "410-430", "430-450", "450-470", "470-490"]

    // Distribución normal centrada en el rango medio
    const frequencies = [5, 12, 25, 35, 18, 4, 1]
    const total = frequencies.reduce((sum, freq) => sum + freq, 0)

    return ranges.map((range, index) => ({
      priceRange: range,
      frequency: frequencies[index],
      percentage: Math.round((frequencies[index] / total) * 1000) / 10,
    }))
  }

  // Preparar datos para el gráfico de precios
  const preparePriceChartData = () => {
    if (!marketData.length) return null

    return {
      labels: marketData.map((d) => d.date),
      datasets: [
        {
          label: "Precio (USD/ton)",
          data: marketData.map((d) => d.price),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    }
  }

  // Preparar datos para el gráfico de volumen
  const prepareVolumeChartData = () => {
    if (!marketData.length) return null

    return {
      labels: marketData.map((d) => d.date),
      datasets: [
        {
          label: "Volumen de operaciones",
          data: marketData.map((d) => d.volume),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  // Preparar datos para el gráfico de interés abierto
  const prepareOpenInterestChartData = () => {
    if (!marketData.length) return null

    return {
      labels: marketData.map((d) => d.date),
      datasets: [
        {
          label: "Interés abierto",
          data: marketData.map((d) => d.openInterest),
          backgroundColor: "rgba(153, 102, 255, 0.7)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  // Preparar datos para el gráfico de correlación
  const prepareCorrelationChartData = () => {
    if (!correlationData.length) return null

    return {
      labels: correlationData.map((d) => `${d.factorA} vs ${d.factorB}`),
      datasets: [
        {
          label: "Coeficiente de correlación",
          data: correlationData.map((d) => d.correlation),
          backgroundColor: correlationData.map((d) =>
            d.correlation > 0 ? "rgba(75, 192, 192, 0.7)" : "rgba(255, 99, 132, 0.7)",
          ),
          borderColor: correlationData.map((d) =>
            d.correlation > 0 ? "rgba(75, 192, 192, 1)" : "rgba(255, 99, 132, 1)",
          ),
          borderWidth: 1,
        },
      ],
    }
  }

  // Preparar datos para el gráfico de patrones estacionales
  const prepareSeasonalChartData = () => {
    if (!seasonalPatterns.length) return null

    return {
      labels: seasonalPatterns.map((d) => d.month),
      datasets: [
        {
          label: "Precio promedio (USD/ton)",
          data: seasonalPatterns.map((d) => d.averagePrice),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Volatilidad (%)",
          data: seasonalPatterns.map((d) => d.volatility),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: false,
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    }
  }

  // Preparar datos para el gráfico de distribución de precios
  const preparePriceDistributionChartData = () => {
    if (!priceDistribution.length) return null

    return {
      labels: priceDistribution.map((d) => d.priceRange),
      datasets: [
        {
          label: "Frecuencia (%)",
          data: priceDistribution.map((d) => d.percentage),
          backgroundColor: [
            "rgba(75, 192, 192, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(153, 102, 255, 0.7)",
            "rgba(255, 159, 64, 0.7)",
            "rgba(255, 99, 132, 0.7)",
            "rgba(255, 205, 86, 0.7)",
            "rgba(201, 203, 207, 0.7)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(201, 203, 207, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  // Preparar datos para el gráfico de dispersión precio-volumen
  const preparePriceVolumeScatterData = () => {
    if (!marketData.length) return null

    return {
      datasets: [
        {
          label: "Precio vs Volumen",
          data: marketData.map((d) => ({
            x: d.price,
            y: d.volume,
          })),
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    }
  }

  // Opciones para los gráficos de líneas
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          maxTicksLimit: 12,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      tooltip: {
        backgroundColor: "rgba(10, 15, 41, 0.9)",
        titleColor: "#00a8ff",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  }

  // Opciones para los gráficos de barras
  const barChartOptions = {
    ...lineChartOptions,
    scales: {
      ...lineChartOptions.scales,
      y: {
        ...lineChartOptions.scales.y,
        beginAtZero: true,
      },
    },
  }

  // Opciones para el gráfico de patrones estacionales
  const seasonalChartOptions = {
    ...lineChartOptions,
    scales: {
      ...lineChartOptions.scales,
      y: {
        ...lineChartOptions.scales.y,
        position: "left" as const,
        title: {
          display: true,
          text: "Precio (USD/ton)",
          color: "rgba(75, 192, 192, 1)",
        },
      },
      y1: {
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 99, 132, 0.7)",
        },
        title: {
          display: true,
          text: "Volatilidad (%)",
          color: "rgba(255, 99, 132, 1)",
        },
      },
    },
  }

  // Opciones para el gráfico de pastel
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "white",
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(10, 15, 41, 0.9)",
        titleColor: "#00a8ff",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
      },
    },
  }

  // Opciones para el gráfico de dispersión
  const scatterChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        title: {
          display: true,
          text: "Precio (USD/ton)",
          color: "white",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        title: {
          display: true,
          text: "Volumen",
          color: "white",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      tooltip: {
        backgroundColor: "rgba(10, 15, 41, 0.9)",
        titleColor: "#00a8ff",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
      },
    },
  }

  // Renderizar componente de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Visualización de Patrones de Mercado</h2>
          <p className="text-muted-foreground">
            Análisis visual de tendencias, correlaciones y patrones en el mercado azucarero
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 mes</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tendencias">
        <TabsList className="grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="tendencias">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Tendencias
          </TabsTrigger>
          <TabsTrigger value="correlaciones">
            <Network className="h-4 w-4 mr-2" />
            Correlaciones
          </TabsTrigger>
          <TabsTrigger value="estacionalidad">
            <Calendar className="h-4 w-4 mr-2" />
            Estacionalidad
          </TabsTrigger>
          <TabsTrigger value="distribucion">
            <BarChart2 className="h-4 w-4 mr-2" />
            Distribución
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Tendencias */}
        <TabsContent value="tendencias" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-3">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Evolución del Precio del Azúcar</CardTitle>
                  <Select value={dataType} onValueChange={setDataType}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Tipo de datos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Precio</SelectItem>
                      <SelectItem value="volume">Volumen</SelectItem>
                      <SelectItem value="openInterest">Interés Abierto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  {dataType === "price"
                    ? "Evolución histórica del precio del azúcar (USD/ton)"
                    : dataType === "volume"
                      ? "Volumen diario de operaciones"
                      : "Evolución del interés abierto en contratos de futuros"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {dataType === "price" && preparePriceChartData() && (
                    <Line data={preparePriceChartData()!} options={lineChartOptions} />
                  )}
                  {dataType === "volume" && prepareVolumeChartData() && (
                    <Bar data={prepareVolumeChartData()!} options={barChartOptions} />
                  )}
                  {dataType === "openInterest" && prepareOpenInterestChartData() && (
                    <Bar data={prepareOpenInterestChartData()!} options={barChartOptions} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis Técnico</CardTitle>
                <CardDescription>Indicadores técnicos y patrones de precio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      <span>Tendencia actual</span>
                    </div>
                    <span className="font-medium text-green-500">Alcista</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Soporte</p>
                      <p className="font-medium">$385.00</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Resistencia</p>
                      <p className="font-medium">$425.00</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">RSI (14)</p>
                      <p className="font-medium">58.3</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">MACD</p>
                      <p className="font-medium text-green-500">Positivo</p>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Patrones identificados:</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center">
                        <ArrowUpDown className="h-4 w-4 mr-1 text-blue-500" />
                        Consolidación en rango $400-$420
                      </li>
                      <li className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                        Ruptura de resistencia en $410
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relación Precio-Volumen</CardTitle>
                <CardDescription>Análisis de la relación entre precio y volumen de operaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {preparePriceVolumeScatterData() && (
                    <Scatter data={preparePriceVolumeScatterData()!} options={scatterChartOptions} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Correlaciones */}
        <TabsContent value="correlaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Correlaciones de Mercado</CardTitle>
              <CardDescription>Análisis de correlaciones entre el precio del azúcar y otros factores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {prepareCorrelationChartData() && (
                  <Bar data={prepareCorrelationChartData()!} options={barChartOptions} />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de Correlaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left border-b">Factores</th>
                      <th className="p-2 text-center border-b">Correlación</th>
                      <th className="p-2 text-left border-b">Interpretación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {correlationData.map((item, index) => (
                      <tr key={index} className="hover:bg-muted">
                        <td className="p-2 border-b">
                          <span className="font-medium">{item.factorA}</span> vs <span>{item.factorB}</span>
                        </td>
                        <td
                          className={`p-2 text-center border-b ${
                            item.correlation > 0.7
                              ? "text-green-500"
                              : item.correlation > 0.3
                                ? "text-blue-500"
                                : item.correlation < -0.7
                                  ? "text-red-500"
                                  : item.correlation < -0.3
                                    ? "text-amber-500"
                                    : ""
                          }`}
                        >
                          {item.correlation > 0 ? "+" : ""}
                          {item.correlation.toFixed(2)}
                        </td>
                        <td className="p-2 border-b text-sm">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Estacionalidad */}
        <TabsContent value="estacionalidad" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patrones Estacionales</CardTitle>
              <CardDescription>Análisis de patrones estacionales en el precio y volatilidad del azúcar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {prepareSeasonalChartData() && (
                  <Line data={prepareSeasonalChartData()!} options={seasonalChartOptions} />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles Estacionales por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left border-b">Mes</th>
                      <th className="p-2 text-center border-b">Precio Promedio</th>
                      <th className="p-2 text-center border-b">Cambio (%)</th>
                      <th className="p-2 text-center border-b">Volatilidad (%)</th>
                      <th className="p-2 text-center border-b">Volumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonalPatterns.map((item, index) => (
                      <tr key={index} className="hover:bg-muted">
                        <td className="p-2 border-b font-medium">{item.month}</td>
                        <td className="p-2 text-center border-b">${item.averagePrice.toFixed(2)}</td>
                        <td
                          className={`p-2 text-center border-b ${
                            item.priceChange > 0 ? "text-green-500" : item.priceChange < 0 ? "text-red-500" : ""
                          }`}
                        >
                          {item.priceChange > 0 ? "+" : ""}
                          {item.priceChange}%
                        </td>
                        <td className="p-2 text-center border-b">{item.volatility}%</td>
                        <td className="p-2 text-center border-b">{item.tradingVolume.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Distribución */}
        <TabsContent value="distribucion" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Precios</CardTitle>
                <CardDescription>Distribución de frecuencia de los precios del azúcar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {preparePriceDistributionChartData() && (
                    <Pie data={preparePriceDistributionChartData()!} options={pieChartOptions} />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Distribución</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Rango de precios más frecuente:</p>
                    <p className="text-lg font-bold">$390-$410 (35%)</p>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Interpretación:</p>
                    <p className="text-sm">
                      La distribución de precios muestra una concentración en el rango medio ($390-$410), lo que indica
                      un mercado relativamente estable. Los precios extremos (por debajo de $370 o por encima de $450)
                      son poco frecuentes, representando menos del 10% de las observaciones.
                    </p>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Implicaciones para operaciones:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Considerar estrategias de rango en el intervalo $390-$410</li>
                      <li>• Potencial de ruptura si el precio supera consistentemente $430</li>
                      <li>• Soporte fuerte en la zona de $370-$390</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de Distribución de Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left border-b">Rango de Precio</th>
                      <th className="p-2 text-center border-b">Frecuencia</th>
                      <th className="p-2 text-center border-b">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceDistribution.map((item, index) => (
                      <tr key={index} className="hover:bg-muted">
                        <td className="p-2 border-b font-medium">${item.priceRange}</td>
                        <td className="p-2 text-center border-b">{item.frequency}</td>
                        <td className="p-2 text-center border-b">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
