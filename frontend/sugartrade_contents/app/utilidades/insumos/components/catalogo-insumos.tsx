"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, Droplets, Sprout, Zap, ShieldCheck } from "lucide-react"

// Datos de ejemplo para categorías de insumos
const categorias = [
  { id: 1, nombre: "Fertilizantes", icon: <Leaf className="h-4 w-4" /> },
  { id: 2, nombre: "Herbicidas", icon: <Droplets className="h-4 w-4" /> },
  { id: 3, nombre: "Semillas", icon: <Sprout className="h-4 w-4" /> },
  { id: 4, nombre: "Nutrientes", icon: <Zap className="h-4 w-4" /> },
  { id: 5, nombre: "Fungicidas", icon: <ShieldCheck className="h-4 w-4" /> },
]

// Datos de ejemplo para productos
const productos = [
  {
    id: 1,
    nombre: "Fertilizante Premium Caña",
    categoria: "Fertilizantes",
    precio: 1200000,
    unidad: "Tonelada",
    disponibilidad: true,
    descuento: 10,
    canjeAzucar: true,
    descripcion: "Fertilizante de alta calidad para caña de azúcar, con alto contenido de nitrógeno y potasio.",
    imagen: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    nombre: "Herbicida Selectivo Avanzado",
    categoria: "Herbicidas",
    precio: 850000,
    unidad: "1000 litros",
    disponibilidad: true,
    descuento: 5,
    canjeAzucar: true,
    descripcion: "Herbicida selectivo para el control de malezas en cultivos de caña de azúcar.",
    imagen: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    nombre: "Semillas Certificadas Premium",
    categoria: "Semillas",
    precio: 1500000,
    unidad: "Tonelada",
    disponibilidad: true,
    descuento: 0,
    canjeAzucar: true,
    descripcion: "Semillas certificadas de caña de azúcar, con alto rendimiento y resistencia a enfermedades.",
    imagen: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    nombre: "Nutriente Foliar Concentrado",
    categoria: "Nutrientes",
    precio: 750000,
    unidad: "500 litros",
    disponibilidad: true,
    descuento: 15,
    canjeAzucar: true,
    descripcion: "Nutriente foliar de alta concentración para aplicación directa en cultivos de caña.",
    imagen: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    nombre: "Fungicida Biológico Protector",
    categoria: "Fungicidas",
    precio: 950000,
    unidad: "1000 litros",
    disponibilidad: true,
    descuento: 8,
    canjeAzucar: true,
    descripcion: "Fungicida biológico para el control de enfermedades en cultivos de caña de azúcar.",
    imagen: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 6,
    nombre: "Fertilizante Orgánico Certificado",
    categoria: "Fertilizantes",
    precio: 980000,
    unidad: "Tonelada",
    disponibilidad: true,
    descuento: 12,
    canjeAzucar: true,
    descripcion: "Fertilizante 100% orgánico certificado para cultivos de caña con prácticas sostenibles.",
    imagen: "/placeholder.svg?height=200&width=200",
  },
]

interface CatalogoInsumosProps {
  agregarAlCarrito: (producto: any, cantidad?: number) => void
}

export function CatalogoInsumos({ agregarAlCarrito }: CatalogoInsumosProps) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("")
  const [busqueda, setBusqueda] = useState("")
  const [ordenarPor, setOrdenarPor] = useState("recomendado")
  const [mostrarSoloCanjeables, setMostrarSoloCanjeables] = useState(false)

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    const matchCategoria = categoriaSeleccionada ? producto.categoria === categoriaSeleccionada : true
    const matchBusqueda = busqueda
      ? producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      : true
    const matchCanjeable = mostrarSoloCanjeables ? producto.canjeAzucar : true
    return matchCategoria && matchBusqueda && matchCanjeable
  })

  // Ordenar productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (ordenarPor) {
      case "precio-asc":
        return a.precio - b.precio
      case "precio-desc":
        return b.precio - a.precio
      case "descuento":
        return b.descuento - a.descuento
      default:
        return 0 // Por defecto, mantener el orden original (recomendado)
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Insumos</CardTitle>
          <CardDescription>Explore nuestra selección de insumos agrícolas de alta calidad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.nombre}>
                      <div className="flex items-center">
                        <span className="mr-2">{categoria.icon}</span>
                        <span>{categoria.nombre}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ordenar">Ordenar por</Label>
              <Select value={ordenarPor} onValueChange={setOrdenarPor}>
                <SelectTrigger id="ordenar">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recomendado">Recomendado</SelectItem>
                  <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="descuento">Mayor descuento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="busqueda">Búsqueda</Label>
              <Input
                id="busqueda"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="solo-canjeables"
                  checked={mostrarSoloCanjeables}
                  onChange={(e) => setMostrarSoloCanjeables(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="solo-canjeables" className="text-sm font-normal">
                  Mostrar solo productos canjeables por azúcar
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-end mb-4">
          <TabsList>
            <TabsTrigger value="grid" className="px-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </TabsTrigger>
            <TabsTrigger value="list" className="px-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="8" x2="21" y1="6" y2="6" />
                <line x1="8" x2="21" y1="12" y2="12" />
                <line x1="8" x2="21" y1="18" y2="18" />
                <line x1="3" x2="3.01" y1="6" y2="6" />
                <line x1="3" x2="3.01" y1="12" y2="12" />
                <line x1="3" x2="3.01" y1="18" y2="18" />
              </svg>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productosOrdenados.map((producto) => (
              <Card key={producto.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={producto.imagen || "/placeholder.svg"}
                    alt={producto.nombre}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                </div>
                <CardHeader className="relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                      <CardDescription>{producto.categoria}</CardDescription>
                    </div>
                    {producto.descuento > 0 && (
                      <Badge variant="destructive" className="absolute top-4 right-4">
                        -{producto.descuento}%
                      </Badge>
                    )}
                    {producto.canjeAzucar && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Canjeable
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Precio por {producto.unidad}:</span>
                      <div className="text-right">
                        {producto.descuento > 0 && (
                          <span className="text-sm line-through text-muted-foreground mr-2">
                            {formatCurrency(producto.precio)}
                          </span>
                        )}
                        <span className="font-medium">
                          {formatCurrency(producto.precio * (1 - producto.descuento / 100))}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{producto.descripcion}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => agregarAlCarrito(producto)}>
                    Agregar al Carrito
                  </Button>
                  <Button onClick={() => agregarAlCarrito(producto)}>Comprar Ahora</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-4">
            {productosOrdenados.map((producto) => (
              <Card key={producto.id}>
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 p-4">
                    <img
                      src={producto.imagen || "/placeholder.svg"}
                      alt={producto.nombre}
                      className="h-40 w-full object-cover rounded-md"
                    />
                  </div>
                  <div className="md:w-3/4 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{producto.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{producto.categoria}</p>
                      </div>
                      <div className="flex space-x-2">
                        {producto.descuento > 0 && <Badge variant="destructive">-{producto.descuento}%</Badge>}
                        {producto.canjeAzucar && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Canjeable
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm mb-4">{producto.descripcion}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-muted-foreground">Precio por {producto.unidad}:</p>
                        <div>
                          {producto.descuento > 0 && (
                            <span className="text-sm line-through text-muted-foreground mr-2">
                              {formatCurrency(producto.precio)}
                            </span>
                          )}
                          <span className="text-lg font-bold">
                            {formatCurrency(producto.precio * (1 - producto.descuento / 100))}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => agregarAlCarrito(producto)}>
                          Agregar al Carrito
                        </Button>
                        <Button onClick={() => agregarAlCarrito(producto)}>Comprar Ahora</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
