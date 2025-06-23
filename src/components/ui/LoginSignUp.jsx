'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import useLogin from '@/lib/loginSignup'; // Adjust path if needed
import Image from 'next/image';

export default function LoginSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, loading, error } = useLogin();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get('email')?.trim();
    const password = form.get('password');

    if (!email || !password) {
      console.error('Email and password are required');
      return;
    }

    await loginUser({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-700 via-black to-yellow-400 relative overflow-hidden px-4">
      {/* Abstract Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="flex gap-4 items-center scale-[2] sm:scale-[2.5] md:scale-[3]">
          <div className="flex flex-col gap-2">
            <div className="w-6 h-6 bg-cyan-400 clip-triangle-up" />
            <div className="w-10 h-1 bg-white rotate-45" />
            <div className="w-6 h-6 bg-cyan-400 clip-triangle-down" />
          </div>
          <div className="w-1 h-12 bg-yellow-300 rounded-full shadow" />
          <div className="w-10 h-1 bg-white -rotate-45" />
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md p-8 md:p-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 text-xl font-semibold text-cyan-700 mb-6">
          <Image src="/logo.png" alt="Zerokoin Logo" width={33} height={33} />
          <span className="text-3xl">Zerokoin</span>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600 pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Terms */}
        <p className="text-xs text-center text-gray-600 mt-6">
          By signing in, you agree to ZeroKoin Terms of Service and confirm that
          you have read and understood our{' '}
          <a href="https://zerokoin.com/privacypolicy" className="text-blue-600 underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
