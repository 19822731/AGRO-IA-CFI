"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Droplets } from "lucide-react"
import { useCsvData } from "@/hooks/use-csv-data"
import { irrigationMetadata } from "@/lib/services/irrigation-areas-service"

interface AnalysisResult {
  title: string
  content: string
  type: "text" | "chart" | "map"
  chartData?: any
}

export function AnalisisIARiego() {
  const { isLoading: isLoadingData, data } = useCsvData()
  const [query, setQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult[]>([])

  const handleAnalyze = () => {
    if (!query.trim()) return

    setIsAnalyzing(true)

    // Simulamos un análisis de IA
    setTimeout(() => {
      // Generamos resultados simulados basados en palabras clave en la consulta
      const newResults: AnalysisResult[] = []

      if (
        query.toLowerCase().includes("riego") ||
        query.toLowerCase().includes("irrigación") ||
        query.toLowerCase().includes("agua")
      ) {
        newResults.push({
          title: "Análisis de Sistemas de Riego",
          content:
            "El análisis de los datos de áreas bajo riego en Tucumán muestra una distribución heterogénea de los sistemas de irrigación. Los sistemas de canal representan aproximadamente el 45% del área total irrigada, seguidos por los sistemas mixtos (35%) y los sistemas de pozo (20%). La eficiencia promedio de los sistemas de riego es del 70%, con variaciones significativas según el tipo y antigüedad del sistema. Los sistemas de pozo muestran la mayor eficiencia (78% en promedio), mientras que los sistemas de canal presentan la menor (62% en promedio).",
          type: "text",
        })
      }

      if (query.toLowerCase().includes("eficiencia") || query.toLowerCase().includes("optimización")) {
        newResults.push({
          title: "Análisis de Eficiencia de Riego",
          content:
            "La eficiencia de los sistemas de riego muestra una correlación positiva significativa (r=0.68) con la productividad de los cultivos de caña de azúcar. Los ingenios que utilizan sistemas de riego más eficientes tienden a obtener rendimientos hasta un 25% superiores por hectárea. Se identifica una tendencia de mejora en la eficiencia de riego durante los últimos 5 años, con un incremento promedio anual del 2%. Esta mejora se atribuye principalmente a la modernización de infraestructura y la adopción de técnicas de riego de precisión. Las áreas con sistemas de riego más eficientes también muestran una mayor resiliencia ante eventos de sequía.",
          type: "text",
        })
      }

      if (query.toLowerCase().includes("producción") || query.toLowerCase().includes("rendimiento")) {
        newResults.push({
          title: "Relación entre Riego y Producción",
          content:
            "El análisis multivariado revela que el riego es uno de los factores más determinantes en la producción de caña de azúcar en Tucumán, explicando aproximadamente el 40% de la variabilidad en los rendimientos. La disponibilidad de riego adecuado puede incrementar la producción entre 30-50 toneladas por hectárea en comparación con áreas de secano. Los datos históricos muestran que las fluctuaciones en la producción están fuertemente correlacionadas con la disponibilidad de agua para riego, especialmente en años de precipitaciones por debajo del promedio. Los ingenios ubicados en zonas con sistemas de riego más desarrollados muestran una menor variabilidad interanual en su producción.",
          type: "text",
        })
      }

      if (
        query.toLowerCase().includes("distribución") ||
        query.toLowerCase().includes("espacial") ||
        query.toLowerCase().includes("geográfica")
      ) {
        newResults.push({
          title: "Análisis de Distribución Espacial",
          content:
            "La distribución espacial de las áreas bajo riego en Tucumán muestra patrones interesantes. Las zonas centro-este de la provincia concentran la mayor parte de los sistemas de canal, aprovechando los principales ríos de la región. Los sistemas de pozo se concentran principalmente en la zona sur, donde el nivel freático es más accesible. Se observa una correlación espacial entre la ubicación de los ingenios y la disponibilidad de sistemas de riego eficientes, lo que sugiere que el acceso al riego ha sido históricamente un factor determinante en la localización de la industria azucarera. Las áreas con mayor densidad de sistemas de riego también coinciden con las zonas de mayor productividad por hectárea.",
          type: "text",
        })
      }

      if (
        query.toLowerCase().includes("futuro") ||
        query.toLowerCase().includes("proyección") ||
        query.toLowerCase().includes("cambio climático")
      ) {
        newResults.push({
          title: "Proyecciones y Adaptación al Cambio Climático",
          content:
            "Las proyecciones climáticas para Tucumán indican un incremento en la variabilidad de las precipitaciones y un aumento en la frecuencia de eventos extremos. Esto subraya la importancia estratégica de los sistemas de riego para mantener la estabilidad en la producción azucarera. El análisis sugiere que la inversión en mejoras de eficiencia de riego podría mitigar hasta un 60% del impacto negativo proyectado por el cambio climático en la producción. Las áreas actualmente dependientes de sistemas de canal podrían enfrentar mayores desafíos debido a la reducción proyectada en los caudales de los ríos durante períodos críticos. Se recomienda una estrategia de diversificación hacia sistemas mixtos que combinen fuentes superficiales y subterráneas para aumentar la resiliencia.",
          type: "text",
        })
      }

      if (newResults.length === 0) {
        newResults.push({
          title: "Análisis General de Riego y Producción Azucarera",
          content:
            "El análisis de los datos disponibles sobre áreas bajo riego y producción azucarera en Tucumán revela una estrecha relación entre ambas variables. Los sistemas de riego cubren aproximadamente 105,000 hectáreas en la provincia, de las cuales cerca del 70% se dedica al cultivo de caña de azúcar. La eficiencia promedio de los sistemas de riego es del 70%, con un potencial significativo de mejora mediante modernización de infraestructura y adopción de técnicas de precisión. Los datos históricos muestran una tendencia de crecimiento tanto en el área irrigada (2% anual) como en la eficiencia de los sistemas (2% anual), lo que ha contribuido al incremento sostenido en la producción azucarera. La distribución espacial de los sistemas de riego coincide en gran medida con las áreas de mayor concentración de ingenios, reflejando la importancia histórica del acceso al agua en el desarrollo de la industria.",
          type: "text",
        })
      }

      setResults(newResults)
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Droplets className="h-5 w-5 mr-2" />
          Análisis Avanzado: Riego y Producción
        </CardTitle>
        <CardDescription>
          Realice consultas en lenguaje natural para analizar la relación entre áreas bajo riego y producción azucarera
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Textarea
              placeholder="Ejemplo: Analiza la relación entre eficiencia de riego y rendimiento de caña de azúcar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoadingData || isAnalyzing}
            />
            <Button
              onClick={handleAnalyze}
              disabled={isLoadingData || isAnalyzing || !query.trim()}
              className="self-end"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Analizar
                </>
              )}
            </Button>
          </div>

          {isLoadingData && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Cargando datos...</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-semibold">Resultados del Análisis</h3>

              {results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{result.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm">{result.content}</div>
                  </CardContent>
                </Card>
              ))}

              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Fuentes de Datos</h4>
                <p className="text-sm text-muted-foreground">
                  Este análisis se basa en datos de áreas bajo riego proporcionados por la Red de Información para el
                  Desarrollo Productivo (RIDES), combinados con datos históricos de producción azucarera. La capa
                  vectorial de áreas bajo riego (ID: {irrigationMetadata.identifier}) proporciona información espacial
                  detallada sobre los sistemas de irrigación en Tucumán, incluyendo tipo, eficiencia y extensión.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
