import FormularioIngresoPrecio from "./components/formulario-ingreso-precio"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PreciosAzucarPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Precios del Azúcar</h1>

      <Tabs defaultValue="ingreso" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ingreso">Ingresar Precios</TabsTrigger>
          <TabsTrigger value="historial">Historial de Precios</TabsTrigger>
        </TabsList>

        <TabsContent value="ingreso" className="mt-6">
          <FormularioIngresoPrecio />
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Precios</CardTitle>
              <CardDescription>Visualización de los precios históricos del azúcar</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La visualización del historial de precios se implementará en una fase posterior.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
