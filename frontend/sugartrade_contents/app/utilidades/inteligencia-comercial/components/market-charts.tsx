"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Loader2, TrendingUp, Globe, DollarSign } from "lucide-react"

export default function MarketCharts() {
    const [globalData, setGlobalData] = useState<any>(null)
    const [localData, setLocalData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

                // Fetch Global Data
                const globalRes = await fetch(`${apiUrl}/api/market/global/sugar`)
                if (globalRes.ok) {
                    const data = await globalRes.json()
                    setGlobalData(data)
                }

                // Fetch Local Data
                const localRes = await fetch(`${apiUrl}/api/market/local/history`)
                if (localRes.ok) {
                    const data = await localRes.json()
                    setLocalData(data)
                }

            } catch (error) {
                console.error("Error fetching market data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Global Market Card */}
                <Card className="bg-[#111936] border-[#1a2040]">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <Globe className="h-5 w-5 mr-2 text-blue-400" />
                            Mercado Global (Sugar #11)
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Futuros de Azúcar N°11 (ICE)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <span className="text-3xl font-bold text-white">
                                {globalData?.price ? `$${globalData.price}` : "N/A"}
                            </span>
                            <span className="text-sm text-gray-400 ml-2">USD/lb</span>
                            {globalData?.change && (
                                <span className={`ml-3 text-sm font-medium ${globalData.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {globalData.change >= 0 ? "+" : ""}{globalData.change} ({globalData.change_percent}%)
                                </span>
                            )}
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={globalData?.history || []}>
                                    <defs>
                                        <linearGradient id="colorGlobal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickFormatter={(value) => value.split('-')[2]} />
                                    <YAxis stroke="#6b7280" fontSize={12} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGlobal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Local Market Card */}
                <Card className="bg-[#111936] border-[#1a2040]">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                            Mercado Local (Tucumán)
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Precio Promedio Ponderado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <span className="text-3xl font-bold text-white">
                                {localData.length > 0 ? `$${localData[localData.length - 1].price.toLocaleString()}` : "N/A"}
                            </span>
                            <span className="text-sm text-gray-400 ml-2">ARS/Bolsa</span>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={localData}>
                                    <defs>
                                        <linearGradient id="colorLocal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickFormatter={(value) => value.split('-')[2]} />
                                    <YAxis stroke="#6b7280" fontSize={12} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="price" stroke="#22c55e" fillOpacity={1} fill="url(#colorLocal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
