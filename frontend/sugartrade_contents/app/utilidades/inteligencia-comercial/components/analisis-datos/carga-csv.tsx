"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { csvDataService } from "@/lib/services/csv-data-service"

export function CargaCSV({ onDataLoaded }: { onDataLoaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor seleccione un archivo CSV")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const content = await file.text()
      await csvDataService.loadData(content)
      setSuccess(true)
      onDataLoaded()
    } catch (err) {
      console.error("Error al cargar el archivo CSV:", err)
      setError("Error al procesar el archivo CSV. Verifique el formato.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasteData = async () => {
    try {
      // Obtener el CSV de ejemplo del texto proporcionado por el usuario
      const csvContent = `Fuente,Tipo de Dato,Subtipo de Dato,Valor,Unidad,Fecha,Ubicación,Notas
Informe 13-03-2025.pdf,Precio,Bolsa Azúcar 50kg,13000,ARS,2025-03-13,Argentina,
Informe 13-03-2025.pdf,Precio,Bolsa Azúcar 50kg (USD MEP),12.60,USD,2025-03-13,Argentina,
Informe 13-03-2025.pdf,Precio,Bolsa Azúcar 50kg (USD MEP),11.50,USD,2025-03-06,Argentina,
Informe 13-03-2025.pdf,Precio,Bolsa Azúcar 50kg (USD MEP),9.80,USD,2025-02-27,Argentina,
Informe 13-03-2025.pdf,Precio,Azúcar Refinada Externa,750-780,USD/tonelada,2025-03-13,Argentina,
Informe 13-03-2025.pdf,Precio,Azúcar Cruda Externa,680-720,USD/tonelada,2025-03-13,Argentina,
Informe 13-03-2025.pdf,Inflación,IPC Interanual,276.2,%,Febrero 2025,Argentina,
Informe 13-03-2025.pdf,Precio,Variación Alcohol vs Azúcar,-17,%,Marzo 2025,Argentina,
Ra-242.pdf,Costo Producción,Total costos de producción,150000,ARS/Hectárea,2021,Tucumán,Valor estimado
Ra-242.pdf,Margen Bruto,Margen bruto,75000,ARS/Hectárea,2021,Tucumán,Valor estimado
Site_PREVISAO_DE_SAFRA-CANA-DE-ACUCAR-NOV-2023.pdf,Producción,Total Brasil,652.4,Millones de toneladas,2023/24,Brasil,Estimado
Site_PREVISAO_DE_SAFRA-CANA-DE-ACUCAR-NOV-2023.pdf,Producción,Sudeste,403.1,Millones de toneladas,2023/24,Brasil,
Site_PREVISAO_DE_SAFRA-CANA-DE-ACUCAR-NOV-2024.pdf,Producción,Total Brasil,660.7,Millones de toneladas,2024/25,Brasil,Estimado
Site_PREVISAO_DE_SAFRA-CANA-DE-ACUCAR-NOV-2024.pdf,Producción,Sudeste,390.2,Millones de toneladas,2024/25,Brasil,
sugar-dashboard-union europea.pdf,Precio,Azúcar Blanca UE,557,EUR/tonelada,2025-01,Unión Europea,
sugar-dashboard-union europea.pdf,Precio,Azúcar Blanca Mundial (LIFFE),560.2,USD/tonelada,2025-05,Global,Futuros
sugar-dashboard-union europea.pdf,Precio,Azúcar Cruda Mundial (ICE),21.31,USD centavos/libra,2025-03,Global,Futuros
Group 2 Tables - World US and Mexican Sugar and Corn Sweetener Prices.pdf,Precio,Azúcar Blanca Mundial (Promedio),32.12,USD centavos/libra,2016,Global,
Group 2 Tables - World US and Mexican Sugar and Corn Sweetener Prices.pdf,Precio,Azúcar Cruda Mundial (Promedio),16.75,USD centavos/libra,2016,Global,
Sugar-November-2020.pdf,Producción,Global,182,Millones de toneladas,2020/21,Global,Estimado
Sugar-November-2020.pdf,Producción,Brasil,64,Millones de toneladas,2020/21,Brasil,Estimado
Sugar-November-2020.pdf,Producción,India,33.5,Millones de toneladas,2020/21,India,Estimado
Sugar-November-2020.pdf,Producción,Tailandia,13.5,Millones de toneladas,2020/21,Tailandia,Estimado
Sugar-November-2020.pdf,Precio Exportación,Tailandia,3473,USD/tonelada,2020,Tailandia,
Sugar-November-2021.pdf,Producción,México,6.3,Millones de toneladas,2021/22,México,Pronóstico
Sugar-May-2020.pdf,Producción,Global,188,Millones de toneladas,2020/21,Global,Pronóstico
Sugar-May-2021.pdf,Producción,Global,186,Millones de toneladas,2021/22,Global,Pronóstico
Sugar-May-2022.pdf,Producción,Tailandia,10.5,Millones de toneladas,2022/23,Tailandia,Pronóstico
Sugar-November-2022.pdf,Producción,Australia,4.4,Millones de toneladas,2022/23,Australia,Estimado
Sugar-May-2023.pdf,Producción,Pakistán,7.1,Millones de toneladas,2023/24,Pakistán,Pronóstico
sugar-nov 2023.pdf,Producción,Unión Europea,15.5,Millones de toneladas,2023/24,Unión Europea,Pronóstico
sugar.pdf,Producción,Sudáfrica,2.0,Millones de toneladas,2024/25,Sudáfrica,Pronóstico
HISTORICO AZÚCAR .xlsx - Histórico - Común Tipo A (MI) .pdf,Precio Estimado,Bolsa 50kg,63,ARS,2008-01-01,Argentina,IVA Incluido
HISTORICO AZÚCAR .xlsx - Histórico - Común Tipo A (MI) .pdf,Precio Estimado,Bolsa 50kg,63,ARS,2008-02-01,Argentina,IVA Incluido
registro_temperatura365d_smn.txt,Temperatura,Máxima,26.5,°C,2025-03-17,Aeroparque Aero,
registro_temperatura365d_smn.txt,Temperatura,Mínima,19.8,°C,2025-03-17,Aeroparque Aero,
Estadísticas normales Datos abiertos 1991-2020.txt,Temperatura Media,Anual,13.2,°C,1991-2020,La Quiaca Observatorio,
Estadísticas normales Datos abiertos 1991-2020.txt,Temperatura Máxima Media,Anual,20.6,°C,1991-2020,La Quiaca Observatorio,
Estadísticas normales Datos abiertos 1991-2020.txt,Temperatura Mínima Media,Anual,7.7,°C,1991-2020,La Quiaca Observatorio,
7d7ab895-d322-409b-ae0e-060d84e14853,Metadato,Título,Capa de Caña de Azúcar del año 2023 de la Provincia de Tucumán,,,2023,Argentina,Tucumán,
7d7ab895-d322-409b-ae0e-060d84e14853,Metadato,Fecha Creación,2023-03-08,,,Argentina,Tucumán,`

      setIsLoading(true)
      await csvDataService.loadData(csvContent)
      setSuccess(true)
      onDataLoaded()
    } catch (err) {
      console.error("Error al cargar los datos CSV de ejemplo:", err)
      setError("Error al procesar los datos CSV de ejemplo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carga de Datos CSV</CardTitle>
        <CardDescription>Cargue un archivo CSV con datos históricos para análisis avanzado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="csv">Archivo CSV</Label>
            <Input id="csv" type="file" accept=".csv" onChange={handleFileChange} disabled={isLoading} />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleUpload} disabled={!file || isLoading} className="flex-1">
              {isLoading ? "Cargando..." : "Cargar Archivo"}
            </Button>
            <Button variant="outline" onClick={handlePasteData} disabled={isLoading} className="flex-1">
              Cargar Datos de Ejemplo
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>Datos cargados correctamente. Puede proceder con el análisis.</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
