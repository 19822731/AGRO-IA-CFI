"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MLPrediccionesGlobal } from "./modelos-patrones/ml-predicciones-global"
import { AnalisisEuropaDetallado } from "./modelos-patrones/analisis-europa-detallado"
import { AnalisisHistoricoGlobal } from "./analisis-historico/analisis-historico-global"
import PreciosInternosHistoricos from "./analisis-historico/precios-internos-historicos"

export function InteligenciaComercial() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Inteligencia Comercial</h1>
        <p className="text-gray-400 mt-2">
          Análisis avanzado del mercado global del azúcar con modelos predictivos y datos históricos
        </p>
      </div>

      <Tabs defaultValue="predicciones" className="space-y-6">
        <TabsList className="bg-[#111936] border-[#1a2040]">
          <TabsTrigger
            value="predicciones"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Predicciones Globales
          </TabsTrigger>
          <TabsTrigger value="europa" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Mercado Europeo
          </TabsTrigger>
          <TabsTrigger
            value="historico"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Análisis Histórico Global
          </TabsTrigger>
          <TabsTrigger
            value="precios-internos"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Precios Internos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="predicciones">
          <MLPrediccionesGlobal />
        </TabsContent>
        <TabsContent value="europa">
          <AnalisisEuropaDetallado />
        </TabsContent>
        <TabsContent value="historico">
          <AnalisisHistoricoGlobal />
        </TabsContent>
        <TabsContent value="precios-internos">
          <PreciosInternosHistoricos />
        </TabsContent>
      </Tabs>
    </div>
  )
}
