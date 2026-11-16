"use client"

import { useRef } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface PriceEvolutionChartProps {
  data: {
    fecha: string
    precio: number
  }[]
  yAxisLabel?: string
}

export default function PriceEvolutionChart({ data, yAxisLabel = "centavos/libra" }: PriceEvolutionChartProps) {
  const chartRef = useRef<ChartJS>(null)

  // Formatear fechas para mostrar solo el día y mes
  const labels = data.map((item) => {
    const fecha = new Date(item.fecha)
    return `${fecha.getDate()} ${fecha.toLocaleString("es", { month: "short" })}`
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: "Precio",
        data: data.map((item) => item.precio),
        borderColor: "#4285F4",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 300)
          gradient.addColorStop(0, "rgba(66, 133, 244, 0.5)")
          gradient.addColorStop(1, "rgba(66, 133, 244, 0)")
          return gradient
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#050505",
        pointBorderColor: "#4285F4",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
          font: {
            family: "'Outfit', sans-serif",
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
          font: {
            family: "'Outfit', sans-serif",
            size: 11,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(10, 15, 41, 0.8)",
        titleColor: "#4285F4",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: {
          family: "'Outfit', sans-serif",
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          family: "'Outfit', sans-serif",
          size: 12,
        },
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context) => `${context.parsed.y.toLocaleString("es-AR")} ${yAxisLabel}`,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  }

  return <Line ref={chartRef} options={options} data={chartData} />
}
