"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "./satellite-map.css" // Importar los estilos personalizados
import html2canvas from "html2canvas"

// Añadir estas importaciones al inicio del archivo
import { Button } from "@/components/ui/button"
import { Square, Trash2 } from "lucide-react"

// Corregir el problema de los íconos de Leaflet en Next.js
import { fixLeafletIcons } from "./leaflet-icon-fix"

// Definir la interfaz para las referencias expuestas
export interface SatelliteMapRef {
  downloadMap: () => Promise<void>
  centerMapOn: (lat: number, lng: number, zoom?: number) => void
  enableAreaSelection: () => void
  disableAreaSelection: () => void
}

// Añadir estas propiedades a la interfaz SatelliteMapProps
interface SatelliteMapProps {
  source: string
  layer: string
  date: string
  initialCenter?: [number, number]
  initialZoom?: number
  onAreaSelected?: (bounds: L.LatLngBounds) => void
}

const SatelliteMap = forwardRef<SatelliteMapRef, SatelliteMapProps>(
  (
    { source, layer, date, initialCenter = [-26.8083, -65.2176], initialZoom = 9, onAreaSelected: propsOnAreaSelected },
    ref,
  ) => {
    const mapRef = useRef<L.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const [activeMarker, setActiveMarker] = useState<L.Marker | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [currentOverlay, setCurrentOverlay] = useState<L.Layer | null>(null)

    // Añadir estas variables de estado dentro del componente SatelliteMap
    const [isAreaSelectionMode, setIsAreaSelectionMode] = useState(false)
    const [selectedArea, setSelectedArea] = useState<L.Rectangle | null>(null)
    const [areaSelectionControls, setAreaSelectionControls] = useState<L.Control | null>(null)

    // Exponer funciones a través de la referencia
    useImperativeHandle(ref, () => ({
      downloadMap: async () => {
        if (!mapContainerRef.current) return

        try {
          // Usar html2canvas para capturar el mapa como una imagen
          const canvas = await html2canvas(mapContainerRef.current)

          // Convertir el canvas a una URL de datos
          const imageUrl = canvas.toDataURL("image/png")

          // Crear un enlace de descarga
          const link = document.createElement("a")
          link.href = imageUrl
          link.download = `satellite-image-${source}-${layer}-${date}.png`

          // Simular un clic en el enlace para iniciar la descarga
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } catch (error) {
          console.error("Error al descargar la imagen:", error)
          alert("Hubo un error al descargar la imagen. Por favor, intente nuevamente.")
        }
      },

      // Función para centrar el mapa en coordenadas específicas
      centerMapOn: (lat: number, lng: number, zoom = 11) => {
        if (!mapRef.current) return

        // Centrar el mapa en las coordenadas
        mapRef.current.setView([lat, lng], zoom, {
          animate: true,
          duration: 1, // duración de la animación en segundos
        })

        // Eliminar el marcador anterior si existe
        if (activeMarker) {
          mapRef.current.removeLayer(activeMarker)
        }

        // Crear un nuevo marcador con un estilo personalizado
        const newMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div class="marker-pin" style="background-color: #00a8ff; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0, 168, 255, 0.5);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }).addTo(mapRef.current)

        // Añadir un círculo pulsante alrededor del marcador
        const pulseCircle = L.circle([lat, lng], {
          radius: 5000, // 5km de radio
          color: "#00a8ff",
          fillColor: "#00a8ff",
          fillOpacity: 0.2,
          weight: 2,
          className: "pulse-circle",
        }).addTo(mapRef.current)

        // Guardar referencia al nuevo marcador
        setActiveMarker(newMarker)

        // Añadir un popup con información
        newMarker
          .bindPopup(`
          <div style="text-align: center;">
            <strong>${lat.toFixed(4)}, ${lng.toFixed(4)}</strong><br>
            <span style="font-size: 0.9em;">Zoom: ${zoom}</span>
          </div>
        `)
          .openPopup()
      },
      enableAreaSelection: () => {
        if (!mapRef.current) return

        // Limpiar área seleccionada anterior
        if (selectedArea) {
          mapRef.current.removeLayer(selectedArea)
          setSelectedArea(null)
        }

        setIsAreaSelectionMode(true)

        // Crear controles personalizados para la selección de área
        const AreaSelectionControl = L.Control.extend({
          onAdd: () => {
            const container = L.DomUtil.create("div", "leaflet-bar leaflet-control")
            container.style.backgroundColor = "#111936"
            container.style.padding = "8px"
            container.style.borderRadius = "4px"
            container.style.border = "1px solid #1a2040"

            const content = `
              <div class="text-white text-sm mb-2">Seleccione un área:</div>
              <div class="flex space-x-2">
                <button id="cancel-selection" class="px-2 py-1 bg-[#1a2040] text-white rounded text-sm">Cancelar</button>
                <button id="confirm-selection" class="px-2 py-1 bg-[#00a8ff] text-white rounded text-sm" disabled>Confirmar</button>
              </div>
            `

            container.innerHTML = content

            // Añadir eventos a los botones
            setTimeout(() => {
              const cancelBtn = document.getElementById("cancel-selection")
              const confirmBtn = document.getElementById("confirm-selection")

              if (cancelBtn) {
                cancelBtn.addEventListener("click", () => {
                  disableAreaSelection()
                })
              }

              if (confirmBtn) {
                confirmBtn.addEventListener("click", () => {
                  if (selectedArea && propsOnAreaSelected) {
                    propsOnAreaSelected(selectedArea.getBounds())
                  }
                  disableAreaSelection()
                })
              }
            }, 0)

            return container
          },
        })

        const control = new AreaSelectionControl({ position: "topright" })
        control.addTo(mapRef.current)
        setAreaSelectionControls(control)

        // Configurar el evento de clic para iniciar la selección
        let startPoint: L.LatLng | null = null
        let rect: L.Rectangle | null = null

        const onMapClick = (e: L.LeafletMouseEvent) => {
          if (!mapRef.current) return

          if (!startPoint) {
            // Primer clic - establecer punto de inicio
            startPoint = e.latlng

            // Mostrar marcador para el punto inicial
            L.marker(startPoint, {
              icon: L.divIcon({
                className: "start-point-marker",
                html: '<div style="width: 10px; height: 10px; background-color: #00a8ff; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [10, 10],
              }),
            }).addTo(mapRef.current)
          } else {
            // Segundo clic - crear rectángulo
            const bounds = L.latLngBounds(startPoint, e.latlng)

            if (rect) {
              mapRef.current.removeLayer(rect)
            }

            rect = L.rectangle(bounds, {
              color: "#00a8ff",
              weight: 2,
              fillColor: "#00a8ff",
              fillOpacity: 0.2,
            }).addTo(mapRef.current)

            setSelectedArea(rect)

            // Habilitar botón de confirmar
            const confirmBtn = document.getElementById("confirm-selection")
            if (confirmBtn) {
              confirmBtn.removeAttribute("disabled")
            }

            // Reiniciar para permitir nueva selección
            startPoint = null
          }
        }

        mapRef.current.on("click", onMapClick)

        // Guardar la referencia al evento para poder eliminarlo después
        mapRef.current.areaSelectionClickHandler = onMapClick
      },
      disableAreaSelection: () => {
        disableAreaSelection()
      },
    }))

    // Añadir esta función dentro del componente SatelliteMap
    const disableAreaSelection = () => {
      if (!mapRef.current) return

      // Eliminar el controlador de eventos de clic
      if (mapRef.current.areaSelectionClickHandler) {
        mapRef.current.off("click", mapRef.current.areaSelectionClickHandler)
        delete mapRef.current.areaSelectionClickHandler
      }

      // Eliminar los controles de selección
      if (areaSelectionControls && mapRef.current) {
        mapRef.current.removeControl(areaSelectionControls)
        setAreaSelectionControls(null)
      }

      // Eliminar marcadores de inicio si existen
      const markers = document.getElementsByClassName("start-point-marker")
      while (markers.length > 0) {
        markers[0].remove()
      }

      setIsAreaSelectionMode(false)
    }

    useEffect(() => {
      // Corregir los íconos de Leaflet
      fixLeafletIcons()

      // Inicializar el mapa si no existe
      if (!mapRef.current && mapContainerRef.current) {
        // Centrar en las coordenadas iniciales
        mapRef.current = L.map(mapContainerRef.current).setView(initialCenter, initialZoom)

        // Añadir capa base de OpenStreetMap
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current)

        // Añadir controles de zoom en una posición más visible
        mapRef.current.zoomControl.setPosition("bottomright")

        // Añadir escala
        L.control
          .scale({
            imperial: false,
            position: "bottomleft",
          })
          .addTo(mapRef.current)
      }
    }, [initialCenter, initialZoom])

    // Efecto para actualizar la visualización cuando cambian source, layer o date
    useEffect(() => {
      if (!mapRef.current) return

      // Simular carga de datos
      const loadSatelliteData = async () => {
        setIsLoading(true)

        // Eliminar la capa actual si existe
        if (currentOverlay && mapRef.current) {
          mapRef.current.removeLayer(currentOverlay)
          setCurrentOverlay(null)
        }

        // Simular tiempo de carga (entre 0.5 y 1.5 segundos)
        const loadTime = Math.random() * 1000 + 500
        await new Promise((resolve) => setTimeout(resolve, loadTime))

        // Generar visualización según la fuente, capa y fecha
        const newOverlay = generateVisualization(source, layer, date)

        if (newOverlay && mapRef.current) {
          newOverlay.addTo(mapRef.current)
          setCurrentOverlay(newOverlay)
        }

        setIsLoading(false)
      }

      loadSatelliteData()
    }, [source, layer, date])

    // Función para generar visualizaciones según la fuente, capa y fecha
    const generateVisualization = (source: string, layer: string, date: string): L.Layer | null => {
      if (!mapRef.current) return null

      const bounds = mapRef.current.getBounds()
      const center = mapRef.current.getCenter()

      // Generar un valor de "semilla" basado en la fecha para crear variaciones
      const dateSeed = new Date(date).getTime() % 100 // 0-99
      const dateVariation = dateSeed / 100 // 0-0.99

      // Diferentes visualizaciones según la fuente
      switch (source) {
        case "sentinel-2": {
          // Sentinel-2 (tonos azulados para color natural, verdes para NDVI)
          if (layer === "ndvi") {
            // Visualización NDVI para Sentinel-2
            const ndviLayer = L.layerGroup()

            // Añadir un rectángulo base con gradiente
            L.rectangle([bounds.getNorthEast(), bounds.getSouthWest()], {
              color: "#00a8ff",
              weight: 1,
              fillColor: "#00ff00",
              fillOpacity: 0.2 + dateVariation * 0.1,
            }).addTo(ndviLayer)

            // Añadir círculos con diferentes valores de NDVI
            const circlePositions = [
              { lat: center.lat + 0.1, lng: center.lng - 0.1, value: 0.8 + dateVariation * 0.2 },
              { lat: center.lat - 0.05, lng: center.lng + 0.15, value: 0.5 + dateVariation * 0.2 },
              { lat: center.lat - 0.2, lng: center.lng - 0.05, value: 0.3 + dateVariation * 0.2 },
              { lat: center.lat + 0.15, lng: center.lng + 0.2, value: 0.1 + dateVariation * 0.2 },
            ]

            circlePositions.forEach((pos) => {
              // Determinar color según el valor NDVI
              let color
              if (pos.value > 0.66) color = "green"
              else if (pos.value > 0.33) color = "lime"
              else if (pos.value > 0) color = "yellow"
              else color = "red"

              L.circle([pos.lat, pos.lng], {
                radius: 3000 + Math.random() * 2000,
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
              }).addTo(ndviLayer)
            })

            // Añadir texto de marca de agua
            addWatermark("Sentinel-2 NDVI • " + date)

            return ndviLayer
          } else if (layer === "moisture") {
            // Visualización de humedad para Sentinel-2
            const moistureLayer = L.layerGroup()

            // Añadir un rectángulo base con tonos azules
            L.rectangle([bounds.getNorthEast(), bounds.getSouthWest()], {
              color: "#00a8ff",
              weight: 1,
              fillColor: "#0000ff",
              fillOpacity: 0.1 + dateVariation * 0.1,
            }).addTo(moistureLayer)

            // Añadir patrones de humedad
            const positions = [
              { lat: center.lat + 0.1, lng: center.lng - 0.1, value: 0.8 + dateVariation * 0.2 },
              { lat: center.lat - 0.05, lng: center.lng + 0.15, value: 0.6 + dateVariation * 0.2 },
              { lat: center.lat - 0.2, lng: center.lng - 0.05, value: 0.4 + dateVariation * 0.2 },
              { lat: center.lat + 0.15, lng: center.lng + 0.2, value: 0.2 + dateVariation * 0.2 },
            ]

            positions.forEach((pos) => {
              const opacity = pos.value
              L.circle([pos.lat, pos.lng], {
                radius: 4000 + Math.random() * 2000,
                color: "#0066ff",
                fillColor: "#0066ff",
                fillOpacity: opacity,
              }).addTo(moistureLayer)
            })

            // Añadir texto de marca de agua
            addWatermark("Sentinel-2 Moisture • " + date)

            return moistureLayer
          } else {
            // Color natural para Sentinel-2 (tonos azulados)
            const naturalLayer = L.layerGroup()

            // Añadir un rectángulo base con tonos naturales
            L.rectangle([bounds.getNorthEast(), bounds.getSouthWest()], {
              color: "#00a8ff",
              weight: 1,
              fillColor: "#a0d8ef",
              fillOpacity: 0.1 + dateVariation * 0.05,
            }).addTo(naturalLayer)

            // Simular patrones de vegetación y agua
            const features = [
              { type: "water", lat: center.lat + 0.1, lng: center.lng - 0.1 },
              { type: "forest", lat: center.lat - 0.05, lng: center.lng + 0.15 },
              { type: "urban", lat: center.lat - 0.2, lng: center.lng - 0.05 },
              { type: "agriculture", lat: center.lat + 0.15, lng: center.lng + 0.2 },
            ]

            features.forEach((feature) => {
              let color, opacity

              switch (feature.type) {
                case "water":
                  color = "#0066ff"
                  opacity = 0.4 + dateVariation * 0.1
                  break
                case "forest":
                  color = "#006600"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                case "urban":
                  color = "#cc9966"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                case "agriculture":
                  color = "#99cc00"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                default:
                  color = "#ffffff"
                  opacity = 0.2
              }

              L.circle([feature.lat, feature.lng], {
                radius: 3000 + Math.random() * 2000,
                color: color,
                fillColor: color,
                fillOpacity: opacity,
              }).addTo(naturalLayer)
            })

            // Añadir texto de marca de agua
            addWatermark("Sentinel-2 Natural Color • " + date)

            return naturalLayer
          }
        }

        case "landsat-8": {
          // Landsat-8 (tonos más cálidos/rojizos para color natural)
          if (layer === "ndvi") {
            // Visualización NDVI para Landsat-8
            const ndviLayer = L.layerGroup()

            // Añadir un rectángulo base con gradiente
            L.rectangle([bounds.getNorthEast(), bounds.getSouthWest()], {
              color: "#ff6600",
              weight: 1,
              fillColor: "#00ff00",
              fillOpacity: 0.15 + dateVariation * 0.1,
            }).addTo(ndviLayer)

            // Añadir círculos con diferentes valores de NDVI
            // Patrón diferente al de Sentinel-2
            const circlePositions = [
              { lat: center.lat - 0.12, lng: center.lng + 0.08, value: 0.9 + dateVariation * 0.1 },
              { lat: center.lat + 0.08, lng: center.lng - 0.12, value: 0.6 + dateVariation * 0.1 },
              { lat: center.lat + 0.18, lng: center.lng + 0.05, value: 0.4 + dateVariation * 0.1 },
              { lat: center.lat - 0.05, lng: center.lng - 0.18, value: 0.2 + dateVariation * 0.1 },
            ]

            circlePositions.forEach((pos) => {
              // Determinar color según el valor NDVI
              let color
              if (pos.value > 0.66) color = "green"
              else if (pos.value > 0.33) color = "lime"
              else if (pos.value > 0) color = "yellow"
              else color = "red"

              L.circle([pos.lat, pos.lng], {
                radius: 2500 + Math.random() * 2000,
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
              }).addTo(ndviLayer)
            })

            // Añadir texto de marca de agua
            addWatermark("Landsat-8 NDVI • " + date)

            return ndviLayer
          } else if (layer === "thermal") {
            // Visualización térmica para Landsat-8
            const thermalLayer = L.layerGroup()

            // Añadir un rectángulo base con tonos térmicos
            L.rectangle([bounds.getNorthEast(), bounds.getSouthWest()], {
              color: "#ff6600",
              weight: 1,
              fillColor: "#ff9900",
              fillOpacity: 0.1 + dateVariation * 0.1,
            }).addTo(thermalLayer)

            // Añadir patrones térmicos
            const positions = [
              { lat: center.lat - 0.1, lng: center.lng + 0.1, value: 0.9 + dateVariation * 0.1 },
              { lat: center.lat + 0.1, lng: center.lng - 0.1, value: 0.7 + dateVariation * 0.1 },
              { lat: center.lat + 0.2, lng: center.lng + 0.1, value: 0.5 + dateVariation * 0.1 },
              { lat: center.lat - 0.1, lng: center.lng - 0.2, value: 0.3 + dateVariation * 0.1 },
            ]

            positions.forEach((pos) => {
              // Determinar color según el valor térmico
              let color
              if (pos.value > 0.8)
                color = "#ff0000" // Muy caliente
              else if (pos.value > 0.6)
                color = "#ff6600" // Caliente
              else if (pos.value > 0.4)
                color = "#ffcc00" // Templado
              else color = "#66ccff" // Frío

              L.circle([pos.lat, pos.lng], {
                radius: 3500 + Math.random() * 2000,
                color: color,
                fillColor: color,
                fillOpacity: 0.4,
              }).addTo(thermalLayer)
            })

            // Añadir texto de marca de agua
            addWatermark("Landsat-8 Thermal • " + date)

            return thermalLayer
          } else {
            // Color natural para Landsat-8 (tonos más cálidos/rojizos)
            const naturalLayer = L.layerGroup()

            // Añadir un rectángulo base con tonos naturales
            L.rectangle([bounds.getNorthEast(), bounds.getSouthWest()], {
              color: "#ff6600",
              weight: 1,
              fillColor: "#ffcc99",
              fillOpacity: 0.1 + dateVariation * 0.05,
            }).addTo(naturalLayer)

            // Simular patrones de vegetación y agua
            const features = [
              { type: "water", lat: center.lat - 0.12, lng: center.lng + 0.08 },
              { type: "forest", lat: center.lat + 0.08, lng: center.lng - 0.12 },
              { type: "urban", lat: center.lat + 0.18, lng: center.lng + 0.05 },
              { type: "agriculture", lat: center.lat - 0.05, lng: center.lng - 0.18 },
            ]

            features.forEach((feature) => {
              let color, opacity

              switch (feature.type) {
                case "water":
                  color = "#3399cc"
                  opacity = 0.4 + dateVariation * 0.1
                  break
                case "forest":
                  color = "#336600"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                case "urban":
                  color = "#cc6633"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                case "agriculture":
                  color = "#cccc00"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                default:
                  color = "#ffffff"
                  opacity = 0.2
              }

              L.circle([feature.lat, feature.lng], {
                radius: 3000 + Math.random() * 2000,
                color: color,
                fillColor: color,
                fillOpacity: opacity,
              }).addTo(naturalLayer)
            })

            // Añadir texto de marca de agua
            addWatermark("Landsat-8 Natural Color • " + date)

            return naturalLayer
          }
        }

        case "conae": {
          // CONAE (tonos más verdosos)
          if (layer === "saocom") {
            // Visualización SAOCOM para CONAE
            const saocomLayer = L.layerGroup()

            // Añadir un rectángulo base con tonos de radar
            L.rectangle([bounds.getNorthEast(), bounds.getSouthWest()], {
              color: "#33cc33",
              weight: 1,
              fillColor: "#ccffcc",
              fillOpacity: 0.1 + dateVariation * 0.1,
            }).addTo(saocomLayer)

            // Añadir patrones de radar
            const positions = [
              { lat: center.lat - 0.15, lng: center.lng - 0.15, value: 0.9 + dateVariation * 0.1 },
              { lat: center.lat + 0.15, lng: center.lng + 0.15, value: 0.7 + dateVariation * 0.1 },
              { lat: center.lat + 0.15, lng: center.lng - 0.15, value: 0.5 + dateVariation * 0.1 },
              { lat: center.lat - 0.15, lng: center.lng + 0.15, value: 0.3 + dateVariation * 0.1 },
            ]

            positions.forEach((pos) => {
              const opacity = pos.value * 0.5
              L.circle([pos.lat, pos.lng], {
                radius: 4000 + Math.random() * 2000,
                color: "#33cc33",
                fillColor: "#33cc33",
                fillOpacity: opacity,
              }).addTo(saocomLayer)
            })

            // Añadir texto de marca de agua
            addWatermark("CONAE SAOCOM • " + date)

            return saocomLayer
          } else {
            // SAC-D para CONAE
            const sacdLayer = L.layerGroup()

            // Añadir un rectángulo base
            L.rectangle([bounds.getNorthEast(), bounds.getSouthWest()], {
              color: "#33cc33",
              weight: 1,
              fillColor: "#99ff99",
              fillOpacity: 0.1 + dateVariation * 0.05,
            }).addTo(sacdLayer)

            // Simular patrones de vegetación y agua
            const features = [
              { type: "water", lat: center.lat - 0.15, lng: center.lng - 0.15 },
              { type: "forest", lat: center.lat + 0.15, lng: center.lng + 0.15 },
              { type: "urban", lat: center.lat + 0.15, lng: center.lng - 0.15 },
              { type: "agriculture", lat: center.lat - 0.15, lng: center.lng + 0.15 },
            ]

            features.forEach((feature) => {
              let color, opacity

              switch (feature.type) {
                case "water":
                  color = "#0099cc"
                  opacity = 0.4 + dateVariation * 0.1
                  break
                case "forest":
                  color = "#009900"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                case "urban":
                  color = "#996633"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                case "agriculture":
                  color = "#99cc00"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                default:
                  color = "#ffffff"
                  opacity = 0.2
              }

              L.circle([feature.lat, feature.lng], {
                radius: 3000 + Math.random() * 2000,
                color: color,
                fillColor: color,
                fillOpacity: opacity,
              }).addTo(sacdLayer)
            })

            // Añadir texto de marca de agua
            addWatermark("CONAE SAC-D • " + date)

            return sacdLayer
          }
        }

        case "inta": {
          // INTA (tonos más amarillentos)
          if (layer === "cultivos") {
            // Visualización de cultivos para INTA
            const cultivosLayer = L.layerGroup()

            // Añadir un rectángulo base
            L.rectangle([bounds.getNorthEast(), bounds.getSouthWest()], {
              color: "#cccc00",
              weight: 1,
              fillColor: "#ffffcc",
              fillOpacity: 0.1 + dateVariation * 0.1,
            }).addTo(cultivosLayer)

            // Añadir patrones de cultivos
            const positions = [
              { lat: center.lat - 0.1, lng: center.lng - 0.2, type: "maiz" },
              { lat: center.lat + 0.1, lng: center.lng + 0.2, type: "trigo" },
              { lat: center.lat + 0.2, lng: center.lng - 0.1, type: "soja" },
              { lat: center.lat - 0.2, lng: center.lng + 0.1, type: "caña" },
            ]

            positions.forEach((pos) => {
              let color

              switch (pos.type) {
                case "maiz":
                  color = "#ffcc00"
                  break
                case "trigo":
                  color = "#cc9900"
                  break
                case "soja":
                  color = "#99cc00"
                  break
                case "caña":
                  color = "#66cc00"
                  break
                default:
                  color = "#ffffff"
              }

              L.circle([pos.lat, pos.lng], {
                radius: 3500 + Math.random() * 2000,
                color: color,
                fillColor: color,
                fillOpacity: 0.4 + dateVariation * 0.1,
              }).addTo(cultivosLayer)
            })

            // Añadir texto de marca de agua
            addWatermark("INTA Cultivos • " + date)

            return cultivosLayer
          } else {
            // Mapa de suelos para INTA
            const suelosLayer = L.layerGroup()

            // Añadir un rectángulo base
            L.rectangle([bounds.getNorthEast(), bounds.getSouthWest()], {
              color: "#cccc00",
              weight: 1,
              fillColor: "#ffffcc",
              fillOpacity: 0.1 + dateVariation * 0.05,
            }).addTo(suelosLayer)

            // Simular patrones de suelos
            const features = [
              { type: "arcilloso", lat: center.lat - 0.1, lng: center.lng - 0.2 },
              { type: "arenoso", lat: center.lat + 0.1, lng: center.lng + 0.2 },
              { type: "limoso", lat: center.lat + 0.2, lng: center.lng - 0.1 },
              { type: "humifero", lat: center.lat - 0.2, lng: center.lng + 0.1 },
            ]

            features.forEach((feature) => {
              let color, opacity

              switch (feature.type) {
                case "arcilloso":
                  color = "#996633"
                  opacity = 0.4 + dateVariation * 0.1
                  break
                case "arenoso":
                  color = "#ffcc99"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                case "limoso":
                  color = "#cc9966"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                case "humifero":
                  color = "#663300"
                  opacity = 0.3 + dateVariation * 0.1
                  break
                default:
                  color = "#ffffff"
                  opacity = 0.2
              }

              L.circle([feature.lat, feature.lng], {
                radius: 3000 + Math.random() * 2000,
                color: color,
                fillColor: color,
                fillOpacity: opacity,
              }).addTo(suelosLayer)
            })

            // Añadir texto de marca de agua
            addWatermark("INTA Suelos • " + date)

            return suelosLayer
          }
        }

        default:
          return null
      }
    }

    // Función para añadir marca de agua con información de la imagen
    const addWatermark = (text: string) => {
      if (!mapRef.current) return

      // Crear un control personalizado para la marca de agua
      const WatermarkControl = L.Control.extend({
        onAdd: () => {
          const div = L.DomUtil.create("div", "map-watermark")
          div.innerHTML = text
          div.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
          div.style.color = "white"
          div.style.padding = "5px 10px"
          div.style.borderRadius = "4px"
          div.style.fontSize = "12px"
          div.style.fontFamily = "monospace"
          return div
        },
      })

      // Añadir el control al mapa
      new WatermarkControl({ position: "bottomleft" }).addTo(mapRef.current)
    }

    // Añadir estos elementos al return del componente, justo antes del cierre del div principal
    return (
      <div ref={mapContainerRef} className="h-[600px] w-full rounded-lg relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000] rounded-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
              <p className="text-white mt-4">Cargando imagen satelital...</p>
              <p className="text-[#00a8ff] text-sm mt-1">
                {source} • {layer} • {date}
              </p>
            </div>
          </div>
        )}

        {/* Botón flotante para selección de área */}
        {!isAreaSelectionMode && !isLoading && (
          <div className="absolute bottom-4 right-4 z-[1000]">
            <Button
              onClick={() => ref.current?.enableAreaSelection()}
              className="bg-[#111936] hover:bg-[#1a2040] border border-[#1a2040]"
              size="sm"
            >
              <Square className="h-4 w-4 mr-2" />
              Seleccionar área
            </Button>
          </div>
        )}

        {/* Botón para limpiar selección */}
        {selectedArea && !isAreaSelectionMode && (
          <div className="absolute bottom-4 left-4 z-[1000]">
            <Button
              onClick={() => {
                if (mapRef.current && selectedArea) {
                  mapRef.current.removeLayer(selectedArea)
                  setSelectedArea(null)
                }
              }}
              variant="outline"
              size="sm"
              className="bg-[#111936] hover:bg-[#1a2040] border border-[#1a2040]"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar selección
            </Button>
          </div>
        )}
      </div>
    )
  },
)

SatelliteMap.displayName = "SatelliteMap"

export default SatelliteMap
