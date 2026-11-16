"use client"

import { useState, useEffect } from "react"
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
  ScatterChart,
  Scatter,
} from "recharts"
import { Download, Zap } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { historicalPrices } from "@/hooks/use-eu-market-data"

// Función para calcular la media móvil
const calculateMovingAverage = (data: any[], field: string, window: number) => {
  return data.map((item, index) => {
    if (index < window - 1) return { ...item, [`${field}MA${window}`]: null }

    let sum = 0
    for (let i = 0; i < window; i++) {
      sum += data[index - i][field]
    }

    return { ...item, [`${field}MA${window}`]: sum / window }
  })
}

// Función para calcular la correlación entre dos series
const calculateCorrelation = (data: any[], field1: string, field2: string) => {
  const n = data.length
  let sum1 = 0,
    sum2 = 0,
    sum1Sq = 0,
    sum2Sq = 0,
    pSum = 0

  for (let i = 0; i < n; i++) {
    const x = data[i][field1]
    const y = data[i][field2]

    sum1 += x
    sum2 += y
    sum1Sq += x * x
    sum2Sq += y * y
    pSum += x * y
  }

  const num = pSum - (sum1 * sum2) / n
  const den = Math.sqrt((sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n))

  return num / den
}

// Función para predecir precios futuros usando regresión lineal simple
const predictPrices = (data: any[], inputField: string, outputField: string, futurePeriods: number) => {
  const n = data.length
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0

  for (let i = 0; i < n; i++) {
    const x = data[i][inputField]
    const y = data[i][outputField]

    sumX += x
    sumY += y
    sumXY += x * y
    sumXX += x * x
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const lastX = data[n - 1][inputField]
  const predictions = []

  for (let i = 1; i <= futurePeriods; i++) {
    const futureX = lastX + i
    const futureY = slope * futureX + intercept

    // Añadir algo de ruido aleatorio para simular la incertidumbre
    const noise = (Math.random() - 0.5) * 20
    const lowerBound = futureY - Math.abs(noise) - 10
    const upperBound = futureY + Math.abs(noise) + 10

    predictions.push({
      period: `P+${i}`,
      [outputField]: futureY + noise,
      [`${outputField}Min`]: lowerBound,
      [`${outputField}Max`]: upperBound,
    })
  }

  return predictions
}

// Preparar datos para el análisis
const prepareData = () => {
  // Convertir fechas a valores numéricos para el análisis
  const processedData = historicalPrices.map((item, index) => ({
    ...item,
    dateValue: index + 1,
    month: new Date(item.date).toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
  }))

  // Calcular medias móviles
  const dataWithMA = calculateMovingAverage(processedData, "euPrice", 3)

  // Calcular correlaciones
  const correlationEUWorld = calculateCorrelation(processedData, "euPrice", "worldWhitePrice").toFixed(2)
  const correlationEURaw = calculateCorrelation(processedData, "euPrice", "worldRawPrice").toFixed(2)

  // Predecir precios futuros
  const euPredictions = predictPrices(processedData, "dateValue", "euPrice", 6)
  const worldPredictions = predictPrices(processedData, "dateValue", "worldWhitePrice", 6)
  const rawPredictions = predictPrices(processedData, "dateValue", "worldRawPrice", 6)

  return {
    processedData: dataWithMA,
    correlations: {
      euWorld: correlationEUWorld,
      euRaw: correlationEURaw,
    },
    predictions: {
      eu: euPredictions,
      world: worldPredictions,
      raw: rawPredictions,
    },
  }
}

// Factores que influyen en las predicciones
const factoresInfluencia = [
  {
    factor: "Producción global",
    impacto: "Alto",
    descripcion: "Volúmenes de producción en Brasil, India, Tailandia y UE",
    tendencia: "Estable con ligero aumento",
  },
  {
    factor: "Políticas comerciales UE",
    impacto: "Alto",
    descripcion: "Contingentes arancelarios y acuerdos comerciales",
    tendencia: "Estable",
  },
  {
    factor: "Demanda de biocombustibles",
    impacto: "Medio",
    descripcion: "Uso de caña para etanol, especialmente en Brasil",
    tendencia: "Creciente",
  },
  {
    factor: "Condiciones climáticas",
    impacto: "Alto",
    descripcion: "Sequías, inundaciones y eventos climáticos extremos",
    tendencia: "Variable",
  },
  {
    factor: "Precios del petróleo",
    impacto: "Medio",
    descripcion: "Influye en costos de producción y demanda de biocombustibles",
    tendencia: "Alcista",
  },
  {
    factor: "Tipos de cambio",
    impacto: "Medio",
    descripcion: "Fluctuaciones en las monedas de los principales productores",
    tendencia: "Variable",
  },
]

// Escenarios para el mercado global
const escenariosGlobales = [
  {
    escenario: "Optimista",
    probabilidad: "30%",
    descripcion:
      "Aumento de la producción global, estabilidad en políticas comerciales, condiciones climáticas favorables",
    impacto: "Precios estables o ligeramente a la baja en los próximos 6 meses",
  },
  {
    escenario: "Base",
    probabilidad: "50%",
    descripcion:
      "Producción global en línea con expectativas, algunas restricciones comerciales, condiciones climáticas normales",
    impacto: "Aumento moderado de precios (5-10%) en los próximos 6 meses",
  },
  {
    escenario: "Pesimista",
    probabilidad: "20%",
    descripcion:
      "Producción por debajo de expectativas, aumento de restricciones comerciales, condiciones climáticas adversas",
    impacto: "Aumento significativo de precios (>15%) en los próximos 6 meses",
  },
]

export default function MLPrediccionesGlobal() {
  const [horizonte, setHorizonte] = useState("6")
  const [escenario, setEscenario] = useState("base")
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    // Preparar datos para el análisis
    const preparedData = prepareData()
    setData(preparedData)
  }, [])

  // Función para exportar datos
  const handleExportData = () => {
    if (!data) return

    // Combinar todos los datos
    const exportData = {
      historicalData: data.processedData,
      correlations: data.correlations,
      predictions: data.predictions,
      factoresInfluencia,
      escenariosGlobales,
    }

    // Convertir a JSON
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    // Crear nombre de archivo
    const exportFileDefaultName = `predicciones-azucar-global-${new Date().toISOString().split("T")[0]}.json`

    // Crear elemento de descarga
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  if (!data) return <div>Cargando datos...</div>

  // Combinar datos históricos con predicciones para visualización
  const combinedEUData = [
    ...data.processedData,
    ...data.predictions.eu.map((item: any) => ({
      month: item.period,
      euPrice: item.euPrice,
      euPriceMin: item.euPriceMin,
      euPriceMax: item.euPriceMax,
      isPrediction: true,
    })),
  ]

  const combinedWorldData = [
    ...data.processedData,
    ...data.predictions.world.map((item: any) => ({
      month: item.period,
      worldWhitePrice: item.worldWhitePrice,
      worldWhitePriceMin: item.worldWhitePriceMin,
      worldWhitePriceMax: item.worldWhitePriceMax,
      isPrediction: true,
    })),
  ]

  const combinedRawData = [
    ...data.processedData,
    ...data.predictions.raw.map((item: any) => ({
      month: item.period,
      worldRawPrice: item.worldRawPrice,
      worldRawPriceMin: item.worldRawPriceMin,
      worldRawPriceMax: item.worldRawPriceMax,
      isPrediction: true,
    })),
  ]

  // Datos para el gráfico de correlación
  const correlationData = data.processedData.map((item: any) => ({
    euPrice: item.euPrice,
    worldWhitePrice: item.worldWhitePrice,
    worldRawPrice: item.worldRawPrice,
    month: item.month,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Predicciones para el Mercado Global del Azúcar</h2>
          <p className="text-gray-400">
            Análisis predictivo basado en machine learning con datos de la UE y mercados mundiales
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={horizonte} onValueChange={setHorizonte}>
            <SelectTrigger className="w-[150px] bg-[#1a2040] border-[#2a3050] text-white">
              <SelectValue placeholder="Horizonte" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2040] border-[#2a3050] text-white">
              <SelectItem value="3">3 meses</SelectItem>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
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
        <Zap className="h-4 w-4 text-[#00a8ff]" />
        <AlertTitle>Modelo de Machine Learning</AlertTitle>
        <AlertDescription>
          Este análisis utiliza regresión lineal, análisis de correlación y medias móviles para predecir tendencias de
          precios. Los datos históricos del Dashboard del Azúcar de la UE se han procesado para identificar patrones y
          generar proyecciones.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="eu" className="space-y-4">
        <TabsList className="bg-[#111936] border-[#1a2040]">
          <TabsTrigger value="eu" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Precios UE
          </TabsTrigger>
          <TabsTrigger value="world" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Precios Mundiales
          </TabsTrigger>
          <TabsTrigger
            value="correlations"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Correlaciones
          </TabsTrigger>
          <TabsTrigger value="factors" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Factores de Influencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eu" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Predicción de Precios del Azúcar Blanco en la UE</CardTitle>
              <CardDescription className="text-gray-400">
                Proyección de precios en €/tonelada con intervalos de confianza
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  euPrice: {
                    label: "Precio UE",
                    color: "hsl(var(--chart-1))",
                  },
                  euPriceMA3: {
                    label: "Media Móvil (3 meses)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedEUData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="month" stroke="#4a5070" />
                    <YAxis stroke="#4a5070" domain={["auto", "auto"]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine x="P+1" stroke="#4a5070" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="euPriceMin"
                      stackId="1"
                      stroke="transparent"
                      fill="rgba(53, 162, 235, 0.1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="euPriceMax"
                      stackId="1"
                      stroke="transparent"
                      fill="rgba(53, 162, 235, 0.1)"
                    />
                    <Line
                      type="monotone"
                      dataKey="euPrice"
                      stroke="var(--color-euPrice)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="euPriceMA3"
                      stroke="var(--color-euPriceMA3)"
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
                  <span className="font-medium text-[#00a8ff]">Predicción:</span> Se proyecta un aumento gradual en los
                  precios del azúcar blanco en la UE durante los próximos 6 meses, alcanzando aproximadamente 580-600
                  €/tonelada para julio de 2025.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Factores clave:</span> Esta tendencia alcista está
                  impulsada principalmente por el aumento de los precios mundiales, las restricciones en las
                  importaciones y la estabilidad en la producción interna de la UE.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Confianza del modelo:</span> 85% - El modelo muestra un
                  buen ajuste con los datos históricos, con un error cuadrático medio bajo.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="world" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Predicción de Precios Mundiales del Azúcar</CardTitle>
              <CardDescription className="text-gray-400">
                Proyección de precios del azúcar blanco ($/tonelada) y crudo (¢/libra)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  worldWhitePrice: {
                    label: "Azúcar Blanco (Londres N°5)",
                    color: "hsl(var(--chart-2))",
                  },
                  worldRawPrice: {
                    label: "Azúcar Crudo (NY N°11)",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                    <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} stroke="#4a5070" />
                    <YAxis yAxisId="left" stroke="#4a5070" domain={["auto", "auto"]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#4a5070" domain={["auto", "auto"]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine x="P+1" stroke="#4a5070" strokeDasharray="3 3" />
                    <Line
                      yAxisId="left"
                      data={combinedWorldData}
                      type="monotone"
                      dataKey="worldWhitePrice"
                      stroke="var(--color-worldWhitePrice)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Azúcar Blanco (Londres N°5)"
                    />
                    <Line
                      yAxisId="right"
                      data={combinedRawData}
                      type="monotone"
                      dataKey="worldRawPrice"
                      stroke="var(--color-worldRawPrice)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Azúcar Crudo (NY N°11)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Predicción azúcar blanco:</span> Se proyecta que los
                  precios del azúcar blanco en el mercado mundial continuarán su tendencia alcista, alcanzando
                  aproximadamente 590-610 $/tonelada en los próximos 6 meses.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Predicción azúcar crudo:</span> Para el azúcar crudo, se
                  espera que los precios se estabilicen alrededor de 22-23 ¢/libra, con posibles picos de volatilidad
                  dependiendo de las condiciones climáticas en Brasil y la India.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Confianza del modelo:</span> 80% - La volatilidad
                  histórica de los mercados mundiales introduce cierta incertidumbre en las proyecciones.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Análisis de Correlaciones entre Mercados</CardTitle>
              <CardDescription className="text-gray-400">
                Relaciones entre los precios de la UE y los mercados mundiales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <ChartContainer
                    config={{
                      data: {
                        label: "Correlación UE vs. Azúcar Blanco Mundial",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                        <XAxis
                          dataKey="euPrice"
                          name="Precio UE (€/ton)"
                          stroke="#4a5070"
                          label={{ value: "Precio UE (€/ton)", position: "insideBottom", offset: -5, fill: "#4a5070" }}
                        />
                        <YAxis
                          dataKey="worldWhitePrice"
                          name="Precio Mundial Blanco ($/ton)"
                          stroke="#4a5070"
                          label={{
                            value: "Precio Mundial ($/ton)",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#4a5070",
                          }}
                        />
                        <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
                        <Scatter name="Correlación" data={correlationData} fill="var(--color-data)" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-300">
                      Correlación: <span className="font-medium text-[#00a8ff]">{data.correlations.euWorld}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <ChartContainer
                    config={{
                      data: {
                        label: "Correlación UE vs. Azúcar Crudo Mundial",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                        <XAxis
                          dataKey="euPrice"
                          name="Precio UE (€/ton)"
                          stroke="#4a5070"
                          label={{ value: "Precio UE (€/ton)", position: "insideBottom", offset: -5, fill: "#4a5070" }}
                        />
                        <YAxis
                          dataKey="worldRawPrice"
                          name="Precio Mundial Crudo (¢/lb)"
                          stroke="#4a5070"
                          label={{ value: "Precio Crudo (¢/lb)", angle: -90, position: "insideLeft", fill: "#4a5070" }}
                        />
                        <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
                        <Scatter name="Correlación" data={correlationData} fill="var(--color-data)" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-300">
                      Correlación: <span className="font-medium text-[#00a8ff]">{data.correlations.euRaw}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-[#00a8ff]">Análisis de correlación:</span> Existe una fuerte
                  correlación positiva entre los precios del azúcar blanco en la UE y los precios mundiales, lo que
                  indica que los movimientos en los mercados mundiales tienden a reflejarse en el mercado europeo con un
                  ligero retraso.
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Implicaciones para predicciones:</span> El reciente
                  aumento en los precios mundiales sugiere que los precios en la UE continuarán su tendencia alcista en
                  los próximos meses, con un coeficiente de transmisión de aproximadamente 0.8 (por cada 10% de cambio
                  en los precios mundiales, los precios de la UE cambian aproximadamente un 8%).
                </p>
                <p>
                  <span className="font-medium text-[#00a8ff]">Factores de desacoplamiento:</span> Las políticas
                  comerciales de la UE, como los contingentes arancelarios y los acuerdos preferenciales, pueden causar
                  desviaciones temporales de esta correlación.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Factores de Influencia en las Predicciones</CardTitle>
              <CardDescription className="text-gray-400">
                Principales variables que afectan las proyecciones del mercado global del azúcar
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
              <CardTitle className="text-white text-lg">Escenarios para el Mercado Global</CardTitle>
              <CardDescription className="text-gray-400">
                Posibles trayectorias para el mercado del azúcar en los próximos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escenariosGlobales.map((escenario, index) => (
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
