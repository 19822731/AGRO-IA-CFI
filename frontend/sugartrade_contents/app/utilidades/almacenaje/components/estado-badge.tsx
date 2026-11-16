import type { CertificadoEstado, CertificadoTipo } from "../types"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, Truck, PackageCheck, Repeat } from "lucide-react"

interface EstadoBadgeProps {
  estado: CertificadoEstado
  className?: string
}

interface TipoBadgeProps {
  tipo: CertificadoTipo
  className?: string
}

export function EstadoBadge({ estado, className = "" }: EstadoBadgeProps) {
  const getEstadoConfig = (estado: CertificadoEstado) => {
    switch (estado) {
      case "disponible":
        return {
          bg: "bg-green-100 border-green-300 text-green-800",
          icon: <Check className="h-3.5 w-3.5 mr-1" />,
          text: "Disponible",
        }
      case "reservado":
        return {
          bg: "bg-amber-100 border-amber-300 text-amber-800",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
          text: "Reservado",
        }
      case "disponible-carga":
        return {
          bg: "bg-blue-100 border-blue-300 text-blue-800",
          icon: <Truck className="h-3.5 w-3.5 mr-1" />,
          text: "Disponible para Carga",
        }
      case "operacion-cargada":
        return {
          bg: "bg-purple-100 border-purple-300 text-purple-800",
          icon: <PackageCheck className="h-3.5 w-3.5 mr-1" />,
          text: "Operación Cargada",
        }
      default:
        return {
          bg: "bg-gray-100 border-gray-300 text-gray-800",
          icon: null,
          text: "Desconocido",
        }
    }
  }

  const config = getEstadoConfig(estado)

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${className} flex items-center gap-1 text-xs font-medium py-1 h-6`}
    >
      {config.icon}
      {config.text}
    </Badge>
  )
}

export function TipoBadge({ tipo, className = "" }: TipoBadgeProps) {
  if (tipo === "normal") {
    return (
      <Badge
        variant="outline"
        className={`bg-gray-100 border-gray-300 text-gray-800 ${className} text-xs font-medium py-1 h-6`}
      >
        Normal
      </Badge>
    )
  } else {
    return (
      <Badge
        variant="outline"
        className={`bg-indigo-100 border-indigo-300 text-indigo-800 ${className} flex items-center gap-1 text-xs font-medium py-1 h-6`}
      >
        <Repeat className="h-3.5 w-3.5 mr-1" />
        Para Canje
      </Badge>
    )
  }
}
