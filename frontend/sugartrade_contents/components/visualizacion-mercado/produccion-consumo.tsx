"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Download, Info } from "lucide-react"
import {
  useDatosProduccionPorPeriodo,
  useDatosProduccionPorDepartamento,
  useProgresoMensual,
} from "@/hooks/use-sugar-data"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function ProduccionConsumo() {
  const [activeView, setActiveView] = useState("periodos")

  const { datos: datosPeriodos, cargando: cargandoPeriodos } = useDatosProduccionPorPeriodo()

  const { datos: datosDepartamentos, cargando: cargandoDepartamentos } = useDatosProduccionPorDepartamento()

  const { datos: datosProgreso, cargando: cargandoProgreso } = useProgresoMensual()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Producción y Consumo de Caña de Azúcar</h2>
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
          <CardTitle>Dinámica de la Cosecha de Caña de Azúcar en Tucumán (Zafra 2023)</CardTitle>
          <CardDescription>
            Fuente: Reporte Agroindustrial - EEAOC (Estación Experimental Agroindustrial Obispo Colombres)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="periodos" className="w-full" onValueChange={setActiveView}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="periodos">Períodos de Cosecha</TabsTrigger>
              <TabsTrigger value="departamentos">Por Departamentos</TabsTrigger>
              <TabsTrigger value="progreso">Progreso Mensual</TabsTrigger>
              <TabsTrigger value="distribucion">Distribución</TabsTrigger>
            </TabsList>

            <TabsContent value="periodos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Porcentaje de Cosecha por Período</CardTitle>
                    <CardDescription>Distribución porcentual de la cosecha en los diferentes períodos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cargandoPeriodos ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[250px] w-full" />
                      </div>
                    ) : (
                      <div className="h-[300px]">
                        <ChartContainer
                          config={{
                            porcentaje: {
                              label: "Porcentaje",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datosPeriodos}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="region" />
                              <YAxis label={{ value: "Porcentaje (%)", angle: -90, position: "insideLeft" }} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Legend />
                              <Bar dataKey="porcentaje" fill="var(--color-porcentaje)" name="Porcentaje" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de la Cosecha</CardTitle>
                    <CardDescription>Proporción de hectáreas cosechadas en cada período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cargandoPeriodos ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[250px] w-full rounded-full" />
                      </div>
                    ) : (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={datosPeriodos}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, porcentaje }) => `${name}: ${porcentaje}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="porcentaje"
                              nameKey="region"
                            >
                              {datosPeriodos.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, "Porcentaje"]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Información del Período de Cosecha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      La época en que se realiza la cosecha de caña de azúcar influye en el crecimiento, en la
                      producción del cañaveral y en la producción de azúcar del año siguiente. En Tucumán se distinguen
                      cuatro etapas durante la zafra:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Inicial:</strong> Mayo y junio (25% de la cosecha)
                      </li>
                      <li>
                        <strong>Intermedia:</strong> Julio a mediados de septiembre (47% de la cosecha)
                      </li>
                      <li>
                        <strong>Final:</strong> Mediados de septiembre a mediados de octubre (19% de la cosecha)
                      </li>
                      <li>
                        <strong>Tardía:</strong> Desde mediados de octubre en adelante (9% de la cosecha)
                      </li>
                    </ul>
                    <p>
                      Se destaca la presencia de lotes cosechados en el período tardío, aspecto negativo teniendo en
                      cuenta que dicha época de cosecha implica disminuciones en la producción de caña y azúcar en el
                      año siguiente.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="departamentos">
              <Card>
                <CardHeader>
                  <CardTitle>Cosecha por Departamentos y Períodos</CardTitle>
                  <CardDescription>
                    Hectáreas cosechadas en cada departamento según el período de cosecha
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cargandoDepartamentos ? (
                    <div className="h-[500px] flex items-center justify-center">
                      <Skeleton className="h-[450px] w-full" />
                    </div>
                  ) : (
                    <div className="h-[500px]">
                      <ChartContainer
                        config={{
                          inicial: {
                            label: "Inicial",
                            color: "#0088FE",
                          },
                          intermedio: {
                            label: "Intermedio",
                            color: "#00C49F",
                          },
                          final: {
                            label: "Final",
                            color: "#FFBB28",
                          },
                          tardio: {
                            label: "Tardío",
                            color: "#FF8042",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={datosDepartamentos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis label={{ value: "Hectáreas", angle: -90, position: "insideLeft" }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="inicial" stackId="a" fill="var(--color-inicial)" name="Inicial" />
                            <Bar dataKey="intermedio" stackId="a" fill="var(--color-intermedio)" name="Intermedio" />
                            <Bar dataKey="final" stackId="a" fill="var(--color-final)" name="Final" />
                            <Bar dataKey="tardio" stackId="a" fill="var(--color-tardio)" name="Tardío" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis por Departamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        En la parte inicial de la zafra la recolección se concentró principalmente en los sectores
                        oriental y sur del área cañera, mayormente en los cañaverales localizados en los departamentos
                        Leales, Cruz Alta, Simoca, Burruyacu, La Cocha y Graneros.
                      </p>
                      <p>
                        En el período intermedio, la disposición de los lotes cosechados mostró una distribución
                        homogénea en toda el área con cañaverales.
                      </p>
                      <p>
                        En el período final, la cosecha se focalizó en los departamentos Cruz Alta, Burruyacu, Simoca,
                        sector oeste de Leales y en los departamentos ubicados en la parte occidental del área cañera.
                      </p>
                      <p>
                        Finalmente en el período tardío, se verificó que la cosecha se centralizó mayormente en los
                        sectores occidentales de los departamentos Cruz Alta, Leales y Burruyacu, en el departamento
                        Simoca y en sectores pedemontanos de los departamentos ubicados en la parte occidental del área
                        cañera, entre ellos Monteros, Chicligasta y Famailla.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progreso">
              <Card>
                <CardHeader>
                  <CardTitle>Progreso Mensual de la Cosecha</CardTitle>
                  <CardDescription>Porcentaje de cosecha realizada en cada mes durante la zafra 2023</CardDescription>
                </CardHeader>
                <CardContent>
                  {cargandoProgreso ? (
                    <div className="h-[400px] flex items-center justify-center">
                      <Skeleton className="h-[350px] w-full" />
                    </div>
                  ) : (
                    <div className="h-[400px]">
                      <ChartContainer
                        config={{
                          porcentaje: {
                            label: "Porcentaje",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={datosProgreso}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis label={{ value: "Porcentaje (%)", angle: -90, position: "insideLeft" }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="porcentaje" fill="var(--color-porcentaje)" name="Porcentaje" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Desarrollo de la Zafra 2023</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        La zafra cañera 2023 comenzó el 08 de mayo, pero recién se generalizó hacia el fin de la primera
                        quincena de junio. El comienzo tardío se debió, principalmente, a la falta de maduración del
                        cultivo, lo que provocó muy bajos rendimientos iniciales.
                      </p>
                      <p>
                        Durante el mes de julio se produjeron paradas en algunos ingenios a raíz de la falta de piso
                        para la recolección, provocadas por lluvias con milimetrajes inusuales para la fecha.
                      </p>
                      <p>
                        Las condiciones ambientales entre agosto y mediados de octubre fueron en general benignas para
                        el desarrollo de la zafra. En la tercera década de octubre, la ocurrencia de intensas lluvias
                        determinó nuevamente paradas en varias fábricas azucareras.
                      </p>
                      <p>
                        La zafra finalizó el 21 de noviembre, cosechándose prácticamente la totalidad de la superficie
                        cosechable con caña de azúcar estimada para la zafra 2023, valor que alcanzó las 278.410 ha.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="distribucion">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución Geográfica de la Cosecha</CardTitle>
                  <CardDescription>
                    Representación de la distribución espacial de los períodos de cosecha
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-2xl h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="text-lg font-medium mb-2">Mapa de Distribución</p>
                        <p className="text-sm text-gray-500">
                          El mapa muestra la distribución espacial del avance de cosecha según períodos en la zafra
                          cañera 2023 en Tucumán.
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                            <span>Período Inicial</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                            <span>Período Intermedio</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                            <span>Período Final</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                            <span>Período Tardío</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Características de la Distribución</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Período Inicial:</strong> Concentración en los sectores oriental y sur del área cañera
                        (Leales, Cruz Alta, Simoca, Burruyacu, La Cocha y Graneros).
                      </li>
                      <li>
                        <strong>Período Intermedio:</strong> Distribución homogénea en toda el área con cañaverales.
                      </li>
                      <li>
                        <strong>Período Final:</strong> Focalización en Cruz Alta, Burruyacu, Simoca, sector oeste de
                        Leales y departamentos de la parte occidental.
                      </li>
                      <li>
                        <strong>Período Tardío:</strong> Centralización en sectores occidentales de Cruz Alta, Leales y
                        Burruyacu, en Simoca y sectores pedemontanos de Monteros, Chicligasta y Famailla.
                      </li>
                    </ul>
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
