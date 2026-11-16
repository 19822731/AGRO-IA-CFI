import type { Metadata } from "next"
import MapaZafra2016 from "../components/analisis-historico/mapa-zafra-2016"
import AnalisisZafra2016 from "../components/analisis-historico/analisis-zafra-2016"
import AnalisisIAHistorico from "../components/analisis-historico/analisis-ia-historico"

export const metadata: Metadata = {
  title: "Análisis Histórico | Inteligencia Comercial",
  description: "Análisis histórico de datos de producción de caña de azúcar en la Provincia de Tucumán",
}

export default function AnalisisHistoricoPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análisis Histórico</h1>
        <p className="text-muted-foreground mt-2">
          Visualización y análisis de datos históricos de producción de caña de azúcar en la Provincia de Tucumán.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <MapaZafra2016 />
        <AnalisisZafra2016 />
        <AnalisisIAHistorico />
      </div>
    </div>
  )
}
