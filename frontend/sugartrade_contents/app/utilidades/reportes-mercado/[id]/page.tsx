"use client"

import { marketReports } from "@/app/data/market-reports"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, ChevronLeft, Download, Globe, Printer, Share2, Tag } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const report = marketReports.find((r) => r.id === params.id)

  if (!report) {
    notFound()
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link href="/utilidades/reportes-mercado">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a Reportes
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{report.country}</h1>
              <Badge variant={getBadgeVariant(report.topic)}>{report.topic}</Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {new Date(report.date).toLocaleDateString()}
              <span className="mx-1">•</span>
              {report.source}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Descargar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Compartir
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Resumen</h2>
              <p className="mb-6 text-lg">{report.summary}</p>

              <h2 className="text-xl font-semibold mb-4">Detalles</h2>
              <div className="space-y-4 text-sm leading-relaxed">
                {report.details.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Palabras Clave</h3>
              <div className="flex flex-wrap gap-2">
                {report.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {report.regions.length > 0 && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-2">Regiones</h3>
                <div className="flex flex-wrap gap-2">
                  {report.regions.map((region) => (
                    <Badge key={region} variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {region}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Reportes Relacionados</h3>
              <div className="space-y-2">
                {marketReports
                  .filter(
                    (r) =>
                      r.id !== report.id &&
                      (r.country === report.country ||
                        r.topic === report.topic ||
                        r.keywords.some((k) => report.keywords.includes(k))),
                  )
                  .slice(0, 3)
                  .map((relatedReport) => (
                    <Link
                      key={relatedReport.id}
                      href={`/utilidades/reportes-mercado/${relatedReport.id}`}
                      className="block"
                    >
                      <div className="p-2 hover:bg-accent rounded-md transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{relatedReport.country}</span>
                          <Badge variant="outline" className="text-xs">
                            {relatedReport.topic}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">{relatedReport.summary}</p>
                      </div>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getBadgeVariant(topic: string): "default" | "secondary" | "destructive" | "outline" {
  switch (topic.toLowerCase()) {
    case "climate":
      return "default"
    case "production":
    case "exportation and production":
      return "secondary"
    case "prices":
      return "destructive"
    case "regulation":
    default:
      return "outline"
  }
}
