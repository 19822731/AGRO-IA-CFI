import { NormalesClimaticas } from "./normales-climaticas"
import { CorrelacionesClimaAzucar } from "./correlaciones-clima-azucar"
import { TemperaturaArgentina } from "./temperatura-argentina"
import { ModeloPredictivo } from "./modelo-predictivo"

export default function AnalisisClimatico() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Análisis Climático</h1>
      <p className="text-lg text-muted-foreground">
        Análisis de datos climáticos históricos y su relación con el mercado del azúcar
      </p>

      <TemperaturaArgentina />

      <NormalesClimaticas />

      <CorrelacionesClimaAzucar />

      <ModeloPredictivo />
    </div>
  )
}
