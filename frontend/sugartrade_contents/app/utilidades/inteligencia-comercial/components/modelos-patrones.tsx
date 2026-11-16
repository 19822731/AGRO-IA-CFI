import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, CloudRain, TrendingUp, Sparkles } from "lucide-react"

// Componente para Patrones de Mercado
export function PatronesMercado() {
  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-[#00a8ff] mr-2" />
          <CardTitle className="text-white">Patrones de Mercado</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Identificación de tendencias y ciclos en el mercado azucarero
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] flex flex-col items-center justify-center bg-[#0a0f29] rounded-lg">
          <div className="text-center max-w-md">
            <div className="bg-[#00a8ff]/20 p-4 rounded-full inline-block mb-4">
              <TrendingUp className="h-12 w-12 text-[#00a8ff]" />
            </div>
            <h3 className="text-white text-lg font-medium mb-2">Análisis de Patrones de Mercado</h3>
            <p className="text-gray-400 mb-6">
              El sistema está analizando los patrones históricos del mercado para identificar tendencias y ciclos
              recurrentes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para Patrones Climáticos
export function PatronesClimaticos() {
  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <div className="flex items-center">
          <CloudRain className="h-5 w-5 text-[#00a8ff] mr-2" />
          <CardTitle className="text-white">Patrones Climáticos</CardTitle>
        </div>
        <CardDescription className="text-gray-400">Impacto del clima en la producción de azúcar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] flex flex-col items-center justify-center bg-[#0a0f29] rounded-lg">
          <div className="text-center max-w-md">
            <div className="bg-[#00a8ff]/20 p-4 rounded-full inline-block mb-4">
              <CloudRain className="h-12 w-12 text-[#00a8ff]" />
            </div>
            <h3 className="text-white text-lg font-medium mb-2">Análisis de Patrones Climáticos</h3>
            <p className="text-gray-400 mb-6">
              El sistema está analizando datos climáticos históricos y su correlación con la producción de azúcar.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para Análisis Avanzado
export function AnalisisAvanzado() {
  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-[#00a8ff] mr-2" />
          <CardTitle className="text-white">Análisis Avanzado</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Predicciones y análisis detallado del mercado azucarero
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="predicciones" className="w-full">
          <TabsList className="bg-[#0a0f29] border border-[#1a2040]">
            <TabsTrigger
              value="predicciones"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white"
            >
              Predicciones
            </TabsTrigger>
            <TabsTrigger value="tendencias" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white">
              Tendencias
            </TabsTrigger>
            <TabsTrigger
              value="recomendaciones"
              className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-white"
            >
              Recomendaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predicciones" className="mt-4">
            <div className="bg-[#0a0f29] rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-white text-lg font-medium mb-2">Predicciones de Mercado</h3>
                <p className="text-gray-400">
                  Basado en el análisis de datos históricos y patrones actuales, nuestro sistema de IA ha generado las
                  siguientes predicciones:
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-[#00a8ff] mr-2" />
                    <h4 className="text-white font-medium">Predicción de Precios</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    Se espera un aumento del 3.2% en los precios globales del azúcar en los próximos 30 días.
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Confianza: 87%</span>
                    <span className="text-[#00a8ff]">Actualizado: 17/03/2025</span>
                  </div>
                </div>

                <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-[#00a8ff] mr-2" />
                    <h4 className="text-white font-medium">Predicción de Producción</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    La producción global de azúcar se mantendrá estable con un ligero incremento del 1.5% para el
                    próximo trimestre.
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Confianza: 82%</span>
                    <span className="text-[#00a8ff]">Actualizado: 15/03/2025</span>
                  </div>
                </div>

                <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-[#00a8ff] mr-2" />
                    <h4 className="text-white font-medium">Predicción de Demanda</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    Se prevé un aumento en la demanda de azúcar del 2.8% en mercados emergentes durante el próximo
                    semestre.
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Confianza: 79%</span>
                    <span className="text-[#00a8ff]">Actualizado: 16/03/2025</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tendencias" className="mt-4">
            <div className="bg-[#0a0f29] rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-white text-lg font-medium mb-2">Tendencias Actuales</h3>
                <p className="text-gray-400">
                  Análisis de las tendencias más relevantes en el mercado azucarero global:
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    <h4 className="text-white font-medium">Tendencia Alcista en Asia</h4>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Los mercados asiáticos muestran una tendencia alcista sostenida en los últimos 3 meses, con un
                    incremento acumulado del 5.7%.
                  </p>
                </div>

                <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-red-500 mr-2 rotate-180" />
                    <h4 className="text-white font-medium">Tendencia Bajista en Europa</h4>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Los mercados europeos muestran una tendencia bajista en el último mes, con una caída del 2.3% debido
                    a cambios regulatorios.
                  </p>
                </div>

                <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-yellow-500 mr-2" />
                    <h4 className="text-white font-medium">Tendencia Lateral en América</h4>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Los mercados americanos muestran una tendencia lateral con fluctuaciones menores al 1% en los
                    últimos 2 meses.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recomendaciones" className="mt-4">
            <div className="bg-[#0a0f29] rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-white text-lg font-medium mb-2">Recomendaciones Estratégicas</h3>
                <p className="text-gray-400">
                  Basado en el análisis de datos y predicciones, nuestro sistema de IA recomienda:
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-[#00a8ff] mr-2" />
                    <h4 className="text-white font-medium">Posicionamiento de Mercado</h4>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Se recomienda mantener posiciones en contratos de azúcar para el próximo trimestre, con especial
                    atención a los mercados asiáticos.
                  </p>
                </div>

                <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-[#00a8ff] mr-2" />
                    <h4 className="text-white font-medium">Estrategia de Compra</h4>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Considerar aumentar las compras en un 5-10% aprovechando la estabilidad actual de precios antes del
                    incremento previsto.
                  </p>
                </div>

                <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-[#00a8ff] mr-2" />
                    <h4 className="text-white font-medium">Diversificación</h4>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Diversificar proveedores con mayor énfasis en productores de Asia y América Latina para mitigar
                    riesgos de suministro.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Componente para Visualización de Mercado
export function VisualizacionMercado() {
  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <div className="flex items-center">
          <PieChart className="h-5 w-5 text-[#00a8ff] mr-2" />
          <CardTitle className="text-white">Visualización de Mercado</CardTitle>
        </div>
        <CardDescription className="text-gray-400">Gráficos interactivos y dashboards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] flex flex-col items-center justify-center bg-[#0a0f29] rounded-lg">
          <div className="text-center max-w-md">
            <div className="bg-[#00a8ff]/20 p-4 rounded-full inline-block mb-4">
              <PieChart className="h-12 w-12 text-[#00a8ff]" />
            </div>
            <h3 className="text-white text-lg font-medium mb-2">Visualización de Datos</h3>
            <p className="text-gray-400 mb-6">
              Explore los datos del mercado azucarero a través de visualizaciones interactivas y dashboards
              personalizables.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
