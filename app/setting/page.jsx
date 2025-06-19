"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { GraduationCap, Edit, Target, X, ChevronDown, Trash2, Edit3, Bell, Upload } from "lucide-react"
import Image from "next/image"
import { useUsers } from "../../hooks/useUsers"
import { userHelpers } from "@/lib/api"

// Admin data for the table - keeping this as static since it's admin-specific
const adminData = [
  { email: "anas24@gmail.com", role: "Super Admin", id: 1 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 2 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 3 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 4 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 5 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 6 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 7 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 8 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 9 },
]

export default function SettingPage() {
  const [currentView, setCurrentView] = useState("main")
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false)
  const [selectedExpiry, setSelectedExpiry] = useState("02:00")
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [showNotificationList, setShowNotificationList] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showSendToDropdown, setShowSendToDropdown] = useState(false)
  const [selectedSendTo, setSelectedSendTo] = useState("Send to")
  const [uploadedImage, setUploadedImage] = useState(false)
  const [notificationView, setNotificationView] = useState("empty")
  const [formData, setFormData] = useState({
    name: "Fayhan",
    email: "Menog",
    role: "Super Admin",
    time: "1 Month",
  })

  // Fetch users data for statistics
  const { users, loading, error } = useUsers(1, 100)

  // Calculate real statistics from users
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        learningRewards: 0,
        referralsRewards: 0,
        adBaseRewards: 0,
      }
    }

    const userStats = userHelpers.calculateStats(users)
    return {
      learningRewards: users.length, // Total users as learning rewards
      referralsRewards: userStats.totalReferrals,
      adBaseRewards: Math.floor(users.length * 0.3), // Mock ad-based rewards
    }
  }, [users])

  // Generate notification data from real users
  const notificationData = useMemo(() => {
    if (!users || users.length === 0) return []

    return users.slice(0, 5).map((user, index) => ({
      id: user._id,
      title: "New Update",
      message: "Watch the full episode to learn zero koin video",
      time: `${(index + 1) * 2} hours ago`,
      avatar: "/placeholder.svg?height=32&width=32",
      network: "Zerokoin Network",
      userName: user.name || "Unknown User",
      userEmail: user.email,
    }))
  }, [users])

  // Listen for notification clicks from header
  useEffect(() => {
    const handleNotificationClick = () => {
      if (currentView === "main") {
        setShowNotificationPanel(true)
      }
    }

    window.addEventListener("notificationClick", handleNotificationClick)
    return () => window.removeEventListener("notificationClick", handleNotificationClick)
  }, [currentView])

  const handleAddNewAdmin = () => {
    setCurrentView("permissions")
  }

  const handleViewControl = () => {
    setCurrentView("control")
  }

  const handleNotificationSettings = () => {
    setCurrentView("notifications")
    setNotificationView("empty")
  }

  const handleCreateNotification = () => {
    setNotificationView("create")
  }

  const handleNext = () => {
    setUploadedImage(true)
    setNotificationView("send")
  }

  const handleSendNotification = () => {
    setShowSuccessModal(true)
    setTimeout(() => {
      setShowSuccessModal(false)
      setNotificationView("empty")
      setShowNotificationList(true)
    }, 3000)
  }

  const handleUploadImage = () => {
    setUploadedImage(true)
  }

  if (loading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Notification Settings View
  if (currentView === "notifications") {
    // Empty Notification State
    if (notificationView === "empty") {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Hye Admin!</h1>
            <Button onClick={() => setCurrentView("main")} variant="outline" className="w-full sm:w-auto">
              Back to Settings
            </Button>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="w-24 sm:w-32 h-24 sm:h-32 bg-teal-100 rounded-full flex items-center justify-center">
              <Bell className="h-12 sm:h-16 w-12 sm:w-16 text-teal-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg sm:text-xl font-medium text-gray-900">You have no Notification Yet!</h2>
            </div>
            <Button
              onClick={handleCreateNotification}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Create Notification
            </Button>
          </div>

          {/* Notification Panel */}
          {showNotificationPanel && (
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 border-l border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
                    {notificationData.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotificationPanel(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                {notificationData.length > 0 ? (
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      alt="User"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Hi {notificationData[0].userName}</p>
                      <p className="text-sm text-gray-500">Here Sign up to Zero Koin</p>
                      <p className="text-xs text-gray-400">2 May 12:5 PM</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p>No notifications available</p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    View on Admin: <span className="font-medium">Abdul Salam</span>
                  </p>
                  <p className="text-xs text-gray-500">On 5th May, 2:30 PM</p>
                </div>
              </div>
            </div>
          )}

          {/* Notification List */}
          {showNotificationList && (
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 border-l border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotificationList(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {notificationData.map((notification) => (
                  <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <Image
                        src={notification.avatar || "/placeholder.svg?height=32&width=32"}
                        alt="Zerokoin"
                        width={32}
                        height={32}
                        className="rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 text-sm">{notification.network}</p>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                            <X className="h-3 w-3 text-gray-400" />
                          </Button>
                        </div>
                        <p className="font-medium text-gray-800 text-sm mb-1">{notification.title}</p>
                        <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 flex gap-2">
                <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm">Manage</Button>
                <Button variant="outline" className="flex-1 text-sm">
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Create Notification View
    if (notificationView === "create") {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Create Notification</h1>
            <Button onClick={() => setNotificationView("empty")} variant="outline" className="w-full sm:w-auto">
              Back
            </Button>
          </div>

          {/* Create Form */}
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Upload Image Area */}
            <div
              onClick={handleUploadImage}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Upload Image</p>
                </div>
              </div>
            </div>

            {/* Static Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Zero Koin</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Zero Koin mining is the process of validating transactions and securing the Zero Koin blockchain by
                solving complex mathematical problems, typically using computing power, to earn rewards in Zero Koin.
              </p>
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Filter & Send Notification View
    if (notificationView === "send") {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Filter & Send Notification</h1>
            <div className="relative">
              <Button
                onClick={() => setShowSendToDropdown(!showSendToDropdown)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                {selectedSendTo}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showSendToDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {["New User", "Old User", "Top rated user"].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedSendTo(option)
                          setShowSendToDropdown(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Notification Preview */}
            <div className="relative rounded-lg overflow-hidden">
              <Image
                src="/notification-bg.png"
                alt="Notification Background"
                width={600}
                height={200}
                className="w-full h-48 sm:h-56 object-cover"
              />
            </div>

            {/* Static Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Zero Koin</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Zero Koin mining is the process of validating transactions and securing the Zero Koin blockchain by
                solving complex mathematical problems, typically using computing power, to earn rewards in Zero Koin.
              </p>
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSendNotification}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                Send Notification
              </Button>
            </div>
          </div>

          {/* Success Modal */}
          <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
            <DialogContent className="sm:max-w-md bg-white text-center border-0 shadow-2xl mx-4">
              <div className="py-8 px-6">
                {/* Success Icon with Animation */}
                <div className="relative mx-auto w-24 h-24 mb-8">
                  {/* Main Circle */}
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-green-600 rounded-full flex items-center justify-center relative z-10">
                    <Bell className="h-10 w-10 text-white" />
                  </div>

                  {/* Animated Dots */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
                    <div className="absolute w-3 h-3 bg-teal-500 rounded-full -top-1 left-1/2 transform -translate-x-1/2"></div>
                    <div className="absolute w-2 h-2 bg-green-500 rounded-full top-2 -right-1"></div>
                    <div className="absolute w-2 h-2 bg-teal-400 rounded-full top-1/2 -right-2 transform -translate-y-1/2"></div>
                    <div className="absolute w-3 h-3 bg-green-400 rounded-full -bottom-1 right-2"></div>
                    <div className="absolute w-2 h-2 bg-teal-500 rounded-full -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                    <div className="absolute w-2 h-2 bg-green-500 rounded-full bottom-2 -left-1"></div>
                    <div className="absolute w-2 h-2 bg-teal-400 rounded-full top-1/2 -left-2 transform -translate-y-1/2"></div>
                    <div className="absolute w-3 h-3 bg-green-400 rounded-full top-2 left-2"></div>
                  </div>
                </div>

                {/* Success Text */}
                <h3 className="text-xl font-semibold text-teal-600 mb-2">Your Notification</h3>
                <h3 className="text-xl font-semibold text-teal-600 mb-6">has Successfully Send!</h3>

                {/* Wait Text */}
                <p className="text-sm text-gray-600 mb-2">Please wait</p>
                <p className="text-sm text-gray-600 mb-8">You will be directed to the homepage soon</p>

                {/* Loading Spinner */}
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )
    }
  }

  // Main Settings View
  if (currentView === "main") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Setting</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Learning Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.learningRewards}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Edit className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Referrals Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.referralsRewards}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Ad Base Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.adBaseRewards}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expiry Dropdown */}
        <div className="flex justify-center sm:justify-end">
          <div className="relative">
            <Button
              onClick={() => setShowExpiryDropdown(!showExpiryDropdown)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 h-8"
            >
              Expiry {selectedExpiry}
              <ChevronDown className="h-3 w-3" />
            </Button>
            {showExpiryDropdown && (
              <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded shadow-lg z-10">
                <div className="py-1">
                  {["1 Day", "2 Day", "3 Day", "4 Day", "5 Day"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedExpiry(option.split(" ")[0] + ":00")
                        setShowExpiryDropdown(false)
                      }}
                      className="block w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4 sm:pt-8">
          <Button
            onClick={handleViewControl}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            View Admin Control
          </Button>
          <Button
            onClick={handleNotificationSettings}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            Notification Settings
          </Button>
        </div>

        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 border-l border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">{notificationData.length}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowNotificationPanel(false)} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {notificationData.length > 0 ? (
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Hi {notificationData[0].userName}</p>
                    <p className="text-sm text-gray-500">Here Sign up to Zero Koin</p>
                    <p className="text-xs text-gray-400">2 May 12:5 PM</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p>No notifications available</p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  View on Admin: <span className="font-medium">Abdul Salam</span>
                </p>
                <p className="text-xs text-gray-500">On 5th May, 2:30 PM</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Maintained Control View
  if (currentView === "control") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Maintained control</h1>
          <Button
            onClick={handleAddNewAdmin}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            Add New Admin
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Learning Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.learningRewards}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Edit className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Referrals Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.referralsRewards}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Ad Base Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.adBaseRewards}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Access Table */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-3 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Access Table</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[200px]">Admin Email</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[120px]">Role</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[160px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminData.map((admin) => (
                    <TableRow key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="py-3 text-gray-900 text-sm">{admin.email}</TableCell>
                      <TableCell className="py-3 text-gray-900 text-sm">{admin.role}</TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 text-xs flex items-center gap-1 justify-center"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="hidden sm:inline">Remove</span>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 text-xs flex items-center gap-1 justify-center"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Permissions new Admin View
  if (currentView === "permissions") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Permissions new Admin</h1>
          <Button
            onClick={() => setCurrentView("control")}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            Add New Admin
          </Button>
        </div>

        {/* Add New Admin Detail Card */}
        <div className="flex justify-center px-3 sm:px-0">
          <Card className="bg-white border border-gray-200 w-full max-w-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Add New Admin Detail</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("control")}
                  className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-gray-200 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-gray-200 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="border-gray-200 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                    Time
                  </Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="border-gray-200 text-gray-900"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setCurrentView("control")}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}



