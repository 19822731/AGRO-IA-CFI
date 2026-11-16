"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CloudIcon, DropletIcon, SunIcon, ThermometerIcon } from "lucide-react"

// Datos de precipitaciones históricas por zona
const precipitacionesPorZona = [
  {
    id: "cruz-alta",
    nombre: "Cruz Alta",
    datos: [
      { mes: "Ene", valor: 180 },
      { mes: "Feb", valor: 160 },
      { mes: "Mar", valor: 120 },
      { mes: "Abr", valor: 80 },
      { mes: "May", valor: 40 },
      { mes: "Jun", valor: 20 },
      { mes: "Jul", valor: 15 },
      { mes: "Ago", valor: 10 },
      { mes: "Sep", valor: 30 },
      { mes: "Oct", valor: 70 },
      { mes: "Nov", valor: 100 },
      { mes: "Dic", valor: 150 },
    ],
  },
  {
    id: "leales",
    nombre: "Leales",
    datos: [
      { mes: "Ene", valor: 190 },
      { mes: "Feb", valor: 170 },
      { mes: "Mar", valor: 130 },
      { mes: "Abr", valor: 85 },
      { mes: "May", valor: 45 },
      { mes: "Jun", valor: 25 },
      { mes: "Jul", valor: 20 },
      { mes: "Ago", valor: 15 },
      { mes: "Sep", valor: 35 },
      { mes: "Oct", valor: 75 },
      { mes: "Nov", valor: 110 },
      { mes: "Dic", valor: 160 },
    ],
  },
  {
    id: "famailla",
    nombre: "Famaillá",
    datos: [
      { mes: "Ene", valor: 200 },
      { mes: "Feb", valor: 180 },
      { mes: "Mar", valor: 140 },
      { mes: "Abr", valor: 90 },
      { mes: "May", valor: 50 },
      { mes: "Jun", valor: 30 },
      { mes: "Jul", valor: 25 },
      { mes: "Ago", valor: 20 },
      { mes: "Sep", valor: 40 },
      { mes: "Oct", valor: 80 },
      { mes: "Nov", valor: 120 },
      { mes: "Dic", valor: 170 },
    ],
  },
  {
    id: "monteros",
    nombre: "Monteros",
    datos: [
      { mes: "Ene", valor: 210 },
      { mes: "Feb", valor: 190 },
      { mes: "Mar", valor: 150 },
      { mes: "Abr", valor: 95 },
      { mes: "May", valor: 55 },
      { mes: "Jun", valor: 35 },
      { mes: "Jul", valor: 30 },
      { mes: "Ago", valor: 25 },
      { mes: "Sep", valor: 45 },
      { mes: "Oct", valor: 85 },
      { mes: "Nov", valor: 130 },
      { mes: "Dic", valor: 180 },
    ],
  },
  {
    id: "burruyacu",
    nombre: "Burruyacú",
    datos: [
      { mes: "Ene", valor: 170 },
      { mes: "Feb", valor: 150 },
      { mes: "Mar", valor: 110 },
      { mes: "Abr", valor: 75 },
      { mes: "May", valor: 35 },
      { mes: "Jun", valor: 15 },
      { mes: "Jul", valor: 10 },
      { mes: "Ago", valor: 5 },
      { mes: "Sep", valor: 25 },
      { mes: "Oct", valor: 65 },
      { mes: "Nov", valor: 95 },
      { mes: "Dic", valor: 140 },
    ],
  },
]

// Componente de gráfico de precipitaciones
function GraficoPrecipitaciones() {
  const [zonaSeleccionada, setZonaSeleccionada] = useState("cruz-alta")

  const zonaActual = precipitacionesPorZona.find((zona) => zona.id === zonaSeleccionada) || precipitacionesPorZona[0]

  // Encontrar el valor máximo para escalar el gráfico
  const valorMaximo = Math.max(...zonaActual.datos.map((d) => d.valor))

  // Función para obtener el color basado en el valor de precipitación
  const getColorClass = (valor: number) => {
    if (valor < 30) return "bg-yellow-200"
    if (valor < 80) return "bg-blue-200"
    if (valor < 150) return "bg-blue-300"
    return "bg-blue-500"
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <DropletIcon className="mr-2 h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-medium">Precipitaciones Históricas - {zonaActual.nombre}</h3>
        </div>
        <Select value={zonaSeleccionada} onValueChange={setZonaSeleccionada}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar zona" />
          </SelectTrigger>
          <SelectContent>
            {precipitacionesPorZona.map((zona) => (
              <SelectItem key={zona.id} value={zona.id}>
                {zona.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-12 gap-2">
          {zonaActual.datos.map((dato) => (
            <div key={dato.mes} className="flex flex-col items-center">
              <div className="text-xs mb-1">{dato.mes}</div>
              <div className="w-full flex flex-col items-center space-y-1">
                <div
                  className={`w-full ${getColorClass(dato.valor)} rounded-sm`}
                  style={{ height: `${(dato.valor / valorMaximo) * 150}px` }}
                ></div>
                <div className="text-xs">{dato.valor} mm</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">Datos históricos de precipitaciones (promedio 2013-2022)</div>
    </div>
  )
}

// Componente principal de la pestaña Clima
export function ClimaTab() {
  return (
    <div className="space-y-4">
      {/* Tarjetas de información meteorológica */}
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

      {/* Pronóstico del tiempo */}
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

      {/* Gráfico de precipitaciones */}
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
