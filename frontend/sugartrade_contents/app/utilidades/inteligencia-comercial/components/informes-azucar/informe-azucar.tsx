"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getReportByRegion, getAvailableRegions } from "@/lib/services/sugar-reports-service"

export function InformeAzucar() {
  const regions = getAvailableRegions()
  const [selectedRegion, setSelectedRegion] = useState(regions[0])
  const report = getReportByRegion(selectedRegion)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informes de Producción de Azúcar</CardTitle>
        <CardDescription>
          Datos y estadísticas sobre la producción y exportación de azúcar en diferentes regiones
        </CardDescription>
        <div className="w-full max-w-xs">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar región" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {report && (
          <Tabs defaultValue="resumen" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="datos">Datos Detallados</TabsTrigger>
              <TabsTrigger value="contexto">Contexto Histórico</TabsTrigger>
            </TabsList>
            <TabsContent value="resumen">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Información General</h3>
                    <p className="text-sm text-gray-500 mb-1">Fecha del informe: {report.report_date}</p>
                    <p className="text-sm text-gray-500 mb-1">Región: {report.region}</p>
                    <p className="text-sm text-gray-500 mb-1">Tema: {report.topic}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Datos de Producción</h3>
                    {report.production_forecast_2023 && (
                      <p className="text-sm text-gray-500 mb-1">
                        Pronóstico de producción 2023: {report.production_forecast_2023} {report.production_unit}
                      </p>
                    )}
                    {report.production_forecast_2024 && (
                      <p className="text-sm text-gray-500 mb-1">
                        Pronóstico de producción 2024: {report.production_forecast_2024} {report.production_unit}
                      </p>
                    )}
                    {report.production_estimate_2023 && (
                      <p className="text-sm text-gray-500 mb-1">
                        Estimación de producción 2023: {report.production_estimate_2023} {report.production_unit}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Puntos Clave</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {report.key_points.map((point, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {report.production_exports_chart_data && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Producción y Exportaciones</h3>
                    <div className="h-64 w-full">
                      {/* Aquí se podría integrar un gráfico con recharts */}
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left p-1 border-b">Año</th>
                            <th className="text-right p-1 border-b">Producción ({report.production_unit})</th>
                            <th className="text-right p-1 border-b">Exportaciones ({report.export_unit})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.production_exports_chart_data.years.map((year, index) => (
                            <tr key={year}>
                              <td className="p-1 border-b">{year}</td>
                              <td className="text-right p-1 border-b">
                                {report.production_exports_chart_data.production[index]}
                              </td>
                              <td className="text-right p-1 border-b">
                                {report.production_exports_chart_data.exports[index]}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="datos">
              <div className="space-y-4">
                {report.sugarcane_production_forecast_2023 && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Producción de Caña de Azúcar</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      Pronóstico 2023: {report.sugarcane_production_forecast_2023} {report.sugarcane_unit}
                    </p>
                    {report.sugarcane_production_forecast_2024 && (
                      <p className="text-sm text-gray-500 mb-1">
                        Pronóstico 2024: {report.sugarcane_production_forecast_2024} {report.sugarcane_unit}
                      </p>
                    )}
                    {report.sugarcane_production_estimate_2023 && (
                      <p className="text-sm text-gray-500 mb-1">
                        Estimación 2023: {report.sugarcane_production_estimate_2023} {report.sugarcane_unit}
                      </p>
                    )}
                  </div>
                )}

                {report.area_harvested_2023 && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Área Cosechada</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      2023: {report.area_harvested_2023.toLocaleString()} {report.area_unit}
                    </p>
                  </div>
                )}

                {report.export_destinations && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Destinos de Exportación</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.export_destinations.map((destination, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {destination}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {report.sugarcane_production_provinces && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Producción por Provincia</h3>
                    <div className="space-y-2">
                      {report.sugarcane_production_provinces.map((province, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${province.percentage}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {province.province}: {province.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="contexto">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Contexto Histórico</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {report.historical_context.map((context, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {context}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Producción por País</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left p-1 border-b">País</th>
                          {report.production_by_country.production_values.map((yearData) => (
                            <th key={yearData.year} className="text-right p-1 border-b">
                              {yearData.year}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.production_by_country.country.slice(0, 10).map((country, index) => (
                          <tr key={index}>
                            <td className="p-1 border-b">{country}</td>
                            {report.production_by_country.production_values.map((yearData) => (
                              <td key={yearData.year} className="text-right p-1 border-b">
                                {yearData.value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Valores en miles de toneladas</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

export default InformeAzucar
