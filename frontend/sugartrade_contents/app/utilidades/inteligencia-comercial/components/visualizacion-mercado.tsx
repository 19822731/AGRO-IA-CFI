"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, BarChart2, PieChart, TrendingUp } from "lucide-react"
import PrecioInteractivo from "./visualizaciones/precio-interactivo"

export default function VisualizacionMercado() {
  const [activeTab, setActiveTab] = useState("precios")

  return (
    <div className="space-y-6">
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Visualización del Mercado</CardTitle>
          <CardDescription className="text-gray-400">
            Herramientas interactivas para analizar el mercado azucarero global
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="precios" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#0a0f29] w-full">
              <TabsTrigger
                value="precios"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff] flex items-center"
              >
                <LineChart className="h-4 w-4 mr-2" />
                Precios y Tendencias
              </TabsTrigger>
              <TabsTrigger
                value="produccion"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff] flex items-center"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Producción y Consumo
              </TabsTrigger>
              <TabsTrigger
                value="distribucion"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff] flex items-center"
              >
                <PieChart className="h-4 w-4 mr-2" />
                Distribución Global
              </TabsTrigger>
              <TabsTrigger
                value="correlaciones"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff] flex items-center"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Correlaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="precios" className="mt-6">
              <PrecioInteractivo />
            </TabsContent>

            <TabsContent value="produccion" className="mt-6">
              <Card className="bg-[#0a0f29] border-[#1a2040] p-6">
                <p className="text-white text-center">Visualización de Producción y Consumo (En desarrollo)</p>
              </Card>
            </TabsContent>

            <TabsContent value="distribucion" className="mt-6">
              <Card className="bg-[#0a0f29] border-[#1a2040] p-6">
                <p className="text-white text-center">Visualización de Distribución Global (En desarrollo)</p>
              </Card>
            </TabsContent>

            <TabsContent value="correlaciones" className="mt-6">
              <Card className="bg-[#0a0f29] border-[#1a2040] p-6">
                <p className="text-white text-center">Visualización de Correlaciones (En desarrollo)</p>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
