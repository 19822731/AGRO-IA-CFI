"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Cloud, Wind, Waves, Sun, AlertCircle } from "lucide-react"

interface RiskAssessmentProps {
  selectedArea: string
  selectedDate: string
}

type RiskType = "flood" | "drought" | "storm" | "frost" | "fire"
type RiskLevel = "low" | "moderate" | "high" | "extreme"

interface RiskAssessment {
  riskType: RiskType
  riskLevel: RiskLevel
  currentIndex: number
  thresholdIndex: number
  indexName: string
  description: string
  impactArea: number
  impactPercentage: number
  estimatedLoss: number
  recommendedActions: string[]
  historicalEvents: {
    date: string
    severity: RiskLevel
    impact: string
  }[]
}

export default function RiskAssessment({ selectedArea, selectedDate }: RiskAssessmentProps) {
  const [loading, setLoading] = useState(true)
  const [riskData, setRiskData] = useState<RiskAssessment[]>([])
  const [selectedRisk, setSelectedRisk] = useState<RiskType>("drought")
  const [parametricTrigger, setParametricTrigger] = useState<boolean>(false)
  const [insuranceDetails, setInsuranceDetails] = useState<{
    premium: number
    coverage: number
    payoutAmount: number
    payoutTriggered: boolean
  } | null>(null)
  const [showInsuranceSimulation, setShowInsuranceSimulation] = useState(false)

  // Cargar datos simulados de riesgos
  useEffect(() => {
    setLoading(true)

    setTimeout(() => {
      // Generar datos de riesgos simulados
      const risks = generateRiskData(selectedArea)
      setRiskData(risks)

      // Determinar si alguno de los riesgos está por encima del umbral
      const drought = risks.find((r) => r.riskType === "drought")
      if (drought && (drought.riskLevel === "high" || drought.riskLevel === "extreme")) {
        setParametricTrigger(true)
      } else {
        setParametricTrigger(false)
      }

      // Generar detalles de seguro
      const areaData = getAreaData(selectedArea)
      const premium = Math.round(areaData.totalArea * 1.5) // $1.5 por hectárea
      const coverage = Math.round(areaData.totalArea * 150) // $150 por hectárea

      // Determinar si se activa el pago del seguro
      const payoutTriggered = drought && drought.currentIndex < drought.thresholdIndex

      setInsuranceDetails({
        premium,
        coverage,
        payoutAmount: Math.round(coverage * 0.7), // 70% del valor asegurado
        payoutTriggered,
      })

      setLoading(false)
    }, 1500)
  }, [selectedArea, selectedDate])

  // Función para obtener datos básicos del área seleccionada
  const getAreaData = (area: string) => {
    // Datos simulados según el área
    let totalArea = 0
    let baseYield = 0

    if (area.includes("Tucumán")) {
      totalArea = 25000
      baseYield = 75
    } else if (area.includes("Salta")) {
      totalArea = 30000
      baseYield = 70
    } else if (area.includes("Jujuy")) {
      totalArea = 20000
      baseYield = 65
    } else {
      totalArea = 15000
      baseYield = 60
    }

    return { totalArea, baseYield }
  }

  // Función para generar datos de riesgo simulados
  const generateRiskData = (area: string): RiskAssessment[] => {
    const { totalArea } = getAreaData(area)

    // Generar datos de riesgo de sequía
    const droughtRisk: RiskAssessment = {
      riskType: "drought",
      // Generar nivel de riesgo basado en el área y con algo de aleatoriedad
      riskLevel: generateRiskLevel(area, "drought"),
      currentIndex: Math.random() * 0.5 + 0.3, // NDWI entre 0.3 y 0.8
      thresholdIndex: 0.35, // Umbral para seguro paramétrico
      indexName: "NDWI (Índice de Agua)",
      description: "Riesgo basado en el índice de disponibilidad de agua.",
      impactArea: Math.round(totalArea * Math.random() * 0.4), // Hasta el 40% del área podría verse afectada
      impactPercentage: Math.round(Math.random() * 40), // Hasta 40% de impacto en rendimiento
      estimatedLoss: 0, // Se calculará después
      recommendedActions: [
        "Implementar sistema de riego por goteo",
        "Monitorear niveles de humedad del suelo",
        "Considerar cultivos resistentes a la sequía",
        "Evaluar contratación de seguro paramétrico",
      ],
      historicalEvents: [
        {
          date: "Enero 2023",
          severity: "high",
          impact: "Reducción del 35% en rendimiento",
        },
        {
          date: "Febrero 2020",
          severity: "moderate",
          impact: "Reducción del 20% en rendimiento",
        },
      ],
    }

    // Calcular pérdida estimada
    droughtRisk.estimatedLoss = Math.round(((droughtRisk.impactArea * 70 * droughtRisk.impactPercentage) / 100) * 250)

    // Generar datos de riesgo de inundación
    const floodRisk: RiskAssessment = {
      riskType: "flood",
      riskLevel: generateRiskLevel(area, "flood"),
      currentIndex: Math.random() * 30 + 70, // Índice de precipitación (mm)
      thresholdIndex: 100, // Umbral de precipitación
      indexName: "Índice de Precipitación (mm)",
      description: "Riesgo basado en niveles de precipitación acumulada y terreno.",
      impactArea: Math.round(totalArea * Math.random() * 0.3), // Hasta el 30% del área podría verse afectada
      impactPercentage: Math.round(Math.random() * 60), // Hasta 60% de impacto en rendimiento
      estimatedLoss: 0, // Se calculará después
      recommendedActions: [
        "Mejorar sistemas de drenaje",
        "Construir terraplenes protectores",
        "Mantener canales de desagüe limpios",
        "Considerar cultivos resistentes a inundaciones",
      ],
      historicalEvents: [
        {
          date: "Marzo 2022",
          severity: "moderate",
          impact: "Daños en 500 hectáreas",
        },
        {
          date: "Diciembre 2019",
          severity: "extreme",
          impact: "Pérdida total en 1200 hectáreas",
        },
      ],
    }

    // Calcular pérdida estimada
    floodRisk.estimatedLoss = Math.round(((floodRisk.impactArea * 70 * floodRisk.impactPercentage) / 100) * 250)

    // Generar datos de riesgo de tormentas
    const stormRisk: RiskAssessment = {
      riskType: "storm",
      riskLevel: generateRiskLevel(area, "storm"),
      currentIndex: Math.random() * 40 + 20, // Velocidad del viento (km/h)
      thresholdIndex: 60, // Umbral de velocidad del viento
      indexName: "Velocidad del Viento (km/h)",
      description: "Riesgo basado en velocidad del viento y exposición del terreno.",
      impactArea: Math.round(totalArea * Math.random() * 0.2), // Hasta el 20% del área podría verse afectada
      impactPercentage: Math.round(Math.random() * 50), // Hasta 50% de impacto en rendimiento
      estimatedLoss: 0, // Se calculará después
      recommendedActions: [
        "Establecer cortavientos",
        "Asegurar infraestructura de riego",
        "Revisar sistemas de anclaje",
        "Contratar seguro contra tormentas",
      ],
      historicalEvents: [
        {
          date: "Noviembre 2021",
          severity: "high",
          impact: "Daños en 700 hectáreas",
        },
      ],
    }

    // Calcular pérdida estimada
    stormRisk.estimatedLoss = Math.round(((stormRisk.impactArea * 70 * stormRisk.impactPercentage) / 100) * 250)

    return [droughtRisk, floodRisk, stormRisk]
  }

  // Función para generar nivel de riesgo según área y tipo
  const generateRiskLevel = (area: string, riskType: RiskType): RiskLevel => {
    // Base de probabilidades según el área
    const baseProbabilities: Record<RiskType, number> = {
      drought: 0.5,
      flood: 0.3,
      storm: 0.2,
      frost: 0.2,
      fire: 0.1,
    }

    // Ajustar probabilidades según el área
    if (area.includes("Tucumán")) {
      baseProbabilities.drought += 0.1
      baseProbabilities.frost -= 0.1
    } else if (area.includes("Salta")) {
      baseProbabilities.flood += 0.2
      baseProbabilities.fire += 0.1
    } else if (area.includes("Jujuy")) {
      baseProbabilities.frost += 0.3
      baseProbabilities.storm += 0.1
    }

    // Añadir componente aleatorio
    const random = Math.random()
    const adjustedProb = baseProbabilities[riskType] + (random - 0.5) * 0.3

    // Determinar nivel de riesgo
    if (adjustedProb > 0.7) return "extreme"
    if (adjustedProb > 0.5) return "high"
    if (adjustedProb > 0.3) return "moderate"
    return "low"
  }

  // Función para obtener color según nivel de riesgo
  const getRiskColor = (level: RiskLevel): string => {
    switch (level) {
      case "low":
        return "green"
      case "moderate":
        return "yellow"
      case "high":
        return "orange"
      case "extreme":
        return "red"
      default:
        return "gray"
    }
  }

  // Función para obtener el ícono según tipo de riesgo
  const getRiskIcon = (type: RiskType) => {
    switch (type) {
      case "drought":
        return <Sun className="h-6 w-6" />
      case "flood":
        return <Waves className="h-6 w-6" />
      case "storm":
        return <Wind className="h-6 w-6" />
      case "frost":
        return <Cloud className="h-6 w-6" />
      case "fire":
        return <AlertCircle className="h-6 w-6" />
      default:
        return <AlertTriangle className="h-6 w-6" />
    }
  }

  // Función para obtener el nombre del riesgo en español
  const getRiskName = (type: RiskType): string => {
    switch (type) {
      case "drought":
        return "Sequía"
      case "flood":
        return "Inundación"
      case "storm":
        return "Tormenta"
      case "frost":
        return "Helada"
      case "fire":
        return "Incendio"
      default:
        return "Desconocido"
    }
  }

  // Determinar el riesgo actualmente seleccionado
  const getSelectedRiskData = (): RiskAssessment | undefined => {
    return riskData.find((risk) => risk.riskType === selectedRisk)
  }

  // Estado de pago del seguro (simulación)
  const handleSimulateInsurance = () => {
    setShowInsuranceSimulation(true)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader>
          <CardTitle className="text-white">Evaluación de Riesgos y Seguros</CardTitle>
          <CardDescription className="text-gray-400">
            Análisis de riesgos basado en datos satelitales para {selectedArea}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Panel de selección de riesgo */}
              <div className="grid grid-cols-3 gap-2">
                {riskData.map((risk) => (
                  <Button
                    key={risk.riskType}
                    variant={selectedRisk === risk.riskType ? "default" : "outline"}
                    className={`flex flex-col items-center py-6 gap-2 ${
                      selectedRisk === risk.riskType
                        ? "bg-[#00a8ff] text-white"
                        : `border-${getRiskColor(risk.riskLevel)}-600 hover:border-[#00a8ff]`
                    }`}
                    onClick={() => setSelectedRisk(risk.riskType)}
                  >
                    <div className={`text-${getRiskColor(risk.riskLevel)}-500`}>{getRiskIcon(risk.riskType)}</div>
                    <span>{getRiskName(risk.riskType)}</span>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        risk.riskLevel === "low"
                          ? "bg-green-900/30 text-green-400"
                          : risk.riskLevel === "moderate"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : risk.riskLevel === "high"
                              ? "bg-orange-900/30 text-orange-400"
                              : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {risk.riskLevel === "low"
                        ? "Bajo"
                        : risk.riskLevel === "moderate"
                          ? "Moderado"
                          : risk.riskLevel === "high"
                            ? "Alto"
                            : "Extremo"}
                    </div>
                  </Button>
                ))}
              </div>

              {/* Detalles del riesgo seleccionado */}
              {getSelectedRiskData() && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-[#0a0f29] rounded-lg border border-[#1a2040] p-4">
                    <h3 className="text-white font-medium mb-3">Detalles del Riesgo</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Tipo de riesgo:</span>
                        <span className="text-white">{getRiskName(getSelectedRiskData()!.riskType)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Nivel de riesgo:</span>
                        <span className={`text-${getRiskColor(getSelectedRiskData()!.riskLevel)}-400`}>
                          {getSelectedRiskData()!.riskLevel === "low"
                            ? "Bajo"
                            : getSelectedRiskData()!.riskLevel === "moderate"
                              ? "Moderado"
                              : getSelectedRiskData()!.riskLevel === "high"
                                ? "Alto"
                                : "Extremo"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">{getSelectedRiskData()!.indexName}:</span>
                        <span className="text-white">
                          {getSelectedRiskData()!.currentIndex.toFixed(2)}
                          {getSelectedRiskData()!.riskType === "drought" || getSelectedRiskData()!.riskType === "flood"
                            ? ` (Umbral: ${getSelectedRiskData()!.thresholdIndex})`
                            : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Área potencialmente afectada:</span>
                        <span className="text-white">{getSelectedRiskData()!.impactArea.toLocaleString()} ha</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Impacto en rendimiento:</span>
                        <span className="text-white">Hasta {getSelectedRiskData()!.impactPercentage}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Pérdida económica estimada:</span>
                        <span className="text-white">$ {getSelectedRiskData()!.estimatedLoss.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-white text-sm font-medium mb-2">Eventos históricos:</h4>
                      <div className="space-y-2">
                        {getSelectedRiskData()!.historicalEvents.map((event, index) => (
                          <div key={index} className="text-xs bg-[#1a2040] rounded p-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">{event.date}</span>
                              <span className={`text-${getRiskColor(event.severity)}-400`}>
                                {event.severity === "low"
                                  ? "Bajo"
                                  : event.severity === "moderate"
                                    ? "Moderado"
                                    : event.severity === "high"
                                      ? "Alto"
                                      : "Extremo"}
                              </span>
                            </div>
                            <p className="text-white mt-1">{event.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#0a0f29] rounded-lg border border-[#1a2040] p-4">
                      <h3 className="text-white font-medium mb-3">Acciones Recomendadas</h3>
                      <ul className="space-y-2">
                        {getSelectedRiskData()!.recommendedActions.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <div className="bg-[#00a8ff] text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-gray-300">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Seguro paramétrico */}
                    <div
                      className={`rounded-lg border p-4 ${
                        parametricTrigger ? "bg-orange-900/20 border-orange-700" : "bg-[#0a0f29] border-[#1a2040]"
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <AlertTriangle
                          className={`h-5 w-5 mr-2 ${parametricTrigger ? "text-orange-400" : "text-[#00a8ff]"}`}
                        />
                        <h3 className="text-white font-medium">Seguro Paramétrico</h3>
                      </div>

                      {insuranceDetails && (
                        <div className="space-y-3">
                          <p className="text-gray-300 text-sm">
                            {parametricTrigger
                              ? "El índice actual ha superado el umbral para activar el pago del seguro paramétrico."
                              : "El índice actual está dentro de los parámetros normales."}
                          </p>

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-[#1a2040] p-2 rounded">
                              <span className="text-xs text-gray-400">Prima anual</span>
                              <p className="text-white">$ {insuranceDetails.premium.toLocaleString()}</p>
                            </div>
                            <div className="bg-[#1a2040] p-2 rounded">
                              <span className="text-xs text-gray-400">Cobertura total</span>
                              <p className="text-white">$ {insuranceDetails.coverage.toLocaleString()}</p>
                            </div>
                          </div>

                          <Button
                            variant={parametricTrigger ? "default" : "outline"}
                            className={parametricTrigger ? "bg-orange-600 hover:bg-orange-700" : ""}
                            onClick={handleSimulateInsurance}
                          >
                            {parametricTrigger ? "Simular reclamación de seguro" : "Simular contratación de seguro"}
                          </Button>

                          {showInsuranceSimulation && (
                            <div
                              className={`mt-4 p-3 rounded-lg ${
                                parametricTrigger
                                  ? "bg-green-900/20 border border-green-700"
                                  : "bg-blue-900/20 border border-blue-700"
                              }`}
                            >
                              {parametricTrigger ? (
                                <div className="text-sm">
                                  <p className="text-green-400 font-medium">Pago de Seguro Activado</p>
                                  <p className="text-gray-300 mt-1">
                                    El índice de {getSelectedRiskData()!.indexName.toLowerCase()} ha activado el pago
                                    del seguro paramétrico.
                                  </p>
                                  <p className="text-white font-medium mt-2">
                                    Monto a pagar: $ {insuranceDetails.payoutAmount.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    El pago se procesará automáticamente en un plazo de 10 días hábiles.
                                  </p>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  <p className="text-blue-400 font-medium">Seguro Contratado (Simulación)</p>
                                  <p className="text-gray-300 mt-1">
                                    Ha contratado un seguro paramétrico contra {getRiskName(selectedRisk)} para{" "}
                                    {getAreaData(selectedArea).totalArea.toLocaleString()} hectáreas.
                                  </p>
                                  <p className="text-white font-medium mt-2">
                                    Prima anual: $ {insuranceDetails.premium.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    El seguro se activará automáticamente cuando el índice de{" "}
                                    {getSelectedRiskData()!.indexName.toLowerCase()} cruce el umbral de{" "}
                                    {getSelectedRiskData()!.thresholdIndex}.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
