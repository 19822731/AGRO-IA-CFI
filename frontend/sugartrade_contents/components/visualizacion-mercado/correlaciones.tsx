"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Download, Info } from "lucide-react"

// Data for price vs production correlation
const priceProdCorrelationData = [
  { year: "2013", precio: 17.5, produccion: 180 },
  { year: "2014", precio: 16.2, produccion: 183 },
  { year: "2015", precio: 13.1, produccion: 177 },
  { year: "2016", precio: 18.1, produccion: 174 },
  { year: "2017", precio: 15.8, produccion: 179 },
  { year: "2018", precio: 12.5, produccion: 185 },
  { year: "2019", precio: 13.7, produccion: 183 },
  { year: "2020", precio: 14.9, produccion: 178 },
  { year: "2021", precio: 19.3, produccion: 181 },
  { year: "2022", precio: 18.2, produccion: 176 },
  { year: "2023", precio: 20.5, produccion: 180 },
]

// Data for price vs climate correlation
const priceClimateCorrelationData = [
  { year: "2013", precio: 17.5, precipitacion: 1200 },
  { year: "2014", precio: 16.2, precipitacion: 1150 },
  { year: "2015", precio: 13.1, precipitacion: 950 },
  { year: "2016", precio: 18.1, precipitacion: 850 },
  { year: "2017", precio: 15.8, precipitacion: 1050 },
  { year: "2018", precio: 12.5, precipitacion: 1300 },
  { year: "2019", precio: 13.7, precipitacion: 1250 },
  { year: "2020", precio: 14.9, precipitacion: 1100 },
  { year: "2021", precio: 19.3, precipitacion: 900 },
  { year: "2022", precio: 18.2, precipitacion: 950 },
  { year: "2023", precio: 20.5, precipitacion: 800 },
]

// Data for price vs oil correlation
const priceOilCorrelationData = [
  { year: "2013", precio: 17.5, petroleo: 98 },
  { year: "2014", precio: 16.2, petroleo: 93 },
  { year: "2015", precio: 13.1, petroleo: 49 },
  { year: "2016", precio: 18.1, petroleo: 44 },
  { year: "2017", precio: 15.8, petroleo: 54 },
  { year: "2018", precio: 12.5, petroleo: 71 },
  { year: "2019", precio: 13.7, petroleo: 64 },
  { year: "2020", precio: 14.9, petroleo: 42 },
  { year: "2021", precio: 19.3, petroleo: 71 },
  { year: "2022", precio: 18.2, petroleo: 99 },
  { year: "2023", precio: 20.5, petroleo: 82 },
]

// Data for scatter plot
const scatterData = priceProdCorrelationData.map((item) => ({
  x: item.produccion,
  y: item.precio,
  z: 10,
  name: item.year,
}))

const scatterClimateData = priceClimateCorrelationData.map((item) => ({
  x: item.precipitacion,
  y: item.precio,
  z: 10,
  name: item.year,
}))

const scatterOilData = priceOilCorrelationData.map((item) => ({
  x: item.petroleo,
  y: item.precio,
  z: 10,
  name: item.year,
}))

export function Correlaciones() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Correlaciones de Mercado</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4 mr-2" />
            Información
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de Correlaciones del Mercado de Azúcar</CardTitle>
          <CardDescription>Relaciones entre el precio del azúcar y otros factores de mercado</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="produccion" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="produccion">Producción</TabsTrigger>
              <TabsTrigger value="clima">Clima</TabsTrigger>
              <TabsTrigger value="petroleo">Petróleo</TabsTrigger>
            </TabsList>

            <TabsContent value="produccion" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Precio vs. Producción Global</CardTitle>
                    <CardDescription>Evolución histórica del precio y la producción de azúcar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ChartContainer
                        config={{
                          precio: {
                            label: "Precio (centavos/lb)",
                            color: "hsl(var(--chart-1))",
                          },
                          produccion: {
                            label: "Producción (millones de toneladas)",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={priceProdCorrelationData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis yAxisId="left" orientation="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="precio"
                              stroke="var(--color-precio)"
                              name="Precio (centavos/lb)"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="produccion"
                              stroke="var(--color-produccion)"
                              name="Producción (millones ton)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Correlación Precio-Producción</CardTitle>
                    <CardDescription>Diagrama de dispersión que muestra la relación entre variables</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid />
                          <XAxis type="number" dataKey="x" name="Producción" unit=" M ton" />
                          <YAxis type="number" dataKey="y" name="Precio" unit=" ¢/lb" />
                          <ZAxis type="number" dataKey="z" range={[60, 400]} />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => [value, name]} />
                          <Scatter name="Precio vs Producción" data={scatterData} fill="#8884d8" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de la Correlación Precio-Producción</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Existe una correlación negativa entre la producción global de azúcar y su precio en el mercado
                      internacional. Cuando la producción aumenta, generalmente se observa una presión a la baja en los
                      precios debido al mayor suministro disponible.
                    </p>
                    <p>
                      Esta relación inversa es particularmente evidente en años de superávit de producción, como 2015 y
                      2018, donde los precios cayeron significativamente. Por el contrario, en años con producción
                      reducida como 2016 y 2021, los precios tendieron a subir.
                    </p>
                    <p>
                      Sin embargo, la correlación no es perfecta, ya que otros factores como los niveles de inventario,
                      políticas comerciales y expectativas de mercado también influyen en la formación de precios.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clima" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Precio vs. Precipitaciones</CardTitle>
                    <CardDescription>
                      Relación entre el precio del azúcar y las precipitaciones en regiones productoras
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ChartContainer
                        config={{
                          precio: {
                            label: "Precio (centavos/lb)",
                            color: "hsl(var(--chart-1))",
                          },
                          precipitacion: {
                            label: "Precipitación (mm)",
                            color: "hsl(var(--chart-3))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={priceClimateCorrelationData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis yAxisId="left" orientation="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="precio"
                              stroke="var(--color-precio)"
                              name="Precio (centavos/lb)"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="precipitacion"
                              stroke="var(--color-precipitacion)"
                              name="Precipitación (mm)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Correlación Precio-Clima</CardTitle>
                    <CardDescription>Diagrama de dispersión que muestra la relación entre variables</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid />
                          <XAxis type="number" dataKey="x" name="Precipitación" unit=" mm" />
                          <YAxis type="number" dataKey="y" name="Precio" unit=" ¢/lb" />
                          <ZAxis type="number" dataKey="z" range={[60, 400]} />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => [value, name]} />
                          <Scatter name="Precio vs Precipitación" data={scatterClimateData} fill="#82ca9d" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de la Correlación Precio-Clima</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Existe una correlación negativa entre los niveles de precipitación en las principales regiones
                      productoras de caña de azúcar y los precios internacionales. Años con mayores precipitaciones
                      tienden a favorecer mejores cosechas, aumentando la oferta y presionando los precios a la baja.
                    </p>
                    <p>
                      Por el contrario, períodos de sequía o precipitaciones por debajo del promedio, como en 2016 y
                      2023, suelen asociarse con rendimientos reducidos y precios más altos. Esta relación es
                      particularmente relevante para Brasil, el mayor productor mundial, donde las condiciones
                      climáticas en las regiones Centro-Sur tienen un impacto significativo en el mercado global.
                    </p>
                    <p>
                      Los eventos climáticos extremos, como El Niño y La Niña, también pueden alterar los patrones de
                      precipitación y afectar la producción de azúcar en múltiples regiones simultáneamente,
                      amplificando su impacto en los precios.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="petroleo" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Precio del Azúcar vs. Petróleo</CardTitle>
                    <CardDescription>Relación entre el precio del azúcar y el precio del petróleo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ChartContainer
                        config={{
                          precio: {
                            label: "Precio Azúcar (centavos/lb)",
                            color: "hsl(var(--chart-1))",
                          },
                          petroleo: {
                            label: "Precio Petróleo (USD/barril)",
                            color: "hsl(var(--chart-4))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={priceOilCorrelationData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis yAxisId="left" orientation="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="precio"
                              stroke="var(--color-precio)"
                              name="Precio Azúcar (¢/lb)"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="petroleo"
                              stroke="var(--color-petroleo)"
                              name="Precio Petróleo (USD/barril)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Correlación Azúcar-Petróleo</CardTitle>
                    <CardDescription>Diagrama de dispersión que muestra la relación entre variables</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid />
                          <XAxis type="number" dataKey="x" name="Petróleo" unit=" USD/barril" />
                          <YAxis type="number" dataKey="y" name="Precio Azúcar" unit=" ¢/lb" />
                          <ZAxis type="number" dataKey="z" range={[60, 400]} />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => [value, name]} />
                          <Scatter name="Precio Azúcar vs Petróleo" data={scatterOilData} fill="#ff7300" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de la Correlación Azúcar-Petróleo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Existe una correlación positiva entre los precios del petróleo y del azúcar, aunque esta relación
                      es compleja y ha variado en intensidad a lo largo del tiempo. Esta correlación se explica
                      principalmente por dos factores:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        <strong>Producción de etanol:</strong> En Brasil, el mayor productor y exportador de azúcar, la
                        caña puede destinarse a la producción de azúcar o etanol. Cuando los precios del petróleo son
                        altos, aumenta la demanda de biocombustibles como el etanol, lo que puede reducir la oferta de
                        azúcar y presionar sus precios al alza.
                      </li>
                      <li>
                        <strong>Costos de producción:</strong> El petróleo afecta los costos de producción agrícola a
                        través de fertilizantes, combustible para maquinaria y transporte. Precios más altos del
                        petróleo pueden traducirse en mayores costos de producción de azúcar, lo que eventualmente se
                        refleja en sus precios.
                      </li>
                    </ol>
                    <p>
                      Esta correlación fue particularmente evidente durante las crisis del petróleo de 2008 y 2021-2022,
                      cuando ambos commodities experimentaron aumentos significativos de precio.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
