"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HARVEST_DATA_2016 } from "@/lib/services/historical-harvest-service"
import { Bot, Send, Loader2 } from "lucide-react"

// Simulación de respuestas de IA para consultas sobre datos históricos
const AI_RESPONSES: Record<string, string> = {
  rendimiento: `
    # Análisis de Rendimiento - Zafra 2016
    
    El rendimiento promedio de la caña de azúcar en Tucumán durante la zafra 2016 fue de **${HARVEST_DATA_2016.averageYield.toFixed(1)} toneladas por hectárea**, con variaciones significativas entre departamentos:
    
    - **Rendimiento más alto**: Departamento de Leales con 90 t/ha
    - **Rendimiento más bajo**: Departamentos de Burruyacú y Tafí Viejo con 35 t/ha
    
    ## Distribución por niveles
    
    - **Muy Alto (90-110 t/ha)**: 1 departamento (Leales)
    - **Alto (75-90 t/ha)**: 2 departamentos (Cruz Alta, Chicligasta)
    - **Medio (60-75 t/ha)**: 3 departamentos (Río Chico, Monteros, Famaillá)
    - **Bajo (45-60 t/ha)**: 2 departamentos (Simoca, Graneros)
    - **Muy Bajo (30-45 t/ha)**: 2 departamentos (Burruyacú, Tafí Viejo)
    
    ## Factores que influyeron en el rendimiento
    
    1. **Condiciones climáticas**: El año 2016 presentó condiciones favorables en la zona central
    2. **Sistemas de riego**: Mayor disponibilidad en la zona este de la provincia
    3. **Tecnificación**: Diferencias en el nivel de mecanización y uso de insumos
    4. **Variedades cultivadas**: Distribución heterogénea de variedades de alto rendimiento
  `,
  comparacion: `
    # Comparación Histórica de Producción
    
    La zafra 2016 representó un punto de referencia importante para la producción azucarera en Tucumán. Comparando con años anteriores:
    
    ## Tendencias 2010-2016
    
    - **Superficie**: Incremento del 8% respecto al promedio 2010-2015
    - **Producción total**: Aumento del 12% respecto al promedio 2010-2015
    - **Rendimiento**: Mejora del 4% respecto al promedio 2010-2015
    
    ## Cambios en la distribución territorial
    
    - **Consolidación** de Leales y Cruz Alta como zonas de alta productividad
    - **Mejora relativa** en Chicligasta y Monteros
    - **Estancamiento** en las zonas periféricas (Burruyacú, Tafí Viejo)
    
    ## Factores de cambio histórico
    
    1. **Tecnificación progresiva** del sector
    2. **Mejoramiento genético** de variedades
    3. **Expansión de sistemas de riego** en zonas centrales
    4. **Concentración productiva** en áreas de mayor aptitud
  `,
  departamentos: `
    # Análisis por Departamento - Zafra 2016
    
    ## Departamentos destacados
    
    ### Leales
    - Superficie: 42,000 ha (15.8% del total provincial)
    - Producción: 3,780,000 t (24.9% del total provincial)
    - Rendimiento: 90 t/ha (Muy Alto)
    - Factores de éxito: Óptimas condiciones de suelo, alta tecnificación, sistemas de riego eficientes
    
    ### Cruz Alta
    - Superficie: 48,000 ha (18.1% del total provincial)
    - Producción: 4,080,000 t (26.8% del total provincial)
    - Rendimiento: 85 t/ha (Alto)
    - Factores de éxito: Mayor superficie cultivada, proximidad a ingenios, buena infraestructura
    
    ## Oportunidades de mejora
    
    ### Burruyacú
    - Rendimiento actual: 35 t/ha (Muy Bajo)
    - Potencial de mejora: Implementación de sistemas de riego, introducción de variedades adaptadas
    - Limitantes: Condiciones edafoclimáticas menos favorables, menor infraestructura
    
    ### Tafí Viejo
    - Rendimiento actual: 35 t/ha (Muy Bajo)
    - Potencial de mejora: Tecnificación, manejo agronómico optimizado
    - Limitantes: Topografía, menor tradición cañera
  `,
  proyecciones: `
    # Proyecciones basadas en datos históricos
    
    Utilizando los datos de la zafra 2016 como base, se pueden proyectar las siguientes tendencias:
    
    ## Proyecciones a corto plazo (1-3 años)
    
    - **Rendimiento promedio**: Potencial incremento a 60-65 t/ha
    - **Departamentos de mayor crecimiento**: Famaillá, Monteros, Simoca
    - **Factores de impulso**: Adopción tecnológica, mejora en sistemas de riego
    
    ## Proyecciones a mediano plazo (3-5 años)
    
    - **Superficie cultivable**: Posible expansión de 5-8% en zonas favorables
    - **Producción total**: Potencial aumento de 10-15%
    - **Redistribución territorial**: Mayor concentración en zonas de alto rendimiento
    
    ## Variables críticas para las proyecciones
    
    1. **Condiciones climáticas**: Impacto del cambio climático en patrones de lluvia
    2. **Inversión en infraestructura**: Especialmente en sistemas de riego
    3. **Políticas sectoriales**: Incentivos para tecnificación y mejora productiva
    4. **Mercados**: Demanda interna y externa del azúcar y derivados
    
    ## Escenarios posibles
    
    - **Optimista**: Rendimiento promedio de 70 t/ha, producción de 19 millones de toneladas
    - **Conservador**: Rendimiento promedio de 62 t/ha, producción de 17 millones de toneladas
    - **Pesimista**: Rendimiento promedio de 55 t/ha, producción de 15 millones de toneladas
  `,
  default: `
    # Análisis de Datos Históricos - Zafra 2016
    
    La campaña de zafra 2016 en Tucumán presentó las siguientes características principales:
    
    ## Datos generales
    
    - **Superficie total**: ${HARVEST_DATA_2016.totalArea.toLocaleString()} hectáreas
    - **Producción total**: ${HARVEST_DATA_2016.totalProduction.toLocaleString()} toneladas
    - **Rendimiento promedio**: ${HARVEST_DATA_2016.averageYield.toFixed(1)} toneladas por hectárea
    
    ## Distribución territorial
    
    - La producción se concentró principalmente en los departamentos de **Cruz Alta** (26.8%) y **Leales** (24.9%)
    - Los mayores rendimientos se observaron en la zona centro-este de la provincia
    - Existe una marcada heterogeneidad productiva entre departamentos
    
    ## Factores determinantes
    
    1. **Condiciones agroecológicas**: Suelos, clima, disponibilidad de agua
    2. **Nivel tecnológico**: Mecanización, variedades, manejo agronómico
    3. **Infraestructura**: Sistemas de riego, vías de comunicación, proximidad a ingenios
    4. **Factores socioeconómicos**: Estructura productiva, acceso a financiamiento
    
    Para obtener análisis más específicos, puede consultar sobre rendimientos, comparaciones históricas, análisis por departamento o proyecciones.
  `,
}

export default function AnalisisIAHistorico() {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("consulta")

  const handleSubmit = () => {
    if (!query.trim()) return

    setIsLoading(true)
    setActiveTab("respuesta")

    // Simulación de procesamiento de IA
    setTimeout(() => {
      let aiResponse = AI_RESPONSES.default

      // Palabras clave para determinar el tipo de consulta
      const keywords = {
        rendimiento: ["rendimiento", "producción", "toneladas", "hectárea", "t/ha"],
        comparacion: ["comparación", "histórico", "años", "anterior", "tendencia", "evolución"],
        departamentos: ["departamento", "leales", "cruz alta", "chicligasta", "monteros", "simoca", "regional"],
        proyecciones: ["proyección", "futuro", "estimación", "próximo", "previsión", "tendencia"],
      }

      // Determinar el tipo de consulta basado en palabras clave
      const queryLower = query.toLowerCase()
      for (const [type, words] of Object.entries(keywords)) {
        if (words.some((word) => queryLower.includes(word))) {
          aiResponse = AI_RESPONSES[type]
          break
        }
      }

      setResponse(aiResponse)
      setIsLoading(false)
    }, 1500)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Análisis Avanzado con IA - Datos Históricos</CardTitle>
        <CardDescription>
          Realice consultas en lenguaje natural sobre los datos históricos de producción de caña de azúcar en la
          Provincia de Tucumán.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="consulta">Consulta</TabsTrigger>
            <TabsTrigger value="respuesta" disabled={!response && !isLoading}>
              Respuesta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consulta" className="space-y-4">
            <div className="mt-4">
              <Textarea
                placeholder="Realice su consulta sobre los datos históricos de producción de caña de azúcar. Por ejemplo: '¿Cuáles fueron los departamentos con mayor rendimiento en 2016?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                <Bot className="inline-block mr-1 h-4 w-4" />
                Asistente IA para análisis de datos históricos
              </div>
              <Button onClick={handleSubmit} disabled={!query.trim() || isLoading} className="flex items-center gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Enviar consulta
              </Button>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Consultas sugeridas:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="justify-start text-left h-auto py-2"
                  onClick={() =>
                    setQuery("¿Cuáles fueron los niveles de rendimiento por departamento en la zafra 2016?")
                  }
                >
                  ¿Cuáles fueron los niveles de rendimiento por departamento en la zafra 2016?
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => setQuery("¿Cómo se compara la producción de 2016 con años anteriores?")}
                >
                  ¿Cómo se compara la producción de 2016 con años anteriores?
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => setQuery("Analiza la producción por departamento en la zafra 2016")}
                >
                  Analiza la producción por departamento en la zafra 2016
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => setQuery("¿Qué proyecciones se pueden hacer a partir de los datos de 2016?")}
                >
                  ¿Qué proyecciones se pueden hacer a partir de los datos de 2016?
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="respuesta">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analizando datos históricos...</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, "<br>") }} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
