import { EstadisticasCard } from "./components/estadisticas-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

// Datos de ejemplo para las estadísticas
const estadisticasAlmacenaje = [
  {
    label: "Total Almacenado",
    value: 25000,
    color: "#4f46e5",
  },
  {
    label: "Capacidad Utilizada",
    value: 75,
    color: "#10b981",
  },
  {
    label: "Costo Promedio",
    value: 120,
    color: "#f59e0b",
  },
]

const estadisticasMovimientos = [
  {
    label: "Entradas",
    value: 12500,
    color: "#4f46e5",
  },
  {
    label: "Salidas",
    value: 8750,
    color: "#ef4444",
  },
  {
    label: "Rotación",
    value: 35,
    color: "#8b5cf6",
  },
]

const almacenes = [
  {
    id: "alm-001",
    nombre: "Almacén Central Veracruz",
    ubicacion: "Veracruz, México",
    capacidad: 50000,
    ocupacion: 35000,
    tipo: "Propio",
  },
  {
    id: "alm-002",
    nombre: "Bodega Norte",
    ubicacion: "Monterrey, México",
    capacidad: 30000,
    ocupacion: 15000,
    tipo: "Rentado",
  },
  {
    id: "alm-003",
    nombre: "Almacén Sur",
    ubicacion: "Mérida, México",
    capacidad: 25000,
    ocupacion: 20000,
    tipo: "Propio",
  },
]

export default function AlmacenajePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Almacenaje</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Almacenaje
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <EstadisticasCard title="Estadísticas de Almacenaje" data={estadisticasAlmacenaje} tipo="porcentaje" />
        <EstadisticasCard title="Estadísticas de Movimientos" data={estadisticasMovimientos} tipo="moneda" />
      </div>

      <Tabs defaultValue="almacenes" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="almacenes">Almacenes</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="almacenes" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {almacenes && almacenes.length > 0 ? (
              almacenes.map((almacen) => (
                <Card key={almacen.id} className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{almacen.nombre}</CardTitle>
                    <CardDescription>{almacen.ubicacion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Capacidad:</span>
                        <span>{almacen.capacidad.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ocupación:</span>
                        <span>{almacen.ocupacion.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <span>{almacen.tipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">% Utilizado:</span>
                        <span>{Math.round((almacen.ocupacion / almacen.capacidad) * 100)}%</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${Math.round((almacen.ocupacion / almacen.capacidad) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No hay almacenes disponibles</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="movimientos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Movimientos Recientes</CardTitle>
              <CardDescription>Historial de entradas y salidas de producto</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido de movimientos pendiente de implementar</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reportes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Almacenaje</CardTitle>
              <CardDescription>Generación de reportes y análisis</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido de reportes pendiente de implementar</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
