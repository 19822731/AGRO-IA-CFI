import sqlite3 from "sqlite3"
import { open } from "sqlite"
import path from "path"
import fs from "fs"
import dotenv from "dotenv"

// Cargar variables de entorno
dotenv.config()

async function inicializarBaseDeDatos() {
  // Obtener la ruta de la base de datos desde variables de entorno
  // Con fallback a una ruta local para desarrollo
  const DATABASE_URL = process.env.DATABASE_URL || path.join(process.cwd(), "data", "precios_azucar.db")

  // Asegurar que el directorio existe si estamos usando SQLite local
  if (!process.env.DATABASE_URL) {
    const dataDir = path.dirname(DATABASE_URL)
    if (!fs.existsSync(dataDir)) {
      console.log(`Creando directorio ${dataDir}...`)
      fs.mkdirSync(dataDir, { recursive: true })
    }
  }

  console.log(`Inicializando base de datos en: ${DATABASE_URL}`)

  // Abrir conexión a la base de datos
  const db = await open({
    filename: DATABASE_URL,
    driver: sqlite3.Database,
  })

  // Crear tabla si no existe
  await db.exec(`
    CREATE TABLE IF NOT EXISTS PreciosDelAzucar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mercado TEXT NOT NULL,
      fecha TEXT NOT NULL,
      precio REAL NOT NULL,
      unidad TEXT NOT NULL,
      datos_json TEXT
    )
  `)

  console.log("Tabla PreciosDelAzucar creada o verificada")

  // Insertar algunos datos de ejemplo si la tabla está vacía
  const count = await db.get("SELECT COUNT(*) as count FROM PreciosDelAzucar")

  if (count.count === 0) {
    console.log("Insertando datos de ejemplo...")

    const ejemplos = [
      {
        mercado: "Interno",
        fecha: "2025-04-01",
        precio: 23500,
        unidad: "ARS/bolsa 50kg",
        datos_json: JSON.stringify({ observacion: "Precio promedio en Tucumán" }),
      },
      {
        mercado: "Interno",
        fecha: "2025-03-25",
        precio: 23200,
        unidad: "ARS/bolsa 50kg",
        datos_json: JSON.stringify({ observacion: "Precio promedio en Salta" }),
      },
      {
        mercado: "Interno",
        fecha: "2025-03-18",
        precio: 22800,
        unidad: "ARS/bolsa 50kg",
        datos_json: JSON.stringify({ observacion: "Precio promedio nacional" }),
      },
    ]

    for (const ejemplo of ejemplos) {
      await db.run(
        "INSERT INTO PreciosDelAzucar (mercado, fecha, precio, unidad, datos_json) VALUES (?, ?, ?, ?, ?)",
        ejemplo.mercado,
        ejemplo.fecha,
        ejemplo.precio,
        ejemplo.unidad,
        ejemplo.datos_json,
      )
    }

    console.log("Datos de ejemplo insertados")
  } else {
    console.log(`La tabla ya contiene ${count.count} registros`)
  }

  await db.close()
  console.log("Inicialización completada")
}

inicializarBaseDeDatos()
  .then(() => console.log("Script finalizado exitosamente"))
  .catch((err) => {
    console.error("Error durante la inicialización:", err)
    process.exit(1)
  })
