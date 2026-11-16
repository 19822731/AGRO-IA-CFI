"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropletIcon } from "lucide-react"

// Datos de precipitaciones
const zonasPrecipitaciones = [
  {
    nombre: "Cruz Alta",
    id: "cruz-alta",
    datos: [
      { mes: "Ene", actual: 180, historico: 165 },
      { mes: "Feb", actual: 160, historico: 155 },
      { mes: "Mar", actual: 120, historico: 130 },
      { mes: "Abr", actual: 80, historico: 75 },
      { mes: "May", actual: 40, historico: 45 },
      { mes: "Jun", actual: 20, historico: 25 },
      { mes: "Jul", actual: 15, historico: 20 },
      { mes: "Ago", actual: 10, historico: 15 },
      { mes: "Sep", actual: 30, historico: 35 },
      { mes: "Oct", actual: 70, historico: 65 },
      { mes: "Nov", actual: 100, historico: 110 },
      { mes: "Dic", actual: 150, historico: 140 },
    ],
  },
  {
    nombre: "Leales",
    id: "leales",
    datos: [
      { mes: "Ene", actual: 190, historico: 175 },
      { mes: "Feb", actual: 170, historico: 165 },
      { mes: "Mar", actual: 130, historico: 140 },
      { mes: "Abr", actual: 85, historico: 80 },
      { mes: "May", actual: 45, historico: 50 },
      { mes: "Jun", actual: 25, historico: 30 },
      { mes: "Jul", actual: 20, historico: 25 },
      { mes: "Ago", actual: 15, historico: 20 },
      { mes: "Sep", actual: 35, historico: 40 },
      { mes: "Oct", actual: 75, historico: 70 },
      { mes: "Nov", actual: 110, historico: 120 },
      { mes: "Dic", actual: 160, historico: 150 },
    ],
  },
  {
    nombre: "Famaillá",
    id: "famailla",
    datos: [
      { mes: "Ene", actual: 200, historico: 185 },
      { mes: "Feb", actual: 180, historico: 175 },
      { mes: "Mar", actual: 140, historico: 150 },
      { mes: "Abr", actual: 90, historico: 85 },
      { mes: "May", actual: 50, historico: 55 },
      { mes: "Jun", actual: 30, historico: 35 },
      { mes: "Jul", actual: 25, historico: 30 },
      { mes: "Ago", actual: 20, historico: 25 },
      { mes: "Sep", actual: 40, historico: 45 },
      { mes: "Oct", actual: 80, historico: 75 },
      { mes: "Nov", actual: 120, historico: 130 },
      { mes: "Dic", actual: 170, historico: 160 },
    ],
  },
  {
    nombre: "Monteros",
    id: "monteros",
    datos: [
      { mes: "Ene", actual: 210, historico: 195 },
      { mes: "Feb", actual: 190, historico: 185 },
      { mes: "Mar", actual: 150, historico: 160 },
      { mes: "Abr", actual: 95, historico: 90 },
      { mes: "May", actual: 55, historico: 60 },
      { mes: "Jun", actual: 35, historico: 40 },
      { mes: "Jul", actual: 30, historico: 35 },
      { mes: "Ago", actual: 25, historico: 30 },
      { mes: "Sep", actual: 45, historico: 50 },
      { mes: "Oct", actual: 85, historico: 80 },
      { mes: "Nov", actual: 130, historico: 140 },
      { mes: "Dic", actual: 180, historico: 170 },
    ],
  },
  {
    nombre: "Burruyacú",
    id: "burruyacu",
    datos: [
      { mes: "Ene", actual: 170, historico: 155 },
      { mes: "Feb", actual: 150, historico: 145 },
      { mes: "Mar", actual: 110, historico: 120 },
      { mes: "Abr", actual: 75, historico: 70 },
      { mes: "May", actual: 35, historico: 40 },
      { mes: "Jun", actual: 15, historico: 20 },
      { mes: "Jul", actual: 10, historico: 15 },
      { mes: "Ago", actual: 5, historico: 10 },
      { mes: "Sep", actual: 25, historico: 30 },
      { mes: "Oct", actual: 65, historico: 60 },
      { mes: "Nov", actual: 95, historico: 105 },
      { mes: "Dic", actual: 140, historico: 130 },
    ],
  },
]

export function GraficoPrecipitaciones() {
  const [zonaSeleccionada, setZonaSeleccionada] = useState("cruz-alta")

  const zonaActual = zonasPrecipitaciones.find((zona) => zona.id === zonaSeleccionada) || zonasPrecipitaciones[0]

  // Función para obtener el color basado en el valor de precipitación
  const getColorClass = (value: number) => {
    if (value < 30) return "bg-yellow-200"
    if (value < 80) return "bg-blue-200"
    if (value < 150) return "bg-blue-300"
    return "bg-blue-500"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <DropletIcon className="mr-2 h-5 w-5 text-blue-500" />
              Precipitaciones Históricas
            </CardTitle>
            <CardDescription>Datos históricos y actuales por zona</CardDescription>
          </div>
          <Select value={zonaSeleccionada} onValueChange={setZonaSeleccionada}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar zona" />
            </SelectTrigger>
            <SelectContent>
              {zonasPrecipitaciones.map((zona) => (
                <SelectItem key={zona.id} value={zona.id}>
                  {zona.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Zona: {zonaActual.nombre}</h3>

          <div className="grid grid-cols-12 gap-2 mb-4">
            {zonaActual.datos.map((dato) => (
              <div key={dato.mes} className="flex flex-col items-center">
                <div className="text-xs font-medium mb-1">{dato.mes}</div>
                <div className="w-full flex flex-col items-center space-y-1">
                  <div
                    className={`w-full ${getColorClass(dato.actual)} rounded-sm`}
                    style={{ height: `${dato.actual / 2}px` }}
                    title={`2023: ${dato.actual} mm`}
                  ></div>
                  <div className="text-xs">{dato.actual}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-2">
            {zonaActual.datos.map((dato) => (
              <div key={`hist-${dato.mes}`} className="flex flex-col items-center">
                <div className="w-full flex flex-col items-center space-y-1">
                  <div
                    className="w-full bg-red-300 rounded-sm"
                    style={{ height: `${dato.historico / 2}px` }}
                    title={`Histórico: ${dato.historico} mm`}
                  ></div>
                  <div className="text-xs">{dato.historico}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-300 rounded-sm mr-1"></div>
              <span>2023 (mm)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-300 rounded-sm mr-1"></div>
              <span>Histórico 2013-2022 (mm)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Los datos históricos corresponden al promedio de los últimos 10 años (2013-2022).</p>
          <p className="mt-1">Fuente: Estación Meteorológica INTA Famaillá</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de ejemplo para mostrar cómo se vería integrado
export function ClimaTabEjemplo() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperatura Actual</CardTitle>
            <DropletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28°C</div>
            <p className="text-xs text-muted-foreground">Sensación térmica: 30°C</p>
          </CardContent>
        </Card>
        {/* Otras tarjetas... */}
      </div>

      <GraficoPrecipitaciones />

      {/* Otras secciones... */}
    </div>
  )
}
