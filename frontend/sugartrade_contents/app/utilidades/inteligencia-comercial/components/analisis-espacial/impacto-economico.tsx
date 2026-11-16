"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTucumanSugarMap } from "@/hooks/use-tucuman-sugar-map"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function ImpactoEconomico() {
  const { availableYears } = useTucumanSugarMap()
  const [activeTab, setActiveTab] = useState("produccion")
  const [selectedYear, setSelectedYear] = useState<string>("2022")

  // Colores para los gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Datos simulados de producción y valor
  const produccionData = availableYears.map((year) => {
    // Factor base que varía según el año
    const baseFactor =
      {
        "2018": 0.9,
        "2019": 0.93,
        "2020": 0.95,
        "2021": 0.98,
        "2022": 1.0,
      }[year] || 1.0

    // Precio base que varía según el año (USD/ton)
    const basePrice =
      {
        "2018": 320,
        "2019": 310,
        "2020": 350,
        "2021": 420,
        "2022": 450,
      }[year] || 400

    const produccion = Math.round(1.5 * baseFactor * 1000000) / 1000000 // en millones de toneladas
    const precio = basePrice // USD/ton
    const valor = Math.round(produccion * precio * 1000000) // en USD

    return {
      year: year,
      produccion: produccion,
      precio: precio,
      valor: valor,
    }
  })

  // Datos simulados de distribución de mercado
  const mercadoData = [
    { name: "Mercado Interno", value: 65 },
    { name: "Exportación", value: 35 },
  ]

  // Datos simulados de impacto en la economía provincial
  const impactoData = [
    { categoria: "Empleo Directo", valor: 40000 },
    { categoria: "Empleo Indirecto", valor: 100000 },
    { categoria: "Participación en PBG", valor: 15 }, // % del Producto Bruto Geográfico
    { categoria: "Exportaciones", valor: 180 }, // en millones de USD
    { categoria: "Inversión Anual", valor: 50 }, // en millones de USD
  ]

  // Datos simulados de cadena de valor
  const cadenaValorData = [
    { segmento: "Producción Primaria", valor: 35 },
    { segmento: "Industrialización", valor: 25 },
    { segmento: "Logística", valor: 15 },
    { segmento: "Comercialización", valor: 20 },
    { segmento: "Servicios Asociados", valor: 5 },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Impacto Económico del Sector Azucarero</CardTitle>
        <CardDescription>
          Análisis del valor económico y social de la producción de caña de azúcar en Tucumán
        </CardDescription>
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
            <TabsTrigger value="produccion">Producción y Valor</TabsTrigger>
            <TabsTrigger value="impacto">Impacto Socioeconómico</TabsTrigger>
            <TabsTrigger value="cadena">Cadena de Valor</TabsTrigger>
          </TabsList>

          <TabsContent value="produccion" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Producción y Valor Económico</CardTitle>
                <CardDescription>Evolución de la producción de azúcar y su valor económico (2018-2022)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      produccion: {
                        label: "Producción (millones ton)",
                        color: "hsl(var(--chart-1))",
                      },
                      precio: {
                        label: "Precio (USD/ton)",
                        color: "hsl(var(--chart-2))",
                      },
                      valor: {
                        label: "Valor (millones USD)",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={produccionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="produccion"
                          name="Producción (millones ton)"
                          stroke="var(--color-produccion)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="precio"
                          name="Precio (USD/ton)"
                          stroke="var(--color-precio)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="valor"
                          name="Valor (millones USD)"
                          stroke="var(--color-valor)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Análisis de Producción y Valor</h3>
                  <p className="text-sm text-muted-foreground">
                    La producción de azúcar en Tucumán ha mostrado una tendencia creciente en los últimos años,
                    acompañada por un incremento en los precios internacionales, lo que ha resultado en un aumento
                    significativo del valor económico del sector.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Producción Anual</h4>
                      <p className="text-sm">
                        La producción de azúcar en Tucumán alcanzó aproximadamente{" "}
                        {produccionData.find((d) => d.year === selectedYear)?.produccion} millones de toneladas en{" "}
                        {selectedYear}, representando cerca del 65% de la producción nacional. Este volumen posiciona a
                        Argentina como el 8º productor mundial de azúcar.
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Valor Económico</h4>
                      <p className="text-sm">
                        Con un precio promedio de USD {produccionData.find((d) => d.year === selectedYear)?.precio} por
                        tonelada en {selectedYear}, el valor total de la producción azucarera de Tucumán ascendió a
                        aproximadamente USD{" "}
                        {(produccionData.find((d) => d.year === selectedYear)?.valor || 0) / 1000000} millones,
                        constituyendo uno de los principales sectores económicos de la provincia.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="h-[250px]">
                      <h4 className="font-medium mb-2">Distribución de Mercado</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mercadoData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {mercadoData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Mercados</h4>
                      <p className="text-sm">
                        Aproximadamente el 65% de la producción se destina al mercado interno, mientras que el 35%
                        restante se exporta, principalmente a países del Mercosur, Estados Unidos y otros mercados
                        internacionales. Las exportaciones de azúcar representan una importante fuente de divisas para
                        la economía provincial y nacional.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impacto" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Impacto Socioeconómico</CardTitle>
                <CardDescription>Contribución del sector azucarero a la economía y sociedad de Tucumán</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      valor: {
                        label: "Valor",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={impactoData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="categoria" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="valor" name="Valor" fill="var(--color-valor)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Análisis de Impacto Socioeconómico</h3>
                  <p className="text-sm text-muted-foreground">
                    El sector azucarero tiene un profundo impacto en la estructura socioeconómica de Tucumán, siendo uno
                    de los principales motores de la economía provincial y un importante generador de empleo y
                    desarrollo regional.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Empleo</h4>
                      <p className="text-sm">
                        La cadena agroindustrial del azúcar genera aproximadamente 40,000 empleos directos y 100,000
                        indirectos en Tucumán, representando cerca del 30% del empleo formal de la provincia. Este
                        sector es particularmente importante para las economías locales de los departamentos
                        productores.
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Contribución al PBG</h4>
                      <p className="text-sm">
                        El sector azucarero contribuye con aproximadamente el 15% al Producto Bruto Geográfico (PBG) de
                        Tucumán, siendo uno de los pilares fundamentales de la economía provincial junto con el sector
                        citrícola y la agroindustria en general.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Desarrollo Regional</h4>
                      <p className="text-sm">
                        La actividad azucarera ha sido históricamente el eje del desarrollo económico y social de
                        Tucumán, generando infraestructura, servicios y un ecosistema empresarial que sostiene a
                        numerosas comunidades en toda la provincia.
                      </p>
                    </div>

                    <div className="p-3 border rounded-md">
                      <h4 className="font-medium">Inversión y Modernización</h4>
                      <p className="text-sm">
                        En los últimos años, el sector ha invertido aproximadamente USD 50 millones anuales en
                        modernización tecnológica, tanto en el campo como en los ingenios, mejorando la eficiencia
                        productiva y la sostenibilidad ambiental.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cadena" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cadena de Valor</CardTitle>
                <CardDescription>
                  Distribución del valor económico a lo largo de la cadena agroindustrial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cadenaValorData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {cadenaValorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Análisis de la Cadena de Valor</h3>
                  <p className="text-sm text-muted-foreground">
                    La cadena de valor del azúcar en Tucumán involucra múltiples actores y etapas, desde la producción
                    primaria hasta la comercialización final, generando valor agregado en cada eslabón.
                  </p>

                  <div className="space-y-2">
                    {cadenaValorData.map((item, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <h4 className="font-medium">{item.segmento}</h4>
                        <p className="text-sm">
                          <span className="font-semibold">Participación: {item.valor}% del valor total</span>
                          <span className="block mt-1">
                            {item.segmento === "Producción Primaria" &&
                              "Incluye la preparación del suelo, plantación, manejo del cultivo, cosecha y transporte de la caña a los ingenios. Involucra a productores cañeros independientes y empresas agrícolas integradas."}
                            {item.segmento === "Industrialización" &&
                              "Comprende el procesamiento industrial de la caña para obtener azúcar y subproductos como melaza, bagazo y alcohol. Es realizado por los ingenios azucareros."}
                            {item.segmento === "Logística" &&
                              "Incluye el transporte, almacenamiento y distribución del azúcar desde los ingenios hasta los centros de consumo o exportación."}
                            {item.segmento === "Comercialización" &&
                              "Abarca la venta mayorista y minorista del azúcar en el mercado interno, así como la exportación a mercados internacionales."}
                            {item.segmento === "Servicios Asociados" &&
                              "Incluye servicios técnicos, financieros, de investigación y desarrollo, y otros servicios de apoyo a la cadena productiva."}
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
