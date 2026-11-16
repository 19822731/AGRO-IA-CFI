"use client"

import { useEffect, useRef } from "react"
import { formatCurrency } from "@/lib/utils"

interface ChartData {
  mes: string
  sgr: number
  echeqs: number
  agroinsumos: number
  preventa: number
}

interface FinanciamientoChartProps {
  data: ChartData[]
}

export function FinanciamientoChart({ data }: FinanciamientoChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar el tamaño del canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Configuración del gráfico
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Calcular el valor máximo para la escala
    const maxValue = Math.max(...data.map((d) => d.sgr + d.echeqs + d.agroinsumos + d.preventa))
    const roundedMaxValue = Math.ceil(maxValue / 10000000) * 10000000

    // Dibujar ejes
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, padding.top + chartHeight)
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.strokeStyle = "#d1d5db" // gray-300
    ctx.stroke()

    // Dibujar líneas de cuadrícula horizontales y etiquetas del eje Y
    const numYTicks = 5
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.font = "12px sans-serif"
    ctx.fillStyle = "#6b7280" // gray-500

    for (let i = 0; i <= numYTicks; i++) {
      const y = padding.top + chartHeight - (i / numYTicks) * chartHeight
      const value = (i / numYTicks) * roundedMaxValue

      // Línea de cuadrícula
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.strokeStyle = "#e5e7eb" // gray-200
      ctx.stroke()

      // Etiqueta del eje Y
      ctx.fillText(formatCurrency(value, 0), padding.left - 10, y)
    }

    // Dibujar etiquetas del eje X
    const barWidth = chartWidth / data.length
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    data.forEach((d, i) => {
      const x = padding.left + i * barWidth + barWidth / 2
      ctx.fillText(d.mes, x, padding.top + chartHeight + 10)
    })

    // Dibujar barras apiladas
    const barPadding = barWidth * 0.15
    const actualBarWidth = barWidth - 2 * barPadding

    data.forEach((d, i) => {
      const x = padding.left + i * barWidth + barPadding
      let y = padding.top + chartHeight

      // Barra para SGR
      const sgrHeight = (d.sgr / roundedMaxValue) * chartHeight
      ctx.fillStyle = "#3b82f6" // blue-500
      ctx.fillRect(x, y - sgrHeight, actualBarWidth, sgrHeight)
      y -= sgrHeight

      // Barra para eCheqs
      const echeqsHeight = (d.echeqs / roundedMaxValue) * chartHeight
      ctx.fillStyle = "#10b981" // green-500
      ctx.fillRect(x, y - echeqsHeight, actualBarWidth, echeqsHeight)
      y -= echeqsHeight

      // Barra para Agroinsumos
      const agroinsumoHeight = (d.agroinsumos / roundedMaxValue) * chartHeight
      ctx.fillStyle = "#f59e0b" // yellow-500
      ctx.fillRect(x, y - agroinsumoHeight, actualBarWidth, agroinsumoHeight)
      y -= agroinsumoHeight

      // Barra para Pre-Venta
      const preventaHeight = (d.preventa / roundedMaxValue) * chartHeight
      ctx.fillStyle = "#8b5cf6" // purple-500
      ctx.fillRect(x, y - preventaHeight, actualBarWidth, preventaHeight)
    })

    // Dibujar leyenda
    const legendItems = [
      { label: "SGR", color: "#3b82f6" },
      { label: "eCheqs", color: "#10b981" },
      { label: "Agroinsumos", color: "#f59e0b" },
      { label: "Pre-Venta", color: "#8b5cf6" },
    ]

    const legendX = padding.left
    const legendY = padding.top - 10
    const legendItemWidth = 80

    legendItems.forEach((item, i) => {
      const x = legendX + i * legendItemWidth

      // Cuadrado de color
      ctx.fillStyle = item.color
      ctx.fillRect(x, legendY, 12, 12)

      // Etiqueta
      ctx.fillStyle = "#6b7280" // gray-500
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(item.label, x + 16, legendY + 6)
    })
  }, [data])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
