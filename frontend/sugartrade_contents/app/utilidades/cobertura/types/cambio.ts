export type TipoOperacionCambio = "exportacion" | "importacion" | "otro"

export interface InstrumentoCambio {
  id: string
  fechaVencimiento: string
  tipoCambioFijado: number
  costoCobertura: number
}

export interface CoberturaCambioData {
  id: string
  tipoOperacion: TipoOperacionCambio
  montoDolares: number
  fechaNecesidad: string
  instrumentoSeleccionado: InstrumentoCambio
  fechaContratacion: Date
  estado: "activa" | "vencida" | "liquidada"
}
