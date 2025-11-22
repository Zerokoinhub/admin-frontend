
'use client';
// const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
// const API_BASE = "http://localhost:3002";
const API_BASE = "https://admin-backend-production-4ff2.up.railway.app";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // ✅ Helper: Store user data and token securely
  const storeSession = (token, user) => {
    if (!token || !user) return;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    //console.log('🛡️ Logged in as:', user.role || 'unknown');
  };

  // ✅ Admin Login
  const loginUser = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_BASE+'/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.data?.admin) {
        throw new Error(data.message || 'Login failed');
      }

      storeSession(data.data.token, data.data.admin);
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ Login Error:', err.message);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Admin Registration
  const registerUser = async ({ name, email, password }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_BASE+'/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.data?.admin) {
        throw new Error(data.message || 'Registration failed');
      }

      storeSession(data.data.token, data.data.admin);
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
