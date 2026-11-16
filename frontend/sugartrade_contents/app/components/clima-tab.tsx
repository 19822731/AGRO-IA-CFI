"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudIcon, DropletIcon, SunIcon, ThermometerIcon } from "lucide-react"
import { GraficoPrecipitaciones } from "./grafico-precipitaciones"

export function ClimaTab() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperatura Actual</CardTitle>
            <ThermometerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28°C</div>
            <p className="text-xs text-muted-foreground">Sensación térmica: 30°C</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Humedad</CardTitle>
            <DropletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-xs text-muted-foreground">Punto de rocío: 20°C</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Condición</CardTitle>
            <SunIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Soleado</div>
            <p className="text-xs text-muted-foreground">Índice UV: 8 (Alto)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pronóstico del Tiempo</CardTitle>
          <CardDescription>Próximos 5 días para Tucumán</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium">Lun</span>
              <SunIcon className="my-2 h-10 w-10 text-yellow-500" />
              <span className="text-sm">30°C</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium">Mar</span>
              <SunIcon className="my-2 h-10 w-10 text-yellow-500" />
              <span className="text-sm">31°C</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium">Mié</span>
              <CloudIcon className="my-2 h-10 w-10 text-gray-400" />
              <span className="text-sm">29°C</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium">Jue</span>
              <DropletIcon className="my-2 h-10 w-10 text-blue-500" />
              <span className="text-sm">26°C</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium">Vie</span>
              <CloudIcon className="my-2 h-10 w-10 text-gray-400" />
              <span className="text-sm">28°C</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precipitaciones</CardTitle>
          <CardDescription>Histórico de precipitaciones por zona</CardDescription>
        </CardHeader>
        <CardContent>
          <GraficoPrecipitaciones />
        </CardContent>
      </Card>
    </div>
  )
}
