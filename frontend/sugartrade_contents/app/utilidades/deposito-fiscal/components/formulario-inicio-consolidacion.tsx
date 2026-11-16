"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Camion, Documento } from "../types/zona-primaria"

const formSchema = z.object({
  patente: z.string().min(6, { message: "La patente debe tener al menos 6 caracteres" }),
  conductor: z.string().min(3, { message: "El nombre del conductor debe tener al menos 3 caracteres" }),
  empresa: z.string().min(3, { message: "El nombre de la empresa debe tener al menos 3 caracteres" }),
  numeroManifiesto: z.string().optional(),
  numeroDocumentoTransporte: z
    .string()
    .min(3, { message: "El número de documento de transporte debe tener al menos 3 caracteres" }),
})

type FormValues = z.infer<typeof formSchema>

interface FormularioInicioProps {
  onSubmit: (camion: Camion, documentos: Documento[]) => void
}

export function FormularioInicio({ onSubmit }: FormularioInicioProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patente: "",
      conductor: "",
      empresa: "",
      numeroManifiesto: "",
      numeroDocumentoTransporte: "",
    },
  })

  function handleSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      const camion: Camion = {
        patente: values.patente,
        conductor: values.conductor,
        empresa: values.empresa,
      }

      const documentos: Documento[] = []

      if (values.numeroManifiesto) {
        documentos.push({
          tipo: "manifiesto",
          numero: values.numeroManifiesto,
          descripcion: "Manifiesto de carga",
        })
      }

      documentos.push({
        tipo: "bl",
        numero: values.numeroDocumentoTransporte,
        descripcion: "Documento de transporte",
      })

      onSubmit(camion, documentos)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Información del Camión</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="patente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patente del Camión</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. ABC123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conductor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Conductor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="empresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa de Transporte</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Transportes ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Documentación</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="numeroManifiesto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Manifiesto de Carga (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. MAN-2023-001" {...field} />
                  </FormControl>
                  <FormDescription>Si aplica, ingrese el número de manifiesto de carga.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numeroDocumentoTransporte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Documento de Transporte</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. BL-2023-001" {...field} />
                  </FormControl>
                  <FormDescription>Ingrese el número de BL, guía aérea u otro documento de transporte.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Iniciando..." : "Iniciar Consolidación"}
        </Button>
      </form>
    </Form>
  )
}
