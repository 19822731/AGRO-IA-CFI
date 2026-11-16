"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Droplets, Thermometer, Wind } from "lucide-react"
import { GraficoPrecipitaciones } from "./grafico-precipitaciones"

export function ClimaTab() {
  return (
    <div className="space-y-6">
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader>
          <CardTitle className="text-white">Condiciones Climáticas Actuales</CardTitle>
          <CardDescription className="text-gray-400">Datos meteorológicos para Tucumán</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
            <div className="flex items-center">
              <div className="p-2 rounded-full mr-3 bg-[#1a2040]">
                <Thermometer className="h-5 w-5 text-[#00a8ff]" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Temperatura</h3>
                <p className="text-white text-lg font-medium">28°C</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
            <div className="flex items-center">
              <div className="p-2 rounded-full mr-3 bg-[#1a2040]">
                <Droplets className="h-5 w-5 text-[#00a8ff]" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Humedad</h3>
                <p className="text-white text-lg font-medium">65%</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
            <div className="flex items-center">
              <div className="p-2 rounded-full mr-3 bg-[#1a2040]">
                <Cloud className="h-5 w-5 text-[#00a8ff]" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Nubosidad</h3>
                <p className="text-white text-lg font-medium">Parcialmente Nublado</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0f29] p-4 rounded-lg border border-[#1a2040]">
            <div className="flex items-center">
              <div className="p-2 rounded-full mr-3 bg-[#1a2040]">
                <Wind className="h-5 w-5 text-[#00a8ff]" />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Viento</h3>
                <p className="text-white text-lg font-medium">10 km/h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <GraficoPrecipitaciones />
    </div>
  )
}
