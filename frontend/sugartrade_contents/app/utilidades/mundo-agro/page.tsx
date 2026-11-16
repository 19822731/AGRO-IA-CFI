import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClimaTab } from "./components/clima-tab"

export default function MundoAgroPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Mundo Agro</h1>

      <Tabs defaultValue="clima">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clima">Clima</TabsTrigger>
          <TabsTrigger value="mercados">Mercados</TabsTrigger>
          <TabsTrigger value="noticias">Noticias</TabsTrigger>
          <TabsTrigger value="herramientas">Herramientas</TabsTrigger>
        </TabsList>
        <TabsContent value="clima">
          <ClimaTab />
        </TabsContent>
        <TabsContent value="mercados">
          <div>Contenido de Mercados</div>
        </TabsContent>
        <TabsContent value="noticias">
          <div>Contenido de Noticias</div>
        </TabsContent>
        <TabsContent value="herramientas">
          <div>Contenido de Herramientas</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
