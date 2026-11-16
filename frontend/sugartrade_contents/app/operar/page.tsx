import GraficoPrecios from "./components/grafico-precios"
import HistorialOperaciones from "./components/historial-operaciones"
import CajaDePunta from "./components/caja-de-punta"
import PriceDisplay from "./components/price-display"
import MarketTrades from "./components/market-trades"

export default function OperarPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Operar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Columna Izquierda: Precios y Caja de Punta (Más ancha) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <PriceDisplay />
          <CajaDePunta />
        </div>

        {/* Columna Derecha: Operaciones y Gráfico (Apilados) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <MarketTrades />
          <GraficoPrecios />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <HistorialOperaciones />
      </div>
    </div>
  )
}
