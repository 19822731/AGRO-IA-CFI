import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

export async function GET() {
  try {
    // 1. Ruta al archivo oficial de PRD generado por motor_prd_diario.py
    const baseDir = path.resolve(process.cwd(), "..", "Algoritmo v.2 ")
    const prdJsonPath = path.join(baseDir, "pronosticos", "prd_diario_oficial_hoy.json")
    const estacionalidadCsvPath = path.join(baseDir, "Datos", "estacionalidad_brasil_historica.csv")

    let prdData = null
    if (fs.existsSync(prdJsonPath)) {
      const raw = fs.readFileSync(prdJsonPath, "utf-8")
      prdData = JSON.parse(raw)
    }

    // 2. Curvas de estacionalidad mensual típicas (Argentina vs Brasil vs Precios)
    const meses = [
      { mes: "Ene", num: 1, zafra_arg_pct: 0, export_br_pct: 6.77, precio_medio_usd: 485, precio_bolsa_ars: 34200 },
      { mes: "Feb", num: 2, zafra_arg_pct: 0, export_br_pct: 6.06, precio_medio_usd: 495, precio_bolsa_ars: 34800 },
      { mes: "Mar", num: 3, zafra_arg_pct: 0, export_br_pct: 6.19, precio_medio_usd: 512, precio_bolsa_ars: 35500 },
      { mes: "Abr", num: 4, zafra_arg_pct: 5, export_br_pct: 4.94, precio_medio_usd: 528, precio_bolsa_ars: 36200 },
      { mes: "May", num: 5, zafra_arg_pct: 10, export_br_pct: 7.52, precio_medio_usd: 545, precio_bolsa_ars: 37500 },
      { mes: "Jun", num: 6, zafra_arg_pct: 20, export_br_pct: 8.90, precio_medio_usd: 535, precio_bolsa_ars: 36800 },
      { mes: "Jul", num: 7, zafra_arg_pct: 25, export_br_pct: 9.97, precio_medio_usd: 518, precio_bolsa_ars: 35900 },
      { mes: "Ago", num: 8, zafra_arg_pct: 25, export_br_pct: 10.24, precio_medio_usd: 505, precio_bolsa_ars: 35200 },
      { mes: "Sep", num: 9, zafra_arg_pct: 10, export_br_pct: 10.35, precio_medio_usd: 492, precio_bolsa_ars: 34500 },
      { mes: "Oct", num: 10, zafra_arg_pct: 5, export_br_pct: 10.62, precio_medio_usd: 482, precio_bolsa_ars: 33800 },
      { mes: "Nov", num: 11, zafra_arg_pct: 0, export_br_pct: 9.82, precio_medio_usd: 488, precio_bolsa_ars: 34100 },
      { mes: "Dic", num: 12, zafra_arg_pct: 0, export_br_pct: 8.62, precio_medio_usd: 490, precio_bolsa_ars: 34600 },
    ]

    // Curva acumulada de zafra y exportación
    let acumArg = 0
    let acumBr = 0
    const curvaAcumulada = meses.map((m) => {
      acumArg += m.zafra_arg_pct
      acumBr += m.export_br_pct
      return {
        ...m,
        zafra_arg_acum_pct: acumArg,
        export_br_acum_pct: Number(acumBr.toFixed(1)),
      }
    })

    const payload = {
      timestamp: new Date().toISOString(),
      prd: prdData,
      estacionalidad_mensual: curvaAcumulada,
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error("Error en API estacionalidad-prd:", error)
    return NextResponse.json({ error: "Error al cargar datos de estacionalidad y PRD" }, { status: 500 })
  }
}
