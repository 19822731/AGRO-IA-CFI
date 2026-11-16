"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CloudSun,
  Factory,
  DollarSign,
  Scale,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"

interface PanelSenalesIAProps {
  selectedTicker: string
}

export default function PanelSenalesIA({ selectedTicker }: PanelSenalesIAProps) {
  // Factores clave que mueven el precio
  const driverFactors = [
    {
      title: "Clima & Rinde Sacarino",
      description: "Balance hídrico favorable en NOA; buena concentración de sacarosa en cañaverales.",
      impact: "bullish" as const,
      impactLabel: "+1.2% Soporte",
      icon: <CloudSun className="h-4 w-4 text-emerald-400" />,
    },
    {
      title: "Avance Zafra e Ingenios",
      description: "Molienda a buen ritmo sin cuellos de botella logísticos. Stock de zafra en niveles normales.",
      impact: "neutral" as const,
      impactLabel: "Equilibrado",
      icon: <Factory className="h-4 w-4 text-sky-400" />,
    },
    {
      title: "Paridad Internacional & Brasil",
      description: "Ajuste positivo en contratos ICE NY #11 por desvío de caña hacia etanol en Brasil.",
      impact: "bullish" as const,
      impactLabel: "+2.4% Presión alza",
      icon: <Scale className="h-4 w-4 text-emerald-400" />,
    },
    {
      title: "Tipo de Cambio & Costos",
      description: "Costos de fletes e insumos estables para transporte hacia centros de consumo (AMBA/Córdoba).",
      impact: "neutral" as const,
      impactLabel: "Neutral",
      icon: <DollarSign className="h-4 w-4 text-amber-400" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Diagnóstico de Sentimiento & Señal IA */}
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base font-semibold flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-[#00a8ff]" />
              Sentimiento de Mercado IA
            </CardTitle>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-semibold">
              ALCISTA
            </Badge>
          </div>
          <CardDescription className="text-gray-400 text-xs">
            Índice de fuerza basado en 18 variables agronómicas y financieras.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gray-300 font-medium">Fuerza Alcista: 78 / 100</span>
              <span className="text-emerald-400 font-semibold">Zona Favorable</span>
            </div>
            <div className="w-full h-2.5 bg-[#0a0f29] rounded-full overflow-hidden border border-[#1a2040]">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: "78%" }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>0 (Bajista)</span>
              <span>50 (Neutro)</span>
              <span>100 (Muy Alcista)</span>
            </div>
          </div>

          <div className="p-3 bg-[#0a0f29] rounded-lg border border-[#1a2040] space-y-2">
            <div className="flex items-center text-xs text-emerald-400 font-semibold">
              <TrendingUp className="h-4 w-4 mr-1.5 text-emerald-400" />
              Precios Objetivo Estimados (IA)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-[#111936] p-2 rounded border border-[#1a2040]/80">
                <span className="text-gray-400 text-[11px] block">A 15 Días</span>
                <span className="text-white font-mono font-bold text-sm">$39.500</span>
                <span className="text-emerald-400 text-[10px] ml-1 font-semibold">(+2.7%)</span>
              </div>
              <div className="bg-[#111936] p-2 rounded border border-[#1a2040]/80">
                <span className="text-gray-400 text-[11px] block">A 30 Días</span>
                <span className="text-white font-mono font-bold text-sm">$40.250</span>
                <span className="text-emerald-400 text-[10px] ml-1 font-semibold">(+4.6%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Factores Determinantes que impactan el valor */}
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base font-semibold flex items-center">
            <Scale className="h-4 w-4 mr-2 text-[#00a8ff]" />
            Factores Clave del Mercado
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs">
            Variables explicativas que pondera el algoritmo de previsión.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {driverFactors.map((factor, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-[#0a0f29] rounded-lg border border-[#1a2040] flex items-start space-x-3 text-xs"
            >
              <div className="p-2 bg-[#111936] rounded-md border border-[#1a2040] flex-shrink-0 mt-0.5">
                {factor.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-white truncate">{factor.title}</h5>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                      factor.impact === "bullish"
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-sky-400 bg-sky-500/10"
                    }`}
                  >
                    {factor.impactLabel}
                  </span>
                </div>
                <p className="text-gray-400 text-[11px] mt-0.5 line-clamp-2">{factor.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. Recomendación Estratégica & Cobertura */}
      <Card className="bg-[#111936] border-[#1a2040] flex flex-col justify-between">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base font-semibold flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-[#00a8ff]" />
              Estrategia Comercial
            </CardTitle>
            <Badge className="bg-[#00a8ff]/20 text-[#00a8ff] border-[#00a8ff]/30 text-xs">
              Sugerencia IA
            </Badge>
          </div>
          <CardDescription className="text-gray-400 text-xs">
            Plan de acción sugerido para productores y comercializadores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          <div className="p-3 bg-gradient-to-br from-[#0a0f29] to-[#122045] rounded-lg border border-[#00a8ff]/30 space-y-1.5">
            <div className="flex items-center text-xs text-[#00a8ff] font-semibold">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-[#00a8ff]" />
              Venta Escalonada con Fijación Parcial
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">
              La curva proyectada favorece mantener un <strong className="text-white">60% de la posición física</strong> para capturar el repunte de precio esperado durante las próximas 3 a 4 semanas. Se aconseja fijar el 40% remanente mediante contratos a término o warrants.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#1a2040]">
              <span className="text-gray-400">Piso de Soporte Técnico:</span>
              <span className="font-mono font-semibold text-rose-400">$37.800 ARS</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#1a2040]">
              <span className="text-gray-400">Resistencia de Salida:</span>
              <span className="font-mono font-semibold text-emerald-400">$40.500 ARS</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-400">Horizonte de Cobertura:</span>
              <span className="font-mono font-semibold text-gray-200">20 - 35 días</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
