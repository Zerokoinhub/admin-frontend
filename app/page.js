'use client';

import { useState } from 'react';
import Sidebar from './components/sidebar';
import Header from './components/Header';
import DashboardPage from './components/dashboardPage';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <div className="hidden md:block w-64">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>

      {/* Sidebar for mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleToggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <Header
          onMenuClick={handleToggleSidebar}
          onNotificationClick={() => {}}
          notificationCount={3}
        />

        {/* Content */}
        <main className="p-4">
          <DashboardPage />
        </main>
      </div>
    </div>
  );
}
