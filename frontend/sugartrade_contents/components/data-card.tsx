import type React from "react"
import { RefreshCw } from "lucide-react"

interface DataCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
  isLoading?: boolean
}

export default function DataCard({ title, value, subtitle, trend, icon, isLoading = false }: DataCardProps) {
  return (
    <div className="bg-[#111936] rounded-lg p-6 border border-[#1a2040] hover:border-[#00a8ff] transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-gray-400 text-sm mb-2">{title}</h2>
          <div className="flex items-baseline">
            {isLoading ? (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 text-[#00a8ff] animate-spin mr-2" />
                <span className="text-gray-500">Cargando...</span>
              </div>
            ) : (
              <>
                <span className="text-[#00a8ff] text-2xl font-bold">{value}</span>
                {trend && (
                  <span className={`ml-2 text-sm ${trend.isPositive ? "text-green-500" : "text-red-500"}`}>
                    {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                  </span>
                )}
              </>
            )}
          </div>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-[#00a8ff]">{icon}</div>}
      </div>
    </div>
  )
}
