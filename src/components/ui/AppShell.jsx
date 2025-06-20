'use client';

import { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Header from './Header';
import SplashScreen from './SplashScreen';

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    console.log('👀 Checking splash state...');
    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={handleToggleSidebar} notificationCount={3} />
        <main className="flex-1 mt-14 p-4 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
