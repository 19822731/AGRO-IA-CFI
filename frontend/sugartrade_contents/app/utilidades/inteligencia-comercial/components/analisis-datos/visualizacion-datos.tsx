"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useCsvData } from "@/hooks/use-csv-data"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function VisualizacionDatos() {
  const { isLoading, error, data, locations, dataTypes, getTimeSeriesData } = useCsvData()
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedSubtype, setSelectedSubtype] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [activeTab, setActiveTab] = useState("series-tiempo")

  const subtypes = useMemo(() => {
    if (!selectedType) return []

    const subtypeSet = new Set<string>()
    data
      .filter((entry) => entry.tipoDato === selectedType)
      .forEach((entry) => {
        if (entry.subtipoDato) subtypeSet.add(entry.subtipoDato)
      })

    return Array.from(subtypeSet)
  }, [selectedType, data])

  const timeSeriesData = useMemo(() => {
    if (!selectedType || !selectedSubtype) return []

    return getTimeSeriesData(selectedType, selectedSubtype, selectedLocation).map((item) => ({
      ...item,
      formattedDate: format(item.date, "MMM yyyy", { locale: es }),
    }))
  }, [selectedType, selectedSubtype, selectedLocation, getTimeSeriesData])

  const productionByCountry = useMemo(() => {
    if (!data.length) return []

    const productionData = data.filter(
      (entry) =>
        entry.tipoDato === "Producción" &&
        entry.valorNumerico !== undefined &&
        entry.ubicacion &&
        entry.ubicacion !== "Global",
    )

    // Agrupar por ubicación y obtener el valor más reciente
    const locationMap = new Map<string, { value: number; date: Date | null }>()

    productionData.forEach((entry) => {
      const currentValue = locationMap.get(entry.ubicacion)
      const entryDate = entry.fechaObj

      if (!currentValue || (entryDate && (!currentValue.date || entryDate > currentValue.date))) {
        locationMap.set(entry.ubicacion, {
          value: entry.valorNumerico!,
          date: entryDate || null,
        })
      }
    })

    // Convertir a array y ordenar por valor
    return Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        value: data.value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10
  }, [data])

  const priceComparison = useMemo(() => {
    if (!data.length) return []

    // Filtrar datos de precios
    const priceData = data.filter(
      (entry) => entry.tipoDato === "Precio" && entry.valorNumerico !== undefined && entry.fechaObj !== undefined,
    )

    // Agrupar por subtipo y obtener el valor más reciente
    const subtypeMap = new Map<string, { value: number; date: Date; unit: string }>()

    priceData.forEach((entry) => {
      if (!entry.fechaObj) return

      const currentValue = subtypeMap.get(entry.subtipoDato)

      if (!currentValue || entry.fechaObj > currentValue.date) {
        subtypeMap.set(entry.subtipoDato, {
          value: entry.valorNumerico!,
          date: entry.fechaObj,
          unit: entry.unidad,
        })
      }
    })

    // Convertir a array
    return Array.from(subtypeMap.entries())
      .map(([subtype, data]) => ({
        subtype,
        value: data.value,
        unit: data.unit,
      }))
      .sort((a, b) => a.subtype.localeCompare(b.subtype))
  }, [data])

  if (isLoading) {
    return <div>Cargando datos...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!data.length) {
    return <div>No hay datos disponibles. Por favor cargue un archivo CSV.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualización de Datos</CardTitle>
        <CardDescription>Explore y analice los datos históricos cargados</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="series-tiempo">Series de Tiempo</TabsTrigger>
            <TabsTrigger value="produccion">Producción por País</TabsTrigger>
            <TabsTrigger value="precios">Comparativa de Precios</TabsTrigger>
          </TabsList>

          <TabsContent value="series-tiempo" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="dataType">Tipo de Dato</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="dataType">
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subtype">Subtipo</Label>
                <Select
                  value={selectedSubtype}
                  onValueChange={setSelectedSubtype}
                  disabled={!selectedType || subtypes.length === 0}
                >
                  <SelectTrigger id="subtype">
                    <SelectValue placeholder="Seleccione subtipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtypes.map((subtype) => (
                      <SelectItem key={subtype} value={subtype}>
                        {subtype}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Todas las ubicaciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedType && selectedSubtype && timeSeriesData.length > 0 ? (
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    value: {
                      label: `${selectedSubtype}`,
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="formattedDate" tickFormatter={(value) => value} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-value)"
                        name={selectedSubtype}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center border border-dashed rounded-md p-4">
                <p className="text-muted-foreground">
                  Seleccione tipo y subtipo de dato para visualizar la serie temporal
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="produccion">
            <div className="h-[500px]">
              <ChartContainer
                config={{
                  value: {
                    label: "Producción",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productionByCountry} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="location" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="value" name="Millones de toneladas" fill="var(--color-value)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="precios">
            <div className="h-[500px]">
              <ChartContainer
                config={{
                  value: {
                    label: "Precio",
                    color: "hsl(var(--chart-3))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subtype" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background border rounded-md shadow-sm p-2">
                              <p className="font-medium">{data.subtype}</p>
                              <p>{`${data.value} ${data.unit}`}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Precio" fill="var(--color-value)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
