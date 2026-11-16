"use client"

import { useState } from "react"

interface Tab {
  id: string
  label: string
}

interface TabNavigationProps {
  tabs: Tab[]
  defaultTab?: string
  onTabChange?: (tabId: string) => void
}

export default function TabNavigation({ tabs, defaultTab, onTabChange }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    if (onTabChange) {
      onTabChange(tabId)
    }
  }

  return (
    <div className="border-b border-[#1a2040] mb-6">
      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? "text-[#00a8ff]" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00a8ff]"></span>}
          </button>
        ))}
      </div>
    </div>
  )
}
