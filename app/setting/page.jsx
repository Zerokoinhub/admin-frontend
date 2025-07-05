"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { GraduationCap, Edit, Target, X, ChevronDown, Trash2, Edit3, Bell, Upload, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useUsers } from "../../hooks/useUsers"
import { userHelpers } from "@/lib/api"
import { useAdmins } from "../../hooks/useAdmins"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingPage() {
  const [currentView, setCurrentView] = useState("main")
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false)
  const [selectedExpiry, setSelectedExpiry] = useState("02:00")
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [showNotificationList, setShowNotificationList] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showSendToDropdown, setShowSendToDropdown] = useState(false)
  const [selectedSendTo, setSelectedSendTo] = useState("Send to")
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedImageFile, setUploadedImageFile] = useState(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [notificationView, setNotificationView] = useState("empty")
  const [userRole, setUserRole] = useState("viewer")
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const [notificationData, setNotificationData] = useState({
    title: "Upcoming Zero Koin",
    description:
      "Zero Koin mining is the process of validating transactions and securing the Zero Koin blockchain by solving complex mathematical problems, typically using computing power, to earn rewards in Zero Koin.",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [formData, setFormData] = useState({
    name: "Fayhan",
    email: "Menog",
    role: "Super Admin",
    time: "1 Month",
  })
  const [sentNotifications, setSentNotifications] = useState([])

  // Get user role from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("the role:", parsedUser.role)
        if (parsedUser.role) {
          setUserRole(parsedUser.role)
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error)
      }
    }
  }, [])

  // Fetch sent notifications from backend
  useEffect(() => {
    const fetchSentNotifications = async () => {
      try {
        const response = await fetch(`${BASE_URL}/notifications`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const formattedNotifications = result.data.map((notification) => ({
              id: notification._id,
              title: notification.title,
              description: notification.message,
              image: notification.imageUrl,
              timestamp: notification.createdAt,
              sentTo:
                notification.priority === "new-user"
                  ? "New User"
                  : notification.priority === "top-rated-user"
                    ? "Top rated user"
                    : "Old User",
              type: notification.type,
              priority: notification.priority,
            }))
            setSentNotifications(formattedNotifications)
            if (formattedNotifications.length > 0) {
              setNotificationView("list")
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    fetchSentNotifications()
  }, [])

  // Fetch admins data
  const { admins, loading: adminsLoading, error: adminsError, addAdmin, editAdmin, removeAdmin } = useAdmins()
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [showEditAdminModal, setShowEditAdminModal] = useState(false)
  const [adminFormData, setAdminFormData] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [currentAdminPassword, setCurrentAdminPassword] = useState("")

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
      learningRewards: users.length,
      referralsRewards: userStats.totalReferrals,
      adBaseRewards: Math.floor(users.length * 0.3),
    }
  }, [users])

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (userRole === "viewer") {
      alert("You don't have permission to upload images.")
      return
    }

    setIsUploading(true)
    try {
      setUploadedImageFile(file)
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)
      console.log("Image uploaded successfully")
    } catch (error) {
      console.error("Failed to upload image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle notification sending - Updated to work with new backend
  const handleSendNotification = async () => {
    if (userRole === "viewer") {
      alert("You don't have permission to send notifications.")
      return
    }

    if (!notificationData.title.trim() || !notificationData.description.trim()) {
      alert("Please fill in both title and description.")
      return
    }

    if (selectedSendTo === "Send to") {
      alert("Please select who to send the notification to.")
      return
    }

    setIsSending(true)
    try {
      let endpoint = ""
      let requestBody = null
      const headers = {}

      // Map selectedSendTo to priority and determine endpoint
      let priority = "old-user" // default
      switch (selectedSendTo) {
        case "New User":
          priority = "new-user"
          endpoint = `${BASE_API_URL}/notifications/general-with-image`
          break
        case "Old User":
          priority = "old-user"
          endpoint = `${BASE_API_URL}/notifications/general-with-image`
          break
        case "Top rated user":
          priority = "top-rated-user"
          endpoint = `${BASE_API_URL}/notifications/top-users`
          break
        default:
          throw new Error("Invalid recipient selection")
      }

      // Prepare request based on endpoint
      if (selectedSendTo === "Top rated user") {
        headers["Content-Type"] = "application/json"
        requestBody = JSON.stringify({
          title: notificationData.title,
          message: notificationData.description,
          imageUrl: uploadedImage || null,
          priority: priority,
          limit: 10,
        })
      } else {
        // Use FormData for general notifications with image
        const formData = new FormData()
        formData.append("title", notificationData.title)
        formData.append("message", notificationData.description)
        formData.append("priority", priority)
        if (uploadedImageFile) {
          formData.append("image", uploadedImageFile)
        }
        requestBody = formData
      }

      console.log("Sending notification to:", endpoint)
      console.log("Priority:", priority)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: requestBody,
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("Non-JSON response received:", textResponse)
        throw new Error(`Server returned non-JSON response. Status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Response:", result)

      if (response.ok && result.success) {
        // Add the sent notification to the list
        const newNotification = {
          id: Date.now(),
          title: notificationData.title,
          description: notificationData.description,
          image: uploadedImage,
          timestamp: new Date().toISOString(),
          sentTo: selectedSendTo,
          priority: priority,
        }

        setSentNotifications((prev) => [newNotification, ...prev])

        // Dispatch custom event to notify header component
        const event = new CustomEvent("newNotificationSent", {
          detail: {
            notification: newNotification,
          },
        })
        window.dispatchEvent(event)

        setShowSuccessModal(true)
        setTimeout(() => {
          setShowSuccessModal(false)
          setNotificationView("list")
          setUploadedImage(null)
          setUploadedImageFile(null)
          setSelectedSendTo("Send to")
          setNotificationData({
            title: "Upcoming Zero Koin",
            description:
              "Zero Koin mining is the process of validating transactions and securing the Zero Koin blockchain by solving complex mathematical problems, typically using computing power, to earn rewards in Zero Koin.",
          })
        }, 3000)
      } else {
        throw new Error(result.message || `Server error: ${response.status}`)
      }
    } catch (error) {
      console.error("Failed to send notification:", error)
      alert(`Failed to send notification: ${error.message}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleAddNewAdmin = () => {
    if (userRole === "superadmin") {
      setAdminFormData({
        username: "",
        email: "",
        role: "",
        password: "",
      })
      setShowAddAdminModal(true)
    }
  }

  const handleViewControl = () => {
    setCurrentView("control")
  }

  const handleNotificationSettings = () => {
    if (userRole === "superadmin" || userRole === "editor") {
      setCurrentView("notifications")
      setNotificationView(sentNotifications.length > 0 ? "list" : "empty")
    }
  }

  const handleCreateNotification = () => {
    if (userRole === "superadmin" || userRole === "editor") {
      setNotificationView("create")
    }
  }

  const handleNext = () => {
    if (userRole === "superadmin" || userRole === "editor") {
      setNotificationView("send")
    }
  }

  const handleUploadClick = () => {
    if (userRole === "viewer") {
      alert("You don't have permission to upload images.")
      return
    }
    document.getElementById("image-upload").click()
  }

  // Handle add admin form submission
  const handleAddAdminSubmit = async () => {
    if (!adminFormData.username || !adminFormData.email || !adminFormData.role || !adminFormData.password) {
      alert("Please fill in all fields")
      return
    }

    try {
      const result = await addAdmin(adminFormData)
      if (result.success) {
        alert("Admin added successfully!")
        setShowAddAdminModal(false)
        setAdminFormData({ username: "", email: "", role: "", password: "" })
      } else {
        alert(`Failed to add admin: ${result.error}`)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleEditAdmin = (admin) => {
    if (userRole === "superadmin") {
      setEditingAdmin(admin)
      setAdminFormData({
        username: admin.username || "",
        email: admin.email || "",
        role: admin.role || "",
        password: "",
      })
      setCurrentAdminPassword(admin.password || "")
      setShowEditAdminModal(true)
    } else {
      alert("You don't have permission to edit admins.")
    }
  }

  const handleEditAdminSubmit = async () => {
    if (!adminFormData.username || !adminFormData.email || !adminFormData.role) {
      alert("Please fill in required fields")
      return
    }

    const updateData = {
      username: adminFormData.username,
      email: adminFormData.email,
      role: adminFormData.role,
    }

    if (adminFormData.password?.trim()) {
      updateData.password = adminFormData.password.trim()
    }

    try {
      const result = await editAdmin(editingAdmin._id, updateData)
      if (result && result.success) {
        alert("Admin updated successfully!")
        setShowEditAdminModal(false)
        setEditingAdmin(null)
        setAdminFormData({ username: "", email: "", role: "", password: "" })
      } else {
        throw new Error(result?.error || "Unknown error")
      }
    } catch (error) {
      console.error("Update failed:", error)
      alert(`Failed to update admin: ${error.message}`)
    }
  }

  const handleRemoveAdmin = async (adminId) => {
    if (userRole === "superadmin") {
      if (confirm("Are you sure you want to remove this admin?")) {
        const result = await removeAdmin(adminId)
        if (result.success) {
          alert("Admin removed successfully!")
        } else {
          alert(`Failed to remove admin: ${result.error}`)
        }
      }
    } else {
      alert("You don't have permission to remove admins.")
    }
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
    if (userRole === "viewer") {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to access notification settings.</p>
          <Button onClick={() => setCurrentView("main")} className="mt-4">
            Go Back
          </Button>
        </div>
      )
    }

    // Empty Notification State
    if (notificationView === "empty") {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Hye Admin!</h1>
            <Button onClick={() => setCurrentView("main")} variant="outline" className="w-full sm:w-auto">
              Back to Settings
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="w-24 sm:w-32 h-24 sm:h-32 bg-teal-100 rounded-full flex items-center justify-center">
              <Bell className="h-12 sm:h-16 w-12 sm:w-16 text-teal-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg sm:text-xl font-medium text-gray-900">You have no Notification Yet!</h2>
            </div>
            {(userRole === "superadmin" || userRole === "editor") && (
              <Button
                onClick={handleCreateNotification}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                Create Notification
              </Button>
            )}
          </div>
        </div>
      )
    }

    // Create Notification View
    if (notificationView === "create") {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Create Notification</h1>
            <Button
              onClick={() => setNotificationView(sentNotifications.length > 0 ? "list" : "empty")}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Back
            </Button>
          </div>
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Upload Image Area */}
            <div
              onClick={handleUploadClick}
              className={`border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center transition-colors ${
                userRole === "viewer" ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-gray-400"
              } ${uploadedImage ? "border-teal-500 bg-teal-50" : ""}`}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={userRole === "viewer"}
              />
              <div className="space-y-4">
                {uploadedImage ? (
                  <div className="space-y-4">
                    <Image
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Uploaded notification image"
                      width={200}
                      height={120}
                      className="mx-auto rounded-lg object-cover"
                    />
                    <p className="text-teal-600 font-medium">Image uploaded successfully!</p>
                    <p className="text-sm text-gray-500">Click to change image</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                      {isUploading ? (
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">{isUploading ? "Uploading..." : "Upload Image"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Editable Content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notification-title" className="text-sm font-medium text-gray-700">
                  Notification Title
                </Label>
                <Input
                  id="notification-title"
                  value={notificationData.title}
                  onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                  className="border-gray-200"
                  disabled={userRole === "viewer"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <textarea
                  id="notification-description"
                  value={notificationData.description}
                  onChange={(e) => setNotificationData({ ...notificationData, description: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-md text-sm leading-relaxed resize-none"
                  rows={4}
                  disabled={userRole === "viewer"}
                />
              </div>
            </div>

            <div className="flex justify-end">
              {(userRole === "superadmin" || userRole === "editor") && (
                <Button
                  onClick={handleNext}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium"
                  disabled={!notificationData.title.trim() || !notificationData.description.trim()}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      )
    }

    // Filter & Send Notification View
    if (notificationView === "send") {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Filter & Send Notification</h1>
            <div className="relative">
              <Button
                onClick={() => setShowSendToDropdown(!showSendToDropdown)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                disabled={userRole === "viewer"}
              >
                <Bell className="h-4 w-4" />
                {selectedSendTo}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showSendToDropdown && userRole !== "viewer" && (
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

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Notification Preview */}
            <div className="relative rounded-lg overflow-hidden">
              {uploadedImage ? (
                <Image
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Notification Preview"
                  width={600}
                  height={200}
                  className="w-full h-48 sm:h-56 object-cover"
                />
              ) : (
                <div className="w-full h-48 sm:h-56 bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Bell className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-lg font-medium">No Image Uploaded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{notificationData.title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{notificationData.description}</p>
            </div>

            <div className="flex justify-end">
              {(userRole === "superadmin" || userRole === "editor") && (
                <Button
                  onClick={handleSendNotification}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium"
                  disabled={isSending || selectedSendTo === "Send to"}
                >
                  {isSending ? "Sending..." : "Send Notification"}
                </Button>
              )}
            </div>
          </div>

          {/* Success Modal */}
          <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
            <DialogContent className="sm:max-w-md bg-white text-center border-0 shadow-2xl mx-4">
              <div className="py-8 px-6">
                <div className="relative mx-auto w-24 h-24 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-green-600 rounded-full flex items-center justify-center relative z-10">
                    <Bell className="h-10 w-10 text-white" />
                  </div>
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
                <h3 className="text-xl font-semibold text-teal-600 mb-2">Your Notification</h3>
                <h3 className="text-xl font-semibold text-teal-600 mb-6">has Successfully Send!</h3>
                <p className="text-sm text-gray-600 mb-2">Please wait</p>
                <p className="text-sm text-gray-600 mb-8">You will be directed to the homepage soon</p>
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )
    }

    // Notification List View
    if (notificationView === "list") {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Notifications</h1>
            <Button onClick={() => setCurrentView("main")} variant="outline" className="w-full sm:w-auto">
              Back to Settings
            </Button>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {sentNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No notifications sent yet</p>
                </div>
              ) : (
                sentNotifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <div className="w-4 h-4 bg-teal-600 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Z</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">Zerokoin Network</h3>
                          <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-gray-800 mb-1">{notification.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{notification.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Sent to: {notification.sentTo} • {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            {sentNotifications.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      console.log("Manage notifications")
                    }}
                  >
                    Manage
                  </Button>
                  <Button
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all notifications?")) {
                        setSentNotifications([])
                        setNotificationView("empty")
                      }
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Create New Notification Button */}
          <div className="flex justify-center pt-4">
            {(userRole === "superadmin" || userRole === "editor") && (
              <Button
                onClick={handleCreateNotification}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                Create New Notification
              </Button>
            )}
          </div>
        </div>
      )
    }
  }

  // Main Settings View
  if (currentView === "main") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
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
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {userRole === "superadmin" ? stats.learningRewards : "***"}
                  </p>
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
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {userRole === "superadmin" ? stats.adBaseRewards : "***"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expiry Dropdown */}
        {(userRole === "superadmin" || userRole === "editor") && (
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
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4 sm:pt-8">
          <Button
            onClick={handleViewControl}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            View Admin Control
          </Button>
          {(userRole === "superadmin" || userRole === "editor") && (
            <Button
              onClick={handleNotificationSettings}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
            >
              Notification Settings
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Admin Control View with Back to Settings button
  if (currentView === "control") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header with Back to Settings */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentView("main")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </Button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Maintained control</h1>
          </div>
          {userRole === "superadmin" && (
            <Button
              onClick={handleAddNewAdmin}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
            >
              Add New Admin
            </Button>
          )}
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
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {userRole === "superadmin" ? stats.learningRewards : "***"}
                  </p>
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
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {userRole === "superadmin" ? stats.adBaseRewards : "***"}
                  </p>
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
                    {userRole === "superadmin" && (
                      <TableHead className="font-semibold text-gray-700 py-3 min-w-[160px]">Action</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminsLoading ? (
                    <TableRow>
                      <TableCell colSpan={userRole === "superadmin" ? 3 : 2} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : adminsError ? (
                    <TableRow>
                      <TableCell colSpan={userRole === "superadmin" ? 3 : 2} className="text-center py-8 text-red-600">
                        Error loading admins: {adminsError}
                      </TableCell>
                    </TableRow>
                  ) : admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={userRole === "superadmin" ? 3 : 2} className="text-center py-8 text-gray-500">
                        No admins found
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="py-3 text-gray-900 text-sm">{admin.email}</TableCell>
                        <TableCell className="py-3 text-gray-900 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              admin.role === "superadmin"
                                ? "bg-purple-100 text-purple-800"
                                : admin.role === "editor"
                                  ? "bg-blue-100 text-blue-800"
                                  : admin.role === "viewer"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {admin.role === "superadmin"
                              ? "Super Admin"
                              : admin.role === "editor"
                                ? "Editor"
                                : admin.role === "viewer"
                                  ? "Viewer"
                                  : admin.role}
                          </span>
                        </TableCell>
                        {userRole === "superadmin" && (
                          <TableCell className="py-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleRemoveAdmin(admin._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs flex items-center gap-1 justify-center"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span className="hidden sm:inline">Remove</span>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleEditAdmin(admin)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 text-xs flex items-center gap-1 justify-center"
                              >
                                <Edit3 className="h-3 w-3" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Admin Modal */}
        <Dialog open={showAddAdminModal} onOpenChange={setShowAddAdminModal}>
          <DialogContent className="sm:max-w-md bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Add New Admin</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowAddAdminModal(false)} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name" className="text-sm font-medium text-gray-700">
                    Username *
                  </Label>
                  <Input
                    id="add-name"
                    value={adminFormData.username}
                    onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                    className="border-gray-200"
                    placeholder="Enter admin username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    className="border-gray-200"
                    placeholder="Enter admin email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-role" className="text-sm font-medium text-gray-700">
                    Role *
                  </Label>
                  <Select
                    value={adminFormData.role}
                    onValueChange={(value) => setAdminFormData({ ...adminFormData, role: value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-password" className="text-sm font-medium text-gray-700">
                    Password *
                  </Label>
                  <Input
                    id="add-password"
                    type="password"
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    className="border-gray-200"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAddAdminModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAdminSubmit} className="bg-teal-600 hover:bg-teal-700 text-white">
                    Add Admin
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Admin Modal */}
        <Dialog open={showEditAdminModal} onOpenChange={setShowEditAdminModal}>
          <DialogContent className="sm:max-w-md bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Edit Admin</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowEditAdminModal(false)} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Username *</Label>
                  <Input
                    id="edit-name"
                    value={adminFormData.username}
                    onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                    disabled={userRole !== "superadmin"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    disabled={userRole !== "superadmin"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select
                    value={adminFormData.role}
                    onValueChange={(value) => setAdminFormData({ ...adminFormData, role: value })}
                    disabled={userRole !== "superadmin"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {userRole === "superadmin" && currentAdminPassword && (
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={currentAdminPassword}
                        className="bg-gray-50"
                        readOnly
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-3"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                )}
                {userRole === "superadmin" && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowChangePassword((prev) => !prev)}
                    >
                      {showChangePassword ? "Cancel Password Change" : "Change Password"}
                    </Button>
                  </div>
                )}
                {userRole === "superadmin" && showChangePassword && (
                  <>
                    <div className="space-y-2 pt-4">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          const value = e.target.value
                          setConfirmPassword(value)
                          if (value === newPassword) {
                            setAdminFormData({ ...adminFormData, password: value })
                          }
                        }}
                        className={`${confirmPassword && confirmPassword !== newPassword ? "border-red-500" : ""}`}
                      />
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p className="text-xs text-red-500">Passwords do not match.</p>
                      )}
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowEditAdminModal(false)}>
                    {userRole === "superadmin" ? "Cancel" : "Close"}
                  </Button>
                  {userRole === "superadmin" && (
                    <Button onClick={handleEditAdminSubmit} className="bg-teal-600 hover:bg-teal-700 text-white">
                      Update Admin
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
}

