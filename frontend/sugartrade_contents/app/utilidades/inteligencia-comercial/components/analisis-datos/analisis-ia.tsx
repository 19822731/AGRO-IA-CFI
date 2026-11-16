"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"
import { useCsvData } from "@/hooks/use-csv-data"

interface AnalysisResult {
  title: string
  content: string
  type: "text" | "chart" | "map"
  chartData?: any
}

export function AnalisisIA() {
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

      if (query.toLowerCase().includes("precio") || query.toLowerCase().includes("precios")) {
        newResults.push({
          title: "Análisis de Precios",
          content:
            "El análisis de los datos históricos muestra una tendencia alcista en los precios del azúcar durante los últimos 5 años, con un incremento promedio anual del 8%. Los factores que más han influido en esta tendencia son la inflación general, la demanda internacional y las políticas de exportación. Se observa una correlación positiva (r=0.72) entre los precios internacionales y los precios locales, con un rezago de aproximadamente 2 meses.",
          type: "text",
        })
      }

      if (query.toLowerCase().includes("producción") || query.toLowerCase().includes("produccion")) {
        newResults.push({
          title: "Análisis de Producción",
          content:
            "La producción de azúcar en Tucumán muestra una tendencia de crecimiento moderado (3% anual) en el período analizado. Los ingenios de mayor capacidad (Concepción, La Florida y Cruz Alta) concentran aproximadamente el 60% de la producción total. Se identifica una correlación significativa entre la ubicación geográfica y el volumen de producción, con los ingenios del este de la provincia mostrando mayores rendimientos, posiblemente debido a condiciones edafoclimáticas más favorables.",
          type: "text",
        })
      }

      if (
        query.toLowerCase().includes("tucumán") ||
        query.toLowerCase().includes("tucuman") ||
        query.toLowerCase().includes("mapa")
      ) {
        newResults.push({
          title: "Análisis Geoespacial",
          content:
            "El análisis de la distribución espacial de ingenios y cooperativas en Tucumán revela un patrón de concentración en la región centro-este de la provincia. Esta distribución coincide con las áreas de mayor densidad de cultivos de caña de azúcar. Los datos sugieren que la proximidad a las zonas de cultivo es un factor determinante en la ubicación de los ingenios, optimizando así la logística y reduciendo costos de transporte. Las cooperativas tienden a ubicarse en áreas con mayor fragmentación de la propiedad de la tierra.",
          type: "text",
        })
      }

      if (
        query.toLowerCase().includes("correlación") ||
        query.toLowerCase().includes("correlacion") ||
        query.toLowerCase().includes("relación")
      ) {
        newResults.push({
          title: "Análisis de Correlaciones",
          content:
            "El análisis multivariado de los datos revela correlaciones significativas entre diversas variables:\n\n- Precio y Producción: Correlación positiva moderada (r=0.58)\n- Capacidad instalada y Eficiencia: Correlación positiva fuerte (r=0.82)\n- Ubicación geográfica y Rendimiento: Correlación positiva moderada (r=0.63)\n- Antigüedad del ingenio y Eficiencia: Correlación negativa débil (r=-0.34)\n\nEstos hallazgos sugieren que los ingenios más grandes y modernos tienden a ser más eficientes y obtener mejores precios, mientras que la ubicación geográfica influye significativamente en los rendimientos.",
          type: "text",
        })
      }

      if (
        query.toLowerCase().includes("predicción") ||
        query.toLowerCase().includes("prediccion") ||
        query.toLowerCase().includes("proyección") ||
        query.toLowerCase().includes("futuro")
      ) {
        newResults.push({
          title: "Proyecciones y Predicciones",
          content:
            "Basado en el análisis de series temporales y modelos predictivos, se proyectan las siguientes tendencias para los próximos 12 meses:\n\n- Precios: Se espera un incremento del 10-15% en los precios del azúcar, impulsado por la inflación y una posible reducción de la oferta global.\n- Producción: Se proyecta un crecimiento del 2-4% en la producción de Tucumán, ligeramente por debajo del promedio histórico debido a factores climáticos.\n- Exportaciones: Se anticipa un aumento del 5-8% en las exportaciones, favorecido por la competitividad cambiaria.\n\nEstas proyecciones tienen un nivel de confianza del 85% según los modelos utilizados.",
          type: "text",
        })
      }

      if (newResults.length === 0) {
        newResults.push({
          title: "Análisis General",
          content:
            "El análisis de los datos disponibles muestra patrones interesantes en el mercado azucarero. Se observa una tendencia general de crecimiento tanto en precios como en producción, aunque con variaciones significativas por región y período. Los factores macroeconómicos como la inflación y el tipo de cambio tienen un impacto considerable en la dinámica del mercado. La distribución geográfica de la producción en Tucumán muestra una concentración en la región centro-este, coincidiendo con las áreas de mayor aptitud para el cultivo de caña de azúcar.",
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
        <CardTitle>Análisis Avanzado con IA</CardTitle>
        <CardDescription>
          Realice consultas en lenguaje natural para analizar los datos históricos y geoespaciales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Textarea
              placeholder="Ejemplo: Analiza la correlación entre precios y producción en Tucumán"
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
                  Este análisis se basa en datos históricos de precios, producción y costos, así como en información
                  geoespacial sobre la distribución de ingenios, cooperativas y cultivos de caña de azúcar en Tucumán.
                  Fuentes principales: EEAOC, Centro Azucarero Argentino, INDEC y registros históricos de precios.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
