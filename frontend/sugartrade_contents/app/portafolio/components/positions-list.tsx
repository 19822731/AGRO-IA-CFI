"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function PositionsList() {
  const [positions, setPositions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolio = async () => {
      const token = localStorage.getItem("auth_token") // Correct key from auth-service
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/portfolio`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setPositions(data)
        } else if (response.status === 401) {
          console.error("Unauthorized")
          // Optionally redirect or show error
        }
      } catch (error) {
        console.error("Error fetching portfolio", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [])

  // Calcular totales (simulado precio por ahora)
  const totalValue = positions.reduce((sum, p) => sum + (p.cantidad * 50000), 0) // Mock price 50000

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Posiciones Abiertas</h2>
          <p className="text-sm text-gray-400">Gestione sus activos en el mercado</p>
        </div>
      </div>

      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Resumen de Activos</CardTitle>
            <div className="flex space-x-4">
              <div>
                <CardDescription className="text-gray-400">Valor Estimado Total</CardDescription>
                <p className="text-xl font-bold text-white">$ {totalValue.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Cargando...</div>
          ) : !localStorage.getItem("auth_token") ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Inicie sesión para ver su portafolio</p>
              <Link href="/login">
                <Button>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No tiene activos disponibles</p>
              <Link href="/dashboard/alta-producto">
                <Button>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Dar de Alta Producto
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-[#1a2040]">
                    <TableHead className="text-gray-400">Producto</TableHead>
                    <TableHead className="text-gray-400">Commodity</TableHead>
                    <TableHead className="text-gray-400">Cantidad</TableHead>
                    <TableHead className="text-gray-400">Mercado</TableHead>
                    <TableHead className="text-gray-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position.id} className="hover:bg-[#1a2040]">
                      <TableCell className="font-medium text-white">{position.nombre}</TableCell>
                      <TableCell>{position.commodity}</TableCell>
                      <TableCell>{position.cantidad.toLocaleString("es-AR")} Tn</TableCell>
                      <TableCell>{position.mercado}</TableCell>
                      <TableCell>
                        <Link href={`/operar?producto=${position.id}`}>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4 text-gray-400 hover:text-[#00a8ff]" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
