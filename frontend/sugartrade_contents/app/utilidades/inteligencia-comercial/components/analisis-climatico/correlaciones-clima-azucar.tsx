"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useArgentinaClimateNormals } from "@/hooks/use-argentina-climate-normals"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function CorrelacionesClimaAzucar() {
  const { getClimateSugarCorrelations } = useArgentinaClimateNormals()
  const [activeTab, setActiveTab] = useState("correlaciones")

  // Obtener datos de correlaciones
  const correlationData = getClimateSugarCorrelations()

  // Datos simulados de producción y variables climáticas
  const productionClimateData = [
    { year: 2010, produccion: 1.8, temperatura: 21.5, precipitacion: 950, humedad: 68 },
    { year: 2011, produccion: 1.9, temperatura: 22.1, precipitacion: 980, humedad: 70 },
    { year: 2012, produccion: 1.7, temperatura: 20.8, precipitacion: 920, humedad: 67 },
    { year: 2013, produccion: 1.6, temperatura: 20.5, precipitacion: 900, humedad: 65 },
    { year: 2014, produccion: 2.0, temperatura: 22.3, precipitacion: 1050, humedad: 72 },
    { year: 2015, produccion: 2.1, temperatura: 22.5, precipitacion: 1100, humedad: 73 },
    { year: 2016, produccion: 1.9, temperatura: 21.9, precipitacion: 970, humedad: 69 },
    { year: 2017, produccion: 2.2, temperatura: 22.8, precipitacion: 1150, humedad: 74 },
    { year: 2018, produccion: 2.0, temperatura: 22.0, precipitacion: 1000, humedad: 70 },
    { year: 2019, produccion: 1.8, temperatura: 21.2, precipitacion: 930, humedad: 66 },
    { year: 2020, produccion: 1.7, temperatura: 20.9, precipitacion: 910, humedad: 65 },
    { year: 2021, produccion: 1.9, temperatura: 21.8, precipitacion: 960, humedad: 68 },
    { year: 2022, produccion: 2.1, temperatura: 22.4, precipitacion: 1080, humedad: 72 },
    { year: 2023, produccion: 2.3, temperatura: 23.0, precipitacion: 1200, humedad: 75 },
  ]

  // Datos de anomalías climáticas y su impacto en la producción
  const anomalyData = [
    { year: 2010, anomaliaTemp: 0.2, anomaliaPrecip: -5, impactoProduccion: -2 },
    { year: 2011, anomaliaTemp: 0.8, anomaliaPrecip: 3, impactoProduccion: 5 },
    { year: 2012, anomaliaTemp: -0.5, anomaliaPrecip: -8, impactoProduccion: -8 },
    { year: 2013, anomaliaTemp: -0.8, anomaliaPrecip: -10, impactoProduccion: -12 },
    { year: 2014, anomaliaTemp: 1.0, anomaliaPrecip: 10, impactoProduccion: 10 },
    { year: 2015, anomaliaTemp: 1.2, anomaliaPrecip: 15, impactoProduccion: 15 },
    { year: 2016, anomaliaTemp: 0.6, anomaliaPrecip: 2, impactoProduccion: 3 },
    { year: 2017, anomaliaTemp: 1.5, anomaliaPrecip: 20, impactoProduccion: 18 },
    { year: 2018, anomaliaTemp: 0.7, anomaliaPrecip: 5, impactoProduccion: 7 },
    { year: 2019, anomaliaTemp: -0.1, anomaliaPrecip: -7, impactoProduccion: -5 },
    { year: 2020, anomaliaTemp: -0.4, anomaliaPrecip: -9, impactoProduccion: -10 },
    { year: 2021, anomaliaTemp: 0.5, anomaliaPrecip: 1, impactoProduccion: 2 },
    { year: 2022, anomaliaTemp: 1.1, anomaliaPrecip: 12, impactoProduccion: 12 },
    { year: 2023, anomaliaTemp: 1.7, anomaliaPrecip: 25, impactoProduccion: 20 },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Correlaciones Clima-Azúcar</CardTitle>
        <CardDescription>Análisis de la relación entre variables climáticas y producción de azúcar</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="correlaciones">Correlaciones</TabsTrigger>
            <TabsTrigger value="tendencias">Tendencias Históricas</TabsTrigger>
            <TabsTrigger value="anomalias">Anomalías e Impacto</TabsTrigger>
          </TabsList>

          <TabsContent value="correlaciones" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Correlaciones entre Variables Climáticas y Producción</CardTitle>
                <CardDescription>
                  Coeficientes de correlación entre variables climáticas y rendimiento de azúcar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      correlacion: {
                        label: "Correlación",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={correlationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="variable" />
                        <YAxis domain={[-1, 1]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="correlacion" name="Correlación" fill="var(--color-correlacion)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Interpretación de Correlaciones</h3>
                  <p className="text-sm text-muted-foreground">
                    Los coeficientes de correlación indican la fuerza y dirección de la relación entre cada variable
                    climática y la producción de azúcar. Valores cercanos a 1 indican una fuerte correlación positiva,
                    mientras que valores cercanos a -1 indican una fuerte correlación negativa.
                  </p>

                  <div className="space-y-2">
                    {correlationData.map((item, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <h4 className="font-medium">{item.variable}</h4>
                        <p className="text-sm">
                          <span className={`font-semibold ${item.correlacion > 0 ? "text-green-600" : "text-red-600"}`}>
                            Correlación: {item.correlacion.toFixed(2)}
                          </span>
                          <span className="block mt-1">{item.descripcion}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tendencias" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias Históricas</CardTitle>
                <CardDescription>Evolución de variables climáticas y producción de azúcar (2010-2023)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      produccion: {
                        label: "Producción (millones ton)",
                        color: "hsl(var(--chart-1))",
                      },
                      temperatura: {
                        label: "Temperatura (°C)",
                        color: "hsl(var(--chart-2))",
                      },
                      precipitacion: {
                        label: "Precipitación (mm, escala 1:100)",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productionClimateData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="produccion"
                          name="Producción (millones ton)"
                          fill="var(--color-produccion)"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="temperatura"
                          name="Temperatura (°C)"
                          fill="var(--color-temperatura)"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="precipitacion"
                          name="Precipitación (mm, escala 1:100)"
                          fill="var(--color-precipitacion)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Análisis de Tendencias</h3>
                  <p className="text-sm text-muted-foreground">
                    El gráfico muestra la evolución de la producción de azúcar junto con las principales variables
                    climáticas que la influencian. Se puede observar una clara correlación entre los picos de producción
                    y las condiciones climáticas favorables (temperaturas y precipitaciones adecuadas).
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Períodos de Alta Producción</h4>
                      <p className="text-sm">
                        Los años 2014-2015, 2017 y 2022-2023 muestran picos de producción que coinciden con temperaturas
                        superiores a 22°C y precipitaciones por encima de 1000mm, condiciones óptimas para el cultivo de
                        caña.
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Períodos de Baja Producción</h4>
                      <p className="text-sm">
                        Los años 2012-2013 y 2019-2020 muestran caídas en la producción que coinciden con temperaturas
                        por debajo de 21°C y precipitaciones inferiores a 930mm, condiciones subóptimas para el cultivo.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalias" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Anomalías Climáticas e Impacto</CardTitle>
                <CardDescription>Desviaciones de las normales climáticas y su impacto en la producción</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      anomaliaTemp: {
                        label: "Anomalía Temperatura (°C)",
                        color: "hsl(var(--chart-1))",
                      },
                      anomaliaPrecip: {
                        label: "Anomalía Precipitación (%)",
                        color: "hsl(var(--chart-2))",
                      },
                      impactoProduccion: {
                        label: "Impacto en Producción (%)",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={anomalyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis domain={[-15, 25]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="anomaliaTemp" name="Anomalía Temperatura (°C)" fill="var(--color-anomaliaTemp)" />
                        <Bar
                          dataKey="anomaliaPrecip"
                          name="Anomalía Precipitación (%)"
                          fill="var(--color-anomaliaPrecip)"
                        />
                        <Bar
                          dataKey="impactoProduccion"
                          name="Impacto en Producción (%)"
                          fill="var(--color-impactoProduccion)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Impacto de Anomalías Climáticas</h3>
                  <p className="text-sm text-muted-foreground">
                    El gráfico muestra cómo las desviaciones de las normales climáticas (anomalías) impactan
                    directamente en la producción de azúcar. Se observa una fuerte correlación entre anomalías positivas
                    de temperatura y precipitación con aumentos en la producción, y viceversa.
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Años con Anomalías Positivas</h4>
                      <p className="text-sm">
                        Los años 2014-2015, 2017 y 2022-2023 presentaron anomalías positivas significativas tanto en
                        temperatura como en precipitación, resultando en incrementos de producción del 10-20%. Estas
                        condiciones favorecieron el crecimiento vegetativo y la acumulación de sacarosa.
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Años con Anomalías Negativas</h4>
                      <p className="text-sm">
                        Los años 2012-2013 y 2019-2020 presentaron anomalías negativas en temperatura y precipitación,
                        resultando en reducciones de producción del 5-12%. Estas condiciones limitaron el desarrollo de
                        la caña y redujeron el contenido de azúcar.
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Aplicaciones para Trading</h4>
                      <p className="text-sm">
                        El monitoreo de anomalías climáticas en tiempo real puede proporcionar indicadores tempranos de
                        posibles variaciones en la producción, permitiendo anticipar movimientos de precios y optimizar
                        decisiones de compra/venta.
                      </p>
                    </div>
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
