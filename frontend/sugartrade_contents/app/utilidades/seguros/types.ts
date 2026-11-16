export interface DatosCotizacion {
  tipoCultivo: string
  ubicacion: string
  superficie: number
  riesgos: string[]
}

export interface Cobertura {
  tipo: string
  porcentaje: number
}

export interface Cotizacion {
  id: string
  aseguradora: string
  precio: number
  precioPorHectarea: number
  calificacion: number
  coberturas: Cobertura[]
  deducible: number
  vigencia: number
  tiempoRespuesta: number
}

export interface SeguroContratado {
  id: string
  aseguradora: string
  tipoCultivo: string
  ubicacion: string
  superficie: number
  fechaInicio: string
  fechaFin: string
  estado: string
  precio: number
  poliza: string
  riesgos: string[]
}
