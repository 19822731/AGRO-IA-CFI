"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAltaProductoStore } from "@/lib/store/alta-producto-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
    categoria: z.string().min(1, "Seleccione una categoría"),
    subTipo: z.string().optional(),
    tipoProducto: z.string().optional(), // Made optional as it depends on category
    presentacion: z.string().min(1, "Seleccione una presentación"),
    cantidad: z.coerce.number().min(0.1, "La cantidad debe ser mayor a 0"),
    calidad: z.string().min(1, "Seleccione la calidad"),
    marca: z.string().min(1, "Seleccione la marca/ingenio"),
    lugarEntrega: z.string().min(1, "Seleccione el lugar de entrega"),
})

export function Step1Details() {
    const { setDetails, nextStep, details } = useAltaProductoStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: details || {
            categoria: "",
            subTipo: "",
            tipoProducto: "",
            presentacion: "",
            cantidad: 0,
            calidad: "",
            marca: "",
            lugarEntrega: "",
        },
    })

    // Watch category to conditionally render fields
    const categoria = form.watch("categoria")
    const subTipo = form.watch("subTipo")

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Ensure tipoProducto is set if it's sugar, or use subTipo/Category as name
        const finalValues = {
            ...values,
            tipoProducto: values.tipoProducto || values.subTipo || values.categoria
        }
        setDetails(finalValues as any)
        nextStep()
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Alta de Producto - Paso 1</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Categoría */}
                            <FormField
                                control={form.control}
                                name="categoria"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoría</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione categoría" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="azucar">Azúcar</SelectItem>
                                                <SelectItem value="arroz">Arroz</SelectItem>
                                                <SelectItem value="aceite">Aceite</SelectItem>
                                                <SelectItem value="poroto">Poroto</SelectItem>
                                                <SelectItem value="frutas_frescas">Frutas Frescas</SelectItem>
                                                <SelectItem value="frutos_secos">Frutos Secos y Deshidratados</SelectItem>
                                                <SelectItem value="procesados">Productos Procesados</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Sub-Tipo (Conditional) */}
                            {categoria === "frutas_frescas" && (
                                <FormField
                                    control={form.control}
                                    name="subTipo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fruta</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione fruta" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="cerezas">Cerezas</SelectItem>
                                                    <SelectItem value="ciruelas">Ciruelas</SelectItem>
                                                    <SelectItem value="uvas">Uvas de mesa</SelectItem>
                                                    <SelectItem value="manzanas">Manzanas</SelectItem>
                                                    <SelectItem value="arandanos">Arándanos</SelectItem>
                                                    <SelectItem value="kiwis">Kiwis</SelectItem>
                                                    <SelectItem value="peras">Peras</SelectItem>
                                                    <SelectItem value="naranjas">Naranjas</SelectItem>
                                                    <SelectItem value="paltas">Paltas</SelectItem>
                                                    <SelectItem value="duraznos">Duraznos</SelectItem>
                                                    <SelectItem value="mandarinas">Mandarinas</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {categoria === "frutos_secos" && (
                                <FormField
                                    control={form.control}
                                    name="subTipo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="nueces">Nueces</SelectItem>
                                                    <SelectItem value="avellanas">Avellanas</SelectItem>
                                                    <SelectItem value="almendras">Almendras</SelectItem>
                                                    <SelectItem value="castanas">Castañas</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {categoria === "procesados" && (
                                <FormField
                                    control={form.control}
                                    name="subTipo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="jugos">Jugos</SelectItem>
                                                    <SelectItem value="conservas">Conservas</SelectItem>
                                                    <SelectItem value="congelados">Congelados</SelectItem>
                                                    <SelectItem value="deshidratados">Deshidratados</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Tipo de Producto (Specific to Sugar for now) */}
                            {categoria === "azucar" && (
                                <FormField
                                    control={form.control}
                                    name="tipoProducto"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Variedad</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione variedad" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="blanco_a">Blanco Tipo A</SelectItem>
                                                    <SelectItem value="refinado_45x">Blanco Refinado 45 X</SelectItem>
                                                    <SelectItem value="organico">Orgánico</SelectItem>
                                                    <SelectItem value="crudo">Crudo</SelectItem>
                                                    <SelectItem value="mascabo">Mascabo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="presentacion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Presentación</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione presentación" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="bolsa_50kg">Bolsa 50 kg</SelectItem>
                                                <SelectItem value="bolsa_25kg">Bolsa 25 kg</SelectItem>
                                                <SelectItem value="big_bag_1000">Big Bag 1.000 kg</SelectItem>
                                                <SelectItem value="big_bag_1250">Big Bag 1.250 kg</SelectItem>
                                                {/* Generic options for other products */}
                                                {categoria !== "azucar" && (
                                                    <>
                                                        <SelectItem value="caja">Caja</SelectItem>
                                                        <SelectItem value="pallet">Pallet</SelectItem>
                                                        <SelectItem value="granel">Granel</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cantidad"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cantidad (Ton)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="calidad"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Calidad</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione calidad" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="standard">Standard</SelectItem>
                                                <SelectItem value="premium">Premium</SelectItem>
                                                <SelectItem value="exportacion">Exportación</SelectItem>
                                                <SelectItem value="industria_alimenticia">Industria Alimenticia</SelectItem>
                                                <SelectItem value="industria_bebidas">Industria Bebidas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="marca"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca / Ingenio</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione marca" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* Sugar Mills */}
                                                {categoria === "azucar" && (
                                                    <>
                                                        <SelectItem value="aguilares">Ingenio Aguilares</SelectItem>
                                                        <SelectItem value="bella_vista">Ingenio Bella Vista</SelectItem>
                                                        <SelectItem value="concepcion">Ingenio Concepción</SelectItem>
                                                        <SelectItem value="cruz_alta">Ingenio Cruz Alta</SelectItem>
                                                        <SelectItem value="la_corona">Ingenio La Corona</SelectItem>
                                                        <SelectItem value="la_florida">Ingenio La Florida</SelectItem>
                                                        <SelectItem value="leales">Ingenio Leales</SelectItem>
                                                        <SelectItem value="la_providencia">Ingenio La Providencia</SelectItem>
                                                        <SelectItem value="la_trinidad">Ingenio La Trinidad</SelectItem>
                                                        <SelectItem value="ledesma">Ledesma</SelectItem>
                                                    </>
                                                )}
                                                {/* Generic/Other Brands */}
                                                {categoria !== "azucar" && (
                                                    <>
                                                        <SelectItem value="generica">Genérica</SelectItem>
                                                        <SelectItem value="propia">Marca Propia</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lugarEntrega"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lugar de Entrega</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione lugar" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="planta_tucuman">Planta Tucumán</SelectItem>
                                                <SelectItem value="planta_jujuy">Planta Jujuy</SelectItem>
                                                <SelectItem value="puerto_rosario">Puerto Rosario</SelectItem>
                                                <SelectItem value="deposito_bsas">Depósito Buenos Aires</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" size="lg">
                                Siguiente
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
