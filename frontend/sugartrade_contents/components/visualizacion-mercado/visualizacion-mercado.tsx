import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProduccionConsumo } from "./produccion-consumo"
import { DistribucionGlobal } from "./distribucion-global"
import { Correlaciones } from "./correlaciones"
import { TendenciasEstacionalidad } from "./tendencias-estacionalidad"

export function VisualizacionMercado() {
  return (
    <Tabs defaultValue="precios" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="precios">Precios</TabsTrigger>
        <TabsTrigger value="produccion-consumo">Producción y Consumo</TabsTrigger>
        <TabsTrigger value="distribucion-global">Distribución Global</TabsTrigger>
        <TabsTrigger value="correlaciones">Correlaciones</TabsTrigger>
        <TabsTrigger value="tendencias-estacionalidad">Tendencias</TabsTrigger>
      </TabsList>
      <TabsContent value="precios" className="mt-6">
        <p>Contenido de la pestaña Precios.</p>
      </TabsContent>
      <TabsContent value="produccion-consumo" className="mt-6">
        <ProduccionConsumo />
      </TabsContent>
      <TabsContent value="distribucion-global" className="mt-6">
        <DistribucionGlobal />
      </TabsContent>
      <TabsContent value="correlaciones" className="mt-6">
        <Correlaciones />
      </TabsContent>
      <TabsContent value="tendencias-estacionalidad" className="mt-6">
        <TendenciasEstacionalidad />
      </TabsContent>
    </Tabs>
  )
}
