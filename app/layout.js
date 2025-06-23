// app/layout.jsx
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ClientLayout from './ClientLayout'; // ✅ Client logic wrapper
import SplashScreen from '@/components/ui/SplashScreen';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Sign in | ZeroKoin',
  description: 'Sign in into ZeroKoin admin panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
       
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
