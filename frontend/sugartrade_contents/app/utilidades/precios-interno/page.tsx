import FormularioPrecioInterno from "./components/formulario-precio"
import TablaPreciosInternos from "./components/tabla-precios"

export const metadata = {
  title: "Precios del Mercado Interno | SugarTrade",
  description: "Gestión de precios del azúcar en el mercado interno",
}

export default function PreciosInternoPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <FormularioPrecioInterno />
        </div>
        <div className="w-full md:w-2/3">
          <TablaPreciosInternos />
        </div>
      </div>
    </div>
  )
}
