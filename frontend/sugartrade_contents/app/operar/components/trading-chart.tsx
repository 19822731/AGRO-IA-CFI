"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  type ChartOptions,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface TradingChartProps {
  contractType: "contrato5" | "contrato11" | "mercadoInterno"
}

export default function TradingChart({ contractType }: TradingChartProps) {
  const [timeframe, setTimeframe] = useState("1D")
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    // Generar datos simulados para el gráfico
    const generateChartData = () => {
      const basePrice = contractType === "contrato5" ? 19.75 : contractType === "contrato11" ? 16.8 : 4275.5

      const dataPoints = timeframe === "1D" ? 24 : timeframe === "1S" ? 7 : timeframe === "1M" ? 30 : 90

      const labels = []
      const data = []

      // Generar etiquetas de tiempo
      for (let i = 0; i < dataPoints; i++) {
        if (timeframe === "1D") {
          labels.push(`${i}:00`)
        } else if (timeframe === "1S") {
          const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
          labels.push(days[i % 7])
        } else {
          labels.push(`Día ${i + 1}`)
        }
      }

      // Generar precios simulados
      let price = basePrice
      for (let i = 0; i < dataPoints; i++) {
        // Añadir algo de volatilidad
        const change = (Math.random() - 0.5) * (basePrice * 0.02)
        price += change

        // Asegurar que el precio no baje demasiado
        if (price < basePrice * 0.8) price = basePrice * 0.8
        if (price > basePrice * 1.2) price = basePrice * 1.2

        data.push(price)
      }

      return {
        labels,
        datasets: [
          {
            label: contractType === "mercadoInterno" ? "Precio (ARS/bolsa 50kg)" : "Precio (centavos/libra)",
            data,
            borderColor: "#00a8ff",
            backgroundColor: "rgba(0, 168, 255, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      }
    }

    const data = generateChartData()
    setChartData(data)
    setLoading(false)
  }, [contractType, timeframe])

  const chartOptions: ChartOptions<"line"> = {
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
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  }

  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white">Gráfico Intradía</CardTitle>
        <div className="flex space-x-2">
          <TabsList className="bg-[#0a0f29]">
            <TabsTrigger
              value="1D"
              onClick={() => setTimeframe("1D")}
              className={timeframe === "1D" ? "bg-[#1a2040] text-[#00a8ff]" : "text-gray-400"}
            >
              1D
            </TabsTrigger>
            <TabsTrigger
              value="1S"
              onClick={() => setTimeframe("1S")}
              className={timeframe === "1S" ? "bg-[#1a2040] text-[#00a8ff]" : "text-gray-400"}
            >
              1S
            </TabsTrigger>
            <TabsTrigger
              value="1M"
              onClick={() => setTimeframe("1M")}
              className={timeframe === "1M" ? "bg-[#1a2040] text-[#00a8ff]" : "text-gray-400"}
            >
              1M
            </TabsTrigger>
            <TabsTrigger
              value="3M"
              onClick={() => setTimeframe("3M")}
              className={timeframe === "3M" ? "bg-[#1a2040] text-[#00a8ff]" : "text-gray-400"}
            >
              3M
            </TabsTrigger>
          </TabsList>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
