'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const publicRoutes = ['/', '/login', '/register']; // Add more if needed

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Public route — no auth required
    if (publicRoutes.includes(pathname)) {
      setIsAllowed(true);
    }
    // Protected route — must have token
    else if (!token) {
      router.replace('/');
    } else {
      setIsAllowed(true);
    }
  }, [pathname, router]);

  if (!isAllowed) return null;

  return <>{children}</>;
}
