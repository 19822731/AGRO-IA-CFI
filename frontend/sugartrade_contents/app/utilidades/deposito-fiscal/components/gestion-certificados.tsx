"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Mercancia, Certificado } from "../types"
import { toast } from "@/components/ui/use-toast"

interface GestionCertificadosProps {
  certificados: Certificado[]
  mercancias: Mercancia[]
  emitirCertificado: (certificado: Omit<Certificado, "id">) => Certificado
}

const formSchema = z.object({
  numero: z.string().min(3, { message: "El número de certificado debe tener al menos 3 caracteres" }),
  mercanciaId: z.string().min(1, { message: "Debe seleccionar una mercancía" }),
  descripcion: z.string().min(3, { message: "La descripción debe tener al menos 3 caracteres" }),
})

type FormValues = z.infer<typeof formSchema>

export function GestionCertificados({ certificados, mercancias, emitirCertificado }: GestionCertificadosProps) {
  const [activeTab, setActiveTab] = useState("listado")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numero: "",
      mercanciaId: "",
      descripcion: "",
    },
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      const mercancia = mercancias.find((m) => m.id === values.mercanciaId)

      if (!mercancia) {
        throw new Error("Mercancía no encontrada")
      }

      const nuevoCertificado: Omit<Certificado, "id"> = {
        ...values,
        fechaEmision: new Date(),
        valor: mercancia.valor,
      }

      emitirCertificado(nuevoCertificado)

      toast({
        title: "Certificado emitido",
        description: "El certificado de depósito ha sido emitido exitosamente.",
      })

      form.reset()
      setActiveTab("listado")
    } catch (error) {
      toast({
        title: "Error al emitir",
        description: "Ocurrió un error al emitir el certificado. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtrar mercancías elegibles (que no estén retiradas)
  const mercanciasElegibles = mercancias.filter((m) => m.estado !== "retirada")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Certificados</CardTitle>
        <CardDescription>
          Administre los certificados de depósito emitidos y emita nuevos certificados para mercancías en depósito.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="listado" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="listado">Listado de Certificados</TabsTrigger>
            <TabsTrigger value="emitir">Emitir Certificado</TabsTrigger>
          </TabsList>

          <TabsContent value="listado" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Mercancía</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificados.map((certificado) => {
                  const mercancia = mercancias.find((m) => m.id === certificado.mercanciaId)
                  return (
                    <TableRow key={certificado.id}>
                      <TableCell className="font-medium">{certificado.numero}</TableCell>
                      <TableCell>{mercancia?.descripcion || "N/A"}</TableCell>
                      <TableCell>{certificado.descripcion}</TableCell>
                      <TableCell>${certificado.valor.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(certificado.fechaEmision)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="emitir" className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Certificado</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. C-2023-004" {...field} />
                        </FormControl>
                        <FormDescription>Código único que identifica el certificado de depósito.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mercanciaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mercancía</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar mercancía" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mercanciasElegibles.length > 0 ? (
                              mercanciasElegibles.map((mercancia) => (
                                <SelectItem key={mercancia.id} value={mercancia.id}>
                                  {mercancia.descripcion} - {mercancia.cliente}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No hay mercancías disponibles
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>Mercancía sobre la cual se emitirá el certificado.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Descripción del Certificado</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Certificado de depósito para azúcar a granel" {...field} />
                        </FormControl>
                        <FormDescription>Descripción detallada del certificado de depósito.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || mercanciasElegibles.length === 0}>
                  {isSubmitting ? "Emitiendo..." : "Emitir Certificado"}
                </Button>

                {mercanciasElegibles.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    No hay mercancías disponibles para emitir certificados. Registre nuevas mercancías primero.
                  </p>
                )}
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
