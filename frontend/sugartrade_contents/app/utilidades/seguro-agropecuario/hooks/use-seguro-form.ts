"use client"

import { useState } from "react"
import type { FormularioSeguro, DatosProductor, DatosFinca, Cotizacion } from "../types/seguro"
import { coberturas as coberturasIniciales } from "../data/aseguradoras"

const estadoInicial: FormularioSeguro = {
  paso: 1,
  datosProductor: {
    nombre: "",
    documento: "",
    telefono: "",
    email: "",
    experiencia: 0,
  },
  datosFinca: {
    nombre: "",
    ubicacion: {
      lat: -27.3364,
      lng: -55.8675,
    },
    superficie: 0,
    tipoSuelo: "",
    cultivoAnterior: "",
    rendimientoPromedio: 0,
  },
  coberturas: coberturasIniciales,
  cotizaciones: [],
  cotizacionSeleccionada: null,
}

export function useSeguroForm() {
  const [formulario, setFormulario] = useState<FormularioSeguro>(estadoInicial)
  const [cargando, setCargando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const avanzarPaso = () => {
    setFormulario((prev) => ({
      ...prev,
      paso: prev.paso + 1,
    }))
  }

  const retrocederPaso = () => {
    setFormulario((prev) => ({
      ...prev,
      paso: Math.max(1, prev.paso - 1),
    }))
  }

  const irAPaso = (paso: number) => {
    setFormulario((prev) => ({
      ...prev,
      paso: Math.max(1, Math.min(paso, 5)),
    }))
  }

  const actualizarDatosProductor = (datos: Partial<DatosProductor>) => {
    setFormulario((prev) => ({
      ...prev,
      datosProductor: {
        ...prev.datosProductor,
        ...datos,
      },
    }))
  }

  const actualizarDatosFinca = (datos: Partial<DatosFinca>) => {
    setFormulario((prev) => ({
      ...prev,
      datosFinca: {
        ...prev.datosFinca,
        ...datos,
      },
    }))
  }

  const actualizarUbicacion = (lat: number, lng: number) => {
    setFormulario((prev) => ({
      ...prev,
      datosFinca: {
        ...prev.datosFinca,
        ubicacion: { lat, lng },
      },
    }))
  }

  const toggleCobertura = (id: string) => {
    setFormulario((prev) => ({
      ...prev,
      coberturas: prev.coberturas.map((cob) => (cob.id === id ? { ...cob, seleccionada: !cob.seleccionada } : cob)),
    }))
  }

  const actualizarCotizaciones = (cotizaciones: Cotizacion[]) => {
    setFormulario((prev) => ({
      ...prev,
      cotizaciones,
    }))
  }

  const seleccionarCotizacion = (id: string) => {
    setFormulario((prev) => ({
      ...prev,
      cotizacionSeleccionada: id,
    }))
  }

  const reiniciarFormulario = () => {
    setFormulario(estadoInicial)
  }

  return {
    formulario,
    cargando,
    error,
    avanzarPaso,
    retrocederPaso,
    irAPaso,
    actualizarDatosProductor,
    actualizarDatosFinca,
    actualizarUbicacion,
    toggleCobertura,
    actualizarCotizaciones,
    seleccionarCotizacion,
    reiniciarFormulario,
    setCargando,
    setError,
  }
}
