/**
 * Utilidades de formateo para el módulo de financiación
 */

/**
 * Formatea un valor numérico como moneda en pesos argentinos
 * @param value - Valor numérico a formatear
 * @returns Cadena formateada como moneda (ej: $1.000.000)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea un porcentaje
 * @param value - Valor decimal (ej: 0.05 para 5%)
 * @returns Cadena formateada como porcentaje (ej: 5%)
 */
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formatea una fecha en formato local argentino
 * @param date - Objeto Date o string de fecha
 * @returns Fecha formateada (ej: 15/04/2023)
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
