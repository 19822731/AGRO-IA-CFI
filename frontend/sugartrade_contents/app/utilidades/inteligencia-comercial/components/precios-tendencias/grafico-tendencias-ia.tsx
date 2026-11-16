"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts"
import { Sparkles, Calendar, TrendingUp, Eye, SlidersHorizontal, Info } from "lucide-react"

interface DataPoint {
  date: string
  timestamp: number
  precioReal?: number
  prediccionIA?: number
  rangoSuperior?: number
  rangoInferior?: number
  sma20?: number
  tipo: "historico" | "proyeccion"
}

interface GraficoTendenciasIAProps {
  selectedTicker: string
}

export default function GraficoTendenciasIA({ selectedTicker }: GraficoTendenciasIAProps) {
  const [timeRange, setTimeRange] = useState<"1M" | "3M" | "6M" | "1Y" | "TODO">("3M")
  const [showSMA, setShowSMA] = useState<boolean>(true)
  const [showConfidence, setShowConfidence] = useState<boolean>(true)
  const [metricUnit, setMetricUnit] = useState<string>("ARS")

  // Generador de datos históricos + proyección IA dinámica
  const chartData: DataPoint[] = useMemo(() => {
    const data: DataPoint[] = []
    const now = new Date()

    // Configuración base según el ticker seleccionado
    let basePrice = 38450
    let volatility = 280
    let unitLabel = "ARS"
    let stepTrend = 18

    if (selectedTicker === "ice-ny-11") {
      basePrice = 21.42
      volatility = 0.25
      unitLabel = "¢/lb"
      stepTrend = 0.02
    } else if (selectedTicker === "ice-london-5") {
      basePrice = 542.8
      volatility = 4.5
      unitLabel = "USD/t"
      stepTrend = 0.35
    } else if (selectedTicker === "paridad-fob") {
      basePrice = 518.5
      volatility = 3.8
      unitLabel = "USD/t"
      stepTrend = 0.3
    }
    setMetricUnit(unitLabel)

    // Determinar cantidad de días históricos según timeRange
    let historicalDays = 90
    if (timeRange === "1M") historicalDays = 30
    else if (timeRange === "3M") historicalDays = 90
    else if (timeRange === "6M") historicalDays = 180
    else if (timeRange === "1Y") historicalDays = 365
    else if (timeRange === "TODO") historicalDays = 500

    let currentPrice = basePrice - historicalDays * (stepTrend * 0.7)

    // Generar días históricos
    for (let i = historicalDays; i >= 1; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)

      const noise = (Math.sin(i * 0.25) * volatility) + ((Math.random() - 0.49) * volatility * 0.8)
      currentPrice += (stepTrend * 0.7) + noise * 0.1
      const priceVal = Math.round(currentPrice * 100) / 100

      const dateStr = d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })

      data.push({
        date: dateStr,
        timestamp: d.getTime(),
        precioReal: priceVal,
        tipo: "historico",
      })
    }

    // Calcular SMA 20 simple para histórico
    for (let i = 0; i < data.length; i++) {
      if (i >= 19) {
        const sum = data.slice(i - 19, i + 1).reduce((acc, curr) => acc + (curr.precioReal || 0), 0)
        data[i].sma20 = Math.round((sum / 20) * 100) / 100
      }
    }

    // El último punto histórico conecta con la proyección IA
    const lastHistorical = data[data.length - 1]
    lastHistorical.prediccionIA = lastHistorical.precioReal
    lastHistorical.rangoSuperior = lastHistorical.precioReal
    lastHistorical.rangoInferior = lastHistorical.precioReal

    // Generar 30 días futuros de proyección IA
    let forecastPrice = lastHistorical.precioReal || basePrice
    for (let j = 1; j <= 30; j++) {
      const d = new Date(now)
      d.setDate(d.getDate() + j)

      // Algoritmo predictivo simulado con leve canal alcista y cono de incertidumbre expansivo
      const trendGain = stepTrend * 1.15
      forecastPrice += trendGain + (Math.sin(j * 0.4) * (volatility * 0.35))
      const roundedForecast = Math.round(forecastPrice * 100) / 100

      const uncertainty = (volatility * 0.6) + (j * (volatility * 0.08))

      const dateStr = d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })

      data.push({
        date: dateStr,
        timestamp: d.getTime(),
        prediccionIA: roundedForecast,
        rangoSuperior: Math.round((roundedForecast + uncertainty) * 100) / 100,
        rangoInferior: Math.round((roundedForecast - uncertainty) * 100) / 100,
        tipo: "proyeccion",
      })
    }

    return data
  }, [timeRange, selectedTicker])

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as DataPoint
      const isForecast = item.tipo === "proyeccion"

      return (
        <div className="bg-[#0a0f29]/95 backdrop-blur-md border border-[#1a2040] p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-[#1a2040] pb-1.5">
            <span className="font-semibold text-gray-300">{label}</span>
            {isForecast ? (
              <Badge className="bg-[#00a8ff]/20 text-[#00a8ff] border-[#00a8ff]/30 text-[10px] px-1.5 py-0 flex items-center">
                <Sparkles className="h-3 w-3 mr-1" /> Pronóstico IA
              </Badge>
            ) : (
              <span className="text-[10px] text-gray-400">Dato Registrado</span>
            )}
          </div>

          {item.precioReal !== undefined && (
            <div className="flex justify-between items-center text-white">
              <span className="text-gray-400">Precio Real:</span>
              <span className="font-mono font-bold text-sky-400">
                {metricUnit === "ARS" ? "$" : ""}
                {item.precioReal.toLocaleString("es-AR")} {metricUnit}
              </span>
            </div>
          )}

          {item.prediccionIA !== undefined && isForecast && (
            <div className="flex justify-between items-center text-white">
              <span className="text-[#00a8ff] flex items-center">
                <Sparkles className="h-3 w-3 mr-1" /> Proyección:
              </span>
              <span className="font-mono font-bold text-[#00a8ff]">
                {metricUnit === "ARS" ? "$" : ""}
                {item.prediccionIA.toLocaleString("es-AR")} {metricUnit}
              </span>
            </div>
          )}

          {item.rangoSuperior && isForecast && showConfidence && (
            <div className="pt-1 border-t border-[#1a2040]/60 space-y-0.5 text-[11px]">
              <div className="flex justify-between text-gray-400">
                <span>Límite Sup (85%):</span>
                <span className="font-mono text-emerald-400">${item.rangoSuperior.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Límite Inf (85%):</span>
                <span className="font-mono text-rose-400">${item.rangoInferior?.toLocaleString("es-AR")}</span>
              </div>
            </div>
          )}

          {item.sma20 && showSMA && !isForecast && (
            <div className="flex justify-between items-center text-amber-400 pt-1 border-t border-[#1a2040]/60">
              <span className="text-gray-400">Media Móvil (20):</span>
              <span className="font-mono">${item.sma20.toLocaleString("es-AR")}</span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-white text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#00a8ff]" />
                Curva Histórica & Proyección Predictiva IA
              </CardTitle>
              <Badge className="bg-[#00a8ff]/20 text-[#00a8ff] border-[#00a8ff]/40 text-xs font-normal">
                Modelo Neuro-Predictivo v2.4
              </Badge>
            </div>
            <CardDescription className="text-gray-400 text-xs mt-1">
              Serie temporal validada + horizonte predictivo de 30 días con intervalo probabilístico al 85%.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de Rango Temporal */}
            <div className="flex items-center bg-[#0a0f29] rounded-lg p-0.5 border border-[#1a2040]">
              {(["1M", "3M", "6M", "1Y", "TODO"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                    timeRange === r
                      ? "bg-[#1a2040] text-[#00a8ff] shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Toggles de Indicadores */}
            <div className="flex items-center space-x-1.5 bg-[#0a0f29] px-2.5 py-1 rounded-lg border border-[#1a2040] text-xs">
              <button
                onClick={() => setShowSMA(!showSMA)}
                className={`flex items-center px-1.5 py-0.5 rounded transition-colors ${
                  showSMA ? "text-amber-400 font-medium" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5 inline-block"></span>
                SMA 20
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={() => setShowConfidence(!showConfidence)}
                className={`flex items-center px-1.5 py-0.5 rounded transition-colors ${
                  showConfidence ? "text-[#00a8ff] font-medium" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Sparkles className="h-3 w-3 mr-1 text-[#00a8ff]" />
                Cono IA
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientProyeccion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a8ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00a8ff" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradientConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00a8ff" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#00a8ff" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#1a2040" strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#1a2040" }}
                tickLine={{ stroke: "#1a2040" }}
                interval={Math.floor(chartData.length / 8)}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#1a2040" }}
                tickLine={{ stroke: "#1a2040" }}
                domain={["auto", "auto"]}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Rango de Confianza IA (Cono de Incertidumbre) */}
              {showConfidence && (
                <Area
                  type="monotone"
                  dataKey="rangoSuperior"
                  stroke="none"
                  fill="url(#gradientConfidence)"
                  isAnimationActive={false}
                />
              )}
              {showConfidence && (
                <Line
                  type="monotone"
                  dataKey="rangoSuperior"
                  stroke="#00a8ff"
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {showConfidence && (
                <Line
                  type="monotone"
                  dataKey="rangoInferior"
                  stroke="#00a8ff"
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {/* Línea de Media Móvil (SMA 20) */}
              {showSMA && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  dot={false}
                  name="Media Móvil 20"
                  isAnimationActive={false}
                />
              )}

              {/* Precio Real Registrado (Línea sólida cian) */}
              <Line
                type="monotone"
                dataKey="precioReal"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                name="Precio Registrado"
                isAnimationActive={false}
              />

              {/* Proyección Predictiva IA (Línea discontinua azul neón) */}
              <Line
                type="monotone"
                dataKey="prediccionIA"
                stroke="#00a8ff"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: "#00a8ff" }}
                name="Proyección IA"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda interactiva inferior */}
        <div className="mt-3 pt-3 border-t border-[#1a2040] flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="w-3.5 h-0.5 bg-sky-400 mr-1.5 inline-block rounded-full"></span>
              <span>Histórico Real</span>
            </div>
            <div className="flex items-center">
              <span className="w-3.5 h-0.5 border-b-2 border-dashed border-[#00a8ff] mr-1.5 inline-block"></span>
              <span className="text-[#00a8ff] flex items-center font-medium">
                <Sparkles className="h-3 w-3 mr-1" />
                Pronóstico IA (30d)
              </span>
            </div>
            {showConfidence && (
              <div className="flex items-center">
                <span className="w-3.5 h-2 bg-[#00a8ff]/20 border border-[#00a8ff]/40 rounded-sm mr-1.5 inline-block"></span>
                <span>Banda Probabilística (85%)</span>
              </div>
            )}
            {showSMA && (
              <div className="flex items-center">
                <span className="w-3.5 h-0.5 bg-amber-400 mr-1.5 inline-block rounded-full"></span>
                <span>SMA 20</span>
              </div>
            )}
          </div>

          <div className="flex items-center text-[11px] text-gray-500">
            <Info className="h-3 w-3 mr-1 text-gray-400" />
            <span>Último reentrenamiento: Hoy 06:00 hs • Error MAPE: 1.82%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
