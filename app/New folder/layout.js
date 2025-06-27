import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';

import AppShell from '../../src/components/ui/AppShell';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute'; // ✅ New import

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Dashboard',
  description: 'ZeroKoin admin panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
          <ProtectedRoute>
            <AppShell>{children}</AppShell>
          </ProtectedRoute>
        
      </body>
    </html>
  );
}
