// "use client";

// import { usePathname } from "next/navigation";
// import { Bell, Menu } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function Header({ onMenuClick, onNotificationClick, notificationCount = 0 }) {
//   const pathname = usePathname();

//   const getHeaderTitle = () => {
//     switch (pathname) {
//       case "/dashboard":
//         return "Dashboard";
//       case "/rewards-system":
//         return "Rewards System";
//       case "/user-management":
//         return "User Management";
//       case "/coin-transfer":
//         return "Coin Transfer";
//       case "/user-profile":
//         return "User Profile";
//       case "/course-management":
//         return "Course Management";
//       case "/calculator":
//         return "Calculator";
//       case "/setting":
//         return "Settings";
//       default:
//         return "";
//     }
//   };

//   return (
//     <header className="fixed top-0 left-0 right-0 z-30 h-21 px-4 sm:px-6 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm md:ml-64">
//       {/* Left: Burger + Title */}
//       <div className="flex items-center gap-3 w-full">
//         {/* Burger menu (only on mobile) */}
//         <Button
//           variant="ghost"
//           size="sm"
//           className="md:hidden h-8 w-8 p-0"
//           onClick={onMenuClick}
//         >
//           <Menu className="h-5 w-5" />
//         </Button>

//         {/* Page Title */}
//         <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
//           {getHeaderTitle()}
//         </h1>
//       </div>

//       {/* Right: Notification Bell */}
//       <Button
//         variant="ghost"
//         size="sm"
//         className="h-8 w-8 p-0 relative"
//         onClick={onNotificationClick}
//       >
//         <Bell className="h-5 w-5 text-gray-600" />
//         {notificationCount > 0 && (
//           <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
//             {notificationCount}
//           </span>
//         )}
//       </Button>
//     </header>
//   );
// }








"use client"

import { usePathname } from "next/navigation"
import { Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Image from "next/image"

export default function Header({ onMenuClick, onNotificationClick, notificationCount = 0 }) {
  const pathname = usePathname()
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [notifications, setNotifications] = useState([])

  const getHeaderTitle = () => {
    switch (pathname) {
      case "/dashboard":
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

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/notification")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = () => {
    setShowNotificationPanel(true)
    if (onNotificationClick) {
      onNotificationClick()
    }
  }

  const actualNotificationCount = notifications.length || notificationCount

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 h-21 px-4 sm:px-6 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm md:ml-64">
        {/* Left: Burger + Title */}
        <div className="flex items-center gap-3 w-full">
          {/* Burger menu (only on mobile) */}
          <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page Title */}
          <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{getHeaderTitle()}</h1>
        </div>

        {/* Right: Notification Bell */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative" onClick={handleNotificationClick}>
          <Bell className="h-5 w-5 text-gray-600" />
          {actualNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {actualNotificationCount}
            </span>
          )}
        </Button>
      </header>

      {/* Notification Panel */}
      {showNotificationPanel && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 border-l border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">{actualNotificationCount}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowNotificationPanel(false)} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div key={notification._id || index} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Image
                      src="/placeholder.svg?height=32&width=32"
                      alt="Notification"
                      width={32}
                      height={32}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 text-sm">Zerokoin Network</p>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                          <X className="h-3 w-3 text-gray-400" />
                        </Button>
                      </div>
                      <p className="font-medium text-gray-800 text-sm mb-1">{notification.title}</p>
                      <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Hi Admin!</p>
                    <p className="text-sm text-gray-500">No new notifications</p>
                    <p className="text-xs text-gray-400">Check back later</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    View on Admin: <span className="font-medium">System</span>
                  </p>
                  <p className="text-xs text-gray-500">No notifications available</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 flex gap-2">
            <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm">Manage</Button>
            <Button variant="outline" className="flex-1 text-sm">
              Clear All
            </Button>
          </div>
        </div>
      )}
    </>
  )
}


