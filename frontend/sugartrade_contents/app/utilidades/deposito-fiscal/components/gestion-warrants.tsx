"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Mercancia, Warrant } from "../types"
import { toast } from "@/components/ui/use-toast"

interface GestionWarrantsProps {
  warrants: Warrant[]
  mercancias: Mercancia[]
  emitirWarrant: (warrant: Omit<Warrant, "id">) => Warrant
}

const formSchema = z.object({
  numero: z.string().min(3, { message: "El número de warrant debe tener al menos 3 caracteres" }),
  mercanciaId: z.string().min(1, { message: "Debe seleccionar una mercancía" }),
  valorGarantia: z.coerce.number().positive({ message: "El valor de garantía debe ser un número positivo" }),
  beneficiario: z.string().min(3, { message: "El beneficiario debe tener al menos 3 caracteres" }),
  fechaVencimiento: z.string().min(1, { message: "Debe seleccionar una fecha de vencimiento" }),
})

type FormValues = z.infer<typeof formSchema>

export function GestionWarrants({ warrants, mercancias, emitirWarrant }: GestionWarrantsProps) {
  const [activeTab, setActiveTab] = useState("listado")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numero: "",
      mercanciaId: "",
      valorGarantia: 0,
      beneficiario: "",
      fechaVencimiento: "",
    },
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "vigente":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Vigente
          </Badge>
        )
      case "vencido":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Vencido
          </Badge>
        )
      case "ejecutado":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Ejecutado
          </Badge>
        )
      case "cancelado":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      const nuevoWarrant: Omit<Warrant, "id"> = {
        ...values,
        fechaEmision: new Date(),
        fechaVencimiento: new Date(values.fechaVencimiento),
        estado: "vigente",
      }

      emitirWarrant(nuevoWarrant)

      toast({
        title: "Warrant emitido",
        description: "El warrant ha sido emitido exitosamente.",
      })

      form.reset()
      setActiveTab("listado")
    } catch (error) {
      toast({
        title: "Error al emitir",
        description: "Ocurrió un error al emitir el warrant. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtrar mercancías elegibles (que no tengan warrant y no estén retiradas)
  const mercanciasElegibles = mercancias.filter((m) => !m.numeroWarrant && m.estado !== "retirada")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Warrants</CardTitle>
        <CardDescription>
          Administre los warrants emitidos y emita nuevos warrants para mercancías en depósito.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="listado" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="listado">Listado de Warrants</TabsTrigger>
            <TabsTrigger value="emitir">Emitir Warrant</TabsTrigger>
          </TabsList>

          <TabsContent value="listado" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Mercancía</TableHead>
                  <TableHead>Beneficiario</TableHead>
                  <TableHead>Valor Garantía</TableHead>
                  <TableHead>Emisión</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warrants.map((warrant) => {
                  const mercancia = mercancias.find((m) => m.id === warrant.mercanciaId)
                  return (
                    <TableRow key={warrant.id}>
                      <TableCell className="font-medium">{warrant.numero}</TableCell>
                      <TableCell>{mercancia?.descripcion || "N/A"}</TableCell>
                      <TableCell>{warrant.beneficiario}</TableCell>
                      <TableCell>${warrant.valorGarantia.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(warrant.fechaEmision)}</TableCell>
                      <TableCell>{formatDate(warrant.fechaVencimiento)}</TableCell>
                      <TableCell>{getEstadoBadge(warrant.estado)}</TableCell>
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
                        <FormLabel>Número de Warrant</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. W-2023-006" {...field} />
                        </FormControl>
                        <FormDescription>Código único que identifica el warrant.</FormDescription>
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
                        <FormDescription>Mercancía sobre la cual se emitirá el warrant.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valorGarantia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Garantía (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>Valor por el cual se emite el warrant como garantía.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beneficiario</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Banco Agrícola" {...field} />
                        </FormControl>
                        <FormDescription>
                          Entidad financiera o persona a favor de quien se emite el warrant.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaVencimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Vencimiento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>Fecha en que vence el warrant.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || mercanciasElegibles.length === 0}>
                  {isSubmitting ? "Emitiendo..." : "Emitir Warrant"}
                </Button>

                {mercanciasElegibles.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    No hay mercancías disponibles para emitir warrants. Registre nuevas mercancías primero.
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
