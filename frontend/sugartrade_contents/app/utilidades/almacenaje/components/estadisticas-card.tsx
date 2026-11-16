import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EstadisticaItem {
  label: string
  value: number
  color: string
}

interface EstadisticasCardProps {
  title: string
  data: EstadisticaItem[]
  tipo: "porcentaje" | "moneda"
}

export function EstadisticasCard({ title, data, tipo }: EstadisticasCardProps) {
  const formatValue = (value: number, tipo: "porcentaje" | "moneda") => {
    if (tipo === "porcentaje") {
      return `${value}%`
    } else if (tipo === "moneda") {
      return `$${value.toLocaleString()}`
    }
    return value.toString()
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className="text-lg font-bold" style={{ color: item.color }}>
                {formatValue(item.value, tipo)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
