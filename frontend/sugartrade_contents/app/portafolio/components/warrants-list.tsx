import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Warehouse, Calendar, Package } from "lucide-react"
import Link from "next/link"

interface Warrant {
  id: string
  totalBags: number
  deposito: string
  ingenio: string
  fechaEmision: string
  fechaVencimiento: string
  estado: string
}

interface WarrantsListProps {
  warrants: Warrant[]
}

export default function WarrantsList({ warrants }: WarrantsListProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#111936] border-[#1a2040]">
        <CardHeader>
          <CardTitle className="text-white">Mis Warrants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {warrants.length === 0 ? (
              <p className="text-gray-400">No tienes warrants activos.</p>
            ) : (
              warrants.map((warrant) => (
                <Link href={`/portafolio/warrant/${warrant.id}`} key={warrant.id}>
                  <div className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 hover:border-[#00a8ff] transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[#00a8ff] font-medium">Warrant #{warrant.id}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-400">
                            <Warehouse className="h-4 w-4 mr-2" />
                            <span>{warrant.deposito}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Vence: {warrant.fechaVencimiento}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Package className="h-4 w-4 mr-2" />
                            <span>{warrant.totalBags} bolsas</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#1a2040] px-2 py-1 rounded text-xs text-white uppercase">
                        {warrant.estado}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
