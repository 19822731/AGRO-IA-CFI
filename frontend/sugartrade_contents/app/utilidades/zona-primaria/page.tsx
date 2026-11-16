import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import ZonaPrimariaGestion from "./components/zona-primaria-gestion"

export default function ZonaPrimariaPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Zona Primaria y Consolidación</h1>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <ZonaPrimariaGestion />
      </Suspense>
    </div>
  )
}
