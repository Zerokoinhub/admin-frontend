// "use client";

// import { usePathname } from "next/navigation";
// import { Bell } from 'lucide-react';

// export default function Header() {
//   const pathname = usePathname();
  
//   // Show "Dashboard" only for root URL ("/")
//   const getHeaderTitle = () => {
//     if (pathname === "/") {
//       return "Dashboard";
//     }
//     return ""; // Empty string for all other routes
//   };

//   return (
//     <header className="h-14 px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
//       <h1 className="text-lg font-semibold text-gray-800">
//         {getHeaderTitle()}
//       </h1>
//       <Bell className="h-5 w-5 text-gray-600" />
//     </header>
//   );
// }




"use client"

import { usePathname } from "next/navigation"
import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

// interface HeaderProps {
//   onMenuClick?: () => void
//   onNotificationClick?: () => void
//   notificationCount?: number
// }

export default function Header({ onMenuClick, onNotificationClick, notificationCount = 0 }) {
  const pathname = usePathname()

  const getHeaderTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard"
      case "/rewards-system":
        return "Rewards System"
      case "/user-management":
        return "User Management"
      case "/coin-transfer":
        return "Coin Transfer"
      case "/user-profile":
        return "User Profile"
      case "/course-management":
        return "Course Management"
      case "/calculator":
        return "Calculator"
      case "/setting":
        return "Settings"
      default:
        return ""
    }
  }

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
      {/* Mobile menu button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{getHeaderTitle()}</h1>
      </div>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative" onClick={onNotificationClick}>
        <Bell className="h-5 w-5 text-gray-600" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </Button>
    </header>
  )
}




