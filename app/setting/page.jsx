"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  User,
  Shield,
  Eye,
  Edit,
  GraduationCap,
  Target,
  Bell,
  ChevronDown,
  X,
  Upload,
  ArrowLeft,
  Edit3,
  Trash2,
  ExternalLink,
  Save,
  XCircle,
  Pencil,
  Loader2,
  DollarSign,
  Gift,
  Users,
  Video,
  Calendar,
  Trophy,
} from "lucide-react"
import Image from "next/image"
import { userAPI, userHelpers } from "../../src/lib/api"
import { useUsers } from "../../hooks/useUsers"
import { useAdmins } from "../../hooks/useAdmins"

// API Service for Settings
const settingsAPI = {
  async getSettings() {
    try {
      const token = localStorage.getItem("token")
      const APP_BACKEND_URL = "https://zerokoinapp-production.up.railway.app/api"
      
      const response = await fetch(`${APP_BACKEND_URL}/settings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error fetching settings:", error)
      return { success: false, error: error.message }
    }
  },

  async updateSettings(settingsData) {
    try {
      const token = localStorage.getItem("token")
      const APP_BACKEND_URL = "https://zerokoinapp-production.up.railway.app/api"
      
      const response = await fetch(`${APP_BACKEND_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(settingsData),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error updating settings:", error)
      return { success: false, error: error.message }
    }
  },
}

export default function SettingPage() {
  // User role state
  const [userRole, setUserRole] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // State management
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [transferAmount, setTransferAmount] = useState("")
  const [transferReason, setTransferReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [transferHistory, setTransferHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState("history")
  const [historyFilters, setHistoryFilters] = useState({
    search: "",
    status: "all",
    dateRange: "all",
  })

  // Reward settings state
  const [rewardSettings, setRewardSettings] = useState({
    referralReward: 50,
    learningReward: 2,
    adBaseReward: 30,
  })
  const [editingReward, setEditingReward] = useState(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  // Settings specific state
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
  const [notificationView, setNotificationView] = useState("list")

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const [notificationData, setNotificationData] = useState({
    title: "",
    description: "",
    link: "",
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
  const [editingNotification, setEditingNotification] = useState(null)

  // Load reward settings from API on mount
  useEffect(() => {
    loadSettingsFromAPI()
  }, [])

  const loadSettingsFromAPI = async () => {
    setSettingsLoading(true)
    try {
      const result = await settingsAPI.getSettings()
      
      if (result.success && result.data && result.data.rewards) {
        setRewardSettings({
          referralReward: result.data.rewards.referralReward || 50,
          learningReward: result.data.rewards.learningReward || 2,
          adBaseReward: result.data.rewards.adBaseReward || 30,
        })
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setSettingsLoading(false)
    }
  }

  const showTemporaryMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: "", text: "" }), 3000)
  }

  const saveRewardSettingsToAPI = async (newSettings) => {
    setSavingSettings(true)
    try {
      const result = await settingsAPI.updateSettings({ rewards: newSettings })
      
      if (result.success) {
        showTemporaryMessage("success", `✅ Saved successfully!`)
        return true
      } else {
        throw new Error(result.error || "Failed to save")
      }
    } catch (error) {
      console.error("Save failed:", error)
      showTemporaryMessage("error", `Failed to save: ${error.message}`)
      return false
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSaveReward = async (rewardKey, newValue) => {
    if (isNaN(newValue) || newValue < 0) {
      showTemporaryMessage("error", "Please enter a valid positive number")
      return false
    }
    
    const updatedSettings = { ...rewardSettings, [rewardKey]: newValue }
    setRewardSettings(updatedSettings)
    
    const saved = await saveRewardSettingsToAPI(updatedSettings)
    
    if (saved) {
      setEditingReward(null)
      return true
    } else {
      setRewardSettings(rewardSettings)
      return false
    }
  }

  // Get user role from localStorage
  useEffect(() => {
    try {
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        setUserRole(userData.role || "")
        if (userData.role === "superadmin") {
          setActiveTab("transfer")
        } else {
          setActiveTab("history")
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
    }
  }, [])

  const hasTransferAccess = userRole === "superadmin"
  const hasHistoryAccess = true

  useEffect(() => {
    if (hasTransferAccess) {
      fetchUsers()
    }
    if (activeTab === "history") {
      fetchTransferHistory()
    }
  }, [currentPage, activeTab, hasTransferAccess])

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
              link: notification.link || "",
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
          }
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }
    fetchSentNotifications()
  }, [BASE_URL])

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
  const [currentAdminPassword, setCurrentAdminPassword] = useState("")

  const { users: allUsers, loading: usersLoading, error: usersError } = useUsers(1, 100)

  const stats = useMemo(() => {
    if (!allUsers || allUsers.length === 0) {
      return {
        learningRewards: 0,
        referralsRewards: 0,
        adBaseRewards: 0,
      }
    }
    const userStats = userHelpers.calculateStats(allUsers)
    return {
      learningRewards: allUsers.length,
      referralsRewards: userStats.totalReferrals,
      adBaseRewards: Math.floor(allUsers.length * 0.3),
    }
  }, [allUsers])

  const fetchUsers = async () => {
    if (!hasTransferAccess) return
    try {
      setLoading(true)
      const response = await userAPI.getUsers(currentPage, 10)
      if (response.success) {
        setUsers(response.users || response.data || [])
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        setMessage({ type: "error", text: "Failed to fetch users" })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setMessage({ type: "error", text: "Error fetching users" })
    } finally {
      setLoading(false)
    }
  }

  const fetchTransferHistory = async () => {
    try {
      setHistoryLoading(true)
      const response = await userAPI.getTransferHistory(historyFilters)
      if (response.success) {
        const transfers = response.data || []
        const formattedTransfers = transfers.map((transfer) => userHelpers.formatTransferData(transfer))
        setTransferHistory(formattedTransfers)
      } else {
        setMessage({ type: "error", text: response.message || "Failed to fetch transfer history" })
      }
    } catch (error) {
      console.error("Error fetching transfer history:", error)
      setMessage({ type: "error", text: "Error fetching transfer history" })
      setTransferHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setMessage({ type: "", text: "" })
    setIsMobileMenuOpen(false)
  }

  const handleTransfer = async () => {
    if (!hasTransferAccess) {
      setMessage({ type: "error", text: "You don't have permission to transfer coins" })
      return
    }
    if (!selectedUser || !transferAmount || !selectedUser.email) {
      setMessage({
        type: "error",
        text: "Please select a user with email and enter transfer amount",
      })
      return
    }

    const amount = Number.parseInt(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" })
      return
    }

    try {
      setLoading(true)
      const adminUser = localStorage.getItem("user")
      const adminUserStr = JSON.parse(adminUser)
      const admin = adminUserStr.username

      const response = await userAPI.editUserBalance(selectedUser.email, amount, admin)
      if (response.success) {
        setMessage({
          type: "success",
          text: `Successfully transferred ${amount} coins to ${selectedUser.name}. New balance: ${response.data.newBalance}`,
        })
        setSelectedUser((prev) => ({
          ...prev,
          balance: response.data.newBalance,
        }))
        setUsers((prev) =>
          prev.map((user) =>
            user.email === selectedUser.email ? { ...user, balance: response.data.newBalance } : user,
          ),
        )
        setTransferAmount("")
        setTransferReason("")
        fetchTransferHistory()
      } else {
        setMessage({
          type: "error",
          text: response.message || "Transfer failed",
        })
      }
    } catch (error) {
      console.error("Transfer error:", error)
      setMessage({
        type: "error",
        text: error.message || "Transfer failed",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredHistory = transferHistory.filter((transfer) => {
    const matchesSearch =
      !historyFilters.search ||
      transfer.userName?.toLowerCase().includes(historyFilters.search.toLowerCase()) ||
      transfer.userEmail?.toLowerCase().includes(historyFilters.search.toLowerCase()) ||
      transfer.transactionId?.toLowerCase().includes(historyFilters.search.toLowerCase())

    const matchesStatus = historyFilters.status === "all" || transfer.status === historyFilters.status

    let matchesDate = true
    if (historyFilters.dateRange !== "all") {
      const transferDate = new Date(transfer.dateTime || transfer.createdAt)
      const now = new Date()
      switch (historyFilters.dateRange) {
        case "today":
          matchesDate = transferDate.toDateString() === now.toDateString()
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = transferDate >= weekAgo
          break
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = transferDate >= monthAgo
          break
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const exportToCSV = () => {
    const headers = ["Transaction ID", "User Name", "Email", "Amount", "Date", "Time", "Admin", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredHistory.map((transfer) =>
        [
          transfer.transactionId,
          `"${transfer.userName}"`,
          transfer.userEmail,
          transfer.amount,
          transfer.date,
          transfer.time,
          `"${transfer.transferredBy}"`,
          transfer.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transfer-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const transferStats = userHelpers.calculateTransferStats(filteredHistory)

  const getRoleDisplay = (role) => {
    switch (role) {
      case "superadmin":
        return { icon: Shield, color: "text-red-600", bg: "bg-red-50", label: "Super Admin" }
      case "editor":
        return { icon: Edit, color: "text-blue-600", bg: "bg-blue-50", label: "Editor" }
      case "viewer":
        return { icon: Eye, color: "text-green-600", bg: "bg-green-50", label: "Viewer" }
      default:
        return { icon: User, color: "text-gray-600", bg: "bg-gray-50", label: "User" }
    }
  }

  const roleDisplay = getRoleDisplay(userRole)
  const RoleIcon = roleDisplay.icon

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
    } catch (error) {
      console.error("Failed to upload image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

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

      let priority = "old-user"
      switch (selectedSendTo) {
        case "New User":
          priority = "new-user"
          endpoint = `${BASE_URL}/notifications/general-with-image`
          break
        case "Old User":
          priority = "old-user"
          endpoint = `${BASE_URL}/notifications/general-with-image`
          break
        case "Top rated user":
          priority = "top-rated-user"
          endpoint = `${BASE_URL}/notifications/top-users`
          break
        default:
          throw new Error("Invalid recipient selection")
      }

      if (selectedSendTo === "Top rated user") {
        headers["Content-Type"] = "application/json"
        requestBody = JSON.stringify({
          title: notificationData.title,
          message: notificationData.description,
          imageUrl: uploadedImage || null,
          link: notificationData.link || null,
          priority: priority,
          limit: 10,
        })
      } else {
        const formData = new FormData()
        formData.append("title", notificationData.title)
        formData.append("message", notificationData.description)
        formData.append("priority", priority)
        if (notificationData.link) {
          formData.append("link", notificationData.link)
        }
        if (uploadedImageFile) {
          formData.append("image", uploadedImageFile)
        }
        requestBody = formData
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: requestBody,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const newNotification = {
          id: Date.now(),
          title: notificationData.title,
          description: notificationData.description,
          image: uploadedImage,
          link: notificationData.link,
          timestamp: new Date().toISOString(),
          sentTo: selectedSendTo,
          priority: priority,
        }

        setSentNotifications((prev) => [newNotification, ...prev])
        setShowSuccessModal(true)
        
        setTimeout(() => {
          setShowSuccessModal(false)
          setNotificationView("list")
          setUploadedImage(null)
          setUploadedImageFile(null)
          setSelectedSendTo("Send to")
          setNotificationData({
            title: "",
            description: "",
            link: "",
          })
        }, 2000)
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
      setNotificationView("list")
    }
  }

  const handleCreateNotification = () => {
    if (userRole === "superadmin" || userRole === "editor") {
      // Reset form
      setNotificationData({
        title: "",
        description: "",
        link: "",
      })
      setUploadedImage(null)
      setUploadedImageFile(null)
      setSelectedSendTo("Send to")
      setNotificationView("create")
    }
  }

  const handleUploadClick = () => {
    if (userRole === "viewer") {
      alert("You don't have permission to upload images.")
      return
    }
    document.getElementById("image-upload").click()
  }

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

  const handleEditNotification = (notification) => {
    if (userRole === "viewer") {
      alert("You don't have permission to edit notifications.")
      return
    }
    setEditingNotification(notification)
    setNotificationData({
      title: notification.title,
      description: notification.description,
      link: notification.link || "",
    })
    setUploadedImage(notification.image)
    setSelectedSendTo(
      notification.priority === "new-user"
        ? "New User"
        : notification.priority === "top-rated-user"
          ? "Top rated user"
          : "Old User",
    )
    setNotificationView("edit")
  }

  const handleDeleteNotification = async (notificationId) => {
    if (userRole === "viewer") {
      alert("You don't have permission to delete notifications.")
      return
    }
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setSentNotifications((prev) => prev.filter((n) => n.id !== notificationId))
          alert("Notification deleted successfully!")
        } else {
          throw new Error("Failed to delete notification")
        }
      } catch (error) {
        console.error("Delete failed:", error)
        alert("Failed to delete notification. Please try again.")
      }
    }
  }

  const handleUpdateNotification = async () => {
    if (userRole === "viewer") {
      alert("You don't have permission to update notifications.")
      return
    }

    const priorityMap = {
      "New User": "new-user",
      "Old User": "old-user",
      "Top rated user": "top-rated-user",
    }

    const priority = priorityMap[selectedSendTo] || "old-user"

    const updatedNotification = {
      ...editingNotification,
      title: notificationData.title,
      description: notificationData.description,
      link: notificationData.link,
      image: uploadedImage,
      priority: priority,
      sentTo: selectedSendTo,
    }

    try {
      const response = await fetch(`${BASE_URL}/notifications/${editingNotification.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNotification),
      })
      if (response.ok) {
        setSentNotifications((prev) => prev.map((n) => (n.id === editingNotification.id ? updatedNotification : n)))
        alert("Notification updated successfully!")
        setEditingNotification(null)
        setNotificationView("list")
        setNotificationData({
          title: "",
          description: "",
          link: "",
        })
        setUploadedImage(null)
        setUploadedImageFile(null)
        setSelectedSendTo("Send to")
      } else {
        throw new Error("Failed to update notification")
      }
    } catch (error) {
      console.error("Update failed:", error)
      alert("Failed to update notification. Please try again.")
    }
  }

  // Reward Card Component
  const RewardCard = ({ title, value, rewardKey, icon: Icon, color, description }) => {
    const isEditing = editingReward === rewardKey
    const [localValue, setLocalValue] = useState(value.toString())
    const inputRef = useRef(null)

    useEffect(() => {
      if (isEditing && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.select()
        }, 50)
      }
    }, [isEditing])

    const handleSave = async () => {
      const newValue = parseInt(localValue)
      if (isNaN(newValue) || newValue < 0) {
        showTemporaryMessage("error", "Please enter a valid positive number")
        return
      }
      const saved = await handleSaveReward(rewardKey, newValue)
      if (!saved) {
        setLocalValue(value.toString())
      }
    }

    const handleCancel = () => {
      setEditingReward(null)
      setLocalValue(value.toString())
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSave()
      }
      if (e.key === 'Escape') {
        handleCancel()
      }
    }

    return (
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className={`w-10 sm:w-12 h-10 sm:h-12 ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</p>
                {description && (
                  <p className="text-xs text-gray-400 mb-2">{description}</p>
                )}
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-teal-500">
                      <span className="px-2 text-gray-500 text-sm border-r border-gray-200">ZRK</span>
                      <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        value={localValue}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setLocalValue(value);
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-28 px-2 py-2 text-lg font-bold focus:outline-none rounded-r-md"
                        disabled={savingSettings}
                      />
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={savingSettings}
                      className="w-8 h-8 rounded-md bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors"
                      title="Save"
                    >
                      {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-8 h-8 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 flex items-center justify-center transition-colors"
                      title="Cancel"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</span>
                    <span className="text-sm text-gray-400">ZRK</span>
                    <button
                      onClick={() => {
                        setEditingReward(rewardKey)
                        setLocalValue(value.toString())
                      }}
                      className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-400 hover:text-teal-600 flex items-center justify-center transition-colors"
                      title="Edit Reward"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading || usersLoading || settingsLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Main Settings View
  if (currentView === "main") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {message.text && (
          <div className={`p-3 rounded-lg ${
            message.type === "success" ? "bg-green-100 text-green-700 border border-green-300" : 
            message.type === "error" ? "bg-red-100 text-red-700 border border-red-300" :
            "bg-yellow-100 text-yellow-700 border border-yellow-300"
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage admin control and notifications</p>
          </div>
        </div>

        {/* Reward Settings Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Reward Settings</h2>
          </div>
         
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <RewardCard
              title="Referral Rewards"
              value={rewardSettings.referralReward}
              rewardKey="referralReward"
              icon={Users}
              color="bg-purple-500"
              description="Reward for referring a new user"
            />
            <RewardCard
              title="Learning Rewards"
              value={rewardSettings.learningReward}
              rewardKey="learningReward"
              icon={GraduationCap}
              color="bg-blue-500"
              description="Reward per learning session"
            />
            <RewardCard
              title="Ad Base Rewards"
              value={rewardSettings.adBaseReward}
              rewardKey="adBaseReward"
              icon={Video}
              color="bg-orange-500"
              description="Reward for watching video ads"
            />
          </div>
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
                    {["1 Day
