"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MarketReport } from "@/app/data/market-reports"
import { Search, X } from "lucide-react"
import { useState } from "react"

interface ReportFiltersProps {
  reports: MarketReport[]
  onFilterChange: (filteredReports: MarketReport[]) => void
}

export function ReportFilters({ reports, onFilterChange }: ReportFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [country, setCountry] = useState("")
  const [topic, setTopic] = useState("")
  const [dateRange, setDateRange] = useState("")

  // Extract unique countries and topics
  const countries = Array.from(new Set(reports.map((report) => report.country)))
  const topics = Array.from(new Set(reports.map((report) => report.topic)))

  const applyFilters = () => {
    let filteredReports = [...reports]

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredReports = filteredReports.filter(
        (report) =>
          report.summary.toLowerCase().includes(term) ||
          report.details.toLowerCase().includes(term) ||
          report.keywords.some((keyword) => keyword.toLowerCase().includes(term)) ||
          report.regions.some((region) => region.toLowerCase().includes(term)),
      )
    }

    // Apply country filter
    if (country) {
      filteredReports = filteredReports.filter((report) => report.country === country)
    }

    // Apply topic filter
    if (topic) {
      filteredReports = filteredReports.filter((report) => report.topic === topic)
    }

    // Apply date range filter
    if (dateRange) {
      const today = new Date()
      const startDate = new Date()

      switch (dateRange) {
        case "7days":
          startDate.setDate(today.getDate() - 7)
          break
        case "30days":
          startDate.setDate(today.getDate() - 30)
          break
        case "90days":
          startDate.setDate(today.getDate() - 90)
          break
      }

      filteredReports = filteredReports.filter((report) => new Date(report.date) >= startDate)
    }

    onFilterChange(filteredReports)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setCountry("")
    setTopic("")
    setDateRange("")
    onFilterChange(reports)
  }

  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="search" className="text-xs mb-1 block">
            Buscar
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Palabras clave, regiones..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="country" className="text-xs mb-1 block">
            País
          </Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country">
              <SelectValue placeholder="Todos los países" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los países</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="topic" className="text-xs mb-1 block">
            Tema
          </Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger id="topic">
              <SelectValue placeholder="Todos los temas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los temas</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date" className="text-xs mb-1 block">
            Fecha
          </Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger id="date">
              <SelectValue placeholder="Cualquier fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier fecha</SelectItem>
              <SelectItem value="7days">Últimos 7 días</SelectItem>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="90days">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
        <Button size="sm" onClick={applyFilters}>
          <Search className="h-4 w-4 mr-1" />
          Aplicar filtros
        </Button>
      </div>
    </div>
  )
}
