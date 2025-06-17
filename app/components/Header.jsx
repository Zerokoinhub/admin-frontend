"use client";

import { usePathname } from "next/navigation";
import { Bell } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  
  // Show "Dashboard" only for root URL ("/")
  const getHeaderTitle = () => {
    if (pathname === "/") {
      return "Dashboard";
    }
    return ""; // Empty string for all other routes
  };

  return (
    <header className="h-14 px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
      <h1 className="text-lg font-semibold text-gray-800">
        {getHeaderTitle()}
      </h1>
      <Bell className="h-5 w-5 text-gray-600" />
    </header>
  );
}








