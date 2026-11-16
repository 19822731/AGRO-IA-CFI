"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import PrecioInteractivo from "./precio-interactivo"
import ProduccionInteractiva from "./produccion-interactiva"
import { LineChart, BarChart2, Activity, TrendingUp, Layers, Download, Share2 } from "lucide-react"

export default function PanelInteractivo() {
  const [activeTab, setActiveTab] = useState("precios")

  // Función para exportar el panel completo (simulada)
  const handleExportPanel = () => {
    alert("Funcionalidad de exportación del panel completo en desarrollo")
  }

  // Función para compartir el panel (simulada)
  const handleSharePanel = () => {
    alert("Funcionalidad de compartir panel en desarrollo")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Panel de Visualizaciones Interactivas</h2>
          <p className="text-gray-400">Explore la evolución de precios y producción del mercado azucarero mundial</p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#1a2040] border-[#2a3050] hover:bg-[#2a3050] text-white"
            onClick={handleExportPanel}
          >
            <Download className="h-4 w-4 mr-2 text-[#00a8ff]" />
            Exportar Panel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#1a2040] border-[#2a3050] hover:bg-[#2a3050] text-white"
            onClick={handleSharePanel}
          >
            <Share2 className="h-4 w-4 mr-2 text-[#00a8ff]" />
            Compartir Panel
          </Button>
        </div>
      </div>

      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xl">Visualizaciones del Mercado Azucarero</CardTitle>
          <CardDescription className="text-gray-400">
            Seleccione el tipo de visualización que desea explorar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="precios" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#0a0f29] w-full">
              <TabsTrigger
                value="precios"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                <LineChart className="h-4 w-4 mr-2" />
                Evolución de Precios
              </TabsTrigger>
              <TabsTrigger
                value="produccion"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Evolución de Producción
              </TabsTrigger>
              <TabsTrigger
                value="correlaciones"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                <Activity className="h-4 w-4 mr-2" />
                Correlaciones
              </TabsTrigger>
              <TabsTrigger
                value="proyecciones"
                className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Proyecciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="precios" className="mt-4">
              <PrecioInteractivo />
            </TabsContent>

            <TabsContent value="produccion" className="mt-4">
              <ProduccionInteractiva />
            </TabsContent>

            <TabsContent value="correlaciones" className="mt-4">
              <Card className="bg-[#0a0f29] border-[#1a2040] h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Layers className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                  <p className="text-white">Visualización de correlaciones en desarrollo</p>
                  <p className="text-gray-400 text-sm">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="proyecciones" className="mt-4">
              <Card className="bg-[#0a0f29] border-[#1a2040] h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                  <p className="text-white">Visualización de proyecciones en desarrollo</p>
                  <p className="text-gray-400 text-sm">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="bg-[#0a0f29] p-4 rounded-lg">
        <h3 className="text-white text-lg mb-2">Guía de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff] text-xs mr-2 flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-sm text-gray-300">
                <span className="text-white">Seleccione el tipo de visualización</span> - Elija entre precios,
                producción, correlaciones o proyecciones según la información que desee analizar.
              </p>
            </div>
            <div className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff] text-xs mr-2 flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-sm text-gray-300">
                <span className="text-white">Interactúe con los gráficos</span> - Utilice las herramientas de zoom,
                filtrado y selección para explorar los datos en detalle.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff] text-xs mr-2 flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-sm text-gray-300">
                <span className="text-white">Exporte los datos</span> - Utilice el botón de descarga para exportar los
                datos de la visualización actual en formato JSON.
              </p>
            </div>
            <div className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-[#1a2040] flex items-center justify-center text-[#00a8ff] text-xs mr-2 flex-shrink-0 mt-0.5">
                4
              </div>
              <p className="text-sm text-gray-300">
                <span className="text-white">Analice los eventos significativos</span> - Observe las líneas de
                referencia que indican eventos importantes que afectaron al mercado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
