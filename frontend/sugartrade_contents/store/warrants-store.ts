"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type WarrantStatus = "pendiente" | "activo" | "vencido" | "canjeado"
export type CertificadoStatus = "disponible" | "en_proceso" | "utilizado" | "canjeado"
export type ProductoType = "azucar_blanco" | "azucar_crudo" | "azucar_organico"
export type OperacionType = "compra" | "venta" | "canje" | "ingreso" | "retiro"

export interface Warrant {
  id: string
  numero: string
  fecha: string
  producto: ProductoType
  cantidad: number
  deposito: string
  estado: WarrantStatus
  valor: number
  propietario: string
  fechaVencimiento?: string
}

export interface Certificado {
  id: string
  numero: string
  fecha: string
  tipo: "canje" | "deposito"
  producto: ProductoType
  cantidad: number
  estado: CertificadoStatus
  warrantId: string
  valor: number
}

export interface Movimiento {
  id: string
  fecha: string
  documentoId: string
  documentoTipo: "warrant" | "certificado" | "operacion" | "canje" | "almacenaje"
  accion: "creacion" | "actualizacion" | "transferencia" | "canje" | "compra" | "venta" | "ingreso" | "retiro"
  usuario: string
  detalles: string
  monto?: number
}

export interface Operacion {
  id: string
  fecha: string
  tipo: OperacionType
  producto: ProductoType
  cantidad: number
  precio: number
  monto: number
  contraparte: string
  estado: "pendiente" | "completada" | "cancelada"
  documentosRelacionados?: string[] // IDs de warrants o certificados relacionados
}

export interface Deposito {
  id: string
  nombre: string
  ubicacion: string
  capacidadTotal: number
  ocupacionActual: number
  productos: {
    [key in ProductoType]?: number
  }
}

interface WarrantsState {
  warrants: Warrant[]
  certificados: Certificado[]
  movimientos: Movimiento[]
  operaciones: Operacion[]
  depositos: Deposito[]
  estadisticas: {
    warrants: { valor: number; subtexto: string }
    certificados: { valor: number; subtexto: string }
    bolsas: { valor: number; subtexto: string }
    certificadosCanje: { valor: number; subtexto: string }
    operacionesMes: { valor: number; subtexto: string }
    valorPortafolio: { valor: number; subtexto: string }
  }

  // Acciones para Warrants y Certificados
  addWarrant: (warrant: Omit<Warrant, "id">) => string
  updateWarrant: (id: string, data: Partial<Warrant>) => void
  addCertificado: (certificado: Omit<Certificado, "id">) => string
  updateCertificado: (id: string, data: Partial<Certificado>) => void
  transferirWarrant: (warrantId: string, nuevoPropietario: string) => void
  utilizarCertificado: (certificadoId: string) => void

  // Acciones para Operaciones
  registrarOperacion: (operacion: Omit<Operacion, "id">) => string
  completarOperacion: (operacionId: string) => void
  cancelarOperacion: (operacionId: string) => void

  // Acciones para Canje
  realizarCanje: (certificadoId: string, warrantId: string) => void

  // Acciones para Almacenaje
  ingresarProducto: (deposito: string, producto: ProductoType, cantidad: number, valor: number) => string
  retirarProducto: (warrantId: string, cantidad: number) => void

  // Acciones para Movimientos
  addMovimiento: (movimiento: Omit<Movimiento, "id">) => void

  // Cálculos y estadísticas
  calcularEstadisticas: () => void
}

// Verificar si estamos en el cliente
const isClient = typeof window !== "undefined"

export const useWarrantsStore = create<WarrantsState>()(
  persist(
    (set, get) => ({
      warrants: [
        {
          id: "w1",
          numero: "W-1001",
          fecha: "01/03/2025",
          producto: "azucar_blanco",
          cantidad: 100,
          deposito: "Depósito Central",
          estado: "activo",
          valor: 50000,
          propietario: "Usuario Principal",
          fechaVencimiento: "01/03/2026",
        },
        {
          id: "w2",
          numero: "W-1002",
          fecha: "02/03/2025",
          producto: "azucar_crudo",
          cantidad: 200,
          deposito: "Depósito Norte",
          estado: "pendiente",
          valor: 90000,
          propietario: "Usuario Principal",
          fechaVencimiento: "02/03/2026",
        },
        {
          id: "w3",
          numero: "W-1003",
          fecha: "03/03/2025",
          producto: "azucar_organico",
          cantidad: 150,
          deposito: "Depósito Sur",
          estado: "activo",
          valor: 75000,
          propietario: "Usuario Secundario",
          fechaVencimiento: "03/03/2026",
        },
      ],
      certificados: [
        {
          id: "c1",
          numero: "CD-2001",
          fecha: "05/03/2025",
          tipo: "deposito",
          producto: "azucar_blanco",
          cantidad: 100,
          estado: "disponible",
          warrantId: "w1",
          valor: 50000,
        },
        {
          id: "c2",
          numero: "CD-2002",
          fecha: "06/03/2025",
          tipo: "canje",
          producto: "azucar_crudo",
          cantidad: 200,
          estado: "en_proceso",
          warrantId: "w2",
          valor: 90000,
        },
      ],
      movimientos: [
        {
          id: "m1",
          fecha: "01/03/2025",
          documentoId: "w1",
          documentoTipo: "warrant",
          accion: "creacion",
          usuario: "Usuario Principal",
          detalles: "Creación de warrant",
        },
        {
          id: "m2",
          fecha: "05/03/2025",
          documentoId: "c1",
          documentoTipo: "certificado",
          accion: "creacion",
          usuario: "Usuario Principal",
          detalles: "Creación de certificado de depósito",
        },
      ],
      operaciones: [
        {
          id: "op1",
          fecha: "10/03/2025",
          tipo: "compra",
          producto: "azucar_blanco",
          cantidad: 50,
          precio: 500,
          monto: 25000,
          contraparte: "Proveedor A",
          estado: "completada",
          documentosRelacionados: ["w1"],
        },
        {
          id: "op2",
          fecha: "15/03/2025",
          tipo: "venta",
          producto: "azucar_crudo",
          cantidad: 30,
          precio: 450,
          monto: 13500,
          contraparte: "Cliente B",
          estado: "pendiente",
        },
      ],
      depositos: [
        {
          id: "d1",
          nombre: "Depósito Central",
          ubicacion: "Tucumán",
          capacidadTotal: 10000,
          ocupacionActual: 6500,
          productos: {
            azucar_blanco: 3000,
            azucar_crudo: 2000,
            azucar_organico: 1500,
          },
        },
        {
          id: "d2",
          nombre: "Depósito Norte",
          ubicacion: "Salta",
          capacidadTotal: 8000,
          ocupacionActual: 3360,
          productos: {
            azucar_blanco: 1500,
            azucar_crudo: 1860,
          },
        },
        {
          id: "d3",
          nombre: "Depósito Sur",
          ubicacion: "Santiago del Estero",
          capacidadTotal: 12000,
          ocupacionActual: 9360,
          productos: {
            azucar_blanco: 3000,
            azucar_crudo: 3500,
            azucar_organico: 2860,
          },
        },
      ],
      estadisticas: {
        warrants: { valor: 3, subtexto: "Total: 3" },
        certificados: { valor: 2, subtexto: "Disponibles: 1" },
        bolsas: { valor: 450, subtexto: "BLS" },
        certificadosCanje: { valor: 1, subtexto: "Disponibles para canje" },
        operacionesMes: { valor: 2, subtexto: "En el último mes" },
        valorPortafolio: { valor: 215000, subtexto: "Valor total" },
      },

      // Acciones para Warrants y Certificados
      addWarrant: (warrant) => {
        const id = `w${Date.now()}`
        set((state) => ({
          warrants: [...state.warrants, { ...warrant, id }],
        }))
        get().calcularEstadisticas()
        return id
      },

      updateWarrant: (id, data) => {
        set((state) => ({
          warrants: state.warrants.map((w) => (w.id === id ? { ...w, ...data } : w)),
        }))
        get().calcularEstadisticas()
      },

      addCertificado: (certificado) => {
        const id = `c${Date.now()}`
        set((state) => ({
          certificados: [...state.certificados, { ...certificado, id }],
        }))
        get().calcularEstadisticas()
        return id
      },

      updateCertificado: (id, data) => {
        set((state) => ({
          certificados: state.certificados.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }))
        get().calcularEstadisticas()
      },

      transferirWarrant: (warrantId, nuevoPropietario) => {
        get().updateWarrant(warrantId, { propietario: nuevoPropietario })
        get().addMovimiento({
          fecha: new Date().toLocaleDateString("es-AR"),
          documentoId: warrantId,
          documentoTipo: "warrant",
          accion: "transferencia",
          usuario: "Usuario Actual",
          detalles: `Transferido a ${nuevoPropietario}`,
        })
      },

      utilizarCertificado: (certificadoId) => {
        get().updateCertificado(certificadoId, { estado: "utilizado" })
        get().addMovimiento({
          fecha: new Date().toLocaleDateString("es-AR"),
          documentoId: certificadoId,
          documentoTipo: "certificado",
          accion: "actualizacion",
          usuario: "Usuario Actual",
          detalles: "Certificado utilizado",
        })
      },

      // Acciones para Operaciones
      registrarOperacion: (operacion) => {
        const id = `op${Date.now()}`
        set((state) => ({
          operaciones: [...state.operaciones, { ...operacion, id }],
        }))

        // Registrar el movimiento
        get().addMovimiento({
          fecha: new Date().toLocaleDateString("es-AR"),
          documentoId: id,
          documentoTipo: "operacion",
          accion: operacion.tipo === "compra" ? "compra" : "venta",
          usuario: "Usuario Actual",
          detalles: `${operacion.tipo === "compra" ? "Compra" : "Venta"} de ${operacion.cantidad} BLS de ${formatProducto(operacion.producto)}`,
          monto: operacion.monto,
        })

        // Si la operación es de tipo compra y está completada, crear warrant y certificado
        if (operacion.tipo === "compra" && operacion.estado === "completada") {
          // Buscar un depósito con capacidad
          const deposito = get().depositos.find((d) => d.capacidadTotal - d.ocupacionActual >= operacion.cantidad)

          if (deposito) {
            // Crear warrant y certificado
            get().ingresarProducto(deposito.nombre, operacion.producto, operacion.cantidad, operacion.monto)
          }
        }

        get().calcularEstadisticas()
        return id
      },

      completarOperacion: (operacionId) => {
        const operacion = get().operaciones.find((op) => op.id === operacionId)
        if (!operacion) return

        set((state) => ({
          operaciones: state.operaciones.map((op) => (op.id === operacionId ? { ...op, estado: "completada" } : op)),
        }))

        // Si es una compra, crear warrant y certificado
        if (operacion.tipo === "compra") {
          // Buscar un depósito con capacidad
          const deposito = get().depositos.find((d) => d.capacidadTotal - d.ocupacionActual >= operacion.cantidad)

          if (deposito) {
            // Crear warrant y certificado
            const warrantId = get().ingresarProducto(
              deposito.nombre,
              operacion.producto,
              operacion.cantidad,
              operacion.monto,
            )

            // Actualizar la operación con el documento relacionado
            set((state) => ({
              operaciones: state.operaciones.map((op) =>
                op.id === operacionId
                  ? {
                      ...op,
                      documentosRelacionados: [...(op.documentosRelacionados || []), warrantId],
                    }
                  : op,
              ),
            }))
          }
        }

        // Si es una venta, actualizar el warrant correspondiente
        if (operacion.tipo === "venta" && operacion.documentosRelacionados?.length) {
          const warrantId = operacion.documentosRelacionados[0]
          const warrant = get().warrants.find((w) => w.id === warrantId)

          if (warrant) {
            // Si la cantidad vendida es igual a la del warrant, marcar como utilizado
            if (operacion.cantidad === warrant.cantidad) {
              get().updateWarrant(warrantId, { estado: "vencido" })

              // Buscar y actualizar el certificado asociado
              const certificado = get().certificados.find((c) => c.warrantId === warrantId)
              if (certificado) {
                get().updateCertificado(certificado.id, { estado: "utilizado" })
              }
            }
            // Si es menor, reducir la cantidad
            else if (operacion.cantidad < warrant.cantidad) {
              get().updateWarrant(warrantId, {
                cantidad: warrant.cantidad - operacion.cantidad,
                valor: warrant.valor * (1 - operacion.cantidad / warrant.cantidad),
              })

              // Actualizar el certificado asociado
              const certificado = get().certificados.find((c) => c.warrantId === warrantId)
              if (certificado) {
                get().updateCertificado(certificado.id, {
                  cantidad: certificado.cantidad - operacion.cantidad,
                  valor: certificado.valor * (1 - operacion.cantidad / certificado.cantidad),
                })
              }
            }
          }
        }

        get().addMovimiento({
          fecha: new Date().toLocaleDateString("es-AR"),
          documentoId: operacionId,
          documentoTipo: "operacion",
          accion: "actualizacion",
          usuario: "Usuario Actual",
          detalles: `Operación completada: ${operacion.tipo} de ${operacion.cantidad} BLS de ${formatProducto(operacion.producto)}`,
        })

        get().calcularEstadisticas()
      },

      cancelarOperacion: (operacionId) => {
        set((state) => ({
          operaciones: state.operaciones.map((op) => (op.id === operacionId ? { ...op, estado: "cancelada" } : op)),
        }))

        const operacion = get().operaciones.find((op) => op.id === operacionId)
        if (!operacion) return

        get().addMovimiento({
          fecha: new Date().toLocaleDateString("es-AR"),
          documentoId: operacionId,
          documentoTipo: "operacion",
          accion: "actualizacion",
          usuario: "Usuario Actual",
          detalles: `Operación cancelada: ${operacion.tipo} de ${operacion.cantidad} BLS de ${formatProducto(operacion.producto)}`,
        })

        get().calcularEstadisticas()
      },

      // Acciones para Canje
      realizarCanje: (certificadoId, warrantId) => {
        const certificado = get().certificados.find((c) => c.id === certificadoId)
        const warrant = get().warrants.find((w) => w.id === warrantId)

        if (!certificado || !warrant) return

        // Actualizar el estado del certificado y warrant
        get().updateCertificado(certificadoId, { estado: "canjeado" })
        get().updateWarrant(warrantId, { estado: "canjeado" })

        // Crear un nuevo certificado de canje
        const nuevoCertificadoId = get().addCertificado({
          numero: `CC-${3000 + get().certificados.length + 1}`,
          fecha: new Date().toLocaleDateString("es-AR"),
          tipo: "canje",
          producto: warrant.producto,
          cantidad: warrant.cantidad,
          estado: "disponible",
          warrantId: warrant.id,
          valor: warrant.valor,
        })

        // Registrar el movimiento
        get().addMovimiento({
          fecha: new Date().toLocaleDateString("es-AR"),
          documentoId: nuevoCertificadoId,
          documentoTipo: "canje",
          accion: "canje",
          usuario: "Usuario Actual",
          detalles: `Canje de certificado ${certificado.numero} por certificado de canje`,
        })

        get().calcularEstadisticas()
        return nuevoCertificadoId
      },

      // Acciones para Almacenaje
      ingresarProducto: (depositoNombre, producto, cantidad, valor) => {
        // Buscar el depósito
        const deposito = get().depositos.find((d) => d.nombre === depositoNombre)
        if (!deposito) return ""

        // Actualizar la ocupación del depósito
        set((state) => ({
          depositos: state.depositos.map((d) => {
            if (d.id === deposito.id) {
              const productosActualizados = { ...d.productos }
              productosActualizados[producto] = (productosActualizados[producto] || 0) + cantidad

              return {
                ...d,
                ocupacionActual: d.ocupacionActual + cantidad,
                productos: productosActualizados,
              }
            }
            return d
          }),
        }))

        // Crear un nuevo warrant
        const warrantId = get().addWarrant({
          numero: `W-${1000 + get().warrants.length + 1}`,
          fecha: new Date().toLocaleDateString("es-AR"),
          producto,
          cantidad,
          deposito: depositoNombre,
          estado: "activo",
          valor,
          propietario: "Usuario Actual",
          fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("es-AR"),
        })

        // Crear un certificado de depósito asociado
        get().addCertificado({
          numero: `CD-${2000 + get().certificados.length + 1}`,
          fecha: new Date().toLocaleDateString("es-AR"),
          tipo: "deposito",
          producto,
          cantidad,
          estado: "disponible",
          warrantId,
          valor,
        })

        // Registrar el movimiento
        get().addMovimiento({
          fecha: new Date().toLocaleDateString("es-AR"),
          documentoId: warrantId,
          documentoTipo: "almacenaje",
          accion: "ingreso",
          usuario: "Usuario Actual",
          detalles: `Ingreso de ${cantidad} BLS de ${formatProducto(producto)} en ${depositoNombre}`,
        })

        get().calcularEstadisticas()
        return warrantId
      },

      retirarProducto: (warrantId, cantidad) => {
        const warrant = get().warrants.find((w) => w.id === warrantId)
        if (!warrant || warrant.estado !== "activo") return

        // Buscar el depósito
        const deposito = get().depositos.find((d) => d.nombre === warrant.deposito)
        if (!deposito) return

        // Verificar que la cantidad a retirar no exceda la del warrant
        const cantidadRetirar = Math.min(cantidad, warrant.cantidad)

        // Actualizar la ocupación del depósito
        set((state) => ({
          depositos: state.depositos.map((d) => {
            if (d.id === deposito.id) {
              const productosActualizados = { ...d.productos }
              productosActualizados[warrant.producto] = Math.max(
                0,
                (productosActualizados[warrant.producto] || 0) - cantidadRetirar,
              )

              return {
                ...d,
                ocupacionActual: Math.max(0, d.ocupacionActual - cantidadRetirar),
                productos: productosActualizados,
              }
            }
            return d
          }),
        }))

        // Si se retira todo el producto, marcar el warrant como vencido
        if (cantidadRetirar === warrant.cantidad) {
          get().updateWarrant(warrantId, { estado: "vencido" })

          // Buscar y actualizar el certificado asociado
          const certificado = get().certificados.find((c) => c.warrantId === warrantId)
          if (certificado) {
            get().updateCertificado(certificado.id, { estado: "utilizado" })
          }
        }
        // Si es parcial, actualizar la cantidad
        else {
          const proporcion = 1 - cantidadRetirar / warrant.cantidad

          get().updateWarrant(warrantId, {
            cantidad: warrant.cantidad - cantidadRetirar,
            valor: Math.round(warrant.valor * proporcion),
          })

          // Actualizar el certificado asociado
          const certificado = get().certificados.find((c) => c.warrantId === warrantId)
          if (certificado) {
            get().updateCertificado(certificado.id, {
              cantidad: certificado.cantidad - cantidadRetirar,
              valor: Math.round(certificado.valor * proporcion),
            })
          }
        }

        // Registrar el movimiento
        get().addMovimiento({
          fecha: new Date().toLocaleDateString("es-AR"),
          documentoId: warrantId,
          documentoTipo: "almacenaje",
          accion: "retiro",
          usuario: "Usuario Actual",
          detalles: `Retiro de ${cantidadRetirar} BLS de ${formatProducto(warrant.producto)} de ${warrant.deposito}`,
        })

        get().calcularEstadisticas()
      },

      // Acciones para Movimientos
      addMovimiento: (movimiento) => {
        const id = `m${Date.now()}`
        set((state) => ({
          movimientos: [...state.movimientos, { ...movimiento, id }],
        }))
      },

      // Cálculos y estadísticas
      calcularEstadisticas: () => {
        const { warrants, certificados, operaciones } = get()

        const totalWarrants = warrants.length
        const activosWarrants = warrants.filter((w) => w.estado === "activo").length

        const totalCertificados = certificados.length
        const disponiblesCertificados = certificados.filter((c) => c.estado === "disponible").length

        const totalBolsas = warrants.reduce((sum, w) => sum + w.cantidad, 0)

        const certificadosCanje = certificados.filter((c) => c.tipo === "canje" && c.estado === "disponible").length

        // Operaciones del último mes
        const unMesAtras = new Date()
        unMesAtras.setMonth(unMesAtras.getMonth() - 1)
        const operacionesMes = operaciones.filter((op) => {
          const fechaOp = new Date(op.fecha.split("/").reverse().join("-"))
          return fechaOp >= unMesAtras
        }).length

        // Valor total del portafolio (warrants activos)
        const valorPortafolio = warrants.filter((w) => w.estado === "activo").reduce((sum, w) => sum + w.valor, 0)

        set({
          estadisticas: {
            warrants: { valor: activosWarrants, subtexto: `Total: ${totalWarrants}` },
            certificados: { valor: disponiblesCertificados, subtexto: `Total: ${totalCertificados}` },
            bolsas: { valor: totalBolsas, subtexto: "BLS" },
            certificadosCanje: { valor: certificadosCanje, subtexto: "Disponibles para canje" },
            operacionesMes: { valor: operacionesMes, subtexto: "En el último mes" },
            valorPortafolio: { valor: valorPortafolio, subtexto: "Valor total" },
          },
        })
      },
    }),
    {
      name: "warrants-storage",
      storage: isClient ? createJSONStorage(() => localStorage) : undefined,
      skipHydration: !isClient,
    },
  ),
)

// Funciones auxiliares para formatear datos
function formatProducto(producto: string): string {
  const map: Record<string, string> = {
    azucar_blanco: "Azúcar Blanco",
    azucar_crudo: "Azúcar Crudo",
    azucar_organico: "Azúcar Orgánico",
  }
  return map[producto] || producto
}
