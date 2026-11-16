"use client"

import { useState, useEffect } from "react"

// Tipos para los datos geoespaciales
export interface SugarCaneFeature {
  id: string
  area: number // hectáreas
  department: string
  harvestStatus?: string
  properties: Record<string, any>
}

export interface MapBounds {
  west: number
  east: number
  south: number
  north: number
}

export interface SugarMapStats {
  totalArea: number
  departmentBreakdown: {
    department: string
    area: number
    percentage: number
  }[]
  harvestProgress?: {
    harvested: number
    inProgress: number
    pending: number
  }
}

export function useTucumanSugarMap() {
  const [isLoading, setIsLoading] = useState(true)
  const [features, setFeatures] = useState<SugarCaneFeature[]>([])
  const [stats, setStats] = useState<SugarMapStats | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>("2022")

  // Metadatos de la capa
  const metadata = {
    title: "Capa de Caña de Azúcar del año 2022 de la Provincia de Tucumán",
    source: "Estación Experimental Agroindustrial Obispo Colombres (EEAOC)",
    description:
      "Capa vectorial que contiene información espacial de la cobertura de caña de azúcar elaborada por la EEAOC, utilizando un proceso de conversión de un formato ráster a un formato vectorial.",
    bounds: {
      west: -66.35913848876953,
      east: -64.30469512939453,
      south: -28.101057958669443,
      north: -26.06665213857739,
    },
    wmsUrl: "https://gis.producciontucuman.gob.ar/ArcGIS/services/Actividades_Agropecuarias_WMS/MapServer/WMSServer?",
    wfsUrl: "https://gis.producciontucuman.gob.ar/ArcGIS/services/Actividades_Agropecuarias_WFS/MapServer/WFSServer?",
    lastUpdated: "2022-02-07",
  }

  // Departamentos de Tucumán con producción de caña
  const departments = [
    "Burruyacú",
    "Cruz Alta",
    "Chicligasta",
    "Famaillá",
    "Graneros",
    "La Cocha",
    "Leales",
    "Lules",
    "Monteros",
    "Río Chico",
    "Simoca",
    "Tafí Viejo",
    "Trancas",
    "Yerba Buena",
  ]

  // Años disponibles (simulados)
  const availableYears = ["2018", "2019", "2020", "2021", "2022"]

  // Datos simulados para demostración
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      try {
        // En una implementación real, aquí se haría una llamada al servicio WFS
        // para obtener los datos reales. Para esta demostración, usamos datos simulados.

        // Simulamos un retraso de red
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Generamos datos simulados basados en el año seleccionado
        const simulatedFeatures: SugarCaneFeature[] = []
        const departmentAreas: Record<string, number> = {}
        let totalArea = 0

        // Generamos datos para cada departamento
        departments.forEach((dept) => {
          // Área base que varía según el departamento (valores ficticios)
          const baseArea =
            {
              "Cruz Alta": 45000,
              Leales: 35000,
              Simoca: 30000,
              Monteros: 25000,
              Chicligasta: 20000,
              "Río Chico": 18000,
              Famaillá: 15000,
              Burruyacú: 12000,
              "La Cocha": 10000,
              Graneros: 8000,
              Lules: 7000,
              "Tafí Viejo": 5000,
              Trancas: 3000,
              "Yerba Buena": 2000,
            }[dept] || 10000

          // Variación según el año (tendencia de crecimiento o reducción)
          const yearFactor =
            {
              "2018": 0.85,
              "2019": 0.9,
              "2020": 0.95,
              "2021": 0.98,
              "2022": 1.0,
            }[selectedYear] || 1.0

          // Calculamos el área para este departamento en este año
          const deptArea = Math.round(baseArea * yearFactor)
          departmentAreas[dept] = deptArea
          totalArea += deptArea

          // Generamos entre 5-15 features (parcelas) para cada departamento
          const numFeatures = 5 + Math.floor(Math.random() * 10)
          for (let i = 0; i < numFeatures; i++) {
            const featureArea = Math.round((deptArea / numFeatures) * (0.8 + Math.random() * 0.4))
            simulatedFeatures.push({
              id: `${dept}-${i}-${selectedYear}`,
              area: featureArea,
              department: dept,
              harvestStatus: Math.random() > 0.7 ? "Harvested" : Math.random() > 0.5 ? "In Progress" : "Pending",
              properties: {
                soilType: Math.random() > 0.5 ? "Arcilloso" : "Franco-arcilloso",
                variety: ["LCP 85-384", "TUCCP 77-42", "RA 87-3", "TUC 95-10"][Math.floor(Math.random() * 4)],
                irrigated: Math.random() > 0.3,
              },
            })
          }
        })

        // Calculamos estadísticas
        const departmentBreakdown = Object.entries(departmentAreas)
          .map(([department, area]) => ({
            department,
            area,
            percentage: Math.round((area / totalArea) * 1000) / 10,
          }))
          .sort((a, b) => b.area - a.area)

        // Calculamos progreso de cosecha (simulado)
        const harvested = simulatedFeatures
          .filter((f) => f.harvestStatus === "Harvested")
          .reduce((sum, f) => sum + f.area, 0)
        const inProgress = simulatedFeatures
          .filter((f) => f.harvestStatus === "In Progress")
          .reduce((sum, f) => sum + f.area, 0)
        const pending = simulatedFeatures
          .filter((f) => f.harvestStatus === "Pending")
          .reduce((sum, f) => sum + f.area, 0)

        setFeatures(simulatedFeatures)
        setStats({
          totalArea,
          departmentBreakdown,
          harvestProgress: {
            harvested,
            inProgress,
            pending,
          },
        })
      } catch (error) {
        console.error("Error loading sugar cane map data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedYear, selectedDepartment])

  // Función para filtrar features por departamento
  const filterByDepartment = (department: string | null) => {
    setSelectedDepartment(department)
  }

  // Función para cambiar el año
  const changeYear = (year: string) => {
    setSelectedYear(year)
  }

  // Función para obtener la URL del WMS con los parámetros adecuados
  const getWmsUrl = (width: number, height: number, bbox: string) => {
    // En una implementación real, construiríamos la URL del WMS con los parámetros adecuados
    return `${metadata.wmsUrl}SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=Actividades_Agropecuarias&STYLES=&FORMAT=image/png&TRANSPARENT=true&WIDTH=${width}&HEIGHT=${height}&CRS=EPSG:4326&BBOX=${bbox}`
  }

  return {
    isLoading,
    features,
    stats,
    metadata,
    departments,
    availableYears,
    selectedDepartment,
    selectedYear,
    filterByDepartment,
    changeYear,
    getWmsUrl,
  }
}
