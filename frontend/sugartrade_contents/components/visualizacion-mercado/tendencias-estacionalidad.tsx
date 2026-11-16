"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Download, Info, Calendar, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Datos históricos de precios mensuales (últimos 5 años)
const preciosMensuales = [
  { mes: "Ene 2019", precio: 12.8 },
  { mes: "Feb 2019", precio: 13.1 },
  { mes: "Mar 2019", precio: 12.5 },
  { mes: "Abr 2019", precio: 12.9 },
  { mes: "May 2019", precio: 11.7 },
  { mes: "Jun 2019", precio: 12.3 },
  { mes: "Jul 2019", precio: 12.0 },
  { mes: "Ago 2019", precio: 11.5 },
  { mes: "Sep 2019", precio: 11.8 },
  { mes: "Oct 2019", precio: 12.4 },
  { mes: "Nov 2019", precio: 12.8 },
  { mes: "Dic 2019", precio: 13.2 },
  { mes: "Ene 2020", precio: 14.1 },
  { mes: "Feb 2020", precio: 14.8 },
  { mes: "Mar 2020", precio: 11.2 },
  { mes: "Abr 2020", precio: 10.4 },
  { mes: "May 2020", precio: 10.8 },
  { mes: "Jun 2020", precio: 11.5 },
  { mes: "Jul 2020", precio: 12.2 },
  { mes: "Ago 2020", precio: 12.8 },
  { mes: "Sep 2020", precio: 13.5 },
  { mes: "Oct 2020", precio: 14.1 },
  { mes: "Nov 2020", precio: 14.8 },
  { mes: "Dic 2020", precio: 15.2 },
  { mes: "Ene 2021", precio: 15.8 },
  { mes: "Feb 2021", precio: 16.5 },
  { mes: "Mar 2021", precio: 16.2 },
  { mes: "Abr 2021", precio: 16.8 },
  { mes: "May 2021", precio: 17.5 },
  { mes: "Jun 2021", precio: 17.9 },
  { mes: "Jul 2021", precio: 18.2 },
  { mes: "Ago 2021", precio: 19.1 },
  { mes: "Sep 2021", precio: 19.8 },
  { mes: "Oct 2021", precio: 19.5 },
  { mes: "Nov 2021", precio: 19.2 },
  { mes: "Dic 2021", precio: 19.4 },
  { mes: "Ene 2022", precio: 18.9 },
  { mes: "Feb 2022", precio: 18.2 },
  { mes: "Mar 2022", precio: 19.1 },
  { mes: "Abr 2022", precio: 19.8 },
  { mes: "May 2022", precio: 19.5 },
  { mes: "Jun 2022", precio: 18.7 },
  { mes: "Jul 2022", precio: 17.9 },
  { mes: "Ago 2022", precio: 17.5 },
  { mes: "Sep 2022", precio: 17.8 },
  { mes: "Oct 2022", precio: 18.2 },
  { mes: "Nov 2022", precio: 19.1 },
  { mes: "Dic 2022", precio: 19.8 },
  { mes: "Ene 2023", precio: 19.5 },
  { mes: "Feb 2023", precio: 20.1 },
  { mes: "Mar 2023", precio: 20.8 },
  { mes: "Abr 2023", precio: 21.2 },
  { mes: "May 2023", precio: 20.5 },
  { mes: "Jun 2023", precio: 20.9 },
  { mes: "Jul 2023", precio: 21.5 },
  { mes: "Ago 2023", precio: 22.1 },
  { mes: "Sep 2023", precio: 22.8 },
  { mes: "Oct 2023", precio: 23.2 },
  { mes: "Nov 2023", precio: 22.5 },
  { mes: "Dic 2023", precio: 21.8 },
]

// Datos de estacionalidad (promedio por mes)
const estacionalidadMensual = [
  { mes: "Enero", promedio: 16.2, minimo: 12.8, maximo: 19.5 },
  { mes: "Febrero", promedio: 16.5, minimo: 13.1, maximo: 20.1 },
  { mes: "Marzo", promedio: 16.0, minimo: 11.2, maximo: 20.8 },
  { mes: "Abril", promedio: 16.2, minimo: 10.4, maximo: 21.2 },
  { mes: "Mayo", promedio: 16.0, minimo: 10.8, maximo: 20.5 },
  { mes: "Junio", promedio: 16.3, minimo: 11.5, maximo: 20.9 },
  { mes: "Julio", promedio: 16.4, minimo: 12.0, maximo: 21.5 },
  { mes: "Agosto", promedio: 16.6, minimo: 11.5, maximo: 22.1 },
  { mes: "Septiembre", promedio: 17.1, minimo: 11.8, maximo: 22.8 },
  { mes: "Octubre", promedio: 17.5, minimo: 12.4, maximo: 23.2 },
  { mes: "Noviembre", promedio: 17.7, minimo: 12.8, maximo: 22.5 },
  { mes: "Diciembre", promedio: 17.9, minimo: 13.2, maximo: 21.8 },
]

// Datos de proyección de precios
const proyeccionPrecios = [
  { mes: "Ene 2024", precio: 21.5, proyeccion: 21.5 },
  { mes: "Feb 2024", precio: 22.1, proyeccion: 22.1 },
  { mes: "Mar 2024", precio: 22.8, proyeccion: 22.8 },
  { mes: "Abr 2024", precio: null, proyeccion: 23.2 },
  { mes: "May 2024", precio: null, proyeccion: 23.5 },
  { mes: "Jun 2024", precio: null, proyeccion: 23.8 },
  { mes: "Jul 2024", precio: null, proyeccion: 24.1 },
  { mes: "Ago 2024", precio: null, proyeccion: 24.3 },
  { mes: "Sep 2024", precio: null, proyeccion: 24.5 },
  { mes: "Oct 2024", precio: null, proyeccion: 24.7 },
  { mes: "Nov 2024", precio: null, proyeccion: 24.9 },
  { mes: "Dic 2024", precio: null, proyeccion: 25.0 },
]

// Datos de volatilidad histórica
const volatilidad = [
  { año: "2019", volatilidad: 5.2 },
  { año: "2020", volatilidad: 12.8 },
  { año: "2021", volatilidad: 8.5 },
  { año: "2022", volatilidad: 6.7 },
  { año: "2023", volatilidad: 7.3 },
]

export function TendenciasEstacionalidad() {
  const [periodoHistorico, setPeriodoHistorico] = useState("5años")

  // Filtrar datos según el período seleccionado
  const filtrarDatosPorPeriodo = () => {
    switch (periodoHistorico) {
      case "1año":
        return preciosMensuales.slice(-12)
      case "2años":
        return preciosMensuales.slice(-24)
      case "3años":
        return preciosMensuales.slice(-36)
      default:
        return preciosMensuales
    }
  }

  const datosFiltrados = filtrarDatosPorPeriodo()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análisis de Tendencias y Estacionalidad</h2>
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
          <CardTitle>Análisis Temporal del Mercado de Azúcar</CardTitle>
          <CardDescription>Tendencias históricas, estacionalidad y proyecciones de precios</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tendencias" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
              <TabsTrigger value="estacionalidad">Estacionalidad</TabsTrigger>
              <TabsTrigger value="proyecciones">Proyecciones</TabsTrigger>
              <TabsTrigger value="volatilidad">Volatilidad</TabsTrigger>
            </TabsList>

            <TabsContent value="tendencias" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="text-lg font-medium">Tendencia Histórica de Precios</h3>
                </div>
                <Select value={periodoHistorico} onValueChange={setPeriodoHistorico}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1año">Último año</SelectItem>
                    <SelectItem value="2años">Últimos 2 años</SelectItem>
                    <SelectItem value="3años">Últimos 3 años</SelectItem>
                    <SelectItem value="5años">Últimos 5 años</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <ChartContainer
                      config={{
                        precio: {
                          label: "Precio (centavos/lb)",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={datosFiltrados}>
                          <defs>
                            <linearGradient id="colorPrecio" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-precio)" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="var(--color-precio)" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="precio"
                            stroke="var(--color-precio)"
                            fillOpacity={1}
                            fill="url(#colorPrecio)"
                            name="Precio (centavos/lb)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Tendencias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      El análisis de la tendencia histórica de los precios del azúcar muestra un patrón alcista
                      sostenido desde mediados de 2020, con un incremento acumulado de aproximadamente 120% en los
                      últimos tres años.
                    </p>
                    <p>Se pueden identificar tres fases principales en este período:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Fase de recuperación (2020):</strong> Tras la caída provocada por la pandemia, los
                        precios iniciaron una recuperación gradual desde mínimos de 10.4 centavos/libra.
                      </li>
                      <li>
                        <strong>Fase de crecimiento acelerado (2021):</strong> Impulsados por problemas de suministro en
                        Brasil y una fuerte demanda post-pandemia, los precios experimentaron un crecimiento sostenido
                        hasta alcanzar los 19.8 centavos/libra.
                      </li>
                      <li>
                        <strong>Fase de consolidación y nuevo impulso (2022-2023):</strong> Tras un período de
                        consolidación en la primera mitad de 2022, los precios retomaron su tendencia alcista, superando
                        los 23 centavos/libra a finales de 2023.
                      </li>
                    </ul>
                    <p>
                      Los factores fundamentales que han impulsado esta tendencia incluyen déficits globales de
                      producción, aumento de costos de insumos agrícolas, y la creciente demanda de etanol en Brasil que
                      reduce la disponibilidad de caña para producción de azúcar.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estacionalidad" className="space-y-4">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 mr-2 text-green-500" />
                <h3 className="text-lg font-medium">Patrones Estacionales de Precios</h3>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <ChartContainer
                      config={{
                        promedio: {
                          label: "Precio Promedio (centavos/lb)",
                          color: "hsl(var(--chart-2))",
                        },
                        minimo: {
                          label: "Precio Mínimo (centavos/lb)",
                          color: "hsl(var(--chart-3))",
                        },
                        maximo: {
                          label: "Precio Máximo (centavos/lb)",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={estacionalidadMensual}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="minimo"
                            stackId="1"
                            stroke="var(--color-minimo)"
                            fill="var(--color-minimo)"
                            fillOpacity={0.3}
                            name="Mínimo"
                          />
                          <Area
                            type="monotone"
                            dataKey="promedio"
                            stackId="2"
                            stroke="var(--color-promedio)"
                            fill="var(--color-promedio)"
                            fillOpacity={0.6}
                            name="Promedio"
                          />
                          <Area
                            type="monotone"
                            dataKey="maximo"
                            stackId="3"
                            stroke="var(--color-maximo)"
                            fill="var(--color-maximo)"
                            fillOpacity={0.3}
                            name="Máximo"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Estacionalidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      El análisis de estacionalidad revela patrones recurrentes en los precios del azúcar a lo largo del
                      año calendario, con tendencias identificables que pueden ayudar a anticipar movimientos de
                      mercado.
                    </p>
                    <p>Los principales patrones estacionales observados son:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Fortaleza en el último trimestre:</strong> Los meses de octubre a diciembre
                        históricamente muestran los precios más altos del año, con un promedio 9% superior al primer
                        semestre.
                      </li>
                      <li>
                        <strong>Debilidad en el segundo trimestre:</strong> Los meses de abril a junio suelen presentar
                        precios más bajos, coincidiendo con el inicio de la zafra en Brasil, el mayor productor mundial.
                      </li>
                      <li>
                        <strong>Transición en el tercer trimestre:</strong> Los meses de julio a septiembre generalmente
                        marcan una transición desde los niveles más bajos hacia la fortaleza de fin de año.
                      </li>
                    </ul>
                    <p>
                      Estos patrones están influenciados principalmente por los ciclos de producción en las principales
                      regiones productoras, especialmente Brasil (mayo-diciembre) e India (noviembre-abril), así como
                      por factores de demanda estacional en mercados clave.
                    </p>
                    <p>
                      Es importante notar que la variabilidad entre los precios máximos y mínimos tiende a ser mayor en
                      los meses de transición (marzo-abril y septiembre-octubre), lo que puede indicar oportunidades de
                      trading en estos períodos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proyecciones" className="space-y-4">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                <h3 className="text-lg font-medium">Proyección de Precios</h3>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <ChartContainer
                      config={{
                        precio: {
                          label: "Precio Real (centavos/lb)",
                          color: "hsl(var(--chart-1))",
                        },
                        proyeccion: {
                          label: "Precio Proyectado (centavos/lb)",
                          color: "hsl(var(--chart-5))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={proyeccionPrecios}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="precio"
                            stroke="var(--color-precio)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Precio Real"
                          />
                          <Line
                            type="monotone"
                            dataKey="proyeccion"
                            stroke="var(--color-proyeccion)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Proyección"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Proyecciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Las proyecciones de precios para 2024 indican una continuación de la tendencia alcista, aunque con
                      una moderación en el ritmo de crecimiento. Se espera que los precios alcancen los 25
                      centavos/libra hacia finales de año, lo que representaría un incremento de aproximadamente 15%
                      respecto a los niveles actuales.
                    </p>
                    <p>Esta proyección se basa en los siguientes factores fundamentales:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Balance global deficitario:</strong> Se anticipa un déficit en el balance mundial de
                        azúcar por cuarto año consecutivo, estimado en 2-3 millones de toneladas.
                      </li>
                      <li>
                        <strong>Reducción de inventarios:</strong> La relación inventarios/consumo se encuentra en
                        niveles históricamente bajos, lo que brinda soporte a los precios.
                      </li>
                      <li>
                        <strong>Factores climáticos:</strong> Las condiciones climáticas adversas en regiones
                        productoras clave, potencialmente exacerbadas por el fenómeno de La Niña en la segunda mitad del
                        año.
                      </li>
                      <li>
                        <strong>Demanda de biocombustibles:</strong> La creciente demanda de etanol en Brasil continuará
                        compitiendo con la producción de azúcar por el uso de la caña.
                      </li>
                    </ul>
                    <p>
                      Los principales riesgos para esta proyección incluyen una posible desaceleración económica global
                      que afecte la demanda, cambios en las políticas de exportación de India y Tailandia, y
                      fluctuaciones significativas en los precios del petróleo que impacten la demanda de etanol.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="volatilidad" className="space-y-4">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                <h3 className="text-lg font-medium">Análisis de Volatilidad</h3>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="h-[400px]">
                    <ChartContainer
                      config={{
                        volatilidad: {
                          label: "Volatilidad (%)",
                          color: "hsl(var(--chart-6))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={volatilidad}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="año" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="volatilidad" fill="var(--color-volatilidad)" name="Volatilidad (%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Volatilidad Histórica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      El análisis de volatilidad histórica muestra variaciones significativas en los últimos cinco años,
                      con un pico notable durante 2020 debido a la incertidumbre generada por la pandemia de COVID-19.
                    </p>
                    <p>Observaciones clave sobre la volatilidad del mercado:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Volatilidad pre-pandemia (2019):</strong> Relativamente baja (5.2%), caracterizada por
                        un mercado estable con movimientos predecibles.
                      </li>
                      <li>
                        <strong>Volatilidad pandémica (2020):</strong> Alcanzó un máximo de 12.8%, más del doble del año
                        anterior, reflejando la extrema incertidumbre en los mercados globales y las disrupciones en las
                        cadenas de suministro.
                      </li>
                      <li>
                        <strong>Normalización gradual (2021-2023):</strong> Disminución progresiva de la volatilidad,
                        aunque manteniéndose por encima de los niveles pre-pandemia, indicando un "nuevo normal" con
                        mayor incertidumbre estructural.
                      </li>
                    </ul>
                    <p>
                      La volatilidad actual (7.3% en 2023) sugiere un mercado que ha encontrado cierto equilibrio, pero
                      que sigue siendo más dinámico que antes de la pandemia. Esta volatilidad moderada ofrece
                      oportunidades para estrategias de trading activas, mientras que la tendencia alcista subyacente
                      favorece posiciones direccionales a mediano plazo.
                    </p>
                    <p>
                      Para 2024, se espera que la volatilidad se mantenga en niveles similares a 2023, con posibles
                      picos durante períodos de incertidumbre climática o eventos geopolíticos que afecten a los
                      principales países productores.
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
