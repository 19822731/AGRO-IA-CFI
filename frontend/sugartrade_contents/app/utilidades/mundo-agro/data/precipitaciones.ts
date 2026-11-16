export interface PrecipitacionData {
  mes: string
  actual: number
  historico: number
}

export interface ZonaPrecipitacion {
  nombre: string
  id: string
  datos: PrecipitacionData[]
}

export const zonasPrecipitaciones: ZonaPrecipitacion[] = [
  {
    nombre: "Cruz Alta",
    id: "cruz-alta",
    datos: [
      { mes: "Ene", actual: 180, historico: 165 },
      { mes: "Feb", actual: 160, historico: 155 },
      { mes: "Mar", actual: 120, historico: 130 },
      { mes: "Abr", actual: 80, historico: 75 },
      { mes: "May", actual: 40, historico: 45 },
      { mes: "Jun", actual: 20, historico: 25 },
      { mes: "Jul", actual: 15, historico: 20 },
      { mes: "Ago", actual: 10, historico: 15 },
      { mes: "Sep", actual: 30, historico: 35 },
      { mes: "Oct", actual: 70, historico: 65 },
      { mes: "Nov", actual: 100, historico: 110 },
      { mes: "Dic", actual: 150, historico: 140 },
    ],
  },
  {
    nombre: "Leales",
    id: "leales",
    datos: [
      { mes: "Ene", actual: 190, historico: 175 },
      { mes: "Feb", actual: 170, historico: 165 },
      { mes: "Mar", actual: 130, historico: 140 },
      { mes: "Abr", actual: 85, historico: 80 },
      { mes: "May", actual: 45, historico: 50 },
      { mes: "Jun", actual: 25, historico: 30 },
      { mes: "Jul", actual: 20, historico: 25 },
      { mes: "Ago", actual: 15, historico: 20 },
      { mes: "Sep", actual: 35, historico: 40 },
      { mes: "Oct", actual: 75, historico: 70 },
      { mes: "Nov", actual: 110, historico: 120 },
      { mes: "Dic", actual: 160, historico: 150 },
    ],
  },
  {
    nombre: "Famaillá",
    id: "famailla",
    datos: [
      { mes: "Ene", actual: 200, historico: 185 },
      { mes: "Feb", actual: 180, historico: 175 },
      { mes: "Mar", actual: 140, historico: 150 },
      { mes: "Abr", actual: 90, historico: 85 },
      { mes: "May", actual: 50, historico: 55 },
      { mes: "Jun", actual: 30, historico: 35 },
      { mes: "Jul", actual: 25, historico: 30 },
      { mes: "Ago", actual: 20, historico: 25 },
      { mes: "Sep", actual: 40, historico: 45 },
      { mes: "Oct", actual: 80, historico: 75 },
      { mes: "Nov", actual: 120, historico: 130 },
      { mes: "Dic", actual: 170, historico: 160 },
    ],
  },
  {
    nombre: "Monteros",
    id: "monteros",
    datos: [
      { mes: "Ene", actual: 210, historico: 195 },
      { mes: "Feb", actual: 190, historico: 185 },
      { mes: "Mar", actual: 150, historico: 160 },
      { mes: "Abr", actual: 95, historico: 90 },
      { mes: "May", actual: 55, historico: 60 },
      { mes: "Jun", actual: 35, historico: 40 },
      { mes: "Jul", actual: 30, historico: 35 },
      { mes: "Ago", actual: 25, historico: 30 },
      { mes: "Sep", actual: 45, historico: 50 },
      { mes: "Oct", actual: 85, historico: 80 },
      { mes: "Nov", actual: 130, historico: 140 },
      { mes: "Dic", actual: 180, historico: 170 },
    ],
  },
  {
    nombre: "Burruyacú",
    id: "burruyacu",
    datos: [
      { mes: "Ene", actual: 170, historico: 155 },
      { mes: "Feb", actual: 150, historico: 145 },
      { mes: "Mar", actual: 110, historico: 120 },
      { mes: "Abr", actual: 75, historico: 70 },
      { mes: "May", actual: 35, historico: 40 },
      { mes: "Jun", actual: 15, historico: 20 },
      { mes: "Jul", actual: 10, historico: 15 },
      { mes: "Ago", actual: 5, historico: 10 },
      { mes: "Sep", actual: 25, historico: 30 },
      { mes: "Oct", actual: 65, historico: 60 },
      { mes: "Nov", actual: 95, historico: 105 },
      { mes: "Dic", actual: 140, historico: 130 },
    ],
  },
]
