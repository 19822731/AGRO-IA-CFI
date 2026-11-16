// Estado posible de un certificado de depósito
export type CertificadoEstado = "disponible" | "reservado" | "disponible-carga" | "operacion-cargada"

// Tipo de certificado
export type CertificadoTipo = "normal" | "canje"

// Estructura del certificado de depósito
export interface CertificadoDeposito {
  id: string // ID único del certificado
  numero: string // Número único del certificado
  codigoQR: string // Código QR único
  bolsas: number // Número de bolsas (BLS)
  ingenio: string // Ingenio productor
  deposito: string // Depósito de almacenamiento
  estado: CertificadoEstado // Estado del certificado
  tipo: CertificadoTipo // Tipo de certificado
  fechaCreacion: string // Fecha de creación
  fechaModificacion: string // Fecha de última modificación
  warrantId: string // ID del warrant al que pertenece
  usuarioId: string // ID del usuario propietario
  historial: HistorialCertificado[] // Historial de cambios
}

// Historial de cambios en un certificado
export interface HistorialCertificado {
  id: string
  fecha: string
  estadoAnterior: CertificadoEstado | null
  estadoNuevo: CertificadoEstado
  accion: string
  usuario: string
  notas?: string
}

// Estructura del warrant
export interface Warrant {
  id: string // ID único del warrant
  numero: string // Número único del warrant
  bolsasTotal: number // Total de bolsas en el warrant
  fechaEmision: string // Fecha de emisión
  fechaVencimiento: string // Fecha de vencimiento
  estado: "activo" | "vencido" | "cancelado" // Estado del warrant
  usuarioId: string // ID del usuario propietario
  certificados: string[] // IDs de los certificados asociados
}

// Depósito físico donde se almacena el azúcar
export interface Deposito {
  id: string
  nombre: string
  ubicacion: string
  capacidad: number
  capacidadDisponible: number
  contacto: string
  telefono: string
  email: string
}

// Ingenio productor del azúcar
export interface Ingenio {
  id: string
  nombre: string
  ubicacion: string
  contacto: string
  telefono: string
  email: string
}

// Filtros para buscar warrants y certificados
export interface FiltrosAlmacenaje {
  numero?: string
  deposito?: string
  ingenio?: string
  estado?: CertificadoEstado
  tipo?: CertificadoTipo
  fechaDesde?: string
  fechaHasta?: string
}
