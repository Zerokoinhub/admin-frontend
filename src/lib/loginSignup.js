'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const loginUser = async ({ email, password }) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // ✅ Log server response
      console.log('✅ Server Response:', data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // ✅ Store token and user data in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // ✅ Log role
      console.log('🛡️ User Role:', data.data.user.role);

      // ✅ Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ Login Error:', err.message);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return {
    loginUser,
    loading,
    error,
  };
}
