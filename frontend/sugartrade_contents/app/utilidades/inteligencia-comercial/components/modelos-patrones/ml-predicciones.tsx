"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Brain, LineChart, RefreshCw, AlertTriangle, Info } from "lucide-react"

export default function MLPredicciones() {
  const [selectedModel, setSelectedModel] = useState("regresion")
  const [confidenceLevel, setConfidenceLevel] = useState(80)
  const [timeHorizon, setTimeHorizon] = useState(6)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateModel = () => {
    setIsLoading(true)
    // Simulación de carga
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl">Predicciones con Machine Learning</CardTitle>
            <CardDescription className="text-gray-400">
              Utilice datos históricos y proyecciones para entrenar modelos predictivos
            </CardDescription>
          </div>
          <div className="bg-[#1a2040] p-2 rounded-full">
            <Brain className="h-6 w-6 text-[#00a8ff]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Modelo de Predicción</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-[#0a0f29] border-[#1a2040] text-white">
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f29] border-[#1a2040]">
                  <SelectItem value="regresion">Regresión Lineal</SelectItem>
                  <SelectItem value="arima">ARIMA</SelectItem>
                  <SelectItem value="prophet">Prophet</SelectItem>
                  <SelectItem value="lstm">LSTM (Red Neuronal)</SelectItem>
                  <SelectItem value="xgboost">XGBoost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Nivel de Confianza (%)</label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[confidenceLevel]}
                  min={50}
                  max={95}
                  step={5}
                  onValueChange={(value) => setConfidenceLevel(value[0])}
                  className="flex-1"
                />
                <span className="text-white w-8 text-center">{confidenceLevel}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Horizonte de Tiempo (meses)</label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[timeHorizon]}
                  min={1}
                  max={24}
                  step={1}
                  onValueChange={(value) => setTimeHorizon(value[0])}
                  className="flex-1"
                />
                <span className="text-white w-8 text-center">{timeHorizon}</span>
              </div>
            </div>

            <Button
              onClick={handleGenerateModel}
              disabled={isLoading}
              className="w-full bg-[#00a8ff] hover:bg-[#0096e0]"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
              {isLoading ? "Generando modelo..." : "Generar Predicciones"}
            </Button>

            <div className="bg-blue-900/20 border border-blue-900/30 rounded-md p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300">
                  Los modelos utilizan datos históricos y proyecciones del USDA para generar predicciones. Ajuste los
                  parámetros según sus necesidades de análisis.
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <Card className="bg-[#0a0f29] border-[#1a2040] h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Resultados del Modelo</CardTitle>
                <CardDescription className="text-gray-400">
                  {isLoading
                    ? "Generando predicciones..."
                    : "Seleccione parámetros y genere el modelo para ver resultados"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center">
                    <RefreshCw className="h-12 w-12 text-[#00a8ff] animate-spin mb-4" />
                    <p className="text-gray-400">Procesando datos y entrenando modelo...</p>
                  </div>
                ) : (
                  <div className="h-64 relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <LineChart className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                      <p className="text-gray-400">Visualización de predicciones en desarrollo</p>
                      <p className="text-sm text-gray-500 mt-2">Genere un modelo para ver predicciones</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Variables Más Influyentes</p>
                    <ul className="space-y-1 text-xs text-gray-300">
                      <li>• Producción de Brasil (Coef: 0.78)</li>
                      <li>• Producción de India (Coef: 0.65)</li>
                      <li>• Exportaciones de Tailandia (Coef: 0.42)</li>
                      <li>• Importaciones de China (Coef: 0.38)</li>
                      <li>• Consumo Global (Coef: 0.35)</li>
                    </ul>
                  </div>

                  <div className="bg-[#1a2040] p-3 rounded-lg">
                    <p className="text-sm text-white font-medium mb-2">Métricas del Modelo</p>
                    <ul className="space-y-1 text-xs text-gray-300">
                      <li>• Error Cuadrático Medio (RMSE): 0.42</li>
                      <li>• Error Absoluto Medio (MAE): 0.31</li>
                      <li>• Coeficiente de Determinación (R²): 0.87</li>
                      <li>• Error Porcentual Absoluto Medio (MAPE): 3.8%</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 bg-yellow-900/20 border border-yellow-900/30 rounded-md p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300">
                      Las predicciones son estimaciones basadas en datos históricos y proyecciones. Los resultados
                      reales pueden variar debido a factores imprevistos como condiciones climáticas extremas, cambios
                      en políticas gubernamentales o eventos geopolíticos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
