export type TipoUsuario = "productor" | "inversor"
export type TipoContrato = "contrato5" | "contrato11"
export type TipoOrden = "mercado" | "limite" | "stop-loss" | "take-profit"
export type EstadoOrden = "pendiente" | "ejecutada" | "cancelada" | "expirada"

export interface DatosContrato {
  id: string
  nombre: string
  precioActual: number
  fechaVencimiento: string
  variacion: number
  descripcion: string
  tamanoContrato: number // Tamaño del contrato en unidades (toneladas)
}

export interface OrdenCobertura {
  id: string
  tipoContrato: TipoContrato
  tipoOrden: TipoOrden
  cantidad: number
  precio?: number // Solo para órdenes límite
  precioStopLoss?: number // Precio para Stop-Loss
  precioTakeProfit?: number // Precio para Take-Profit
  valorNocional: number
  estado: EstadoOrden
  fechaCreacion: Date
  fechaEjecucion?: Date
  posicionId?: string // Referencia a la posición asociada
}

export interface PosicionPortafolio {
  id: string
  tipoContrato: TipoContrato
  cantidad: number
  precioEntrada: number
  valorEntrada: number
  fechaApertura: Date
  ordenesAsociadas: OrdenCobertura[] // Órdenes de Stop-Loss y Take-Profit asociadas
  estado: "abierta" | "cerrada"
  fechaCierre?: Date
  precioCierre?: number
  gananciaPercentage?: number
  gananciaValor?: number
}
