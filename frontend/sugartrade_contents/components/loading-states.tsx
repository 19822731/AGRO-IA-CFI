"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface LoadingStateProps {
  isLoading: boolean
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  delay?: number // Retraso antes de mostrar el estado de carga (ms)
  minDuration?: number // Duración mínima del estado de carga (ms)
}

export function LoadingState({
  isLoading,
  children,
  loadingComponent,
  delay = 300,
  minDuration = 500,
}: LoadingStateProps) {
  const [showLoading, setShowLoading] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)

  useEffect(() => {
    let delayTimeout: NodeJS.Timeout
    let durationTimeout: NodeJS.Timeout

    if (isLoading && !showLoading) {
      // Iniciar el temporizador de retraso
      delayTimeout = setTimeout(() => {
        setShowLoading(true)
        setLoadingStartTime(Date.now())
      }, delay)
    } else if (!isLoading && showLoading && loadingStartTime) {
      // Calcular cuánto tiempo ha pasado desde que comenzó la carga
      const elapsedTime = Date.now() - loadingStartTime
      const remainingTime = Math.max(0, minDuration - elapsedTime)

      // Mantener el estado de carga por la duración mínima
      durationTimeout = setTimeout(() => {
        setShowLoading(false)
        setLoadingStartTime(null)
      }, remainingTime)
    }

    return () => {
      clearTimeout(delayTimeout)
      clearTimeout(durationTimeout)
    }
  }, [isLoading, showLoading, loadingStartTime, delay, minDuration])

  if (showLoading) {
    return (
      loadingComponent || (
        <div className="flex justify-center items-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      )
    )
  }

  return <>{children}</>
}

// Componente para mostrar un esqueleto de carga
interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width || "100%",
    height: height || "1rem",
  }

  return <div className={`animate-pulse bg-[#1a2040] rounded ${className || ""}`} style={style} />
}

// Componente para mostrar un esqueleto de tarjeta
export function CardSkeleton() {
  return (
    <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-6 animate-pulse">
      <div className="flex items-start">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ml-4 flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

// Componente para mostrar un esqueleto de tabla
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-[#111936] border border-[#1a2040] rounded-lg p-4 animate-pulse">
      <div className="mb-4">
        <Skeleton className="h-6 w-1/3" />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array(columns)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-4" />
            ))}
        </div>
        {Array(rows)
          .fill(0)
          .map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid grid-cols-4 gap-4">
              {Array(columns)
                .fill(0)
                .map((_, colIndex) => (
                  <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4" />
                ))}
            </div>
          ))}
      </div>
    </div>
  )
}
