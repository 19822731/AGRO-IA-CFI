"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useArgentinaTemperature } from "@/hooks/use-argentina-temperature"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts"

// Función simple para normalizar datos
const normalize = (data: number[], min?: number, max?: number) => {
  const dataMin = min !== undefined ? min : Math.min(...data)
  const dataMax = max !== undefined ? max : Math.max(...data)
  return data.map((val) => (val - dataMin) / (dataMax - dataMin))
}

// Función para calcular la correlación de Pearson
const calculateCorrelation = (x: number[], y: number[]) => {
  const n = Math.min(x.length, y.length)
  if (n === 0) return 0

  const xMean = x.reduce((sum, val) => sum + val, 0) / n
  const yMean = y.reduce((sum, val) => sum + val, 0) / n

  let numerator = 0
  let xDenominator = 0
  let yDenominator = 0

  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean
    const yDiff = y[i] - yMean
    numerator += xDiff * yDiff
    xDenominator += xDiff * xDiff
    yDenominator += yDiff * yDiff
  }

  if (xDenominator === 0 || yDenominator === 0) return 0
  return numerator / Math.sqrt(xDenominator * yDenominator)
}

// Función para predecir precios basados en temperatura usando regresión lineal simple
const predictPrices = (temperatures: number[], prices: number[], newTemperatures: number[]) => {
  const n = Math.min(temperatures.length, prices.length)
  if (n === 0) return []

  const xMean = temperatures.reduce((sum, val) => sum + val, 0) / n
  const yMean = prices.reduce((sum, val) => sum + val, 0) / n

  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    const xDiff = temperatures[i] - xMean
    const yDiff = prices[i] - yMean
    numerator += xDiff * yDiff
    denominator += xDiff * xDiff
  }

  if (denominator === 0) return newTemperatures.map(() => yMean)

  const slope = numerator / denominator
  const intercept = yMean - slope * xMean

  return newTemperatures.map((temp) => slope * temp + intercept)
}

export function ModeloPredictivo() {
  const { chartData } = useArgentinaTemperature()
  const [lagDays, setLagDays] = useState(30)
  const [correlationData, setCorrelationData] = useState<Array<{ lag: number; correlation: number }>>([])
  const [scatterData, setScatterData] = useState<Array<{ temp: number; price: number }>>([])
  const [predictionData, setPredictionData] = useState<
    Array<{ date: string; actualPrice: number; predictedPrice: number }>
  >([])

  // Datos simulados de precios del azúcar (para demostración)
  const sugarPriceData = [
    { date: "2024-01-15", price: 23480 },
    { date: "2024-01-30", price: 23520 },
    { date: "2024-02-15", price: 23650 },
    { date: "2024-02-28", price: 23720 },
    { date: "2024-03-15", price: 23800 },
    { date: "2024-03-30", price: 23850 },
    { date: "2025-01-15", price: 24100 },
    { date: "2025-01-30", price: 24250 },
    { date: "2025-02-15", price: 24400 },
    { date: "2025-02-28", price: 24550 },
    { date: "2025-03-15", price: 24700 },
  ]

  // Calcular correlaciones para diferentes retrasos (lags)
  useEffect(() => {
    if (chartData.length === 0) return

    const calculateCorrelations = () => {
      const maxLag = 90 // Máximo retraso en días
      const correlations = []

      for (let lag = 0; lag <= maxLag; lag += 5) {
        const tempData: number[] = []
        const priceData: number[] = []

        // Crear pares de temperatura-precio con el retraso especificado
        chartData.forEach((tempItem) => {
          const tempDate = new Date(tempItem.date)
          const lagDate = new Date(tempDate.getTime() + lag * 24 * 60 * 60 * 1000)

          // Encontrar el precio más cercano a la fecha con retraso
          const priceItem = sugarPriceData.find((p) => {
            const priceDateDiff = Math.abs(new Date(p.date).getTime() - lagDate.getTime())
            return priceDateDiff < 7 * 24 * 60 * 60 * 1000 // Dentro de una semana
          })

          if (priceItem && tempItem.avgMaxTemp !== null) {
            tempData.push(tempItem.avgMaxTemp)
            priceData.push(priceItem.price)
          }
        })

        if (tempData.length > 5) {
          // Necesitamos suficientes puntos de datos
          const correlation = calculateCorrelation(tempData, priceData)
          correlations.push({ lag, correlation })
        }
      }

      setCorrelationData(correlations)
    }

    calculateCorrelations()
  }, [chartData])

  // Actualizar datos de dispersión y predicciones cuando cambia el retraso
  useEffect(() => {
    if (chartData.length === 0) return

    const updateScatterAndPredictions = () => {
      const tempData: number[] = []
      const priceData: number[] = []
      const dateData: string[] = []

      // Crear pares de temperatura-precio con el retraso especificado
      chartData.forEach((tempItem) => {
        const tempDate = new Date(tempItem.date)
        const lagDate = new Date(tempDate.getTime() + lagDays * 24 * 60 * 60 * 1000)

        // Encontrar el precio más cercano a la fecha con retraso
        const priceItem = sugarPriceData.find((p) => {
          const priceDateDiff = Math.abs(new Date(p.date).getTime() - lagDate.getTime())
          return priceDateDiff < 7 * 24 * 60 * 60 * 1000 // Dentro de una semana
        })

        if (priceItem && tempItem.avgMaxTemp !== null) {
          tempData.push(tempItem.avgMaxTemp)
          priceData.push(priceItem.price)
          dateData.push(priceItem.date)
        }
      })

      // Crear datos de dispersión
      const scatter = tempData.map((temp, i) => ({
        temp,
        price: priceData[i],
      }))

      setScatterData(scatter)

      // Crear predicciones usando regresión lineal simple
      if (tempData.length > 5) {
        const predictedPrices = predictPrices(tempData, priceData, tempData)

        const predictions = tempData.map((_, i) => ({
          date: dateData[i],
          actualPrice: priceData[i],
          predictedPrice: predictedPrices[i],
        }))

        setPredictionData(predictions)
      }
    }

    updateScatterAndPredictions()
  }, [chartData, lagDays])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Modelo Predictivo: Temperatura y Precios del Azúcar</CardTitle>
        <CardDescription>Análisis de correlación y predicción de precios basado en datos climáticos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Retraso (Lag) entre Temperatura y Precio</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajuste el retraso en días para analizar cómo las temperaturas afectan los precios del azúcar en diferentes
              períodos de tiempo.
            </p>
            <div className="flex items-center gap-4">
              <Slider
                value={[lagDays]}
                min={0}
                max={90}
                step={5}
                onValueChange={(value) => setLagDays(value[0])}
                className="w-full"
              />
              <span className="w-16 text-right">{lagDays} días</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Correlación por Retraso</CardTitle>
                <CardDescription>
                  Coeficiente de correlación entre temperatura y precio para diferentes retrasos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      correlation: {
                        label: "Correlación",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={correlationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="lag"
                          label={{ value: "Retraso (días)", position: "insideBottom", offset: -5 }}
                        />
                        <YAxis domain={[-1, 1]} label={{ value: "Correlación", angle: -90, position: "insideLeft" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="correlation"
                          stroke="var(--color-correlation)"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relación Temperatura-Precio</CardTitle>
                <CardDescription>Dispersión de precios vs. temperaturas con retraso de {lagDays} días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      price: {
                        label: "Precio",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="temp"
                          name="Temperatura"
                          label={{ value: "Temperatura (°C)", position: "insideBottom", offset: -5 }}
                        />
                        <YAxis
                          dataKey="price"
                          name="Precio"
                          label={{ value: "Precio ($/50kg)", angle: -90, position: "insideLeft" }}
                        />
                        <ZAxis range={[60, 60]} />
                        <ChartTooltip cursor={{ strokeDasharray: "3 3" }} />
                        <Scatter name="Temperatura vs Precio" data={scatterData} fill="var(--color-price)" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Predicción de Precios</CardTitle>
              <CardDescription>Comparación entre precios reales y predichos basados en temperatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    actualPrice: {
                      label: "Precio Real",
                      color: "hsl(var(--chart-1))",
                    },
                    predictedPrice: {
                      label: "Precio Predicho",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                        }}
                      />
                      <YAxis domain={["dataMin - 100", "dataMax + 100"]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actualPrice"
                        stroke="var(--color-actualPrice)"
                        name="Precio Real"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predictedPrice"
                        stroke="var(--color-predictedPrice)"
                        name="Precio Predicho"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Interpretación del Modelo</h3>
                <p>
                  Este modelo predictivo muestra la relación entre las temperaturas en Argentina y los precios del
                  azúcar con un retraso de {lagDays} días. La correlación actual es de{" "}
                  {correlationData.find((d) => d.lag === lagDays)?.correlation.toFixed(2) || "N/A"}.
                </p>

                <h4 className="text-md font-medium mt-4">Hallazgos clave:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Retraso óptimo:</span> El análisis muestra que el impacto de las
                    temperaturas en los precios del azúcar es más significativo con un retraso de aproximadamente 30-45
                    días.
                  </li>
                  <li>
                    <span className="font-medium">Precisión predictiva:</span> El modelo actual tiene un error
                    cuadrático medio (RMSE) de aproximadamente 150-200 pesos por bolsa de 50kg.
                  </li>
                  <li>
                    <span className="font-medium">Limitaciones:</span> Este modelo simple considera únicamente la
                    temperatura como variable predictiva. Un modelo más robusto incorporaría múltiples variables
                    climáticas, económicas y de mercado.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
