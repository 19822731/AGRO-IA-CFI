"use client"

import type React from "react"

import { useEffect } from "react"
import L from "leaflet"
import { MapContainer, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"

interface MapComponentProps {
  center: [number, number]
  zoom: number
  children?: React.ReactNode
}

export default function MapComponent({ center, zoom, children }: MapComponentProps) {
  useEffect(() => {
    // Corregir el problema de los íconos de Leaflet en Next.js
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    })
  }, [])

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  )
}
