"use client"

import { usePathname } from "next/navigation"
import { Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function Header({ onMenuClick, onNotificationClick, notificationCount = 0 }) {
  const pathname = usePathname()
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

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

  // Fetch notifications from backend API
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/notifications?page=1&limit=100`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Format notifications for display
          const formattedNotifications = result.data.map((notification) => ({
            _id: notification._id,
            title: notification.title,
            message: notification.message,
            imageUrl: notification.imageUrl,
            createdAt: notification.createdAt,
            type: notification.type,
            priority: notification.priority,
            sentTo:
              notification.priority === "new-user"
                ? "New User"
                : notification.priority === "top-rated-user"
                  ? "Top rated user"
                  : "Old User",
          }))
          setNotifications(formattedNotifications)
        } else {
          console.error("Failed to fetch notifications:", result.message)
          setNotifications([])
        }
      } else {
        console.error("Failed to fetch notifications:", response.status)
        setNotifications([])
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  // Remove notification from local state
  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((notification) => notification._id !== notificationId))
  }

  // Only fetch on component mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Listen for new notifications from settings page
  useEffect(() => {
    const handleNewNotification = (event) => {
      if (event.detail && event.detail.notification) {
        const newNotification = {
          _id: event.detail.notification.id || Date.now().toString(),
          title: event.detail.notification.title,
          message: event.detail.notification.description,
          imageUrl: event.detail.notification.image,
          createdAt: new Date().toISOString(),
          type: "general",
          priority: event.detail.notification.priority || "old-user",
          sentTo: event.detail.notification.sentTo || "Old User",
        }
        setNotifications((prev) => [newNotification, ...prev])
      }
    }

    // Listen for custom event when new notification is sent
    window.addEventListener("newNotificationSent", handleNewNotification)

    return () => {
      window.removeEventListener("newNotificationSent", handleNewNotification)
    }
  }, [])

  const handleNotificationClick = () => {
    setShowNotificationPanel(true)
    if (onNotificationClick) {
      onNotificationClick()
    }
  }

  const handleRefresh = () => {
    fetchNotifications()
  }

  // Use actual notification count from backend
  const actualNotificationCount = notifications.length

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
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {actualNotificationCount > 99 ? "99+" : actualNotificationCount}
            </span>
          )}
        </Button>
      </header>

      {/* Notification Panel */}
      {showNotificationPanel && (
  <div className="fixed top-0 right-0 h-full w-full sm:w-96 max-w-full bg-white shadow-2xl z-50 border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out">
    {/* Header */}
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
        <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">
          {actualNotificationCount}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotificationPanel(false)}
        className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>

    {/* Notification List */}
    <div className="flex-1 overflow-y-auto scroll-smooth">
      {loading ? (
        <div className="p-6 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      ) : notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <div
            key={notification._id || index}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-start gap-3">
              {/* Image or Placeholder */}
              {notification.imageUrl ? (
                <img
                  src={notification.imageUrl}
                  alt="Notification"
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "flex"
                  }}
                />
              ) : null}

              {/* Fallback Icon */}
              <div
                className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ display: notification.imageUrl ? "none" : "flex" }}
              >
                <span className="text-white text-xs font-bold bg-teal-600 px-2 py-1 rounded">Z</span>
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">Zerokoin Network</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => removeNotification(notification._id)}
                  >
                    <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-1">{notification.title}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    {notification.sentTo} • {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      notification.priority === "new-user"
                        ? "bg-green-100 text-green-800"
                        : notification.priority === "top-rated-user"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {notification.priority === "new-user"
                      ? "New"
                      : notification.priority === "top-rated-user"
                      ? "Top"
                      : "Regular"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-6 text-center text-gray-600 space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <h4 className="font-semibold text-gray-900">No Notifications</h4>
          <p className="text-sm text-gray-500">You’re all caught up!</p>
          <p className="text-xs text-gray-400">Check back later for updates.</p>
        </div>
      )}
    </div>

    {/* Footer Actions */}
    <div className="p-4 border-t border-gray-200 flex gap-2">
      <Button
        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm"
        onClick={handleRefresh}
        disabled={loading}
      >
        {loading ? "Refreshing..." : "Refresh"}
      </Button>
      <Button
        variant="outline"
        className="flex-1 text-sm"
        onClick={() => {
          if (confirm("Are you sure you want to clear all notifications?")) {
            setNotifications([]);
          }
        }}
      >
        Clear All
      </Button>
    </div>
  </div>
)}

    </>
  )
}






