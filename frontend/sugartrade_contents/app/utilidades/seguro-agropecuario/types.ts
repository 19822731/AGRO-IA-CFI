export interface Cotizacion {
  id: string
  aseguradora: string
  precio: number
  cobertura: string[]
  plazo: string
  deducible: string
  calificacion: number
}

export interface DatosCotizacion {
  tipoCultivo: string
  ubicacion: string
  superficie: number
  riesgos: string[]
}
