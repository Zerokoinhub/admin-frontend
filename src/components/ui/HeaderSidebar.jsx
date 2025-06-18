'use client'

import { useState } from 'react'
import Sidebar from '@/components/sidebar'
import Header from '@/components/Header'

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (mobile + desktop combined logic) */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={toggleSidebar}
          onNotificationClick={() => {}}
          notificationCount={3}
        />

        {/* Scrollable page content */}
        <main className="mt-14 flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
