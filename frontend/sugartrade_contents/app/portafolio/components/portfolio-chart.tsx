"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function PortfolioChart() {
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    // Generar datos simulados para el gráfico
    const generateChartData = () => {
      const months = ["Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const portfolioValues = [4200000, 4350000, 4100000, 4500000, 4650000, 4850000]

      return {
        labels: months,
        datasets: [
          {
            label: "Valor del Portafolio (ARS)",
            data: portfolioValues,
            borderColor: "#00a8ff",
            backgroundColor: "rgba(0, 168, 255, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      }
    }

    setChartData(generateChartData())
  }, [])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: (value: any) => "$ " + (value / 1000000).toFixed(1) + "M",
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
        callbacks: {
          label: (context: any) => "$ " + context.raw.toLocaleString("es-AR"),
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  }

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
      </div>
    )
  }

  return <Line data={chartData} options={chartOptions} />
}
