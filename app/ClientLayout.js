'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import AppShell from '../src/components/ui/AppShell';
import RouteLoaderProvider from '../src/components/ui/RouteLoaderProvider';
import ProtectedRoute from '../src/components/auth/ProtectedRoute';
import SplashScreen from '../src/components/ui/SplashScreen';

const publicRoutes = ['/', '/login', '/register'];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const isPublic = publicRoutes.includes(pathname);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('splashShown');
    if (alreadyShown) {
      setShowSplash(false);
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('splashShown', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <RouteLoaderProvider>
      <ProtectedRoute>
        {isPublic ? children : <AppShell>{children}</AppShell>}
      </ProtectedRoute>
    </RouteLoaderProvider>
  );
}
