import Link from "next/link"
import { LuHome, LuWarehouse, LuClipboardList, LuBarChart3, LuCreditCard } from "react-icons/lu"

export default function Navigation() {
  return (
    <nav className="bg-gray-900 text-white p-4 fixed h-full w-64 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          <span style={{ color: "#4285F4" }}>A</span>
          <span style={{ color: "#EA4335" }}>gro</span>
          <span style={{ color: "#5F6368" }}>-</span>
          <span style={{ color: "#FBBC05" }}>I</span>
          <span style={{ color: "#34A853" }}>A</span>
        </h1>
        <p className="text-sm text-gray-400">Plataforma de gestión</p>
      </div>

      <ul className="space-y-6">
        <li>
          <Link href="/" className="flex items-center gap-3 text-lg hover:text-blue-400 transition-colors">
            <LuHome className="text-xl" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            href="/utilidades/warrants"
            className="flex items-center gap-3 text-lg hover:text-blue-400 transition-colors"
          >
            <LuClipboardList className="text-xl" />
            <span>Warrants y Certificados</span>
          </Link>
        </li>
        <li>
          <Link
            href="/utilidades/almacenaje"
            className="flex items-center gap-3 text-lg hover:text-blue-400 transition-colors"
          >
            <LuWarehouse className="text-xl" />
            <span>Almacenaje</span>
          </Link>
        </li>
        <li>
          <Link
            href="/utilidades/inteligencia-comercial"
            className="flex items-center gap-3 text-lg hover:text-blue-400 transition-colors"
          >
            <LuBarChart3 className="text-xl" />
            <span>Inteligencia Comercial IA</span>
          </Link>
        </li>
        <li>
          <Link
            href="/visor-cana"
            className="flex items-center gap-3 text-lg hover:text-green-400 transition-colors"
          >
            <LuClipboardList className="text-xl" />
            <span>( Visor-Caña )</span>
          </Link>
        </li>
        <li>
          <Link
            href="/utilidades/operaciones"
            className="flex items-center gap-3 text-lg hover:text-blue-400 transition-colors"
          >
            <LuBarChart3 className="text-xl" />
            <span>Operaciones</span>
          </Link>
        </li>
        <li>
          <Link
            href="/utilidades/financiacion"
            className="flex items-center gap-3 text-lg hover:text-blue-400 transition-colors"
          >
            <LuCreditCard className="text-xl" />
            <span>Financiación</span>
          </Link>
        </li>
      </ul>

      <div className="mt-auto pt-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Usuario conectado</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            <div>
              <p className="font-medium">Juan Pérez</p>
              <p className="text-xs text-gray-400">Productor</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
