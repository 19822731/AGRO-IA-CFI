"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Globe,
  Calendar,
  Info,
  Download,
  MapPin,
  Layers,
  RefreshCw,
  BarChart2,
  Cloud,
  Droplets,
  AlertTriangle,
  TreePine,
} from "lucide-react"
import dynamic from "next/dynamic"
import type { SatelliteMapRef } from "./components/satellite-map"
import NdviAnalysis from "./components/ndvi-analysis"
import EnvironmentalConditions from "./components/environmental-conditions"
import LandUseAnalysis from "./components/land-use-analysis"
import RiskAssessment from "./components/risk-assessment"
import SustainabilityAnalysis from "./components/sustainability-analysis"
import IntaSepaProducts from "./components/inta-sepa-products"

// Añadir estas importaciones al inicio del archivo
import LocationNotification from "@/components/location-notification"
import type L from "leaflet"

// Importamos el mapa dinámicamente para evitar problemas de SSR
const SatelliteMap = dynamic(() => import("./components/satellite-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-[#0a0f29] rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff]"></div>
    </div>
  ),
})

// Definir las áreas de interés
const areasOfInterest = [
  { id: 1, name: "Tucumán - Zona Norte", lat: -26.8083, lng: -65.2176, zoom: 11 },
  { id: 2, name: "Tucumán - Zona Centro", lat: -27.0, lng: -65.2, zoom: 11 },
  { id: 3, name: "Tucumán - Zona Sur", lat: -27.1917, lng: -65.1833, zoom: 11 },
  { id: 4, name: "Salta - Zona Cañera", lat: -24.7859, lng: -65.4117, zoom: 10 },
  { id: 5, name: "Jujuy - Zona Cañera", lat: -24.1858, lng: -65.2995, zoom: 10 },
  { id: 6, name: "Santiago del Estero", lat: -27.7951, lng: -64.2615, zoom: 9 },
]

// Definir los ingenios azucareros
const sugarMills = [
  { id: 1, name: "Ingenio Ledesma", lat: -23.8333, lng: -64.7833, region: "Jujuy" },
  { id: 2, name: "Ingenio La Esperanza", lat: -24.2333, lng: -64.8667, region: "Jujuy" },
  { id: 3, name: "Ingenio Río Grande", lat: -24.9667, lng: -65.1833, region: "Salta" },
  { id: 4, name: "Ingenio Concepción", lat: -27.3333, lng: -65.6, region: "Tucumán" },
  { id: 5, name: "Ingenio La Florida", lat: -27.1333, lng: -65.3167, region: "Tucumán" },
  { id: 6, name: "Ingenio Cruz Alta", lat: -26.9333, lng: -65.1833, region: "Tucumán" },
]

export default function ImagenesSatelitales() {
  // Añadir estas variables de estado dentro del componente ImagenesSatelitales
  const [showLocationNotification, setShowLocationNotification] = useState(true)
  const [selectedAreaBounds, setSelectedAreaBounds] = useState<L.LatLngBounds | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [selectedSource, setSelectedSource] = useState<string>("sentinel-2")
  const [selectedLayer, setSelectedLayer] = useState<string>("natural-color")
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [selectedArea, setSelectedArea] = useState<number | null>(null)
  const [selectedMill, setSelectedMill] = useState<number | null>(null)
  const [isChangingSettings, setIsChangingSettings] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("visualizacion")

  // Referencia al componente del mapa
  const mapRef = useRef<SatelliteMapRef>(null)

  // Función para manejar la descarga de la imagen
  const handleDownload = async () => {
    if (!mapRef.current) return

    try {
      setIsDownloading(true)
      await mapRef.current.downloadMap()
    } catch (error) {
      console.error("Error al descargar la imagen:", error)
      alert("Hubo un error al descargar la imagen. Por favor, intente nuevamente.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Función para centrar el mapa en un área de interés
  const handleAreaClick = (area: (typeof areasOfInterest)[0]) => {
    if (!mapRef.current) return

    // Centrar el mapa en las coordenadas del área
    mapRef.current.centerMapOn(area.lat, area.lng, area.zoom)

    // Actualizar el área seleccionada
    setSelectedArea(area.id)
    setSelectedMill(null)
  }

  // Función para centrar el mapa en un ingenio
  const handleMillClick = (mill: (typeof sugarMills)[0]) => {
    if (!mapRef.current) return

    // Centrar el mapa en las coordenadas del ingenio
    mapRef.current.centerMapOn(mill.lat, mill.lng, 13)

    // Actualizar el ingenio seleccionado
    setSelectedMill(mill.id)
    setSelectedArea(null)
  }

  // Añadir esta función dentro del componente ImagenesSatelitales
  const handleAreaSelected = (bounds: L.LatLngBounds) => {
    setSelectedAreaBounds(bounds)

    // Mostrar notificación de área seleccionada
    alert(`Área seleccionada: 
      Noreste: ${bounds.getNorthEast().lat.toFixed(4)}, ${bounds.getNorthEast().lng.toFixed(4)}
      Suroeste: ${bounds.getSouthWest().lat.toFixed(4)}, ${bounds.getSouthWest().lng.toFixed(4)}
    `)

    // Aquí se podría iniciar el análisis para el área seleccionada
    // Por ejemplo, cambiar a la pestaña de análisis NDVI
    setActiveTab("analisis-ndvi")
  }

  // Añadir esta función dentro del componente ImagenesSatelitales
  const handleAnalyzeUserLocation = (lat: number, lng: number) => {
    if (!mapRef.current) return

    // Centrar el mapa en la ubicación del usuario
    mapRef.current.centerMapOn(lat, lng, 12)

    // Cambiar a la pestaña de análisis NDVI
    setActiveTab("analisis-ndvi")
  }

  // Efecto para mostrar un indicador visual cuando cambian las configuraciones
  useEffect(() => {
    setIsChangingSettings(true)
    const timer = setTimeout(() => {
      setIsChangingSettings(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [selectedSource, selectedLayer, selectedDate])

  // Datos simulados para las fuentes de imágenes
  const sources = [
    { id: "sentinel-2", name: "Sentinel-2", description: "Imágenes de alta resolución (10m) de la ESA" },
    { id: "landsat-8", name: "Landsat 8", description: "Imágenes de la NASA/USGS (30m)" },
    { id: "conae", name: "CONAE", description: "Imágenes de la Comisión Nacional de Actividades Espaciales" },
    { id: "inta", name: "INTA", description: "Recursos del Instituto Nacional de Tecnología Agropecuaria" },
  ]

  // Datos simulados para las capas disponibles
  const layers = {
    "sentinel-2": [
      { id: "natural-color", name: "Color Natural", description: "Visualización en color verdadero (RGB)" },
      { id: "ndvi", name: "Índice de Vegetación (NDVI)", description: "Muestra la salud y densidad de la vegetación" },
      { id: "moisture", name: "Índice de Humedad", description: "Indica el contenido de humedad en el suelo" },
    ],
    "landsat-8": [
      { id: "natural-color", name: "Color Natural", description: "Visualización en color verdadero (RGB)" },
      { id: "ndvi", name: "Índice de Vegetación (NDVI)", description: "Muestra la salud y densidad de la vegetación" },
      { id: "thermal", name: "Banda Térmica", description: "Muestra la temperatura de la superficie" },
    ],
    conae: [
      { id: "saocom", name: "SAOCOM", description: "Imágenes de radar de apertura sintética" },
      { id: "sacd", name: "SAC-D", description: "Datos de la misión Aquarius/SAC-D" },
    ],
    inta: [
      { id: "ndvi_10d", name: "NDVI - Vigor Vegetal", description: "Índice de vegetación MODIS (datos reales NASA)" },
      { id: "et_10d", name: "EVI - Índice Mejorado", description: "Índice de vegetación mejorado MODIS (NASA)" },
      { id: "ch", name: "Mapa de Cultivos", description: "Clasificación nacional de cultivos (GeoINTA)" },
      { id: "ad", name: "Carbono en Suelos", description: "Stock de carbono orgánico del suelo (GeoINTA)" },
    ],
  }

  // Actualizar las capas disponibles cuando cambia la fuente
  useEffect(() => {
    if (layers[selectedSource]?.length > 0) {
      setSelectedLayer(layers[selectedSource][0].id)
    }
  }, [selectedSource])

  // Obtener el nombre del área seleccionada
  const getSelectedAreaName = () => {
    if (selectedArea) {
      const area = areasOfInterest.find((a) => a.id === selectedArea)
      return area ? area.name : "Área desconocida"
    }
    if (selectedMill) {
      const mill = sugarMills.find((m) => m.id === selectedMill)
      return mill ? `${mill.name} (${mill.region})` : "Ingenio desconocido"
    }
    return "Ninguna área seleccionada"
  }

  // Añadir estos elementos al return del componente, justo después del div principal de apertura
  return (
    <div className="space-y-6">
      {/* Notificación de ubicación */}
      {showLocationNotification && <LocationNotification onAnalyzeArea={handleAnalyzeUserLocation} />}

      {/* Resto del código existente... */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Imágenes Satelitales</h1>
        <Button variant="outline" size="sm" onClick={() => setIsInfoOpen(!isInfoOpen)}>
          <Info className="h-4 w-4 mr-2" />
          Acerca de esta herramienta
        </Button>
      </div>

      {isInfoOpen && (
        <Card className="bg-[#111936] border-[#1a2040]">
          <CardHeader>
            <CardTitle className="text-white">Acerca de las Imágenes Satelitales</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              Esta herramienta le permite visualizar imágenes satelitales de diferentes fuentes para monitorear sus
              cultivos y analizar condiciones del suelo, vegetación y clima.
            </p>
            <p>
              Las imágenes provienen de satélites como Sentinel-2 (Agencia Espacial Europea), Landsat 8 (NASA/USGS), y
              recursos nacionales como CONAE e INTA.
            </p>
            <p>
              El Índice de Vegetación (NDVI) es particularmente útil para evaluar la salud de los cultivos, donde los
              valores más altos (verde) indican vegetación más densa y saludable.
            </p>
            <p>Además de la visualización básica, puede acceder a análisis avanzados como:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Análisis temporal de NDVI para monitorear la evolución de los cultivos</li>
              <li>Condiciones ambientales y alertas de sequía o inundaciones</li>
              <li>Análisis de uso de la tierra y cambios en la cobertura vegetal</li>
              <li>Evaluación de riesgos y verificación para seguros paramétricos</li>
              <li>Análisis de sostenibilidad y certificaciones ambientales</li>
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="visualizacion" onValueChange={setActiveTab}>
        <TabsList className="bg-[#0a0f29]">
          <TabsTrigger
            value="visualizacion"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <Layers className="h-4 w-4 mr-2" />
            Visualización
          </TabsTrigger>
          <TabsTrigger
            value="analisis-ndvi"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Análisis NDVI
          </TabsTrigger>
          <TabsTrigger
            value="condiciones"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <Cloud className="h-4 w-4 mr-2" />
            Condiciones Ambientales
          </TabsTrigger>
          <TabsTrigger
            value="uso-tierra"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Uso de la Tierra
          </TabsTrigger>
          <TabsTrigger value="riesgos" className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Riesgos y Seguros
          </TabsTrigger>
          <TabsTrigger
            value="sostenibilidad"
            className="data-[state=active]:bg-[#1a2040] data-[state=active]:text-[#00a8ff]"
          >
            <TreePine className="h-4 w-4 mr-2" />
            Sostenibilidad
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Visualización */}
        <TabsContent value="visualizacion" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:sticky lg:top-4 pr-1">
              <Card className="bg-[#111936] border-[#1a2040]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-[#00a8ff]" />
                    Controles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 flex items-center">
                      <span className="mr-1">Fuente de Imágenes</span>
                      {isChangingSettings && <RefreshCw className="h-3 w-3 text-[#00a8ff] animate-spin ml-1" />}
                    </label>
                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                      <SelectTrigger className="w-full bg-[#0a0f29] border-[#1a2040] text-white">
                        <SelectValue placeholder="Seleccionar fuente" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                        {sources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">{sources.find((s) => s.id === selectedSource)?.description}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 flex items-center">
                      <span className="mr-1">Tipo de Visualización</span>
                      {isChangingSettings && <RefreshCw className="h-3 w-3 text-[#00a8ff] animate-spin ml-1" />}
                    </label>
                    <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                      <SelectTrigger className="bg-[#0a0f29] border-[#1a2040] text-white">
                        <SelectValue placeholder="Seleccionar capa" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f29] border-[#1a2040] text-white">
                        {layers[selectedSource]?.map((layer) => (
                          <SelectItem key={layer.id} value={layer.id}>
                            {layer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      {layers[selectedSource]?.find((l) => l.id === selectedLayer)?.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 flex items-center">
                      <span className="mr-1">Fecha de la Imagen</span>
                      {isChangingSettings && <RefreshCw className="h-3 w-3 text-[#00a8ff] animate-spin ml-1" />}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-[#0a0f29] border border-[#1a2040] rounded-md p-2 text-white"
                        max={new Date().toISOString().split("T")[0]}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">Seleccione la fecha de la imagen a visualizar</p>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full" onClick={handleDownload} disabled={isDownloading}>
                      {isDownloading ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                          Descargando...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Imagen
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {selectedLayer === "ndvi" && (
                <Card className="bg-[#111936] border-[#1a2040]">
                  <CardHeader>
                    <CardTitle className="text-white">Leyenda NDVI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-600 mr-2"></div>
                        <span className="text-sm text-gray-300">-1.0 a 0.0: Sin vegetación</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                        <span className="text-sm text-gray-300">0.0 a 0.33: Vegetación escasa</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-lime-500 mr-2"></div>
                        <span className="text-sm text-gray-300">0.33 a 0.66: Vegetación moderada</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-600 mr-2"></div>
                        <span className="text-sm text-gray-300">0.66 a 1.0: Vegetación densa</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedLayer === "thermal" && (
                <Card className="bg-[#111936] border-[#1a2040]">
                  <CardHeader>
                    <CardTitle className="text-white">Leyenda Térmica</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-400 mr-2"></div>
                        <span className="text-sm text-gray-300">Frío</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-400 mr-2"></div>
                        <span className="text-sm text-gray-300">Templado</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-orange-500 mr-2"></div>
                        <span className="text-sm text-gray-300">Caliente</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-600 mr-2"></div>
                        <span className="text-sm text-gray-300">Muy caliente</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedLayer === "ndvi_10d" && (
                <Card className="bg-[#111936] border-[#1a2040]">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Leyenda NDVI</CardTitle>
                    <CardDescription className="text-gray-400 text-xs">Índice de Vegetación (NASA MODIS)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#8B0000" }}></div>
                        <span className="text-xs text-gray-300">{"< 0.1: Suelo desnudo / Agua"}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#CD853F" }}></div>
                        <span className="text-xs text-gray-300">0.1 - 0.2: Vegetación muy escasa</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#F0E68C" }}></div>
                        <span className="text-xs text-gray-300">0.2 - 0.4: Vegetación escasa</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#9ACD32" }}></div>
                        <span className="text-xs text-gray-300">0.4 - 0.6: Vegetación moderada</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#228B22" }}></div>
                        <span className="text-xs text-gray-300">0.6 - 0.8: Vegetación densa</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#006400" }}></div>
                        <span className="text-xs text-gray-300">{"> 0.8: Vegetación muy densa"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedLayer === "et_10d" && (
                <Card className="bg-[#111936] border-[#1a2040]">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Leyenda EVI</CardTitle>
                    <CardDescription className="text-gray-400 text-xs">Índice de Vegetación Mejorado (NASA)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#A0522D" }}></div>
                        <span className="text-xs text-gray-300">{"< 0.1: Sin cobertura vegetal"}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#DAA520" }}></div>
                        <span className="text-xs text-gray-300">0.1 - 0.3: Bajo vigor</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#ADFF2F" }}></div>
                        <span className="text-xs text-gray-300">0.3 - 0.5: Vigor moderado</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#32CD32" }}></div>
                        <span className="text-xs text-gray-300">0.5 - 0.7: Buen vigor</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#006400" }}></div>
                        <span className="text-xs text-gray-300">{"> 0.7: Excelente vigor"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedLayer === "ch" && (
                <Card className="bg-[#111936] border-[#1a2040]">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Leyenda Cultivos</CardTitle>
                    <CardDescription className="text-gray-400 text-xs">Mapa Nacional de Cultivos (GeoINTA)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#FFD700" }}></div>
                        <span className="text-xs text-gray-300">Soja</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#FF8C00" }}></div>
                        <span className="text-xs text-gray-300">Maíz</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#DAA520" }}></div>
                        <span className="text-xs text-gray-300">Trigo</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#32CD32" }}></div>
                        <span className="text-xs text-gray-300">Caña de azúcar</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#FF69B4" }}></div>
                        <span className="text-xs text-gray-300">Algodón</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#228B22" }}></div>
                        <span className="text-xs text-gray-300">Pasturas</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#006400" }}></div>
                        <span className="text-xs text-gray-300">Monte / Bosque nativo</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#808080" }}></div>
                        <span className="text-xs text-gray-300">Urbano / Sin datos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedLayer === "ad" && (
                <Card className="bg-[#111936] border-[#1a2040]">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Leyenda Carbono</CardTitle>
                    <CardDescription className="text-gray-400 text-xs">Stock de Carbono Orgánico (GeoINTA)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#FFFFCC" }}></div>
                        <span className="text-xs text-gray-300">{"< 20 t/ha: Muy bajo"}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#C2E699" }}></div>
                        <span className="text-xs text-gray-300">20 - 40 t/ha: Bajo</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#78C679" }}></div>
                        <span className="text-xs text-gray-300">40 - 60 t/ha: Moderado</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#31A354" }}></div>
                        <span className="text-xs text-gray-300">60 - 80 t/ha: Alto</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: "#006837" }}></div>
                        <span className="text-xs text-gray-300">{"> 80 t/ha: Muy alto"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-3">
              <Card className="bg-[#111936] border-[#1a2040]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex justify-between items-center">
                    <span className="flex items-center">
                      <span className="mr-2">{layers[selectedSource]?.find((l) => l.id === selectedLayer)?.name}</span>
                      <span className="bg-[#1a2040] px-2 py-1 rounded-full text-xs text-[#00a8ff]">
                        {sources.find((s) => s.id === selectedSource)?.name}
                      </span>
                    </span>
                    {(selectedArea !== null || selectedMill !== null) && (
                      <div className="flex items-center bg-[#1a2040] px-3 py-1 rounded-full text-sm">
                        <MapPin className="h-3 w-3 mr-1 text-[#00a8ff]" />
                        <span className="text-[#00a8ff]">{getSelectedAreaName()}</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Fecha:{" "}
                    {new Date(selectedDate).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden rounded-lg relative">
                  <SatelliteMap
                    ref={mapRef}
                    source={selectedSource}
                    layer={selectedLayer}
                    date={selectedDate}
                    onAreaSelected={handleAreaSelected}
                  />

                  {/* Leyenda flotante sobre el mapa */}
                  {selectedSource === "inta" && (
                    <div className="absolute top-3 right-3 z-[1000] bg-[#111936]/90 backdrop-blur-sm border border-[#1a2040] rounded-lg p-3 max-w-[200px] shadow-lg">
                      <p className="text-white text-xs font-bold mb-2 border-b border-[#1a2040] pb-1">
                        {selectedLayer === "ndvi_10d" && "🟢 Leyenda NDVI"}
                        {selectedLayer === "et_10d" && "🌿 Leyenda EVI"}
                        {selectedLayer === "ch" && "🌾 Leyenda Cultivos"}
                        {selectedLayer === "ad" && "🪨 Leyenda Carbono"}
                      </p>
                      <div className="space-y-1">
                        {selectedLayer === "ndvi_10d" && (
                          <>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#8B0000" }}></div><span className="text-[10px] text-gray-300">{"< 0.1 Suelo / Agua"}</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#CD853F" }}></div><span className="text-[10px] text-gray-300">0.1-0.2 Muy escasa</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#F0E68C" }}></div><span className="text-[10px] text-gray-300">0.2-0.4 Escasa</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#9ACD32" }}></div><span className="text-[10px] text-gray-300">0.4-0.6 Moderada</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#228B22" }}></div><span className="text-[10px] text-gray-300">0.6-0.8 Densa</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#006400" }}></div><span className="text-[10px] text-gray-300">{"> 0.8 Muy densa"}</span></div>
                          </>
                        )}
                        {selectedLayer === "et_10d" && (
                          <>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#A0522D" }}></div><span className="text-[10px] text-gray-300">{"< 0.1 Sin cobertura"}</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#DAA520" }}></div><span className="text-[10px] text-gray-300">0.1-0.3 Bajo vigor</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#ADFF2F" }}></div><span className="text-[10px] text-gray-300">0.3-0.5 Moderado</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#32CD32" }}></div><span className="text-[10px] text-gray-300">0.5-0.7 Bueno</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#006400" }}></div><span className="text-[10px] text-gray-300">{"> 0.7 Excelente"}</span></div>
                          </>
                        )}
                        {selectedLayer === "ch" && (
                          <>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#FFD700" }}></div><span className="text-[10px] text-gray-300">Soja</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#FF8C00" }}></div><span className="text-[10px] text-gray-300">Maíz</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#DAA520" }}></div><span className="text-[10px] text-gray-300">Trigo</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#32CD32" }}></div><span className="text-[10px] text-gray-300">Caña de azúcar</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#FF69B4" }}></div><span className="text-[10px] text-gray-300">Algodón</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#228B22" }}></div><span className="text-[10px] text-gray-300">Pasturas</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#006400" }}></div><span className="text-[10px] text-gray-300">Monte / Bosque</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#808080" }}></div><span className="text-[10px] text-gray-300">Urbano / Sin datos</span></div>
                          </>
                        )}
                        {selectedLayer === "ad" && (
                          <>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#FFFFCC" }}></div><span className="text-[10px] text-gray-300">{"< 20 t/ha Muy bajo"}</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#C2E699" }}></div><span className="text-[10px] text-gray-300">20-40 t/ha Bajo</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#78C679" }}></div><span className="text-[10px] text-gray-300">40-60 t/ha Moderado</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#31A354" }}></div><span className="text-[10px] text-gray-300">60-80 t/ha Alto</span></div>
                            <div className="flex items-center"><div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#006837" }}></div><span className="text-[10px] text-gray-300">{"> 80 t/ha Muy alto"}</span></div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-[#00a8ff]" />
                  Áreas de Interés
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Regiones predefinidas para visualización rápida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areasOfInterest.map((area) => (
                    <Button
                      key={area.id}
                      variant={selectedArea === area.id ? "default" : "outline"}
                      className={`justify-start transition-all duration-300 ${
                        selectedArea === area.id
                          ? "bg-[#00a8ff] text-white border-[#00a8ff]"
                          : "hover:border-[#00a8ff] hover:text-[#00a8ff]"
                      }`}
                      onClick={() => handleAreaClick(area)}
                    >
                      <MapPin
                        className={`h-4 w-4 mr-2 ${selectedArea === area.id ? "text-white" : "text-[#00a8ff]"}`}
                      />
                      {area.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111936] border-[#1a2040]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-[#00a8ff]" />
                  Ingenios Azucareros
                </CardTitle>
                <CardDescription className="text-gray-400">Principales ingenios en la región</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sugarMills.map((mill) => (
                    <Button
                      key={mill.id}
                      variant={selectedMill === mill.id ? "default" : "outline"}
                      className={`justify-start transition-all duration-300 ${
                        selectedMill === mill.id
                          ? "bg-[#00a8ff] text-white border-[#00a8ff]"
                          : "hover:border-[#00a8ff] hover:text-[#00a8ff]"
                      }`}
                      onClick={() => handleMillClick(mill)}
                    >
                      <Droplets
                        className={`h-4 w-4 mr-2 ${selectedMill === mill.id ? "text-white" : "text-[#00a8ff]"}`}
                      />
                      {mill.name}
                      <span className="ml-1 text-xs opacity-70">({mill.region})</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Análisis NDVI */}
        <TabsContent value="analisis-ndvi" className="space-y-6 mt-6">
          {selectedArea !== null || selectedMill !== null ? (
            <NdviAnalysis selectedArea={getSelectedAreaName()} selectedDate={selectedDate} />
          ) : (
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">Seleccione un área para analizar</h3>
                <p className="text-gray-400 mb-4">
                  Para ver el análisis de NDVI, primero debe seleccionar un área de interés o un ingenio azucarero.
                </p>
                <Button onClick={() => setActiveTab("visualizacion")}>Ir a selección de áreas</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pestaña de Condiciones Ambientales */}
        <TabsContent value="condiciones" className="space-y-6 mt-6">
          {selectedArea !== null || selectedMill !== null ? (
            <EnvironmentalConditions selectedArea={getSelectedAreaName()} selectedDate={selectedDate} />
          ) : (
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardContent className="p-8 text-center">
                <Cloud className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">Seleccione un área para analizar</h3>
                <p className="text-gray-400 mb-4">
                  Para ver las condiciones ambientales, primero debe seleccionar un área de interés o un ingenio
                  azucarero.
                </p>
                <Button onClick={() => setActiveTab("visualizacion")}>Ir a selección de áreas</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pestaña de Uso de la Tierra */}
        <TabsContent value="uso-tierra" className="space-y-6 mt-6">
          {selectedArea !== null || selectedMill !== null ? (
            <LandUseAnalysis selectedArea={getSelectedAreaName()} selectedDate={selectedDate} />
          ) : (
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardContent className="p-8 text-center">
                <Layers className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">Seleccione un área para analizar</h3>
                <p className="text-gray-400 mb-4">
                  Para ver el análisis de uso de la tierra, primero debe seleccionar un área de interés o un ingenio
                  azucarero.
                </p>
                <Button onClick={() => setActiveTab("visualizacion")}>Ir a selección de áreas</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pestaña de Riesgos y Seguros */}
        <TabsContent value="riesgos" className="space-y-6 mt-6">
          {selectedArea !== null || selectedMill !== null ? (
            <RiskAssessment selectedArea={getSelectedAreaName()} selectedDate={selectedDate} />
          ) : (
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">Seleccione un área para analizar</h3>
                <p className="text-gray-400 mb-4">
                  Para ver el análisis de riesgos y seguros, primero debe seleccionar un área de interés o un ingenio
                  azucarero.
                </p>
                <Button onClick={() => setActiveTab("visualizacion")}>Ir a selección de áreas</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pestaña de Sostenibilidad */}
        <TabsContent value="sostenibilidad" className="space-y-6 mt-6">
          {selectedArea !== null || selectedMill !== null ? (
            <SustainabilityAnalysis selectedArea={getSelectedAreaName()} selectedDate={selectedDate} />
          ) : (
            <Card className="bg-[#111936] border-[#1a2040]">
              <CardContent className="p-8 text-center">
                <TreePine className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">Seleccione un área para analizar</h3>
                <p className="text-gray-400 mb-4">
                  Para ver el análisis de sostenibilidad, primero debe seleccionar un área de interés o un ingenio
                  azucarero.
                </p>
                <Button onClick={() => setActiveTab("visualizacion")}>Ir a selección de áreas</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
