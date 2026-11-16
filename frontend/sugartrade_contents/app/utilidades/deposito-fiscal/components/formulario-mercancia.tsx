"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Mercancia } from "../types/zona-primaria"

const formSchema = z.object({
  descripcion: z.string().min(3, { message: "La descripción debe tener al menos 3 caracteres" }),
  cantidad: z.coerce.number().positive({ message: "La cantidad debe ser un número positivo" }),
  unidad: z.string().min(1, { message: "Debe seleccionar una unidad" }),
  peso: z.coerce.number().positive({ message: "El peso debe ser un número positivo" }),
  volumen: z.coerce.number().positive({ message: "El volumen debe ser un número positivo" }),
  valor: z.coerce.number().positive({ message: "El valor debe ser un número positivo" }),
})

type FormValues = z.infer<typeof formSchema>

interface FormularioMercanciaProps {
  onSubmit: (mercancia: Omit<Mercancia, "id">) => void
  onCancel: () => void
}

export function FormularioMercancia({ onSubmit, onCancel }: FormularioMercanciaProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descripcion: "",
      cantidad: 0,
      unidad: "",
      peso: 0,
      volumen: 0,
      valor: 0,
    },
  })

  function handleSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Descripción de la Mercancía</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Cajas de repuestos automotrices" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                    <SelectItem value="ton">Toneladas (ton)</SelectItem>
                    <SelectItem value="cajas">Cajas</SelectItem>
                    <SelectItem value="bultos">Bultos</SelectItem>
                    <SelectItem value="pallets">Pallets</SelectItem>
                    <SelectItem value="unidades">Unidades</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="peso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="volumen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volumen (m³)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (USD)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Mercancía"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
