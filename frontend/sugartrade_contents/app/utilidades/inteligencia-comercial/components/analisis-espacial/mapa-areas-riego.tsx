"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Definir tipos para las propiedades
interface AreaRiegoProperties {
  id?: number
  nombre?: string
  tipo?: string
  estado?: string
  superficie?: number
  canal?: string
}

interface AreaRiegoGeometry {
  coordinates?: number[][]
}

interface AreaRiego {
  properties?: AreaRiegoProperties
  geometry?: AreaRiegoGeometry
}

interface MapaAreasRiegoProps {
  areas: AreaRiego[]
}

export default function MapaAreasRiego({ areas = [] }: MapaAreasRiegoProps) {
  // Estado para el centro del mapa (por defecto: Tucumán, Argentina)
  const [center] = useState([-26.8083, -65.2176])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Corregir el problema de los íconos de Leaflet en Next.js
  useEffect(() => {
    if (isClient) {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      })
    }
  }, [isClient])

  return (
    <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {areas &&
        areas.length > 0 &&
        areas.map((area, index) => {
          // Verificar que el área y sus propiedades existan
          if (!area || !area.geometry || !area.geometry.coordinates || !area.properties) {
            return null
          }

          const coords = area.geometry.coordinates[0]
          if (!coords || coords.length < 2) {
            return null
          }

          return (
            <Marker key={area.properties.id || index} position={[coords[1], coords[0]]}>
              <Popup>
                <div>
                  <h3 className="font-bold">{area.properties.nombre || "Área sin nombre"}</h3>
                  <p>
                    <strong>Tipo:</strong> {area.properties.tipo || "No especificado"}
                  </p>
                  <p>
                    <strong>Estado:</strong> {area.properties.estado || "No especificado"}
                  </p>
                  <p>
                    <strong>Superficie:</strong> {area.properties.superficie || 0} ha
                  </p>
                  <p>
                    <strong>Canal:</strong> {area.properties.canal || "No especificado"}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
    </MapContainer>
  )
}
