"use client"

import React, { useState } from "react"
import EstacionalidadMercado from "@/app/utilidades/inteligencia-comercial/components/estacionalidad-mercado"
import { Globe, BarChart3 } from "lucide-react"

export default function InteligenciaZafraPage() {
  const [activeTab, setActiveTab] = useState<"local" | "cloud">("local")

  return (
    <div className="min-h-screen bg-[#0a0f29] text-white p-6 space-y-6">
      {/* Selector de Vista */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1a2040]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#00a8ff]" />
            Inteligencia Comercial & Estacionalidad Agro-IA
          </h1>
          <p className="text-sm text-gray-400">
            Monitor operativo en vivo para ingenios, industrias y productores azucareros.
          </p>
        </div>

        <div className="flex gap-2 bg-[#111936] p-1 rounded-lg border border-[#1a2040]">
          <button
            onClick={() => setActiveTab("local")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "local"
                ? "bg-[#00a8ff] text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Motor M4 Local (PRD & Zafra)
          </button>
          <button
            onClick={() => setActiveTab("cloud")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "cloud"
                ? "bg-[#00a8ff] text-white shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Dashboard Cloud Agro-IA
          </button>
        </div>
      </div>

      {/* Contenido */}
      {activeTab === "local" ? (
        <EstacionalidadMercado />
      ) : (
        <div className="w-full h-[800px] rounded-xl overflow-hidden border border-[#1a2040] bg-[#0c1330]">
          <iframe
            src="https://dashboard.agro-ia.com/"
            className="w-full h-full border-0"
            title="Inteligencia Comercial - Dashboard Agro-IA"
            allow="fullscreen"
          />
        </div>
      )}
    </div>
  )
}
