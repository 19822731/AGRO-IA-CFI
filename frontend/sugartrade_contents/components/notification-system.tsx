"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"

type NotificationType = "success" | "warning" | "info" | "error"

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications debe ser usado dentro de un NotificationProvider")
  }
  return context
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id }

    setNotifications((prev) => [...prev, newNotification])

    // Auto-remove after duration (default: 5000ms)
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

const NotificationItem: React.FC<{
  notification: Notification
  onClose: () => void
}> = ({ notification, onClose }) => {
  const { type, title, message } = notification

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-900/20 border-green-800"
      case "warning":
        return "bg-amber-900/20 border-amber-800"
      case "info":
        return "bg-blue-900/20 border-blue-800"
      case "error":
        return "bg-red-900/20 border-red-800"
    }
  }

  return (
    <div className={`p-4 rounded-md border ${getBgColor()} shadow-lg animate-fadeIn`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <div className="mt-1 text-sm text-gray-300">{message}</div>
        </div>
        <button onClick={onClose} className="ml-4 inline-flex text-gray-400 hover:text-gray-200">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
