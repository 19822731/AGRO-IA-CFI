import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CotizacionForm from "./components/cotizacion-form"
import ListaCotizaciones from "./components/lista-cotizaciones"
import { MisSeguros } from "./components/mis-seguros"

export default function SegurosPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Seguro Agropecuario</h1>
        <p className="text-muted-foreground mt-2">
          Proteja su inversión agrícola con nuestras opciones de seguros especializados
        </p>
      </div>

      <Tabs defaultValue="cotizar" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="cotizar">Cotizar Seguro</TabsTrigger>
          <TabsTrigger value="mis-seguros">Mis Seguros</TabsTrigger>
        </TabsList>

        <TabsContent value="cotizar" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <CotizacionForm />
            </div>
            <div className="md:col-span-2">
              <ListaCotizaciones />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mis-seguros">
          <MisSeguros />
        </TabsContent>
      </Tabs>
    </div>
  )
}
