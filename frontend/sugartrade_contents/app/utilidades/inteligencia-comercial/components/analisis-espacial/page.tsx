import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapaCaniaAzucar } from "./mapa-cana-azucar"
import { MapaActividadesAzucareras } from "./mapa-actividades-azucareras"
import { AnalisisIntegrado } from "./analisis-integrado"

export default function AnalisisEspacial() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Análisis Espacial</h1>
      <p className="text-muted-foreground">
        Visualización y análisis de datos geoespaciales relacionados con la producción de azúcar
      </p>

      <Tabs defaultValue="actividades" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="actividades">Actividades Azucareras</TabsTrigger>
          <TabsTrigger value="cania">Caña de Azúcar</TabsTrigger>
          <TabsTrigger value="integrado">Análisis Integrado</TabsTrigger>
        </TabsList>

        <TabsContent value="actividades" className="pt-6">
          <MapaActividadesAzucareras />
        </TabsContent>

        <TabsContent value="cania" className="pt-6">
          <MapaCaniaAzucar />
        </TabsContent>

        <TabsContent value="integrado" className="pt-6">
          <AnalisisIntegrado />
        </TabsContent>
      </Tabs>
    </div>
  )
}
