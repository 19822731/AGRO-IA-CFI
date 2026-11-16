"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTucumanSugarMap } from "@/hooks/use-tucuman-sugar-map"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, LineChart, Line } from "recharts"

export function RendimientoRegional() {
  const { departments, availableYears } = useTucumanSugarMap()
  const [activeTab, setActiveTab] = useState("rendimiento")
  const [selectedYear, setSelectedYear] = useState<string>("2022")

  // Datos simulados de rendimiento por departamento
  const rendimientoData = departments
    .map((dept) => {
      // Base de rendimiento que varía según el departamento (valores ficticios)
      const baseRendimiento =
        {
          "Cruz Alta": 85,
          Leales: 82,
          Simoca: 80,
          Monteros: 78,
          Chicligasta: 76,
          "Río Chico": 75,
          Famaillá: 77,
          Burruyacú: 72,
          "La Cocha": 70,
          Graneros: 68,
          Lules: 73,
          "Tafí Viejo": 71,
          Trancas: 65,
          "Yerba Buena": 69,
        }[dept] || 70

      // Variación según el año
      const yearFactor =
        {
          "2018": 0.92,
          "2019": 0.95,
          "2020": 0.97,
          "2021": 0.99,
          "2022": 1.0,
        }[selectedYear] || 1.0

      // Añadimos algo de variación aleatoria
      const rendimiento = Math.round(baseRendimiento * yearFactor * (0.98 + Math.random() * 0.04))

      return {
        departamento: dept,
        rendimiento: rendimiento,
        azucar: Math.round(rendimiento * 0.115 * 10) / 10, // Rendimiento de azúcar (aproximadamente 11.5% del rendimiento de caña)
        pureza: Math.round(80 + Math.random() * 10 * 10) / 10, // Pureza del jugo (%)
      }
    })
    .sort((a, b) => b.rendimiento - a.rendimiento)

  // Datos simulados de evolución histórica de rendimiento
  const historicalData = availableYears.map((year) => {
    // Factor base que varía según el año
    const baseFactor =
      {
        "2018": 0.92,
        "2019": 0.95,
        "2020": 0.97,
        "2021": 0.99,
        "2022": 1.0,
      }[year] || 1.0

    return {
      year: year,
      rendimientoPromedio: Math.round(75 * baseFactor),
      rendimientoMax: Math.round(85 * baseFactor),
      rendimientoMin: Math.round(65 * baseFactor),
      azucarPromedio: Math.round(75 * baseFactor * 0.115 * 10) / 10,
    }
  })

  // Datos simulados de factores que afectan el rendimiento
  const factoresData = [
    { factor: "Variedad de Caña", impacto: 25 },
    { factor: "Clima", impacto: 20 },
    { factor: "Manejo Agronómico", impacto: 18 },
    { factor: "Edad del Cañaveral", impacto: 15 },
    { factor: "Suelo", impacto: 12 },
    { factor: "Plagas y Enfermedades", impacto: 10 },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rendimiento Regional de Caña de Azúcar</CardTitle>
        <CardDescription>Análisis de rendimiento por departamento y factores que lo afectan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Año</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rendimiento">Rendimiento por Región</TabsTrigger>
            <TabsTrigger value="historico">Evolución Histórica</TabsTrigger>
            <TabsTrigger value="factores">Factores de Impacto</TabsTrigger>
          </TabsList>

          <TabsContent value="rendimiento" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Departamento</CardTitle>
                <CardDescription>
                  Rendimiento de caña y producción de azúcar por departamento ({selectedYear})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      rendimiento: {
                        label: "Rendimiento de Caña (ton/ha)",
                        color: "hsl(var(--chart-1))",
                      },
                      azucar: {
                        label: "Rendimiento de Azúcar (ton/ha)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rendimientoData.slice(0, 10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="departamento" type="category" width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="rendimiento"
                          name="Rendimiento de Caña (ton/ha)"
                          fill="var(--color-rendimiento)"
                        />
                        <Bar dataKey="azucar" name="Rendimiento de Azúcar (ton/ha)" fill="var(--color-azucar)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Análisis de Rendimiento</h3>
                  <p className="text-sm text-muted-foreground">
                    El rendimiento de caña de azúcar varía significativamente entre los departamentos de Tucumán,
                    influenciado por factores como el clima, suelo, variedades cultivadas y prácticas agronómicas.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Departamentos de Alto Rendimiento</h4>
                      <p className="text-sm">
                        Los departamentos de Cruz Alta, Leales y Simoca muestran los mayores rendimientos, con promedios
                        superiores a 80 ton/ha. Estos departamentos se caracterizan por suelos fértiles y un manejo
                        agronómico avanzado.
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Rendimiento Industrial</h4>
                      <p className="text-sm">
                        El rendimiento de azúcar (producto final) varía entre 7.5 y 9.8 ton/ha, representando
                        aproximadamente el 11-12% del rendimiento de caña. La calidad del jugo (pureza) también varía
                        por región, afectando la eficiencia industrial.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolución Histórica del Rendimiento</CardTitle>
                <CardDescription>Tendencias de rendimiento de caña y azúcar (2018-2022)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      rendimientoPromedio: {
                        label: "Rendimiento Promedio (ton/ha)",
                        color: "hsl(var(--chart-1))",
                      },
                      rendimientoMax: {
                        label: "Rendimiento Máximo (ton/ha)",
                        color: "hsl(var(--chart-2))",
                      },
                      rendimientoMin: {
                        label: "Rendimiento Mínimo (ton/ha)",
                        color: "hsl(var(--chart-3))",
                      },
                      azucarPromedio: {
                        label: "Rendimiento de Azúcar (ton/ha)",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="rendimientoPromedio"
                          name="Rendimiento Promedio (ton/ha)"
                          stroke="var(--color-rendimientoPromedio)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rendimientoMax"
                          name="Rendimiento Máximo (ton/ha)"
                          stroke="var(--color-rendimientoMax)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rendimientoMin"
                          name="Rendimiento Mínimo (ton/ha)"
                          stroke="var(--color-rendimientoMin)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="azucarPromedio"
                          name="Rendimiento de Azúcar (ton/ha)"
                          stroke="var(--color-azucarPromedio)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Tendencias Históricas</h3>
                  <p className="text-sm text-muted-foreground">
                    El rendimiento de caña de azúcar en Tucumán ha mostrado una tendencia creciente en los últimos años,
                    con mejoras tanto en el rendimiento agrícola como industrial.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Factores de Mejora</h4>
                      <p className="text-sm">
                        El incremento en los rendimientos se atribuye principalmente a la adopción de nuevas variedades
                        de caña con mayor potencial productivo, mejoras en las prácticas de manejo agronómico y
                        condiciones climáticas favorables en los últimos años.
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Variabilidad Interanual</h4>
                      <p className="text-sm">
                        A pesar de la tendencia positiva, se observa variabilidad interanual en los rendimientos,
                        principalmente asociada a condiciones climáticas específicas de cada año, como sequías o heladas
                        tempranas que afectan el desarrollo del cultivo.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="factores" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Factores que Afectan el Rendimiento</CardTitle>
                <CardDescription>
                  Impacto relativo de diferentes factores en el rendimiento de caña de azúcar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      impacto: {
                        label: "Impacto Relativo (%)",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={factoresData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="factor" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="impacto" name="Impacto Relativo (%)" fill="var(--color-impacto)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Análisis de Factores</h3>
                  <p className="text-sm text-muted-foreground">
                    El rendimiento de la caña de azúcar está influenciado por múltiples factores, tanto genéticos como
                    ambientales y de manejo. Comprender la importancia relativa de cada factor es clave para optimizar
                    la producción.
                  </p>

                  <div className="space-y-2">
                    {factoresData.map((item, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <h4 className="font-medium">{item.factor}</h4>
                        <p className="text-sm">
                          <span className="font-semibold">Impacto: {item.impacto}%</span>
                          <span className="block mt-1">
                            {item.factor === "Variedad de Caña" &&
                              "Las variedades modernas como LCP 85-384 y TUCCP 77-42 pueden incrementar el rendimiento hasta en un 20% respecto a variedades tradicionales."}
                            {item.factor === "Clima" &&
                              "Temperaturas entre 25-35°C y precipitaciones de 1500-2000mm anuales bien distribuidas son óptimas para el cultivo."}
                            {item.factor === "Manejo Agronómico" &&
                              "Prácticas como fertilización balanceada, control de malezas y manejo adecuado del riego pueden aumentar significativamente el rendimiento."}
                            {item.factor === "Edad del Cañaveral" &&
                              "Los rendimientos suelen ser máximos en el segundo y tercer corte, disminuyendo progresivamente en cortes posteriores."}
                            {item.factor === "Suelo" &&
                              "Suelos profundos, bien drenados y con buen contenido de materia orgánica favorecen mayores rendimientos."}
                            {item.factor === "Plagas y Enfermedades" &&
                              "El control efectivo de plagas como el barrenador y enfermedades como el carbón puede prevenir pérdidas significativas de rendimiento."}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
