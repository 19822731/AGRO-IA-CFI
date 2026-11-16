"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Chart from "chart.js/auto"

// Datos simulados para el gráfico (30 días)
const generateChartData = () => {
  const labels = []
  const data = []

  // Generar fechas para los últimos 30 días
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const day = date.getDate()
    const month = date.toLocaleString("es", { month: "short" })
    labels.push(`${day} ${month}`)

    // Generar precio aleatorio entre 4125 y 4225
    const basePrice = 4125
    const randomVariation = Math.sin(i * 0.5) * 50 + Math.random() * 20
    data.push(basePrice + randomVariation)
  }

  return { labels, data }
}

export default function EvolucionPrecio() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        // Destruir el gráfico anterior si existe
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        const { labels, data } = generateChartData()

        // Crear nuevo gráfico
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Precio (ARS)",
                data,
                borderColor: "rgb(56, 189, 248)",
                backgroundColor: "rgba(56, 189, 248, 0.1)",
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: "rgb(56, 189, 248)",
                pointBorderColor: "rgb(56, 189, 248)",
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                mode: "index",
                intersect: false,
                backgroundColor: "rgb(30, 41, 59)",
                titleColor: "rgb(56, 189, 248)",
                bodyColor: "rgb(226, 232, 240)",
                borderColor: "rgb(71, 85, 105)",
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                grid: {
                  color: "rgba(71, 85, 105, 0.2)",
                },
                ticks: {
                  color: "rgb(148, 163, 184)",
                },
              },
              y: {
                grid: {
                  color: "rgba(71, 85, 105, 0.2)",
                },
                ticks: {
                  color: "rgb(148, 163, 184)",
                },
              },
            },
            interaction: {
              mode: "index",
              intersect: false,
            },
          },
        })
      }
    }

    // Limpiar al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-foreground">Evolución del Precio</CardTitle>
          <p className="text-muted-foreground">Precio del azúcar en el mercado interno (últimos 30 días)</p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <canvas ref={chartRef}></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
