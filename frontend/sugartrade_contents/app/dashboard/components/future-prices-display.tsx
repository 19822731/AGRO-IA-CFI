"use client"

import { useAsync } from "@/hooks/use-async"

interface FuturePrice {
  month: string
  value: number
}

async function fetchFuturePrices(): Promise<FuturePrice[]> {
  const response = await fetch("/api/sugar-prices")
  if (!response.ok) {
    throw new Error(`Error al obtener precios futuros: ${response.status}`)
  }
  const data = await response.json()
  return data.futurePrices
}

export default function FuturePricesDisplay() {
  const { data: prices, error, isLoading, execute } = useAsync<FuturePrice[]>(fetchFuturePrices, true)

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <h3 className="text-cyan-500 flex items-center mb-4">
          <span className="mr-2">◻</span> Precios Futuros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-red-600 mb-2">Error al cargar precios futuros</h3>
        <button onClick={() => execute()} className="text-sm text-red-700 underline">
          Reintentar
        </button>
      </div>
    )
  }

  if (!prices || prices.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-yellow-600">No hay datos de precios futuros disponibles</h3>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-cyan-500 flex items-center mb-4">
        <span className="mr-2">◻</span> Precios Futuros
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {prices.map((price) => (
          <div key={price.month} className="border rounded-lg p-4">
            <div className="text-lg font-medium">{price.month}</div>
            <div className="text-cyan-500 text-2xl font-bold">
              {price.value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
