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

export default function DataCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  isLoading = false,
}: DataCardProps) {

  return (
    <div className="bg-[#111936] rounded-lg p-6 border border-[#1a2040] hover:border-[#00a8ff]/30 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-widest">{title}</h2>
          <div className="flex items-baseline">
            {isLoading ? (
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 animate-spin mr-2 text-[#00a8ff]" />
                <span className="text-gray-500">Cargando...</span>
              </div>
            ) : (
              <>
                <span className="text-white text-3xl font-bold tracking-tight">{value}</span>
                {trend && (
                  <span className={`ml-3 text-sm font-bold px-2 py-0.5 rounded-full ${trend.isPositive ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                    {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                  </span>
                )}
              </>
            )}
          </div>
          {subtitle && <p className="text-gray-400 text-xs mt-2 font-medium">{subtitle}</p>}
        </div>
        {icon && <div className="p-3 rounded-xl transition-colors bg-[#00a8ff]/10 text-[#00a8ff] group-hover:scale-110 duration-300">{icon}</div>}
      </div>
    </div>
  )
}
