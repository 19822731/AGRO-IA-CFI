"use client"

import { useState } from "react"
import { marketReports } from "@/app/data/market-reports"
import { ReportCard } from "./components/report-card"
import { ReportFilters } from "./components/report-filters"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, FileText, Globe, TrendingUp } from "lucide-react"

export default function MarketReportsPage() {
  const [filteredReports, setFilteredReports] = useState(marketReports)

  // Count reports by country and topic for the dashboard
  const countryStats = marketReports.reduce(
    (acc, report) => {
      acc[report.country] = (acc[report.country] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topicStats = marketReports.reduce(
    (acc, report) => {
      acc[report.topic] = (acc[report.topic] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Mercado</h1>
          <p className="text-muted-foreground">Información actualizada sobre mercados azucareros globales</p>
        </div>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Reportes</CardTitle>
                <CardDescription>Todos los reportes disponibles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketReports.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Países</CardTitle>
                <CardDescription>Países con reportes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(countryStats).length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Top:{" "}
                  {Object.entries(countryStats)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([country]) => country)
                    .join(", ")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Temas</CardTitle>
                <CardDescription>Categorías de reportes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(topicStats).length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Top:{" "}
                  {Object.entries(topicStats)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([topic]) => topic)
                    .join(", ")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Último Reporte</CardTitle>
                <CardDescription>Reporte más reciente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium truncate">
                  {marketReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].country}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(
                    marketReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date,
                  ).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Reportes por País
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(countryStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([country, count]) => (
                      <div key={country} className="flex items-center justify-between">
                        <span>{country}</span>
                        <div className="flex items-center">
                          <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(count / marketReports.length) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Reportes por Tema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(topicStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([topic, count]) => (
                      <div key={topic} className="flex items-center justify-between">
                        <span>{topic}</span>
                        <div className="flex items-center">
                          <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(count / marketReports.length) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <ReportFilters reports={marketReports} onFilterChange={setFilteredReports} />

          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron reportes con los filtros actuales.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
