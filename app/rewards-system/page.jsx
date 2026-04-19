"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { TrendingUp, BarChart3, Shield, X, Eye, EyeOff, Lock, Users, GraduationCap, Video, Save, XCircle, Pencil, Loader2, DollarSign } from "lucide-react"
import { useUsers } from "../../hooks/useUsers"
import { userHelpers } from "@/lib/api"

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

export default function RewardsSystemPage() {
  const [currentView, setCurrentView] = useState("distribution")
  const [selectedUser, setSelectedUser] = useState(null)
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    role: "",
    id: "",
  })
  const [roleDisplayName, setRoleDisplayName] = useState("")
  
  // Reward settings state
  const [rewardSettings, setRewardSettings] = useState({
    referralReward: 50,
    learningReward: 2,
    adBaseReward: 30,
  })
  const [editingReward, setEditingReward] = useState(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  // Load reward settings from API
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
      console.error("❌ Save failed:", error)
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

  // Get user data from localStorage
  const getUserData = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          return {
            id: user.id || "",
            username: user.username || "",
            email: user.email || "",
            role: user.role?.toLowerCase() || "",
          }
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error)
      }
    }
    return {
      id: "",
      username: "",
      email: "",
      role: "",
    }
  }

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "superadmin":
        return "Super Admin"
      case "editor":
        return "Editor"
      case "viewer":
        return "Viewer"
      default:
        return "Unknown"
    }
  }

  // Check permissions based on role
  const hasPermission = (action) => {
    const role = userData.role
    switch (role) {
      case "superadmin":
        return ["view", "edit", "viewDetails", "viewProfile", "viewSensitiveData", "editRewards"].includes(action)
      case "editor":
        return ["view", "viewDetails", "editRewards"].includes(action)
      case "viewer":
        return ["view"].includes(action)
      default:
        return false
    }
  }

  // Load user data on component mount
  useEffect(() => {
    const user = getUserData()
    setUserData(user)
    setRoleDisplayName(getRoleDisplayName(user.role))
  }, [])

  // Fetch users data
  const { users, loading, error, pagination } = useUsers(1, 100)

  // Generate chart data from real users
  const chartData = useMemo(() => {
    if (!users || users.length === 0) {
      return [
        { month: "Jan", referrals: 0 },
        { month: "Feb", referrals: 0 },
        { month: "Mar", referrals: 0 },
        { month: "Apr", referrals: 0 },
        { month: "May", referrals: 0 },
        { month: "Jun", referrals: 0 },
        { month: "Jul", referrals: 0 },
      ]
    }

    const monthlyData = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]

    months.forEach((month) => {
      monthlyData[month] = Math.floor(Math.random() * users.length * 0.3) + Math.floor(users.length * 0.1)
    })

    return months.map((month) => ({
      month,
      referrals: monthlyData[month],
    }))
  }, [users])

  // Generate table data from real users
  const tableData = useMemo(() => {
    if (!users || users.length === 0) return []

    return users.slice(0, 7).map((user, index) => ({
      id: user._id,
      name: user.name || "Unknown User",
      referrals: Math.floor(Math.random() * 50) + 10,
      fraudRisk: Math.random() > 0.5 ? "Low" : "Medium",
      email: user.email,
      balance: user.balance || 0,
      walletAddress: user.walletAddresses?.metamask || user.walletAddresses?.trustWallet || "No wallet connected",
      createdAt: new Date(user.createdAt).toLocaleDateString(),
    }))
  }, [users])

  // Generate referrals log data from real users
  const referralsLogData = useMemo(() => {
    if (!users || users.length === 0) return []

    return users.slice(0, 9).map((user) => ({
      date: new Date(user.createdAt).toLocaleDateString(),
      email: user.email,
      uid: user._id.slice(-8).toUpperCase(),
    }))
  }, [users])

  // Calculate stats from real users
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        trackReferrals: 0,
        dailyReports: 0,
        fraudDetection: 0,
      }
    }

    const userStats = userHelpers.calculateStats(users)
    return {
      trackReferrals: userStats.totalReferrals,
      dailyReports: users.length * 10,
      fraudDetection: Math.floor(users.length * 0.1),
    }
  }, [users])

  const handleViewUser = (user) => {
    if (!hasPermission("viewProfile")) {
      alert("You don't have permission to view user profiles")
      return
    }
    setSelectedUser(user)
    setCurrentView("profile")
  }

  const handleViewUserDetails = () => {
    if (!hasPermission("viewDetails")) {
      alert("You don't have permission to view detailed user information")
      return
    }
    setCurrentView("distribution")
  }

  const handleViewReferralsLog = () => {
    if (!hasPermission("viewDetails")) {
      alert("You don't have permission to view referrals log")
      return
    }
    setCurrentView("log")
  }

  // Show authentication error if no user data
  if (!userData.username || !userData.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
          <p className="text-gray-600 max-w-md">
            Unable to load user data. Please log in again to access the rewards system.
          </p>
        </div>
      </div>
    )
  }

  if (loading || settingsLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="text-center text-red-600 p-4">
          <p>Error loading users: {error}</p>
        </div>
      </div>
    )
  }

  // User Profile Screen View (Super Admin Only)
  if (currentView === "profile") {
    if (!hasPermission("viewProfile")) {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
          <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
            <CardContent className="p-8 h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Access Restricted</h3>
              <p className="text-gray-500 mb-6 max-w-sm leading-relaxed">
                User profile access is restricted to Super Admin users only.
              </p>
              <Button onClick={() => setCurrentView("distribution")} className="bg-teal-600 hover:bg-teal-700">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    const user = selectedUser || (tableData.length > 0 ? tableData[0] : null)

    if (!user) {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
          <div className="text-center text-gray-600 p-4">
            <p>No user selected</p>
          </div>
        </div>
      )
    }

    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">User Profile</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {roleDisplayName}
              </Badge>
              <span className="text-sm text-gray-600">Full Access</span>
            </div>
          </div>
          <Button
            onClick={handleViewReferralsLog}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            View Referrals Log
          </Button>
        </div>

        <div className="flex justify-center px-3 sm:px-0">
          <Card className="bg-white border border-gray-200 w-full max-w-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("distribution")}
                  className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
                  <Input id="name" value={user.name} className="border-gray-200 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input id="email" value={user.email} className="border-gray-200 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallet" className="text-sm font-medium text-gray-700">Wallet Address</Label>
                  <Input id="wallet" value={user.walletAddress} className="border-gray-200 text-gray-900 text-xs font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coins" className="text-sm font-medium text-gray-700">Coins Earned</Label>
                  <Input id="coins" value={`${user.balance}$`} readOnly className="bg-gray-50 border-gray-200 text-gray-900" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Referrals Log Table View (Super Admin and Editor Only)
  if (currentView === "log") {
    if (!hasPermission("viewDetails")) {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
          <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
            <CardContent className="p-8 h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <EyeOff className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Access Restricted</h3>
              <p className="text-gray-500 mb-6 max-w-sm leading-relaxed">
                Referrals log access requires Editor or Super Admin permissions.
              </p>
              <Button onClick={() => setCurrentView("distribution")} className="bg-teal-600 hover:bg-teal-700">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Referrals Log</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {roleDisplayName}
              </Badge>
              <span className="text-sm text-gray-600">
                {userData.role === "superadmin" ? "Full Access" : "Limited Access"}
              </span>
            </div>
          </div>
          <Button onClick={() => setCurrentView("distribution")} variant="outline" className="w-full sm:w-auto">
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Track Referrals</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.trackReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Daily Reports</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {hasPermission("viewSensitiveData") ? stats.dailyReports : "***"}
                  </p>
                  {!hasPermission("viewSensitiveData") && <p className="text-xs text-gray-400">Super Admin Only</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Fraud Detection</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.fraudDetection}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-3 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700 py-4 px-3 sm:px-6 min-w-[100px]">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-3 sm:px-6 min-w-[200px]">Referrals Email</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-3 sm:px-6 min-w-[120px]">UID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralsLogData.map((item, index) => (
                    <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="py-4 px-3 sm:px-6 text-gray-900 text-sm">{item.date}</TableCell>
                      <TableCell className="py-4 px-3 sm:px-6 text-gray-900 text-sm">{item.email}</TableCell>
                      <TableCell className="py-4 px-3 sm:px-6 text-gray-900 text-sm">{item.uid}</TableCell>
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

  // Main Distribution View (All Roles) - WITH 3 REWARD CARDS
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Reward Distribution History</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {roleDisplayName}
            </Badge>
            <span className="text-sm text-gray-600">
              {userData.role === "superadmin"
                ? "Full Access"
                : userData.role === "editor"
                  ? "Limited Access"
                  : "View Only"}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          {hasPermission("viewDetails") && (
            <Button
              onClick={handleViewReferralsLog}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Log
            </Button>
          )}
        </div>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`p-3 rounded-lg ${
          message.type === "success" ? "bg-green-100 text-green-700 border border-green-300" : 
          message.type === "error" ? "bg-red-100 text-red-700 border border-red-300" :
          "bg-yellow-100 text-yellow-700 border border-yellow-300"
        }`}>
          {message.text}
        </div>
      )}

      {/* REWARD CARDS SECTION - 3 CARDS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Reward Settings</h2>
          {!hasPermission("editRewards") && (
            <span className="text-xs text-gray-400 ml-2">(View Only)</span>
          )}
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

      {/* Access Notice for Limited Users */}
      {!hasPermission("viewDetails") && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <EyeOff className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-900 mb-1">Limited Access</h3>
              <p className="text-sm text-amber-800">
                You have view-only access to charts and basic user data. Contact your administrator for additional
                permissions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <h3 className="text-sm font-semibold text-gray-600 tracking-wide">REFERRALS PER USER</h3>
            <span className="text-xs text-gray-400 tracking-wide">DETAILS</span>
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <Line
                  type="monotone"
                  dataKey="referrals"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ fill: "#0d9488", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#0d9488" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-3 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Overview</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700 py-3 min-w-[100px]">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 min-w-[100px]">Referrals</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 min-w-[120px]">Fraud Risk</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 min-w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((user) => (
                  <TableRow key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="py-3 font-medium text-gray-900 text-sm">{user.name}</TableCell>
                    <TableCell className="py-3 text-gray-900 text-sm">{user.referrals}</TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={
                          user.fraudRisk === "Low"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 border-0 text-xs"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0 text-xs"
                        }
                      >
                        {user.fraudRisk}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      {hasPermission("viewProfile") ? (
                        <Button
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-1 text-sm w-full sm:w-auto"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled
                          className="bg-gray-300 text-gray-500 px-3 sm:px-4 py-1 text-sm w-full sm:w-auto cursor-not-allowed"
                          title="Requires Super Admin access"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Restricted
                        </Button>
                      )}
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
