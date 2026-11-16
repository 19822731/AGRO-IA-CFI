import { RefreshCw } from "lucide-react"

interface MercadoInternoCardProps {
  precio: number
  cambio: number
  unidad: string
  isLoading?: boolean
}

export default function MercadoInternoCard({ precio, cambio, unidad, isLoading = false }: MercadoInternoCardProps) {
  return (
    <div className="bg-[#111936] rounded-lg p-6 border border-[#1a2040] mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-gray-300 text-sm mb-2">Precio del Azúcar</h2>
          <p className="text-gray-400 text-xs mb-3">Mercado interno (últimos 30 días)</p>

          <div className="flex items-baseline">
            {isLoading ? (
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-[#00a8ff] animate-spin mr-2" />
                <span className="text-gray-500">Cargando...</span>
              </div>
            ) : (
              <>
                <span className="text-[#00a8ff] text-4xl font-bold">$ {precio.toLocaleString("es-AR")}</span>
                <span className="ml-2 text-gray-400 text-sm">{unidad}</span>
              </>
            )}
          </div>

          {!isLoading && (
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-400 mr-1">vs. cierre anterior</span>
              <span
                className={`ml-2 text-sm px-2 py-0.5 rounded ${cambio >= 0 ? "bg-green-700 text-white" : "bg-red-700 text-white"}`}
              >
                {cambio >= 0 ? "↑" : "↓"} {Math.abs(cambio)}%
              </span>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400">Última actualización:</span>
          <p className="text-xs text-white">{isLoading ? "..." : new Date().toLocaleTimeString("es-AR")}</p>
        </div>
      </div>
    </div>
  )
}
