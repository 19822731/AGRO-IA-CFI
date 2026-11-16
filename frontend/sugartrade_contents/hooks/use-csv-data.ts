"use client"

import { useState, useEffect } from "react"
import { csvDataService, type SugarDataEntry } from "@/lib/services/csv-data-service"

interface UseCsvDataProps {
  csvContent?: string
}

export function useCsvData({ csvContent }: UseCsvDataProps = {}) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SugarDataEntry[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [dataTypes, setDataTypes] = useState<string[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        if (csvContent) {
          await csvDataService.loadData(csvContent)
          setData(csvDataService.getData())
          setLocations(csvDataService.getUniqueLocations())
          setDataTypes(csvDataService.getUniqueDataTypes())
        } else if (!csvDataService.isLoaded()) {
          // Si no hay contenido CSV proporcionado y los datos no están cargados,
          // podríamos cargar datos de ejemplo o mostrar un error
          setError("No se proporcionó contenido CSV")
        } else {
          // Si los datos ya están cargados en el servicio
          setData(csvDataService.getData())
          setLocations(csvDataService.getUniqueLocations())
          setDataTypes(csvDataService.getUniqueDataTypes())
        }
      } catch (err) {
        setError("Error al cargar los datos CSV")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [csvContent])

  return {
    isLoading,
    error,
    data,
    locations,
    dataTypes,
    getDataByType: csvDataService.getDataByType.bind(csvDataService),
    getDataByLocation: csvDataService.getDataByLocation.bind(csvDataService),
    getDataByDateRange: csvDataService.getDataByDateRange.bind(csvDataService),
    getTimeSeriesData: csvDataService.getTimeSeriesData.bind(csvDataService),
  }
}
