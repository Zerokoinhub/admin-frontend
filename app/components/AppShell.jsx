'use client';

import { useState } from 'react';
import Sidebar from './sidebar';
import Header from './Header';

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Page content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={handleToggleSidebar} notificationCount={3} />
        <main className="flex-1 mt-14 p-4 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
