import GraficoPrecios from "./components/grafico-precios"
import HistorialOperaciones from "./components/historial-operaciones"
import CajaDePunta from "./components/caja-de-punta"

export default function OperarPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Operar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CajaDePunta />
        </div>
        <div className="lg:col-span-1">
          <GraficoPrecios />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <HistorialOperaciones />
      </div>
    </div>
  )
}
