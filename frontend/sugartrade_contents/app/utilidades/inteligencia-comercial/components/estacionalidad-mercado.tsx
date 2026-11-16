"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Anchor,
  Ship,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Scale,
  Sparkles,
  RefreshCw,
  BarChart3,
  Sliders,
} from "lucide-react"
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
} from "recharts"

export default function EstacionalidadMercado() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [simPrecioBolsa, setSimPrecioBolsa] = useState<number>(35896.16)
  const [chartTab, setChartTab] = useState<string>("zafra-precios")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/estacionalidad-prd")
      if (res.ok) {
        const json = await res.json()
        setData(json)
        if (json?.prd?.prd_resultado?.prd_sugerido_ars_bolsa) {
          setSimPrecioBolsa(json.prd.prd_resultado.prd_sugerido_ars_bolsa)
        }
      }
    } catch (err) {
      console.error("Error al cargar datos de estacionalidad:", err)
    } finally {
      setLoading(false)
    }
  }

  // PRD actual y métricas
  const prd = data?.prd?.prd_resultado?.prd_sugerido_ars_bolsa || 35896.16
  const prd_tn = data?.prd?.prd_resultado?.prd_sugerido_ars_tn || 717923.2
  const pisoFas = data?.prd?.prd_resultado?.piso_paridad_exportacion_bolsa || 35896.16
  const cto5 = data?.prd?.mercado_internacional?.cto5_actual_usd || 509.6
  const cto5_pred = data?.prd?.mercado_internacional?.tactico_7d?.cto5_pred_usd || 526.07
  const cto11 = data?.prd?.mercado_internacional?.cto11_actual_clb || 18.21
  const wsp = data?.prd?.mercado_internacional?.wsp_actual_usd || 108.14
  const arbitrajeActivo = data?.prd?.prd_resultado?.arbitraje_exportacion_activo ?? true
  const infoExport = data?.prd?.monitoreo_exportaciones_aduanas || {
    cupo_anual_exportacion_tn: 900750,
    pct_estacional_esperado: 97.47,
    exportacion_teorica_acumulada_tn: 877931,
    exportacion_real_acumulada_tn: 632110,
    delta_exportacion_tn: -245821,
    pacing_ratio_pct: 72.0,
    semaforo_exportador: "AMARILLO_DEMORA_MODERADA",
    diagnostico_estrategico:
      "Retraso moderado en embarques (72.0% de meta; faltan 245,821 TN). Sugerir acelerar ventas a puerto.",
  }
  const expectativas = data?.prd?.mercado_internacional?.expectativas_estrategicas || {}
  const estacionalidadMensual = data?.estacionalidad_mensual || []

  // Cálculo interactivo de comisiones dinámicas
  const desvioSimPct = prd > 0 ? ((simPrecioBolsa - prd) / prd) * 100 : 0
  const kAdj = 0.5
  const ajusteV = desvioSimPct < 0 ? -desvioSimPct / 100 : 0
  const tasaVendedor = Math.max(0.02, Math.min(0.06, 0.02 + ajusteV * kAdj)) * 100
  const ajusteC = desvioSimPct > 0 ? desvioSimPct / 100 : 0
  const tasaComprador = Math.max(0.02, Math.min(0.06, 0.02 + ajusteC * kAdj)) * 100
  const tasaPlataforma = tasaVendedor + tasaComprador
  const comisionVendedorArs = (simPrecioBolsa * tasaVendedor) / 100
  const comisionCompradorArs = (simPrecioBolsa * tasaComprador) / 100
  const netoVendedorArs = simPrecioBolsa - comisionVendedorArs
  const totalCompradorArs = simPrecioBolsa + comisionCompradorArs

  const semaforoColor =
    infoExport.semaforo_exportador === "VERDE_RITMO_OPTIMO"
      ? "text-emerald-400 bg-emerald-950/40 border-emerald-500/50"
      : infoExport.semaforo_exportador === "AMARILLO_DEMORA_MODERADA"
      ? "text-amber-400 bg-amber-950/40 border-amber-500/50"
      : "text-rose-400 bg-rose-950/40 border-rose-500/50"

  return (
    <div className="space-y-6">
      {/* 1. Encabezado de Inteligencia de Estacionalidad */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#0c1330] via-[#111936] to-[#0c1330] border border-[#1a2040]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="h-6 w-6 text-[#00a8ff]" />
              Monitor de Estacionalidad del Azúcar, Zafra y PRD
            </h2>
            <span className="bg-[#00a8ff]/20 text-[#00a8ff] text-xs px-2.5 py-0.5 rounded-full border border-[#00a8ff]/30 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Agro-IA 2026 M4
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Evolución de curvas de producción, ritmo de exportaciones (Comex Stat / UN Comtrade) e inducción de precios para industriales y cañeros.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2040] hover:bg-[#222c54] text-xs text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700 w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualizar Datos
        </button>
      </div>

      {/* 2. Semáforo de Despachos a Puerto (El detector de sobreoferta que "tira el precio") */}
      <Card className={`border ${semaforoColor}`}>
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-full bg-black/40 border border-current">
                {infoExport.semaforo_exportador === "VERDE_RITMO_OPTIMO" ? (
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-7 w-7 text-amber-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/30 border border-current">
                    {infoExport.semaforo_exportador.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-300">
                    Avance Teórico de Zafra: {infoExport.pct_estacional_esperado}%
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Ritmo de Embarques: {infoExport.pacing_ratio_pct}% de la meta estacional
                </h3>
                <p className="text-sm text-gray-200 mt-1 max-w-3xl">
                  {infoExport.diagnostico_estrategico}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-black/30 p-3 rounded-lg border border-white/10 text-right">
              <div>
                <span className="text-xs text-gray-400 block">Cupo Exportación</span>
                <span className="text-sm font-bold text-white">
                  {(infoExport.cupo_anual_exportacion_tn || 900750).toLocaleString()} TN
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Embarcado Real</span>
                <span className="text-sm font-bold text-emerald-400">
                  {(infoExport.exportacion_real_acumulada_tn || 632110).toLocaleString()} TN
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Desfase Acumulado</span>
                <span className={`text-sm font-bold ${infoExport.delta_exportacion_tn < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {(infoExport.delta_exportacion_tn || -245821).toLocaleString()} TN
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Progreso del Ritmo Exportador */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>Evacuación a Puerto Acumulada: {infoExport.pacing_ratio_pct}%</span>
              <span>Meta Teórica de Equilibrio: 100% de la curva estacional</span>
            </div>
            <div className="w-full h-3 bg-[#0a0f29] rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-500 ${
                  infoExport.pacing_ratio_pct >= 90
                    ? "bg-emerald-500"
                    : infoExport.pacing_ratio_pct >= 65
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(5, infoExport.pacing_ratio_pct))}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Panel de Precios Clave: PRD Diario vs. Paridad FAS y Mercados Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PRD Sugerido */}
        <Card className="bg-[#111936] border-[#00a8ff]/40 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00a8ff]/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400 uppercase font-semibold">PRD Sugerido Hoy</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#00a8ff]/20 text-[#00a8ff] border border-[#00a8ff]/30">
                Oficial
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">
                ${prd.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400 ml-1.5">ARS / bolsa 50kg</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Equivalente: ${prd_tn.toLocaleString("es-AR", { maximumFractionDigits: 0 })} ARS / Tonelada
            </p>
          </CardContent>
        </Card>

        {/* Piso FAS Exportación */}
        <Card className="bg-[#111936] border-emerald-500/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400 uppercase font-semibold">Piso FAS Puerto</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Anchor className="h-3 w-3" />
                Soporte
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-emerald-400">
                ${pisoFas.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400 ml-1.5">ARS / bolsa</span>
            </div>
            <p className="text-xs text-emerald-300/80 mt-1">
              {arbitrajeActivo ? "Arbitraje Activo: Piso que defiende la rentabilidad" : "Paridad de salida a Rosario/BsAs"}
            </p>
          </CardContent>
        </Card>

        {/* Londres Contrato #5 */}
        <Card className="bg-[#111936] border-[#1a2040]">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400 uppercase font-semibold">Londres #5 (Blanco)</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 flex items-center">
                D+7: ${cto5_pred.toFixed(1)}
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-white">${cto5.toFixed(2)}</span>
              <span className="text-xs text-gray-400 ml-1.5">USD / Tonelada</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Proyección D+7: +3.23% al alza
            </p>
          </CardContent>
        </Card>

        {/* NY #11 y White Sugar Premium */}
        <Card className="bg-[#111936] border-[#1a2040]">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400 uppercase font-semibold">NY #11 & Margen Blanco</span>
              <span className="text-xs text-gray-400">{cto11.toFixed(2)} c/lb</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-amber-400">${wsp.toFixed(2)}</span>
              <span className="text-xs text-gray-400 ml-1.5">USD/t (WSP)</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Margen de refinación sobre crudo saludable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Gráfico de Estacionalidad de Zafra vs. Precios y Comex Stat de Brasil */}
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#00a8ff]" />
                Curvas de Estacionalidad de Zafra, Exportaciones y Precios
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Analiza cómo la concentración de la cosecha en mayo-octubre impacta en los precios y cuándo activar la salida a puerto.
              </CardDescription>
            </div>
            <div className="flex gap-1.5 bg-[#0a0f29] p-1 rounded-lg border border-[#1a2040] w-fit">
              <button
                onClick={() => setChartTab("zafra-precios")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  chartTab === "zafra-precios"
                    ? "bg-[#00a8ff] text-white font-medium shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Zafra NOA vs. Precio Bolsa
              </button>
              <button
                onClick={() => setChartTab("brasil-comex")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  chartTab === "brasil-comex"
                    ? "bg-[#00a8ff] text-white font-medium shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Exportación Brasil (Comex Stat)
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartTab === "zafra-precios" ? (
                <ComposedChart data={estacionalidadMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                  <XAxis dataKey="mes" stroke="#8892b0" />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#00a8ff"
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 30]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    domain={[32000, 39000]}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0a0f29", borderColor: "#1a2040", borderRadius: "8px" }}
                    formatter={(val: any, name: string) => {
                      if (name.includes("Zafra")) return [`${val}% de producción anual`, name]
                      return [`$${Number(val).toLocaleString()} ARS`, name]
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="zafra_arg_pct"
                    name="Ritmo Producción Zafra NOA (%)"
                    fill="#00a8ff"
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="precio_bolsa_ars"
                    name="Precio Promedio Bolsa 50kg (ARS)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981" }}
                  />
                </ComposedChart>
              ) : (
                <ComposedChart data={estacionalidadMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                  <XAxis dataKey="mes" stroke="#8892b0" />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#f59e0b"
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 15]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#3b82f6"
                    domain={[450, 560]}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0a0f29", borderColor: "#1a2040", borderRadius: "8px" }}
                    formatter={(val: any, name: string) => {
                      if (name.includes("Exportación")) return [`${val}% del total anual`, name]
                      return [`$${val} USD/t`, name]
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="export_br_pct"
                    name="Cuota Exportación Brasil Comex Stat (%)"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="precio_medio_usd"
                    name="Precio Cto 5 Londres Histórico (USD/t)"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6" }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#1a2040] text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-[#00a8ff] flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-gray-200">Ventana Óptima de Venta Local:</strong> Mayo a Agosto. En entresafra (abril/mayo) los precios internos alcanzan su pico por escasez relativa.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-gray-200">Riesgo de Fin de Año:</strong> Octubre a Diciembre. Si no se evacuó el cupo a puerto, el mercado local recibe sobreoferta tardía y los precios se desploman.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Simulador Interactivo de Comisiones Dinámicas Basadas en el PRD */}
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Sliders className="h-5 w-5 text-purple-400" />
                Simulador de Comisiones Dinámicas de Mercado
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Comprueba cómo el algoritmo penaliza a quien malvende por debajo del PRD y premia con la tasa mínima a quien sostiene el equilibrio.
              </CardDescription>
            </div>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded border border-purple-500/30 font-mono">
              PRD Ancla: ${prd.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Control Slider */}
            <div className="space-y-4 lg:col-span-1 bg-[#0a0f29] p-4 rounded-xl border border-[#1a2040]">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-300">Precio Pactado en Orden:</label>
                <span className="text-lg font-bold text-white font-mono">
                  ${simPrecioBolsa.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <input
                type="range"
                min={Math.round(prd * 0.85)}
                max={Math.round(prd * 1.15)}
                step={50}
                value={simPrecioBolsa}
                onChange={(e) => setSimPrecioBolsa(Number(e.target.value))}
                className="w-full accent-[#00a8ff] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Descuento (-15%)</span>
                <span className="text-[#00a8ff] font-medium">PRD Oficial</span>
                <span>Sobreprecio (+15%)</span>
              </div>

              <div className="pt-2 border-t border-[#1a2040]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Desvío respecto al PRD:</span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded ${
                      Math.abs(desvioSimPct) < 0.5
                        ? "text-emerald-400 bg-emerald-950/40"
                        : desvioSimPct < 0
                        ? "text-rose-400 bg-rose-950/40"
                        : "text-amber-400 bg-amber-950/40"
                    }`}
                  >
                    {desvioSimPct >= 0 ? "+" : ""}
                    {desvioSimPct.toFixed(2)}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  {desvioSimPct < -0.5
                    ? "⚠️ Alerta Vendedor: Vender con descuento incrementa tu comisión para desalentar bajas destructivas."
                    : desvioSimPct > 0.5
                    ? "⚠️ Alerta Comprador: Pagar sobreprecio eleva tu comisión para evitar burbujas."
                    : "✓ Operación Óptima: Ambas partes pagan la comisión base mínima del 2%."}
                </p>
              </div>
            </div>

            {/* Resultado de Comisiones */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Vendedor */}
              <div className="p-4 rounded-xl bg-[#0d163a] border border-[#1a2040] flex flex-col justify-between">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Comisión Vendedor</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${tasaVendedor > 2.1 ? "text-rose-400" : "text-emerald-400"}`}>
                      {tasaVendedor.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-400">(${comisionVendedorArs.toFixed(2)}/bolsa)</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-xs">
                  <span className="text-gray-400 block">Cobro Neto Industrial:</span>
                  <span className="text-sm font-bold text-white font-mono">
                    ${netoVendedorArs.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Comprador */}
              <div className="p-4 rounded-xl bg-[#0d163a] border border-[#1a2040] flex flex-col justify-between">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold">Comisión Comprador</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${tasaComprador > 2.1 ? "text-amber-400" : "text-emerald-400"}`}>
                      {tasaComprador.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-400">(${comisionCompradorArs.toFixed(2)}/bolsa)</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-xs">
                  <span className="text-gray-400 block">Total a Pagar Cliente:</span>
                  <span className="text-sm font-bold text-white font-mono">
                    ${totalCompradorArs.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Plataforma */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#121c47] to-[#0a0f29] border border-[#00a8ff]/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-[#00a8ff] uppercase font-semibold">Plataforma Agro-IA</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#00a8ff]">
                      {tasaPlataforma.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-400">total calce</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-xs">
                  <span className="text-gray-400 block">Ingreso Plataforma:</span>
                  <span className="text-sm font-bold text-white font-mono">
                    ${(comisionVendedorArs + comisionCompradorArs).toFixed(2)} / bolsa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Horizontes Estratégicos de Decisión (3 Meses a 1 Año) */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#00a8ff]" />
          Matriz de Decisión Comercial Multi-Horizonte (Para Gerencias y Productores)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(expectativas).map(([key, val]: [string, any]) => {
            const semaforoBg =
              val.semaforo === "CAPTURA_DE_PICO"
                ? "border-emerald-500/50 bg-emerald-950/20"
                : val.semaforo === "VENTA_CONTROLADA"
                ? "border-blue-500/50 bg-blue-950/20"
                : val.semaforo === "MANTENER_STOCK"
                ? "border-amber-500/50 bg-amber-950/20"
                : "border-purple-500/50 bg-purple-950/20"

            return (
              <Card key={key} className={`border ${semaforoBg}`}>
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span className="font-semibold text-white capitalize">{key.replace("_", " ")}</span>
                      <span className="font-mono text-gray-300">{val.periodo}</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-white">${val.cto5_usd}</span>
                      <span className="text-xs text-gray-400">USD/t</span>
                      <span className="text-xs font-bold text-emerald-400 ml-auto">{val.var_pct}</span>
                    </div>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 border border-current text-gray-200">
                      {val.semaforo}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-3 pt-2 border-t border-white/5 leading-relaxed">
                    {val.accion}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
