"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { SimuladorFinanciamiento } from "../components/simulador-financiamiento"

// Datos de ejemplo para categorías de agroinsumos
const categorias = [
  { id: 1, nombre: "Fertilizantes" },
  { id: 2, nombre: "Herbicidas" },
  { id: 3, nombre: "Insecticidas" },
  { id: 4, nombre: "Semillas" },
  { id: 5, nombre: "Maquinaria" },
]

// Datos de ejemplo para proveedores
const proveedores = [
  { id: 1, nombre: "AgroInsumos SA", rating: 4.8 },
  { id: 2, nombre: "Química Agrícola", rating: 4.5 },
  { id: 3, nombre: "SemillasTech", rating: 4.7 },
  { id: 4, nombre: "Maquinaria Agrícola", rating: 4.6 },
]

// Datos de ejemplo para productos
const productos = [
  {
    id: 1,
    nombre: "Fertilizante Premium",
    categoria: "Fertilizantes",
    proveedor: "AgroInsumos SA",
    precio: 1200000,
    unidad: "Tonelada",
    disponibilidad: true,
    descripcion: "Fertilizante de alta calidad para caña de azúcar, con alto contenido de nitrógeno y potasio.",
  },
  {
    id: 2,
    nombre: "Herbicida Selectivo",
    categoria: "Herbicidas",
    proveedor: "Química Agrícola",
    precio: 850000,
    unidad: "1000 litros",
    disponibilidad: true,
    descripcion: "Herbicida selectivo para el control de malezas en cultivos de caña de azúcar.",
  },
  {
    id: 3,
    nombre: "Semillas Certificadas",
    categoria: "Semillas",
    proveedor: "SemillasTech",
    precio: 1500000,
    unidad: "Tonelada",
    disponibilidad: true,
    descripcion: "Semillas certificadas de caña de azúcar, con alto rendimiento y resistencia a enfermedades.",
  },
  {
    id: 4,
    nombre: "Tractor Agrícola",
    categoria: "Maquinaria",
    proveedor: "Maquinaria Agrícola",
    precio: 15000000,
    unidad: "Unidad",
    disponibilidad: true,
    descripcion: "Tractor agrícola de alta potencia, ideal para labores en cultivos de caña de azúcar.",
  },
  {
    id: 5,
    nombre: "Insecticida Biológico",
    categoria: "Insecticidas",
    proveedor: "Química Agrícola",
    precio: 950000,
    unidad: "1000 litros",
    disponibilidad: true,
    descripcion: "Insecticida biológico para el control de plagas en cultivos de caña de azúcar.",
  },
]

// Datos de ejemplo para pedidos
const pedidos = [
  {
    id: 1,
    fecha: "2023-06-15",
    productos: [
      { nombre: "Fertilizante Premium", cantidad: 2, precio: 1200000 },
      { nombre: "Herbicida Selectivo", cantidad: 1, precio: 850000 },
    ],
    total: 3250000,
    estado: "entregado",
  },
  {
    id: 2,
    fecha: "2023-07-05",
    productos: [{ nombre: "Semillas Certificadas", cantidad: 1, precio: 1500000 }],
    total: 1500000,
    estado: "en proceso",
  },
]

export default function AgroinsumoPage() {
  const [activeTab, setActiveTab] = useState("catalogo")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("")
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<string>("")
  const [busqueda, setBusqueda] = useState("")
  const [showSimulador, setShowSimulador] = useState(false)
  const [simuladorData, setSimuladorData] = useState({
    tipo: "Agroinsumo",
    monto: 0,
    plazo: 6,
    tasa: 20.5,
  })
  const [carrito, setCarrito] = useState<
    {
      id: number
      nombre: string
      cantidad: number
      precio: number
      total: number
    }[]
  >([])

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    const matchCategoria = categoriaSeleccionada ? producto.categoria === categoriaSeleccionada : true
    const matchProveedor = proveedorSeleccionado ? producto.proveedor === proveedorSeleccionado : true
    const matchBusqueda = busqueda
      ? producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      : true
    return matchCategoria && matchProveedor && matchBusqueda
  })

  // Agregar al carrito
  const agregarAlCarrito = (producto: (typeof productos)[0]) => {
    const itemExistente = carrito.find((item) => item.id === producto.id)

    if (itemExistente) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1, total: (item.cantidad + 1) * item.precio }
            : item,
        ),
      )
    } else {
      setCarrito([
        ...carrito,
        {
          id: producto.id,
          nombre: producto.nombre,
          cantidad: 1,
          precio: producto.precio,
          total: producto.precio,
        },
      ])
    }
  }

  // Eliminar del carrito
  const eliminarDelCarrito = (id: number) => {
    setCarrito(carrito.filter((item) => item.id !== id))
  }

  // Actualizar cantidad en carrito
  const actualizarCantidad = (id: number, cantidad: number) => {
    if (cantidad < 1) return

    setCarrito(carrito.map((item) => (item.id === id ? { ...item, cantidad, total: cantidad * item.precio } : item)))
  }

  // Calcular total del carrito
  const totalCarrito = carrito.reduce((sum, item) => sum + item.total, 0)

  // Simular financiamiento
  const simularFinanciamiento = () => {
    setSimuladorData({
      tipo: "Agroinsumo",
      monto: totalCarrito,
      plazo: 6,
      tasa: 20.5,
    })
    setShowSimulador(true)
  }

  // Formatear fechas
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financiamiento para Agroinsumos</h1>
          <p className="text-muted-foreground">
            Adquiera insumos agrícolas con financiamiento propio utilizando sus certificados como garantía
          </p>
        </div>
        <Button onClick={() => (window.location.href = "/utilidades/financiacion")}>Volver a Financiación</Button>
      </div>

      {/* Pestañas principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
          <TabsTrigger value="carrito">
            Carrito
            {carrito.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {carrito.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pedidos">Mis Pedidos</TabsTrigger>
        </TabsList>

        {/* Contenido de Catálogo */}
        <TabsContent value="catalogo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Filtre los productos por categoría, proveedor o búsqueda</CardDescription>
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
                          {categoria.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Select value={proveedorSeleccionado} onValueChange={setProveedorSeleccionado}>
                    <SelectTrigger id="proveedor">
                      <SelectValue placeholder="Todos los proveedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los proveedores</SelectItem>
                      {proveedores.map((proveedor) => (
                        <SelectItem key={proveedor.id} value={proveedor.nombre}>
                          {proveedor.nombre} ({proveedor.rating})
                        </SelectItem>
                      ))}
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
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {productosFiltrados.map((producto) => (
              <Card key={producto.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{producto.nombre}</CardTitle>
                      <CardDescription>{producto.proveedor}</CardDescription>
                    </div>
                    <Badge variant={producto.disponibilidad ? "default" : "secondary"}>
                      {producto.disponibilidad ? "Disponible" : "No disponible"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Precio por {producto.unidad}:</span>
                      <span className="font-medium">{formatCurrency(producto.precio)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Categoría:</span>
                      <span className="font-medium">{producto.categoria}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{producto.descripcion}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={!producto.disponibilidad}
                    className="w-full"
                  >
                    Agregar al Carrito
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contenido de Carrito */}
        <TabsContent value="carrito">
          <Card>
            <CardHeader>
              <CardTitle>Carrito de Compras</CardTitle>
              <CardDescription>Productos seleccionados para financiamiento</CardDescription>
            </CardHeader>
            <CardContent>
              {carrito.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Precio Unitario</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carrito.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nombre}</TableCell>
                        <TableCell>{formatCurrency(item.precio)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                              disabled={item.cantidad <= 1}
                            >
                              -
                            </Button>
                            <span>{item.cantidad}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => eliminarDelCarrito(item.id)}>
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No hay productos en el carrito</div>
              )}
            </CardContent>
            {carrito.length > 0 && (
              <CardFooter className="flex-col items-end space-y-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total:</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalCarrito)}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setCarrito([])}>
                    Vaciar Carrito
                  </Button>
                  <Button onClick={simularFinanciamiento}>Simular Financiamiento</Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Contenido de Pedidos */}
        <TabsContent value="pedidos">
          <Card>
            <CardHeader>
              <CardTitle>Mis Pedidos</CardTitle>
              <CardDescription>Historial de pedidos de agroinsumos</CardDescription>
            </CardHeader>
            <CardContent>
              {pedidos.length > 0 ? (
                <div className="space-y-4">
                  {pedidos.map((pedido) => (
                    <Card key={pedido.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-base">Pedido #{pedido.id}</CardTitle>
                            <CardDescription>{formatearFecha(pedido.fecha)}</CardDescription>
                          </div>
                          <Badge variant={pedido.estado === "entregado" ? "success" : "default"}>{pedido.estado}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead>Cantidad</TableHead>
                              <TableHead>Precio</TableHead>
                              <TableHead>Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pedido.productos.map((producto, index) => (
                              <TableRow key={index}>
                                <TableCell>{producto.nombre}</TableCell>
                                <TableCell>{producto.cantidad}</TableCell>
                                <TableCell>{formatCurrency(producto.precio)}</TableCell>
                                <TableCell>{formatCurrency(producto.cantidad * producto.precio)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total:</p>
                          <p className="text-lg font-bold">{formatCurrency(pedido.total)}</p>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No hay pedidos registrados</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Simulador de Financiamiento */}
      {showSimulador && (
        <SimuladorFinanciamiento isOpen={showSimulador} onClose={() => setShowSimulador(false)} data={simuladorData} />
      )}
    </div>
  )
}
