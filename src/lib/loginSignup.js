'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // ✅ Login Admin
  const loginUser = async ({ email, password }) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.data || !data.data.admin) {
        throw new Error(data.message || 'Login failed');
      }

      // ✅ Save token & admin info
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.admin));

      // ✅ Log admin role
      console.log('🛡️ Logged in as:', data.data.admin?.role || 'Unknown Role');

      // ✅ Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ Login Error:', err.message);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register Admin
  const registerUser = async ({ name, email, password }) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.data || !data.data.admin) {
        throw new Error(data.message || 'Registration failed');
      }

      // ✅ Save token & admin info
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.admin));

      console.log('✅ Registration successful:', data.data.admin.email);

      // ✅ Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ Registration Error:', err.message);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    loginUser,
    registerUser,
    loading,
    error,
  };
}
