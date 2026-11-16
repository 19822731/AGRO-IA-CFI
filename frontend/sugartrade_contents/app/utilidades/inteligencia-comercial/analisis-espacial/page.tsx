"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"

// Importación dinámica del componente de mapa para evitar errores de SSR
const MapaAreasRiego = dynamic(() => import("../components/analisis-espacial/mapa-areas-riego"), { ssr: false })

// Datos de ejemplo para áreas de riego
const areasRiegoData = {
  features: [
    {
      properties: {
        id: 1,
        nombre: "Área de Riego 1",
        tipo: "Canal",
        estado: "Activo",
        superficie: 1200,
        canal: "Canal Principal Norte",
      },
      geometry: {
        coordinates: [[-65.2, -26.8]],
      },
    },
    {
      properties: {
        id: 2,
        nombre: "Área de Riego 2",
        tipo: "Pozo",
        estado: "Inactivo",
        superficie: 850,
        canal: "Canal Secundario Este",
      },
      geometry: {
        coordinates: [[-65.3, -26.9]],
      },
    },
    {
      properties: {
        id: 3,
        nombre: "Área de Riego 3",
        tipo: "Canal",
        estado: "Activo",
        superficie: 1500,
        canal: "Canal Principal Sur",
      },
      geometry: {
        coordinates: [[-65.1, -26.7]],
      },
    },
  ],
}

export default function AnalisisEspacialPage() {
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")

  // Aplicar filtros a los datos con verificación de seguridad
  const areasFiltradas = useMemo(() => {
    if (!areasRiegoData || !areasRiegoData.features) {
      return []
    }

    return areasRiegoData.features.filter((area) => {
      const props = area.properties || {}

      // Verificar que las propiedades existan antes de usarlas
      const cumpleTipo = filtroTipo === "todos" || (props.tipo && props.tipo === filtroTipo)
      const cumpleEstado = filtroEstado === "todos" || (props.estado && props.estado === filtroEstado)

      return cumpleTipo && cumpleEstado
    })
  }, [filtroTipo, filtroEstado])

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Análisis Espacial</h1>

      <Tabs defaultValue="mapa" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="mapa">Mapa de Áreas de Riego</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="mapa" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Filtrar por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Canal">Canal</SelectItem>
                    <SelectItem value="Pozo">Pozo</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Filtrar por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Áreas Mostradas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{areasFiltradas.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="w-full h-[600px]">
            <CardContent className="p-0 h-full">
              <MapaAreasRiego areas={areasFiltradas} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Áreas de Riego</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Distribución por Tipo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Canal</p>
                          <p className="text-2xl font-bold">
                            {areasRiegoData?.features?.filter((a) => a.properties?.tipo === "Canal").length || 0}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Pozo</p>
                          <p className="text-2xl font-bold">
                            {areasRiegoData?.features?.filter((a) => a.properties?.tipo === "Pozo").length || 0}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Distribución por Estado</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Activo</p>
                          <p className="text-2xl font-bold">
                            {areasRiegoData?.features?.filter((a) => a.properties?.estado === "Activo").length || 0}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Inactivo</p>
                          <p className="text-2xl font-bold">
                            {areasRiegoData?.features?.filter((a) => a.properties?.estado === "Inactivo").length || 0}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
