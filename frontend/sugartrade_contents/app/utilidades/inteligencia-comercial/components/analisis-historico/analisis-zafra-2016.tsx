"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HARVEST_DATA_2016 } from "@/lib/services/historical-harvest-service"
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export default function AnalisisZafra2016() {
  const [selectedMetric, setSelectedMetric] = useState<"area" | "production" | "yield">("yield")

  const metricLabels = {
    area: "Superficie (ha)",
    production: "Producción (t)",
    yield: "Rendimiento (t/ha)",
  }

  // Preparar datos para gráficos
  const departmentData = HARVEST_DATA_2016.departmentData.map((dept) => ({
    name: dept.name,
    area: dept.area,
    production: dept.production,
    yield: dept.yield,
    levelId: dept.levelId,
    color: HARVEST_DATA_2016.harvestLevels.find((l) => l.id === dept.levelId)?.color || "#cccccc",
  }))

  // Ordenar por la métrica seleccionada (descendente)
  const sortedData = [...departmentData].sort((a, b) => b[selectedMetric] - a[selectedMetric])

  // Datos para el gráfico de distribución por nivel
  const levelDistribution = HARVEST_DATA_2016.harvestLevels.map((level) => {
    const depts = departmentData.filter((d) => d.levelId === level.id)
    return {
      name: level.name,
      area: depts.reduce((sum, d) => sum + d.area, 0),
      production: depts.reduce((sum, d) => sum + d.production, 0),
      departments: depts.length,
      color: level.color,
    }
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Análisis de Producción - Zafra 2016</CardTitle>
        <CardDescription>
          Análisis detallado de la producción de caña de azúcar por departamento en la Provincia de Tucumán para la
          campaña 2016.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="departamentos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="departamentos">Por Departamento</TabsTrigger>
            <TabsTrigger value="niveles">Por Nivel de Producción</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas Generales</TabsTrigger>
          </TabsList>

          <div className="my-4 flex justify-end">
            <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar métrica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yield">Rendimiento (t/ha)</SelectItem>
                <SelectItem value="production">Producción (t)</SelectItem>
                <SelectItem value="area">Superficie (ha)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="departamentos" className="space-y-4">
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  [selectedMetric]: {
                    label: metricLabels[selectedMetric],
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey={selectedMetric} name={metricLabels[selectedMetric]}>
                      {sortedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Datos por Departamento</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Departamento</th>
                      <th className="p-2 text-right">Superficie (ha)</th>
                      <th className="p-2 text-right">Producción (t)</th>
                      <th className="p-2 text-right">Rendimiento (t/ha)</th>
                      <th className="p-2 text-left">Nivel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((dept, index) => {
                      const level = HARVEST_DATA_2016.harvestLevels.find((l) => l.id === dept.levelId)
                      return (
                        <tr key={index} className="border-b border-muted">
                          <td className="p-2">{dept.name}</td>
                          <td className="p-2 text-right">{dept.area.toLocaleString()}</td>
                          <td className="p-2 text-right">{dept.production.toLocaleString()}</td>
                          <td className="p-2 text-right">
                            {dept.yield.toLocaleString(undefined, {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: dept.color }}></div>
                              {level?.name || "N/A"}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="niveles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    [selectedMetric]: {
                      label: metricLabels[selectedMetric],
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={levelDistribution}
                        dataKey={selectedMetric === "yield" ? "area" : selectedMetric}
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={(entry) => entry.name}
                      >
                        {levelDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Distribución por Nivel de Producción</h3>
                <div className="space-y-4">
                  {HARVEST_DATA_2016.harvestLevels.map((level, index) => {
                    const depts = departmentData.filter((d) => d.levelId === level.id)
                    const totalArea = depts.reduce((sum, d) => sum + d.area, 0)
                    const totalProduction = depts.reduce((sum, d) => sum + d.production, 0)
                    const avgYield = totalArea > 0 ? totalProduction / totalArea : 0
                    const areaPercent = (totalArea / HARVEST_DATA_2016.totalArea) * 100

                    return (
                      <div key={index} className="p-3 rounded-md" style={{ backgroundColor: `${level.color}20` }}>
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: level.color }}></div>
                          <h4 className="font-medium">
                            {level.name} ({level.minValue}-{level.maxValue} t/ha)
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            Departamentos: <span className="font-medium">{depts.length}</span>
                          </div>
                          <div>
                            Área:{" "}
                            <span className="font-medium">
                              {totalArea.toLocaleString()} ha ({areaPercent.toFixed(1)}%)
                            </span>
                          </div>
                          <div>
                            Producción: <span className="font-medium">{totalProduction.toLocaleString()} t</span>
                          </div>
                          <div>
                            Rendimiento promedio: <span className="font-medium">{avgYield.toFixed(1)} t/ha</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="estadisticas">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">{HARVEST_DATA_2016.totalArea.toLocaleString()}</CardTitle>
                  <CardDescription>Hectáreas totales</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">
                    {HARVEST_DATA_2016.totalProduction.toLocaleString()}
                  </CardTitle>
                  <CardDescription>Toneladas producidas</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">{HARVEST_DATA_2016.averageYield.toFixed(1)}</CardTitle>
                  <CardDescription>Rendimiento promedio (t/ha)</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resumen General</h3>
              <p className="text-sm text-muted-foreground">
                La campaña de zafra 2016 en la Provincia de Tucumán presentó una superficie total cosechable de caña de
                azúcar de aproximadamente {HARVEST_DATA_2016.totalArea.toLocaleString()} hectáreas, con una producción
                total de {HARVEST_DATA_2016.totalProduction.toLocaleString()} toneladas y un rendimiento promedio de{" "}
                {HARVEST_DATA_2016.averageYield.toFixed(1)} toneladas por hectárea.
              </p>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Distribución por nivel de producción:</h4>
                <ul className="space-y-2">
                  {HARVEST_DATA_2016.harvestLevels.map((level, index) => {
                    const depts = departmentData.filter((d) => d.levelId === level.id)
                    const deptNames = depts.map((d) => d.name).join(", ")
                    return (
                      <li key={index} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: level.color }}></div>
                        <span>
                          <strong>
                            {level.name} ({level.minValue}-{level.maxValue} t/ha):
                          </strong>{" "}
                          {deptNames}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Observaciones:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Los departamentos de Leales y Cruz Alta presentaron los mayores rendimientos.</li>
                  <li>La zona central de la provincia concentró los niveles de producción más altos.</li>
                  <li>Los departamentos del norte y sur de la provincia mostraron rendimientos más bajos.</li>
                  <li>
                    La variabilidad en los rendimientos estuvo influenciada por factores climáticos y tecnológicos.
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
