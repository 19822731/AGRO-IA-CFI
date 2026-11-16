"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingDown, Users, Warehouse } from "lucide-react"
import { CatalogoInsumos } from "./components/catalogo-insumos"
import { CarritoCompras } from "./components/carrito-compras"
import { CompraComunitaria } from "./components/compra-comunitaria"
import { HistorialCompras } from "./components/historial-compras"

export default function InsumosPage() {
  const [activeTab, setActiveTab] = useState("catalogo")
  const [itemsEnCarrito, setItemsEnCarrito] = useState<any[]>([])

  const agregarAlCarrito = (producto: any, cantidad = 1) => {
    const itemExistente = itemsEnCarrito.find((item) => item.id === producto.id)

    if (itemExistente) {
      setItemsEnCarrito(
        itemsEnCarrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad, subtotal: (item.cantidad + cantidad) * item.precio }
            : item,
        ),
      )
    } else {
      setItemsEnCarrito([
        ...itemsEnCarrito,
        {
          ...producto,
          cantidad,
          subtotal: cantidad * producto.precio,
        },
      ])
    }
  }

  const eliminarDelCarrito = (id: number) => {
    setItemsEnCarrito(itemsEnCarrito.filter((item) => item.id !== id))
  }

  const actualizarCantidad = (id: number, cantidad: number) => {
    if (cantidad < 1) return

    setItemsEnCarrito(
      itemsEnCarrito.map((item) => (item.id === id ? { ...item, cantidad, subtotal: cantidad * item.precio } : item)),
    )
  }

  const vaciarCarrito = () => {
    setItemsEnCarrito([])
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insumos Agrícolas</h1>
          <p className="text-muted-foreground">
            Adquiera insumos de calidad para sus cultivos con opciones de pago flexibles y canje por azúcar
          </p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorro Promedio</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
            <p className="text-xs text-muted-foreground">Comparado con precios de mercado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Comunitarias</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Grupos activos actualmente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insumos Disponibles</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120+</div>
            <p className="text-xs text-muted-foreground">Productos en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recomendaciones IA</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Personalizado</div>
            <p className="text-xs text-muted-foreground">Basado en sus cultivos y necesidades</p>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
          <TabsTrigger value="carrito">
            Carrito
            {itemsEnCarrito.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {itemsEnCarrito.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="compra-comunitaria">Compra Comunitaria</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogo">
          <CatalogoInsumos agregarAlCarrito={agregarAlCarrito} />
        </TabsContent>

        <TabsContent value="carrito">
          <CarritoCompras
            items={itemsEnCarrito}
            eliminarItem={eliminarDelCarrito}
            actualizarCantidad={actualizarCantidad}
            vaciarCarrito={vaciarCarrito}
          />
        </TabsContent>

        <TabsContent value="compra-comunitaria">
          <CompraComunitaria />
        </TabsContent>

        <TabsContent value="historial">
          <HistorialCompras />
        </TabsContent>
      </Tabs>
    </div>
  )
}
