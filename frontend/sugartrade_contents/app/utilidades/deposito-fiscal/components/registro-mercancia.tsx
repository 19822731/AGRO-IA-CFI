"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Mercancia } from "../types"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  descripcion: z.string().min(3, { message: "La descripción debe tener al menos 3 caracteres" }),
  cantidad: z.coerce.number().positive({ message: "La cantidad debe ser un número positivo" }),
  unidad: z.string().min(1, { message: "Debe seleccionar una unidad" }),
  peso: z.coerce.number().positive({ message: "El peso debe ser un número positivo" }),
  volumen: z.coerce.number().positive({ message: "El volumen debe ser un número positivo" }),
  valor: z.coerce.number().positive({ message: "El valor debe ser un número positivo" }),
  cliente: z.string().min(3, { message: "El nombre del cliente debe tener al menos 3 caracteres" }),
  ubicacion: z.string().min(3, { message: "La ubicación debe tener al menos 3 caracteres" }),
  fechaEstimadaSalida: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RegistroMercanciaProps {
  registrarMercancia: (mercancia: Omit<Mercancia, "id">) => Mercancia
}

export function RegistroMercancia({ registrarMercancia }: RegistroMercanciaProps) {
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
      cliente: "",
      ubicacion: "",
      fechaEstimadaSalida: "",
    },
  })

  function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      const nuevaMercancia: Omit<Mercancia, "id"> = {
        ...values,
        fechaIngreso: new Date(),
        fechaEstimadaSalida: values.fechaEstimadaSalida ? new Date(values.fechaEstimadaSalida) : null,
        fechaSalida: null,
        estado: "ingresada",
        numeroWarrant: null,
      }

      registrarMercancia(nuevaMercancia)

      toast({
        title: "Mercancía registrada",
        description: "La mercancía ha sido registrada exitosamente en el depósito fiscal.",
      })

      form.reset()
    } catch (error) {
      toast({
        title: "Error al registrar",
        description: "Ocurrió un error al registrar la mercancía. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Mercancía</CardTitle>
        <CardDescription>
          Complete el formulario para registrar una nueva mercancía en el depósito fiscal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Azúcar a granel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="sacos">Sacos</SelectItem>
                          <SelectItem value="bultos">Bultos</SelectItem>
                          <SelectItem value="cajas">Cajas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <FormField
                control={form.control}
                name="cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación en depósito</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Sector A, Estante 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaEstimadaSalida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha estimada de salida</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Opcional. Fecha estimada en que la mercancía saldrá del depósito.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Mercancía"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-sm text-muted-foreground">
          La mercancía quedará registrada con estado "Ingresada" y se le asignará un ID único.
        </p>
      </CardFooter>
    </Card>
  )
}
