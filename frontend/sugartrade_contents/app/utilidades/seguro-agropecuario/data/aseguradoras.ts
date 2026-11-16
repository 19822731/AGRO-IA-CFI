import type { Aseguradora, Cobertura } from "../types/seguro"

export const coberturas: Cobertura[] = [
  {
    id: "sequia",
    nombre: "Sequía",
    descripcion: "Protección contra pérdidas por falta de lluvia durante períodos críticos del cultivo.",
    seleccionada: false,
  },
  {
    id: "inundacion",
    nombre: "Inundación",
    descripcion: "Cobertura por daños causados por exceso de agua debido a lluvias intensas o desbordamientos.",
    seleccionada: false,
  },
  {
    id: "granizo",
    nombre: "Granizo",
    descripcion: "Protección contra daños físicos directos causados por granizo en el cultivo.",
    seleccionada: false,
  },
  {
    id: "helada",
    nombre: "Helada",
    descripcion: "Cobertura por daños causados por temperaturas bajo cero que afectan el desarrollo del cultivo.",
    seleccionada: false,
  },
  {
    id: "incendio",
    nombre: "Incendio",
    descripcion: "Protección contra pérdidas por incendios en el cultivo o instalaciones.",
    seleccionada: false,
  },
  {
    id: "plagas",
    nombre: "Plagas y Enfermedades",
    descripcion: "Cobertura por daños causados por plagas o enfermedades no controlables con prácticas normales.",
    seleccionada: false,
  },
]

export const aseguradoras: Aseguradora[] = [
  {
    id: "aseguradora1",
    nombre: "Seguros Agrícolas del Norte",
    logo: "/placeholder.svg?height=60&width=120",
    calificacion: 4.5,
    coberturas: {
      sequia: { disponible: true, prima: 2.5 },
      inundacion: { disponible: true, prima: 3.0 },
      granizo: { disponible: true, prima: 1.8 },
      helada: { disponible: true, prima: 2.2 },
      incendio: { disponible: true, prima: 1.5 },
      plagas: { disponible: false, prima: 0 },
    },
  },
  {
    id: "aseguradora2",
    nombre: "Protección Rural Seguros",
    logo: "/placeholder.svg?height=60&width=120",
    calificacion: 4.2,
    coberturas: {
      sequia: { disponible: true, prima: 2.3 },
      inundacion: { disponible: true, prima: 2.8 },
      granizo: { disponible: true, prima: 1.6 },
      helada: { disponible: false, prima: 0 },
      incendio: { disponible: true, prima: 1.4 },
      plagas: { disponible: true, prima: 3.2 },
    },
  },
  {
    id: "aseguradora3",
    nombre: "Aseguradora Cañera Nacional",
    logo: "/placeholder.svg?height=60&width=120",
    calificacion: 4.7,
    coberturas: {
      sequia: { disponible: true, prima: 2.7 },
      inundacion: { disponible: true, prima: 3.2 },
      granizo: { disponible: true, prima: 2.0 },
      helada: { disponible: true, prima: 2.4 },
      incendio: { disponible: true, prima: 1.7 },
      plagas: { disponible: true, prima: 3.5 },
    },
  },
]
