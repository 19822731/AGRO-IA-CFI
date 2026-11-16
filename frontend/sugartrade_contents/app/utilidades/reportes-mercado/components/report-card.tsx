import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Globe, Tag } from "lucide-react"
import type { MarketReport } from "@/app/data/market-reports"
import Link from "next/link"

interface ReportCardProps {
  report: MarketReport
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={`/utilidades/reportes-mercado/${report.id}`}>
      <Card className="h-full cursor-pointer hover:border-blue-500 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{report.country}</CardTitle>
            <Badge variant={getBadgeVariant(report.topic)}>{report.topic}</Badge>
          </div>
          <CardDescription className="flex items-center gap-1 text-xs">
            <CalendarIcon className="h-3 w-3" />
            {new Date(report.date).toLocaleDateString()}
            <span className="mx-1">•</span>
            {report.source}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{report.summary}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start pt-0">
          <div className="flex flex-wrap gap-1 mt-2">
            {report.keywords.slice(0, 3).map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {keyword}
              </Badge>
            ))}
            {report.keywords.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{report.keywords.length - 3}
              </Badge>
            )}
          </div>
          {report.regions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <Globe className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {report.regions.slice(0, 2).join(", ")}
                {report.regions.length > 2 && ` +${report.regions.length - 2}`}
              </span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
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
