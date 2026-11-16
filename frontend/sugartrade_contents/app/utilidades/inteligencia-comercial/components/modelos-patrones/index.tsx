"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnalisisArgentinaDetallado from "./analisis-argentina-detallado"
import MLPrediccionesArgentina from "./ml-predicciones-argentina"
import AnalisisBrasilDetallado from "./analisis-brasil-detallado"
import ComparativaRegional from "./comparativa-regional"
import AnalisisEuropaDetallado from "./analisis-europa-detallado"
import MLPrediccionesGlobal from "./ml-predicciones-global"

export default function ModelosPatrones() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="argentina" className="space-y-4">
        <TabsList className="bg-[#111936] border-[#1a2040]">
          <TabsTrigger
            value="argentina"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Mercado Argentino
          </TabsTrigger>
          <TabsTrigger value="brasil" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Mercado Brasileño
          </TabsTrigger>
          <TabsTrigger value="europa" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            Mercado Europeo
          </TabsTrigger>
          <TabsTrigger
            value="comparativa"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Comparativa Regional
          </TabsTrigger>
          <TabsTrigger
            value="predicciones-argentina"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Predicciones Argentina
          </TabsTrigger>
          <TabsTrigger
            value="predicciones-global"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            Predicciones Global
          </TabsTrigger>
        </TabsList>
        <TabsContent value="argentina">
          <AnalisisArgentinaDetallado />
        </TabsContent>
        <TabsContent value="brasil">
          <AnalisisBrasilDetallado />
        </TabsContent>
        <TabsContent value="europa">
          <AnalisisEuropaDetallado />
        </TabsContent>
        <TabsContent value="comparativa">
          <ComparativaRegional />
        </TabsContent>
        <TabsContent value="predicciones-argentina">
          <MLPrediccionesArgentina />
        </TabsContent>
        <TabsContent value="predicciones-global">
          <MLPrediccionesGlobal />
        </TabsContent>
      </Tabs>
    </div>
  )
}
