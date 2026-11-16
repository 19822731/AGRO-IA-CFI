"use client"

import { useState } from "react"
import { CargaCSV } from "./carga-csv"
import { VisualizacionDatos } from "./visualizacion-datos"
import { AnalisisIA } from "./analisis-ia"

export default function AnalisisDatos() {
  const [dataLoaded, setDataLoaded] = useState(false)

  const handleDataLoaded = () => {
    setDataLoaded(true)
  }

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">Análisis de Datos Históricos</h1>

      <CargaCSV onDataLoaded={handleDataLoaded} />

      {dataLoaded && (
        <>
          <VisualizacionDatos />
          <AnalisisIA />
        </>
      )}
    </div>
  )
}
