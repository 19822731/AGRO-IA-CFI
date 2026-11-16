export type EstadoHabilitacion = "habilitada" | "no-habilitada" | "en-proceso" | "desconocido"

export type EstadoConsolidacion =
  | "ingreso"
  | "pesaje-entrada"
  | "descarga-consolidacion"
  | "control-verificacion"
  | "documentacion"
  | "despacho"
  | "pesaje-salida"
  | "salida"
  | "completada"

export interface Mercancia {
  id: string
  descripcion: string
  cantidad: number
  unidad: string
  peso: number
  volumen: number
  valor: number
}

export interface Camion {
  patente: string
  conductor: string
  empresa: string
  pesoEntrada?: number
  pesoSalida?: number
}

export interface Documento {
  tipo: "manifiesto" | "bl" | "packing-list" | "precinto" | "otro"
  numero: string
  descripcion?: string
}

export interface Consolidacion {
  id: string
  fechaInicio: Date
  fechaFinalizacion: Date | null
  estado: EstadoConsolidacion
  camion: Camion
  mercancias: Mercancia[]
  documentos: Documento[]
  costoTotal: number
  pasos: {
    [key in EstadoConsolidacion]?: {
      completado: boolean
      fechaHora?: Date
      observaciones?: string
    }
  }
}

export interface ZonaPrimaria {
  estado: EstadoHabilitacion
  fechaHabilitacion?: Date
  fechaVencimiento?: Date
  requisitosCompletados: {
    delimitacion: boolean
    senalizacion: boolean
    iluminacion: boolean
    pisos: boolean
    seguridad: boolean
    oficinas: boolean
    servicios: boolean
    equipamiento: boolean
    espacioSuficiente: boolean
    areaInspeccion: boolean
    procedimientos: boolean
    registroOperaciones: boolean
    personalCapacitado: boolean
  }
  consolidaciones: Consolidacion[]
}
