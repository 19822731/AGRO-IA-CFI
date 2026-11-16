"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, MapPin, Newspaper, BarChart2, CloudRain } from "lucide-react"
import Link from "next/link"

export default function MundoCampo() {
  const [activeTab, setActiveTab] = useState("noticias")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Mundo Agro</h1>

      <Tabs defaultValue="noticias" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="noticias">Noticias</TabsTrigger>
          <TabsTrigger value="clima">Clima</TabsTrigger>
          <TabsTrigger value="herramientas">Herramientas</TabsTrigger>
        </TabsList>

        <TabsContent value="noticias" className="space-y-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Últimas Noticias del Sector</CardTitle>
              <CardDescription className="text-gray-400">
                Información actualizada sobre el mercado azucarero
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Récord de producción de azúcar en Tucumán",
                  date: "15 de diciembre, 2023",
                  summary:
                    "La provincia de Tucumán registró un récord histórico en la producción de azúcar durante la zafra 2023.",
                },
                {
                  title: "Nuevas regulaciones para la exportación de azúcar",
                  date: "10 de diciembre, 2023",
                  summary:
                    "El gobierno anunció cambios en las regulaciones para la exportación de azúcar que entrarán en vigor en enero.",
                },
                {
                  title: "Innovaciones tecnológicas en la industria azucarera",
                  date: "5 de diciembre, 2023",
                  summary:
                    "Nuevas tecnologías están transformando la forma en que se produce y procesa el azúcar en Argentina.",
                },
              ].map((news, index) => (
                <div
                  key={index}
                  className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 hover:border-[#00a8ff] transition-colors"
                >
                  <h3 className="text-[#00a8ff] font-medium">{news.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{news.date}</p>
                  <p className="text-sm text-gray-300 mt-2">{news.summary}</p>
                  <div className="mt-3">
                    <Link href="#" className="text-sm text-[#00a8ff] hover:underline inline-flex items-center">
                      Leer más
                      <Newspaper className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Tendencias del Mercado</CardTitle>
              <CardDescription className="text-gray-400">
                Análisis de precios y tendencias del mercado azucarero
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-[#0a0f29] rounded-lg">
                <div className="text-center">
                  <BarChart2 className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                  <p className="text-gray-400">Gráfico de tendencias en desarrollo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clima" className="space-y-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Pronóstico del Tiempo</CardTitle>
              <CardDescription className="text-gray-400">
                Pronóstico para las principales zonas azucareras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    location: "Tucumán",
                    temp: "28°C",
                    condition: "Soleado",
                    humidity: "45%",
                    wind: "10 km/h",
                  },
                  {
                    location: "Salta",
                    temp: "26°C",
                    condition: "Parcialmente nublado",
                    humidity: "50%",
                    wind: "15 km/h",
                  },
                  {
                    location: "Jujuy",
                    temp: "25°C",
                    condition: "Nublado",
                    humidity: "60%",
                    wind: "12 km/h",
                  },
                ].map((weather, index) => (
                  <div
                    key={index}
                    className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 hover:border-[#00a8ff] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[#00a8ff] font-medium">{weather.location}</h3>
                        <p className="text-2xl font-bold text-white mt-2">{weather.temp}</p>
                        <p className="text-sm text-gray-400">{weather.condition}</p>
                      </div>
                      <CloudRain className="h-10 w-10 text-[#00a8ff]" />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Humedad</p>
                        <p className="text-white">{weather.humidity}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Viento</p>
                        <p className="text-white">{weather.wind}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Precipitaciones Históricas</CardTitle>
              <CardDescription className="text-gray-400">Registro de lluvias en los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-[#0a0f29] rounded-lg">
                <div className="text-center">
                  <CloudRain className="h-12 w-12 text-[#00a8ff] mx-auto mb-4" />
                  <p className="text-gray-400">Gráfico de precipitaciones en desarrollo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="herramientas" className="space-y-6">
          <Card className="bg-[#111936] border-[#1a2040]">
            <CardHeader>
              <CardTitle className="text-white">Herramientas para el Productor</CardTitle>
              <CardDescription className="text-gray-400">
                Recursos útiles para la gestión de su producción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/mundo-campo/imagenes-satelitales"
                  className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 hover:border-[#00a8ff] transition-colors"
                >
                  <div className="flex items-start">
                    <div className="bg-[#1a2040] p-3 rounded-full mr-4">
                      <Globe className="h-6 w-6 text-[#00a8ff]" />
                    </div>
                    <div>
                      <h3 className="text-[#00a8ff] font-medium">Imágenes Satelitales</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Monitoree sus cultivos con imágenes satelitales actualizadas
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="#"
                  className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 hover:border-[#00a8ff] transition-colors"
                >
                  <div className="flex items-start">
                    <div className="bg-[#1a2040] p-3 rounded-full mr-4">
                      <BarChart2 className="h-6 w-6 text-[#00a8ff]" />
                    </div>
                    <div>
                      <h3 className="text-[#00a8ff] font-medium">Calculadora de Rendimiento</h3>
                      <p className="text-sm text-gray-400 mt-1">Estime el rendimiento de su producción de azúcar</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="#"
                  className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 hover:border-[#00a8ff] transition-colors"
                >
                  <div className="flex items-start">
                    <div className="bg-[#1a2040] p-3 rounded-full mr-4">
                      <CloudRain className="h-6 w-6 text-[#00a8ff]" />
                    </div>
                    <div>
                      <h3 className="text-[#00a8ff] font-medium">Planificador de Riego</h3>
                      <p className="text-sm text-gray-400 mt-1">Optimice el uso del agua en sus cultivos</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="#"
                  className="bg-[#0a0f29] border border-[#1a2040] rounded-lg p-4 hover:border-[#00a8ff] transition-colors"
                >
                  <div className="flex items-start">
                    <div className="bg-[#1a2040] p-3 rounded-full mr-4">
                      <MapPin className="h-6 w-6 text-[#00a8ff]" />
                    </div>
                    <div>
                      <h3 className="text-[#00a8ff] font-medium">Mapas de Suelos</h3>
                      <p className="text-sm text-gray-400 mt-1">Consulte información edafológica de su región</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
