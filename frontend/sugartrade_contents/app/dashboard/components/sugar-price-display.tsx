"use client"

import { useAsync } from "@/hooks/use-async"

interface SugarPrice {
  value: number
  change: number
  timestamp: string
  currency: string
  unit: string
}

async function fetchCurrentPrice(): Promise<SugarPrice> {
  const response = await fetch("/api/sugar-prices")
  if (!response.ok) {
    throw new Error(`Error al obtener el precio: ${response.status}`)
  }
  const data = await response.json()
  return data.currentPrice
}

export default function SugarPriceDisplay() {
  const { data: price, error, isLoading, execute } = useAsync<SugarPrice>(fetchCurrentPrice, true)

  if (isLoading) {
    return (
      <div className="bg-green-50 p-4 rounded-lg h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando precios...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="text-red-600 mb-2">Error al cargar los precios</div>
        <button onClick={() => execute()} className="text-sm text-red-700 underline">
          Reintentar
        </button>
      </div>
    )
  }

  if (!price) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="text-yellow-600">No hay datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <div className="text-sm text-gray-600 mb-1">
        Precio Actual ({price.currency}/{price.unit})
      </div>
      <div className="flex items-baseline">
        <span className="text-cyan-500 text-4xl font-bold">
          $ {price.value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="flex items-center mt-2">
        <span className="text-sm text-gray-600 mr-1">vs.</span>
        <span className={`${price.change >= 0 ? "bg-green-500" : "bg-red-500"} text-white text-xs px-2 py-0.5 rounded`}>
          {price.change >= 0 ? "↑" : "↓"} {Math.abs(price.change).toFixed(2)}%
        </span>
        <span className="text-sm text-gray-600 ml-1">cierre anterior</span>
      </div>

      {/* Chart placeholder */}
      <div className="h-24 mt-4 flex items-end justify-between">
        <div className="w-1 h-12 bg-gray-200 rounded-t"></div>
        <div className="w-1 h-16 bg-gray-200 rounded-t"></div>
        <div className="w-1 h-8 bg-gray-200 rounded-t"></div>
        <div className="w-1 h-20 bg-gray-200 rounded-t"></div>
      </div>
    </div>
  )
}
