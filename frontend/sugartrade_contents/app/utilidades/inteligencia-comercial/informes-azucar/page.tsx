import { InformeAzucar } from "../components/informes-azucar/informe-azucar"

export const metadata = {
  title: "Informes de Producción de Azúcar | SugarTrade",
  description: "Informes detallados sobre la producción y exportación de azúcar en diferentes regiones del mundo",
}

export default function InformesAzucarPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Informes de Producción de Azúcar</h1>
      <p className="text-gray-500">
        Consulta informes detallados sobre la producción y exportación de azúcar en diferentes regiones del mundo.
      </p>
      <InformeAzucar />
    </div>
  )
}
