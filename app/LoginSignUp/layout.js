import { Geist, Geist_Mono } from "next/font/google";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sign In",
  description: "ZeroKoin Course Managment Facility",
};

export default function CourseLayout({ children }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      {/* You can optionally include a sidebar or header here if needed */}

      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
