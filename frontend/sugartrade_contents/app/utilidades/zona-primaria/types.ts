export type EstadoHabilitacion = "habilitada" | "no_habilitada" | "en_proceso" | "desconocido"

export interface ZonaPrimaria {
  id: string
  nombre: string
  ubicacion: string
  estado: EstadoHabilitacion
  fechaHabilitacion?: Date
  numeroHabilitacion?: string
  responsable?: string
  observaciones?: string
}

export interface Camion {
  id: string
  patente: string
  chofer: string
  empresa: string
  pesoEntrada?: number
  pesoSalida?: number
  horaEntrada?: Date
  horaSalida?: Date
}

export interface Mercancia {
  id: string
  descripcion: string
  cantidad: number
  peso: number
  volumen?: number
  unidad: string
  origen?: string
  destino?: string
  documentos?: string[]
}

export interface Consolidacion {
  id: string
  zonaPrimariaId: string
  camion: Camion
  manifiestoNumero?: string
  documentoTransporte?: string
  mercancias: Mercancia[]
  estado: "pendiente" | "en_proceso" | "completada" | "cancelada"
  fechaInicio: Date
  fechaFinalizacion?: Date
  costoTotal: number
  costoDesglosado: {
    ingreso: number
    pesajeEntrada: number
    despacho: number
    pesajeSalida: number
    otros?: number
  }
  verificacionRealizada: boolean
  verificadoPor?: string
  documentosAdjuntos?: {
    listaCarga?: string
    precintos?: string[]
    otros?: string[]
  }
}

export interface PasoConsolidacion {
  id: string
  titulo: string
  descripcion: string
  completado: boolean
  fechaCompletado?: Date
  costo?: number
  observaciones?: string
}
