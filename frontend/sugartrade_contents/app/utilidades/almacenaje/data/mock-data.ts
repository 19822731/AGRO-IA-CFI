import type { CertificadoDeposito, Warrant, Deposito, Ingenio, HistorialCertificado } from "../types"

// Datos de ejemplo de los depósitos
export const depositos: Deposito[] = [
  {
    id: "dep-001",
    nombre: "Depósito San Lorenzo",
    ubicacion: "San Lorenzo, Santa Fe",
    capacidad: 50000,
    capacidadDisponible: 15000,
    contacto: "Juan Pérez",
    telefono: "+54 341 555-1234",
    email: "contacto@depositosanlorenzo.com",
  },
  {
    id: "dep-002",
    nombre: "Depósito Rosario Norte",
    ubicacion: "Rosario, Santa Fe",
    capacidad: 75000,
    capacidadDisponible: 25000,
    contacto: "María González",
    telefono: "+54 341 555-5678",
    email: "contacto@rosarionorte.com",
  },
  {
    id: "dep-003",
    nombre: "Terminal Portuaria Tucumán",
    ubicacion: "San Miguel de Tucumán, Tucumán",
    capacidad: 60000,
    capacidadDisponible: 10000,
    contacto: "Roberto Fernández",
    telefono: "+54 381 555-9012",
    email: "contacto@terminaltucuman.com",
  },
  {
    id: "dep-004",
    nombre: "Centro Logístico Jujuy",
    ubicacion: "San Salvador de Jujuy, Jujuy",
    capacidad: 40000,
    capacidadDisponible: 20000,
    contacto: "Silvia Rodríguez",
    telefono: "+54 388 555-3456",
    email: "contacto@logisticajujuy.com",
  },
  {
    id: "dep-005",
    nombre: "Depósito Fiscal Salta",
    ubicacion: "Salta Capital, Salta",
    capacidad: 55000,
    capacidadDisponible: 5000,
    contacto: "Carlos López",
    telefono: "+54 387 555-7890",
    email: "contacto@depositofiscalsalta.com",
  },
]

// Datos de ejemplo de los ingenios
export const ingenios: Ingenio[] = [
  {
    id: "ing-001",
    nombre: "Ingenio Ledesma",
    ubicacion: "Libertador General San Martín, Jujuy",
    contacto: "Alberto Martínez",
    telefono: "+54 388 555-2345",
    email: "contacto@ingenioledesma.com",
  },
  {
    id: "ing-002",
    nombre: "Ingenio La Fronterita",
    ubicacion: "Famaillá, Tucumán",
    contacto: "Laura Sánchez",
    telefono: "+54 381 555-6789",
    email: "contacto@lafronterita.com",
  },
  {
    id: "ing-003",
    nombre: "Ingenio Concepción",
    ubicacion: "Banda del Río Salí, Tucumán",
    contacto: "Diego Gómez",
    telefono: "+54 381 555-0123",
    email: "contacto@ingenioconcepcion.com",
  },
  {
    id: "ing-004",
    nombre: "Ingenio San Martín del Tabacal",
    ubicacion: "Orán, Salta",
    contacto: "Patricia Díaz",
    telefono: "+54 387 555-4567",
    email: "contacto@martindeltabacal.com",
  },
  {
    id: "ing-005",
    nombre: "Ingenio Santa Bárbara",
    ubicacion: "Aguilares, Tucumán",
    contacto: "Hernán Fernández",
    telefono: "+54 381 555-8901",
    email: "contacto@ingeniosantabarbara.com",
  },
]

// Crear historial para los certificados
const generarHistorial = (certificadoId: string, estado: string): HistorialCertificado[] => {
  const fechaBase = new Date()
  fechaBase.setMonth(fechaBase.getMonth() - 2)

  const historial: HistorialCertificado[] = [
    {
      id: `hist-${certificadoId}-1`,
      fecha: new Date(fechaBase).toISOString(),
      estadoAnterior: null,
      estadoNuevo: "disponible",
      accion: "Creación del certificado",
      usuario: "Sistema",
    },
  ]

  if (estado !== "disponible") {
    fechaBase.setDate(fechaBase.getDate() + 15)
    historial.push({
      id: `hist-${certificadoId}-2`,
      fecha: new Date(fechaBase).toISOString(),
      estadoAnterior: "disponible",
      estadoNuevo: "reservado",
      accion: "Reserva para operación",
      usuario: "Juan Pérez",
    })
  }

  if (estado === "disponible-carga" || estado === "operacion-cargada") {
    fechaBase.setDate(fechaBase.getDate() + 5)
    historial.push({
      id: `hist-${certificadoId}-3`,
      fecha: new Date(fechaBase).toISOString(),
      estadoAnterior: "reservado",
      estadoNuevo: "disponible-carga",
      accion: "Disponible para carga",
      usuario: "María González",
    })
  }

  if (estado === "operacion-cargada") {
    fechaBase.setDate(fechaBase.getDate() + 3)
    historial.push({
      id: `hist-${certificadoId}-4`,
      fecha: new Date(fechaBase).toISOString(),
      estadoAnterior: "disponible-carga",
      estadoNuevo: "operacion-cargada",
      accion: "Operación cargada",
      usuario: "Roberto Fernández",
      notas: "Carga completada sin novedades",
    })
  }

  return historial
}

// Crear warrants de ejemplo
export const warrants: Warrant[] = [
  {
    id: "war-001",
    numero: "W-2024-001",
    bolsasTotal: 1200,
    fechaEmision: "2024-01-15",
    fechaVencimiento: "2024-07-15",
    estado: "activo",
    usuarioId: "user-123",
    certificados: ["cert-001", "cert-002"],
  },
  {
    id: "war-002",
    numero: "W-2024-002",
    bolsasTotal: 1800,
    fechaEmision: "2024-01-20",
    fechaVencimiento: "2024-07-20",
    estado: "activo",
    usuarioId: "user-123",
    certificados: ["cert-003", "cert-004", "cert-005"],
  },
  {
    id: "war-003",
    numero: "W-2024-003",
    bolsasTotal: 2400,
    fechaEmision: "2024-02-01",
    fechaVencimiento: "2024-08-01",
    estado: "activo",
    usuarioId: "user-123",
    certificados: ["cert-006", "cert-007", "cert-008", "cert-009"],
  },
  {
    id: "war-004",
    numero: "W-2023-120",
    bolsasTotal: 900,
    fechaEmision: "2023-12-10",
    fechaVencimiento: "2024-06-10",
    estado: "activo",
    usuarioId: "user-123",
    certificados: ["cert-010", "cert-011"],
  },
  {
    id: "war-005",
    numero: "W-2023-115",
    bolsasTotal: 600,
    fechaEmision: "2023-11-20",
    fechaVencimiento: "2024-05-20",
    estado: "vencido",
    usuarioId: "user-123",
    certificados: ["cert-012"],
  },
]

// Crear certificados de depósito de ejemplo
export const certificados: CertificadoDeposito[] = [
  // Certificados del warrant 1
  {
    id: "cert-001",
    numero: "CD-24-0001",
    codigoQR: "QR-CD-24-0001",
    bolsas: 600,
    ingenio: "Ingenio Ledesma",
    deposito: "Depósito San Lorenzo",
    estado: "disponible",
    tipo: "normal",
    fechaCreacion: "2024-01-15",
    fechaModificacion: "2024-01-15",
    warrantId: "war-001",
    usuarioId: "user-123",
    historial: generarHistorial("001", "disponible"),
  },
  {
    id: "cert-002",
    numero: "CD-24-0002",
    codigoQR: "QR-CD-24-0002",
    bolsas: 600,
    ingenio: "Ingenio Ledesma",
    deposito: "Depósito San Lorenzo",
    estado: "reservado",
    tipo: "normal",
    fechaCreacion: "2024-01-15",
    fechaModificacion: "2024-03-01",
    warrantId: "war-001",
    usuarioId: "user-123",
    historial: generarHistorial("002", "reservado"),
  },

  // Certificados del warrant 2
  {
    id: "cert-003",
    numero: "CD-24-0003",
    codigoQR: "QR-CD-24-0003",
    bolsas: 600,
    ingenio: "Ingenio La Fronterita",
    deposito: "Depósito Rosario Norte",
    estado: "disponible-carga",
    tipo: "canje",
    fechaCreacion: "2024-01-20",
    fechaModificacion: "2024-03-10",
    warrantId: "war-002",
    usuarioId: "user-123",
    historial: generarHistorial("003", "disponible-carga"),
  },
  {
    id: "cert-004",
    numero: "CD-24-0004",
    codigoQR: "QR-CD-24-0004",
    bolsas: 600,
    ingenio: "Ingenio La Fronterita",
    deposito: "Depósito Rosario Norte",
    estado: "operacion-cargada",
    tipo: "canje",
    fechaCreacion: "2024-01-20",
    fechaModificacion: "2024-03-15",
    warrantId: "war-002",
    usuarioId: "user-123",
    historial: generarHistorial("004", "operacion-cargada"),
  },
  {
    id: "cert-005",
    numero: "CD-24-0005",
    codigoQR: "QR-CD-24-0005",
    bolsas: 600,
    ingenio: "Ingenio La Fronterita",
    deposito: "Depósito Rosario Norte",
    estado: "disponible",
    tipo: "normal",
    fechaCreacion: "2024-01-20",
    fechaModificacion: "2024-01-20",
    warrantId: "war-002",
    usuarioId: "user-123",
    historial: generarHistorial("005", "disponible"),
  },

  // Certificados del warrant 3
  {
    id: "cert-006",
    numero: "CD-24-0006",
    codigoQR: "QR-CD-24-0006",
    bolsas: 600,
    ingenio: "Ingenio Concepción",
    deposito: "Terminal Portuaria Tucumán",
    estado: "disponible",
    tipo: "normal",
    fechaCreacion: "2024-02-01",
    fechaModificacion: "2024-02-01",
    warrantId: "war-003",
    usuarioId: "user-123",
    historial: generarHistorial("006", "disponible"),
  },
  {
    id: "cert-007",
    numero: "CD-24-0007",
    codigoQR: "QR-CD-24-0007",
    bolsas: 600,
    ingenio: "Ingenio Concepción",
    deposito: "Terminal Portuaria Tucumán",
    estado: "reservado",
    tipo: "canje",
    fechaCreacion: "2024-02-01",
    fechaModificacion: "2024-03-05",
    warrantId: "war-003",
    usuarioId: "user-123",
    historial: generarHistorial("007", "reservado"),
  },
  {
    id: "cert-008",
    numero: "CD-24-0008",
    codigoQR: "QR-CD-24-0008",
    bolsas: 600,
    ingenio: "Ingenio Concepción",
    deposito: "Terminal Portuaria Tucumán",
    estado: "disponible-carga",
    tipo: "canje",
    fechaCreacion: "2024-02-01",
    fechaModificacion: "2024-03-12",
    warrantId: "war-003",
    usuarioId: "user-123",
    historial: generarHistorial("008", "disponible-carga"),
  },
  {
    id: "cert-009",
    numero: "CD-24-0009",
    codigoQR: "QR-CD-24-0009",
    bolsas: 600,
    ingenio: "Ingenio Concepción",
    deposito: "Terminal Portuaria Tucumán",
    estado: "operacion-cargada",
    tipo: "canje",
    fechaCreacion: "2024-02-01",
    fechaModificacion: "2024-03-18",
    warrantId: "war-003",
    usuarioId: "user-123",
    historial: generarHistorial("009", "operacion-cargada"),
  },

  // Certificados del warrant 4
  {
    id: "cert-010",
    numero: "CD-23-0120",
    codigoQR: "QR-CD-23-0120",
    bolsas: 450,
    ingenio: "Ingenio San Martín del Tabacal",
    deposito: "Centro Logístico Jujuy",
    estado: "disponible",
    tipo: "normal",
    fechaCreacion: "2023-12-10",
    fechaModificacion: "2023-12-10",
    warrantId: "war-004",
    usuarioId: "user-123",
    historial: generarHistorial("010", "disponible"),
  },
  {
    id: "cert-011",
    numero: "CD-23-0121",
    codigoQR: "QR-CD-23-0121",
    bolsas: 450,
    ingenio: "Ingenio San Martín del Tabacal",
    deposito: "Centro Logístico Jujuy",
    estado: "disponible",
    tipo: "normal",
    fechaCreacion: "2023-12-10",
    fechaModificacion: "2023-12-10",
    warrantId: "war-004",
    usuarioId: "user-123",
    historial: generarHistorial("011", "disponible"),
  },

  // Certificado del warrant 5
  {
    id: "cert-012",
    numero: "CD-23-0115",
    codigoQR: "QR-CD-23-0115",
    bolsas: 600,
    ingenio: "Ingenio Santa Bárbara",
    deposito: "Depósito Fiscal Salta",
    estado: "disponible",
    tipo: "normal",
    fechaCreacion: "2023-11-20",
    fechaModificacion: "2023-11-20",
    warrantId: "war-005",
    usuarioId: "user-123",
    historial: generarHistorial("012", "disponible"),
  },
]
