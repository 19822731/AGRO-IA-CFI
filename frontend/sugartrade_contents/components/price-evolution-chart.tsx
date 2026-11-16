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
  type ChartOptions,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

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
        borderColor: "#00a8ff",
        backgroundColor: "#00a8ff",
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
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 10,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 10,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(10, 15, 41, 0.9)",
        titleColor: "#00a8ff",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context) => `${context.parsed.y.toLocaleString("es-AR")} ${yAxisLabel}`,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
        borderColor: "#00a8ff",
        fill: false,
        backgroundColor: "#00a8ff",
      },
      point: {
        radius: 3,
        hitRadius: 10,
        hoverRadius: 5,
        backgroundColor: "#00a8ff",
        borderColor: "#0a0f29",
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  }

  return <Line ref={chartRef} options={options} data={chartData} />
}
