import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InfoPanel() {
  return (
    <Card className="bg-[#111936] border-[#1a2040]">
      <CardHeader>
        <CardTitle className="text-white">Acerca de las Imágenes Satelitales</CardTitle>
      </CardHeader>
      <CardContent className="text-gray-300 space-y-4">
        <p>
          Esta herramienta le permite visualizar imágenes satelitales de diferentes fuentes para monitorear sus cultivos
          y analizar condiciones del suelo, vegetación y clima.
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
          <li>Monitoreo de deforestación y prácticas sostenibles</li>
          <li>Gestión de certificaciones (Bonsucro, Rainforest Alliance, ISO 14001)</li>
          <li>Análisis de mercado global y comparativas internacionales</li>
          <li>Calendario de cosecha global para optimizar decisiones comerciales</li>
          <li>Recomendaciones estratégicas basadas en datos de competidores</li>
        </ul>
      </CardContent>
    </Card>
  )
}
