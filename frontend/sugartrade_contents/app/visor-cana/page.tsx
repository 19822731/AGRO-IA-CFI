"use client"

import { useState } from "react"
import { UploadCloud, Activity, AlertTriangle, CheckCircle, FileText, Send, MessageSquare } from "lucide-react"
import Image from "next/image"

export default function VisorCanaPage() {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [contexto, setContexto] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  // Consulta state
  const [consulta, setConsulta] = useState("")
  const [isConsulting, setIsConsulting] = useState(false)
  const [chatLog, setChatLog] = useState<{role: 'user' | 'gemma', text: string}[]>([])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!image) return
    
    setIsAnalyzing(true)
    setError("")
    
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.readAsDataURL(image)
      
      reader.onload = async () => {
        const base64Str = (reader.result as string).split(',')[1]
        
        try {
          const response = await fetch("http://localhost:8001/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              imagenBase64: base64Str,
              mimeType: image.type,
              comentario: contexto || "No proporcionado"
            })
          })
          
          if (!response.ok) throw new Error("Error en el motor Pangea")
          
          const data = await response.json()
          setResult(data.diagnostico)
        } catch (err: any) {
          setError(err.message || "Error al conectar con el servidor.")
        } finally {
          setIsAnalyzing(false)
        }
      }
    } catch (err: any) {
      setError("Error procesando imagen local")
      setIsAnalyzing(false)
    }
  }

  const enviarConsulta = async () => {
    if (!consulta.trim() || !result) return
    
    const userText = consulta
    setChatLog(prev => [...prev, {role: 'user', text: userText}])
    setConsulta("")
    setIsConsulting(true)
    
    try {
      const response = await fetch("http://localhost:8001/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pregunta: userText,
          reporte_anterior: result.reporte_vlm || result.resumen
        })
      })
      
      if (!response.ok) throw new Error("Error en la consulta")
      const data = await response.json()
      
      setChatLog(prev => [...prev, {role: 'gemma', text: data.respuesta}])
    } catch (err) {
      setChatLog(prev => [...prev, {role: 'gemma', text: "Error de conexión con el experto."}])
    } finally {
      setIsConsulting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1226] text-white p-8 ml-64">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <span className="text-[#34A853]">Visor Caña</span> 
            <span className="text-gray-400 font-light">| Motor Pangea V4</span>
          </h1>
          <p className="text-gray-400 mt-2">Diagnóstico Inteligente de Fitopatologías con DINOv2 y Gemma 4</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel Izquierdo: Input */}
          <div className="bg-[#111936] border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
            
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <UploadCloud className="text-blue-400" /> Cargar Muestra Foliar
            </h2>

            <div 
              className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-[#0a0f20] hover:border-blue-500 transition-colors cursor-pointer relative"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <input 
                type="file" 
                id="image-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image src={imagePreview} alt="Muestra foliar" layout="fill" objectFit="cover" />
                </div>
              ) : (
                <div className="py-12">
                  <UploadCloud className="text-5xl text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Haz clic o arrastra la imagen aquí</p>
                  <p className="text-xs text-gray-500 mt-2">Formatos: JPG, PNG, WEBP</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Contexto del Productor (Opcional)
              </label>
              <textarea 
                className="w-full bg-[#0a0f20] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                rows={3}
                placeholder="Ej: Lote 4B presenta amarillamiento desde hace 3 días tras lluvias..."
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
              ></textarea>
            </div>

            <button 
              className={`w-full mt-6 py-4 rounded-lg font-bold text-lg flex justify-center items-center gap-2 transition-all ${!image || isAnalyzing ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 shadow-lg shadow-blue-500/20'}`}
              onClick={analyzeImage}
              disabled={!image || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analizando con Pangea...
                </>
              ) : (
                <>
                  <Activity className="text-xl" /> Iniciar Diagnóstico
                </>
              )}
            </button>
            
            {error && <p className="text-red-400 mt-4 text-sm text-center">{error}</p>}
          </div>

          {/* Panel Derecho: Resultados */}
          <div className="bg-[#111936] border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
             
             <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="text-purple-400" /> Resultados Clínicos
            </h2>

            {!result ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-600">
                <Activity className="text-6xl mb-4 opacity-50" />
                <p>Esperando muestra para análisis...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                {/* Score Header */}
                <div className={`p-4 rounded-xl border ${result.salud === 'sano' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'} flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    {result.salud === 'sano' ? (
                      <CheckCircle className="text-5xl text-green-500" />
                    ) : (
                      <AlertTriangle className="text-5xl text-red-500" />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold capitalize">{result.salud === 'sano' ? 'Lote Sano' : 'Riesgo Detectado'}</h3>
                      <p className="text-sm text-gray-400">Certeza Algorítmica: <span className="text-white font-mono">{result.confianza_analisis}%</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Health Score</p>
                    <p className={`text-4xl font-black ${result.salud === 'sano' ? 'text-green-500' : 'text-red-500'}`}>{result.score}/100</p>
                  </div>
                </div>

                {/* Resumen */}
                <div className="bg-[#0a0f20] rounded-lg p-4 border border-gray-800">
                  <p className="text-gray-300 font-medium">{result.resumen}</p>
                </div>

                {/* VLM Report */}
                {result.reporte_vlm && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Reporte Gemma 4</h4>
                    <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-800 prose prose-invert max-w-none text-sm text-gray-300">
                      {result.reporte_vlm.split('\n').map((paragraph: string, i: number) => (
                        <p key={i} className="mb-2">{paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {result.recomendaciones && result.recomendaciones.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Plan de Acción</h4>
                    <ul className="space-y-2">
                      {result.recomendaciones.map((rec: string, idx: number) => (
                        <li key={idx} className="flex gap-3 bg-[#0a0f20] p-3 rounded-lg border border-gray-800 text-sm">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span className="text-gray-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Chat Consulta */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Consultar al Experto
                  </h4>
                  
                  <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
                    {chatLog.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isConsulting && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800 p-3 rounded-lg rounded-tl-none border border-gray-700 text-gray-400 text-sm flex gap-2 items-center">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 relative">
                    <input
                      type="text"
                      className="w-full bg-[#0a0f20] border border-gray-700 rounded-lg py-3 pl-4 pr-12 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Ej: ¿Qué herbicida recomiendas usar?"
                      value={consulta}
                      onChange={(e) => setConsulta(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && enviarConsulta()}
                    />
                    <button 
                      className="absolute right-2 top-2 p-1.5 bg-purple-600 hover:bg-purple-500 rounded-md text-white transition-colors"
                      onClick={enviarConsulta}
                      disabled={isConsulting || !consulta.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
