import { Suspense } from "react"
import { CoberturaIntroduccion } from "./components/cobertura-introduccion"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const metadata = {
  title: "Cobertura | Sugar Trade",
  description: "Protege el precio futuro de tu producción de azúcar o invierte en el mercado de futuros",
}

export default function CoberturaPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Cobertura</h1>
      <p className="text-muted-foreground">
        Protege el precio futuro de tu producción o invierte en el mercado de futuros de azúcar
      </p>

      <Suspense fallback={<LoadingSpinner />}>
        <CoberturaIntroduccion />
      </Suspense>
    </div>
  )
}
