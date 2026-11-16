"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, MapPin, TrendingUp } from "lucide-react"
import AnalisisBrasil from "./analisis-brasil"
import AnalisisGlobal from "./analisis-global"
import TendenciasProyecciones from "./tendencias-proyecciones"

export default function PatronesMercado() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Patrones de Mercado</h2>
          <p className="text-gray-400">Análisis de patrones y tendencias en mercados azucareros clave</p>
        </div>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className="bg-[#111936] border-[#1a2040]">
          <TabsTrigger value="global" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            <Globe className="h-4 w-4 mr-2" />
            Mercado Global
          </TabsTrigger>
          <TabsTrigger
            value="tendencias"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Tendencias y Proyecciones
          </TabsTrigger>
          <TabsTrigger value="brasil" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            <MapPin className="h-4 w-4 mr-2" />
            Brasil
          </TabsTrigger>
          <TabsTrigger
            value="india"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            disabled
          >
            <MapPin className="h-4 w-4 mr-2" />
            India
          </TabsTrigger>
          <TabsTrigger
            value="tailandia"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            disabled
          >
            <MapPin className="h-4 w-4 mr-2" />
            Tailandia
          </TabsTrigger>
          <TabsTrigger
            value="eeuu"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
            disabled
          >
            <MapPin className="h-4 w-4 mr-2" />
            EE.UU.
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <AnalisisGlobal />

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Próximos Análisis</CardTitle>
              <CardDescription className="text-gray-400">Funcionalidades en desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 opacity-70">
                  <h3 className="text-white font-medium mb-2">Análisis de Correlaciones</h3>
                  <p className="text-sm text-gray-400">
                    Correlaciones entre precios del azúcar y otras variables económicas
                  </p>
                </div>
                <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 opacity-70">
                  <h3 className="text-white font-medium mb-2">Análisis de Estacionalidad</h3>
                  <p className="text-sm text-gray-400">Patrones estacionales en precios y producción de azúcar</p>
                </div>
                <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 opacity-70">
                  <h3 className="text-white font-medium mb-2">Análisis de Volatilidad</h3>
                  <p className="text-sm text-gray-400">
                    Medición y predicción de la volatilidad en los mercados azucareros
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          <TendenciasProyecciones />

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Modelos Predictivos</CardTitle>
              <CardDescription className="text-gray-400">Funcionalidades en desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 opacity-70">
                  <h3 className="text-white font-medium mb-2">Predicción de Precios</h3>
                  <p className="text-sm text-gray-400">
                    Modelos de machine learning para predecir precios futuros del azúcar
                  </p>
                </div>
                <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 opacity-70">
                  <h3 className="text-white font-medium mb-2">Análisis de Escenarios</h3>
                  <p className="text-sm text-gray-400">
                    Simulación de diferentes escenarios de mercado y su impacto en precios
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brasil" className="space-y-4">
          <AnalisisBrasil />
        </TabsContent>

        <TabsContent value="india" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Análisis del Mercado de India</CardTitle>
              <CardDescription className="text-gray-400">En desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                El análisis detallado del mercado azucarero de India estará disponible próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tailandia" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Análisis del Mercado de Tailandia</CardTitle>
              <CardDescription className="text-gray-400">En desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                El análisis detallado del mercado azucarero de Tailandia estará disponible próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eeuu" className="space-y-4">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white text-lg">Análisis del Mercado de EE.UU.</CardTitle>
              <CardDescription className="text-gray-400">En desarrollo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                El análisis detallado del mercado azucarero de Estados Unidos estará disponible próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
