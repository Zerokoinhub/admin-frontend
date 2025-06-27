'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPage from '@/components/ui/dashboardPage';

export default function page() {
  const [checkingAuth, setCheckingAuth] = useState(true); // loading flag
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('🛡️ User Role (on reload):', user?.role);
        router.replace('/dashboard'); // ✅ Avoid double push
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      setCheckingAuth(false); // ✅ Allow login to show
    }
  }, [router]);

  if (checkingAuth) return null; // Avoid flicker while checking

  return (
    <div className="p-4">
      <DashboardPage/>
    </div>
  );
}
