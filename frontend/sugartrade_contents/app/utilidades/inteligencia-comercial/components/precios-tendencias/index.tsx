"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, BarChart2, Download, RefreshCw, FileText, Share2, Layers } from "lucide-react"
import TickerPreciosVivo from "./ticker-precios-vivo"
import GraficoTendenciasIA from "./grafico-tendencias-ia"
import PanelSenalesIA from "./panel-senales-ia"
import TablaResumenMercado from "./tabla-resumen-mercado"

export default function PreciosTendenciasDashboard() {
  const [selectedTicker, setSelectedTicker] = useState<string>("blanco-local")

  return (
    <div className="space-y-6">
      {/* 1. Header del Módulo con badge IA y acciones */}
      <div className="bg-gradient-to-r from-[#111936] via-[#16234d] to-[#111936] p-5 rounded-xl border border-[#1a2040] shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Precios y Tendencias Inteligentes
            </h2>
            <Badge className="bg-[#00a8ff]/20 text-[#00a8ff] border-[#00a8ff]/40 text-xs px-2 py-0.5 flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              IA Activa
            </Badge>
          </div>
          <p className="text-gray-300 text-xs md:text-sm mt-1 max-w-2xl">
            Centro de monitoreo en tiempo real, análisis técnico y modelos predictivos para el mercado azucarero argentino e internacional.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="bg-[#0a0f29] border-[#1a2040] text-gray-300 hover:text-white hover:bg-[#1a2040] text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#00a8ff]" />
            Exportar Informe
          </Button>
        </div>
      </div>

      {/* 2. Barra de Cotizaciones y Tickers en Vivo */}
      <TickerPreciosVivo
        selectedTicker={selectedTicker}
        onSelectTicker={(tickerId) => setSelectedTicker(tickerId)}
      />

      {/* 3. Gráfico Principal Combinado: Histórico + Curva Predictiva IA */}
      <GraficoTendenciasIA selectedTicker={selectedTicker} />

      {/* 4. Panel de Inteligencia Predictiva: Sentimiento, Factores y Estrategia */}
      <PanelSenalesIA selectedTicker={selectedTicker} />

      {/* 5. Profundidad de Mercado: Libro de Órdenes y Comparativa de Zafras */}
      <TablaResumenMercado />
    </div>
  )
}
