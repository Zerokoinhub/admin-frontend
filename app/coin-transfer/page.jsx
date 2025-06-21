"use client"

import { useState, useEffect } from "react"
import { X, Shield, Lock, EyeOff, CheckCircle, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ViewScreenshots from "../../src/components/ui/ViewScreenshots"
import TransferHistory from "../../src/components/ui/TransferHistory"
import UserSelector from "../../src/components/ui/UserSelector"
import { userHelpers } from "../../src/lib/api"
import { User } from "lucide-react"

export default function CoinTransferPage() {
  const [showScreenshots, setShowScreenshots] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [transferAmount, setTransferAmount] = useState("")
  const [transferReason, setTransferReason] = useState("")
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    role: "",
    id: "",
  })
  const [roleDisplayName, setRoleDisplayName] = useState("")
  const [transferHistory, setTransferHistory] = useState([])
  const [isTransferring, setIsTransferring] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [screenshotApprovalData, setScreenshotApprovalData] = useState(null)

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

  // Get role color scheme
  const getRoleColorScheme = (role) => {
    switch (role) {
      case "superadmin":
        return {
          bg: "bg-gradient-to-r from-purple-50 to-indigo-50",
          badge: "bg-purple-100 text-purple-800 border-purple-200",
          accent: "text-purple-600",
        }
      case "editor":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
          badge: "bg-blue-100 text-blue-800 border-blue-200",
          accent: "text-blue-600",
        }
      case "viewer":
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50",
          badge: "bg-green-100 text-green-800 border-green-200",
          accent: "text-green-600",
        }
      default:
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50",
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          accent: "text-gray-600",
        }
    }
  }

  // Check permissions based on role
  const hasPermission = (action) => {
    const role = userData.role
    switch (role) {
      case "superadmin":
        return ["view", "transfer", "viewHistory", "viewScreenshots", "editTransfer"].includes(action)
      case "editor":
        return ["view", "transfer", "viewHistory", "viewScreenshots", "editTransfer"].includes(action)
      case "viewer":
        return ["view", "viewHistory", "viewScreenshots"].includes(action) // Can view but not transfer
      default:
        return false
    }
  }

  // Get permissions description
  const getPermissionsDescription = (role) => {
    switch (role) {
      case "superadmin":
        return "Full Access (All Operations)"
      case "editor":
        return "Full Access (All Operations)"
      case "viewer":
        return "Limited Access (View Only)"
      default:
        return "No Permissions"
    }
  }

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  }

  // Create headers with auth token
  const getAuthHeaders = () => {
    const token = getAuthToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Execute coin transfer
  const executeTransfer = async (userId, amount, reason) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/coin-transfer`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          reason: reason,
          transferType: "manual_admin_transfer",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Transfer failed: ${response.status}`)
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Fetch transfer history
  const fetchTransferHistory = async () => {
    try {
      setIsLoadingHistory(true)
      const response = await fetch("http://localhost:5000/api/transfers/history", {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`)
      }

      const data = await response.json()
      setTransferHistory(data)
    } catch (error) {
      console.error("Error fetching transfer history:", error)
      // Fallback to mock data if API fails
      setTransferHistory([
        {
          id: "1",
          userId: selectedUser?._id,
          userName: selectedUser?.name,
          amount: 100,
          reason: "Manual transfer",
          status: "completed",
          createdAt: new Date().toISOString(),
          adminId: userData.id,
          adminName: userData.username,
        },
      ])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Load user data on component mount
  useEffect(() => {
    const user = getUserData()
    setUserData(user)
    setRoleDisplayName(getRoleDisplayName(user.role))
  }, [])

  // Handle transfer action
  const handleTransfer = async () => {
    if (!hasPermission("transfer")) {
      alert("You don't have permission to perform transfers")
      return
    }

    // Check if all screenshots are approved (if coming from screenshot approval)
    if (screenshotApprovalData && !screenshotApprovalData.allScreenshotsApproved) {
      alert("All screenshots must be approved before transfer can be executed")
      return
    }

    if (!transferAmount || !transferReason) {
      alert("Please fill in all transfer details")
      return
    }

    if (!selectedUser) {
      alert("Please select a user first")
      return
    }

    const amount = Number.parseFloat(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid transfer amount")
      return
    }

    if (!confirm(`Are you sure you want to transfer ${amount} coins to ${selectedUser.name}?`)) {
      return
    }

    setIsTransferring(true)

    try {
      const result = await executeTransfer(selectedUser._id, amount, transferReason)

      if (result.success) {
        alert(`Successfully transferred ${amount} coins to ${selectedUser.name}`)

        // Add to transfer history
        const newTransfer = {
          id: Date.now().toString(),
          userId: selectedUser._id,
          userName: selectedUser.name,
          amount: amount,
          reason: transferReason,
          status: "completed",
          createdAt: new Date().toISOString(),
          adminId: userData.id,
          adminName: userData.username,
        }

        setTransferHistory((prev) => [newTransfer, ...prev])

        // Clear form
        setTransferAmount("")
        setTransferReason("")

        // Clear screenshot approval data
        setScreenshotApprovalData(null)

        // Update user balance locally - THIS IS THE KEY CHANGE
        if (selectedUser) {
          setSelectedUser((prev) => ({
            ...prev,
            balance: (prev.balance || 0) + amount,
          }))
        }
      } else {
        alert(`Transfer failed: ${result.error}`)
      }
    } catch (error) {
      alert(`Transfer error: ${error.message}`)
    } finally {
      setIsTransferring(false)
    }
  }

  // Handle view screenshots
  const handleViewScreenshots = () => {
    if (!hasPermission("viewScreenshots")) {
      alert("You don't have permission to view screenshots")
      return
    }
    setShowScreenshots(true)
  }

  // Handle view history
  const handleViewHistory = () => {
    if (!hasPermission("viewHistory")) {
      alert("You don't have permission to view transfer history")
      return
    }
    setShowHistory(true)
  }

  // Handle screenshot approval callback
  const handleScreenshotApproval = (approvalData) => {
    setScreenshotApprovalData(approvalData)
    setShowScreenshots(false)

    // Auto-fill transfer amount and reason if ALL screenshots were approved
    if (approvalData.allScreenshotsApproved) {
      setTransferAmount(approvalData.totalCoins.toString())
      setTransferReason(
        `Screenshot approval reward - ${approvalData.approvedCount} screenshot${approvalData.approvedCount > 1 ? "s" : ""} approved`,
      )
    }
  }

  // Load transfer history when component mounts
  useEffect(() => {
    if (userData.role && hasPermission("viewHistory")) {
      fetchTransferHistory()
    }
  }, [userData.role])

  // Check if transfer button should be enabled
  const isTransferEnabled = () => {
    if (!hasPermission("transfer")) return false
    if (!transferAmount || !transferReason) return false
    if (isTransferring) return false

    // If coming from screenshot approval, all screenshots must be approved
    if (screenshotApprovalData && !screenshotApprovalData.allScreenshotsApproved) {
      return false
    }

    return true
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
            Unable to load user data. Please log in again to access the coin transfer system.
          </p>
        </div>
      </div>
    )
  }

  const colorScheme = getRoleColorScheme(userData.role)

  if (showScreenshots) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
        <ViewScreenshots
          onBack={() => setShowScreenshots(false)}
          onApprove={handleScreenshotApproval}
          selectedUser={selectedUser}
        />
      </div>
    )
  }

  if (showHistory) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
        <TransferHistory onBack={() => setShowHistory(false)} />
      </div>
    )
  }

  const formattedUser = selectedUser ? userHelpers.formatUser(selectedUser) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className={`${colorScheme.bg} border-b border-gray-200/50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <User className={`h-6 w-6 ${colorScheme.accent}`} />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manual Zero Koin Transfer</h1>
                  <p className="text-gray-600 text-sm lg:text-base">Manage coin transfers and user balances</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Badge variant="outline" className={`${colorScheme.badge} px-3 py-1.5 font-medium`}>
                <Shield className="h-3 w-3 mr-2" />
                {roleDisplayName}
              </Badge>
              <div className="text-sm text-gray-600 bg-white/60 px-3 py-1.5 rounded-lg">
                {getPermissionsDescription(userData.role)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Access Notice for Viewer */}
        {userData.role === "viewer" && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <EyeOff className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-amber-900 mb-1">Limited Access Notice</h3>
                <p className="text-sm text-amber-800">
                  You have view-only access. Transfer operations and editing capabilities are restricted to Editor and
                  Super Admin users.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Screenshot Approval Success Notice */}
        {screenshotApprovalData && screenshotApprovalData.hasApprovedScreenshots && (
          <div
            className={`mb-8 rounded-xl p-4 shadow-sm ${
              screenshotApprovalData.allScreenshotsApproved
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                : "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  screenshotApprovalData.allScreenshotsApproved ? "bg-green-100" : "bg-amber-100"
                }`}
              >
                {screenshotApprovalData.allScreenshotsApproved ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <div>
                <h3
                  className={`font-medium mb-1 ${
                    screenshotApprovalData.allScreenshotsApproved ? "text-green-900" : "text-amber-900"
                  }`}
                >
                  {screenshotApprovalData.allScreenshotsApproved
                    ? "All Screenshots Approved!"
                    : "Partial Screenshot Approval"}
                </h3>
                <p
                  className={`text-sm ${
                    screenshotApprovalData.allScreenshotsApproved ? "text-green-800" : "text-amber-800"
                  }`}
                >
                  {screenshotApprovalData.allScreenshotsApproved ? (
                    <>
                      All {screenshotApprovalData.approvedCount} screenshots approved. Transfer form has been pre-filled
                      with {screenshotApprovalData.totalCoins} coins and is ready for execution.
                    </>
                  ) : (
                    <>
                      {screenshotApprovalData.approvedCount} screenshot
                      {screenshotApprovalData.approvedCount > 1 ? "s" : ""} approved, but ALL screenshots must be
                      approved before transfer can be executed.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-800">Transfer Management</h2>
            <p className="text-sm text-gray-600">Select a user and manage their coin balance</p>
          </div>
          <button
            onClick={handleViewHistory}
            className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base ${
              hasPermission("viewHistory")
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!hasPermission("viewHistory")}
          >
            {hasPermission("viewHistory") ? "View All Users" : "Access Restricted"}
          </button>
        </div>

        {/* User Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select User to Transfer Coins</label>
          <UserSelector selectedUser={selectedUser} onUserSelect={setSelectedUser} className="max-w-md" />
        </div>

        {/* User Details Form - Only show if user is selected */}
        {selectedUser ? (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 max-w-full lg:max-w-2xl">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                <input
                  type="text"
                  value={formattedUser.name}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                <input
                  type="email"
                  value={formattedUser.email}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Wallet Address</label>
                <input
                  type="text"
                  value={formattedUser.walletAddress}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm bg-gray-50 font-mono break-all"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Current Balance</label>
                  <input
                    type="text"
                    value={`${formattedUser.balance} coins`}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Member Since</label>
                  <input
                    type="text"
                    value={formattedUser.createdAt}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                    readOnly
                  />
                </div>
              </div>

              {/* Transfer Amount Input - Restricted for Viewer */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Transfer Amount
                  {!hasPermission("transfer") && (
                    <Badge className="ml-2 bg-red-100 text-red-800 text-xs">Restricted</Badge>
                  )}
                  {screenshotApprovalData && screenshotApprovalData.allScreenshotsApproved && (
                    <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Pre-filled from Screenshots</Badge>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={hasPermission("transfer") ? "Enter amount to transfer" : "Access restricted"}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base ${
                      hasPermission("transfer")
                        ? "border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!hasPermission("transfer")}
                  />
                  {!hasPermission("transfer") && (
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Transfer Reason
                  {!hasPermission("transfer") && (
                    <Badge className="ml-2 bg-red-100 text-red-800 text-xs">Restricted</Badge>
                  )}
                  {screenshotApprovalData && screenshotApprovalData.allScreenshotsApproved && (
                    <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Pre-filled from Screenshots</Badge>
                  )}
                </label>
                <div className="relative">
                  <textarea
                    placeholder={hasPermission("transfer") ? "Enter reason for transfer" : "Access restricted"}
                    rows={3}
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base resize-none ${
                      hasPermission("transfer")
                        ? "border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!hasPermission("transfer")}
                  />
                  {!hasPermission("transfer") && <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />}
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-end">
              {hasPermission("transfer") && (
                <button
                  onClick={handleTransfer}
                  disabled={!isTransferEnabled()}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-colors font-medium shadow-lg text-sm sm:text-base ${
                    !isTransferEnabled()
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : screenshotApprovalData && screenshotApprovalData.allScreenshotsApproved
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isTransferring ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : screenshotApprovalData && screenshotApprovalData.allScreenshotsApproved ? (
                    `Execute Transfer (${screenshotApprovalData.totalCoins} Coins)`
                  ) : screenshotApprovalData && !screenshotApprovalData.allScreenshotsApproved ? (
                    "All Screenshots Required"
                  ) : (
                    "Execute Transfer"
                  )}
                </button>
              )}

              <button
                onClick={handleViewScreenshots}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-colors font-medium shadow-lg text-sm sm:text-base ${
                  hasPermission("viewScreenshots")
                    ? "bg-teal-600 text-white hover:bg-teal-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!hasPermission("viewScreenshots")}
              >
                {hasPermission("viewScreenshots") ? "View Screenshots" : "Access Restricted"}
              </button>
            </div>

            {/* Screenshot Requirement Notice */}
            {screenshotApprovalData && !screenshotApprovalData.allScreenshotsApproved && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    All screenshots must be approved before the transfer can be executed. Please return to the
                    screenshot approval page to complete the process.
                  </p>
                </div>
              </div>
            )}

            {/* Viewer Notice */}
            {userData.role === "viewer" && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    You can view user details but cannot perform transfer operations.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500 mb-4">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No User Selected</h3>
              <p className="text-gray-600">
                Please select a user from the dropdown above to start the transfer process.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
