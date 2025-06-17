import { Geist, Geist_Mono } from 'next/font/google';
import Sidebar from "../app/components/sidebar";
import Header from "./components/Header"; // New header component
import './globals.css'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dashboard",
  description: "ZeroKoin admin panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex h-screen">
          {/* Sidebar on the left */}
          <Sidebar />
          
          {/* Page content on the right */}
          <main className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
            {/* Header at top of every screen */}
            <Header />
            
            {/* Scrollable content area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}