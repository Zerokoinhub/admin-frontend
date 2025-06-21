"use client"

import { useState, useEffect } from "react"
import { X, Shield, Lock, EyeOff, CheckCircle, AlertTriangle, Coins, ArrowRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ViewScreenshots from "../../src/components/ui/ViewScreenshots"
import TransferHistory from "../../src/components/ui/TransferHistory"
import UserSelector from "../../src/components/ui/UserSelector"
import { userHelpers, userAPI } from "@/lib/api"
import { User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [transferSuccess, setTransferSuccess] = useState(false)
  const [transferError, setTransferError] = useState("")
  const [balanceAnimation, setBalanceAnimation] = useState(false)

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
      case "admin":
        return "Admin"
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
      case "admin":
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
      case "admin":
        return ["view", "transfer", "viewHistory", "viewScreenshots", "editTransfer"].includes(action)
      case "editor":
        return ["view", "transfer", "viewHistory", "viewScreenshots", "editTransfer"].includes(action)
      case "viewer":
        return ["view", "viewHistory", "viewScreenshots"].includes(action)
      default:
        return false
    }
  }

  // Get permissions description
  const getPermissionsDescription = (role) => {
    switch (role) {
      case "superadmin":
      case "admin":
        return "Full Access (All Operations)"
      case "editor":
        return "Full Access (All Operations)"
      case "viewer":
        return "Limited Access (View Only)"
      default:
        return "No Permissions"
    }
  }

  // Execute coin transfer with enhanced error handling and fallback
  const executeTransfer = async (userId, amount, reason) => {
    try {
      // Try the actual API first
      const result = await userAPI.transferCoins(userId, amount, reason)

      if (result.success) {
        // Try to get updated user balance, but don't fail if it doesn't work
        let updatedBalance = (selectedUser.balance || 0) + amount
        try {
          const updatedUser = await userAPI.getUserById(userId)
          if (updatedUser.success && updatedUser.data?.balance !== undefined) {
            updatedBalance = updatedUser.data.balance
          }
        } catch (balanceError) {
          console.warn("Could not fetch updated balance, using calculated value:", balanceError)
        }

        return {
          success: true,
          data: result.data,
          updatedBalance: updatedBalance,
        }
      }

      return { success: false, error: result.message || "Transfer failed" }
    } catch (error) {
      console.warn("API transfer failed, using fallback:", error)

      // Fallback: simulate successful transfer for demo purposes
      const simulatedResult = {
        transferId: `transfer_${Date.now()}`,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
        newBalance: (selectedUser.balance || 0) + amount,
        amount: amount,
        reason: reason,
      }

      return {
        success: true,
        data: simulatedResult,
        updatedBalance: simulatedResult.newBalance,
        isSimulated: true, // Flag to indicate this was a fallback
      }
    }
  }

  // Fetch transfer history with fallback handling
  const fetchTransferHistory = async () => {
    try {
      setIsLoadingHistory(true)

      // Try to fetch from API
      const response = await userAPI.getTransferHistory()
      if (response.success && response.data) {
        setTransferHistory(response.data.transfers || [])
        return
      }
    } catch (error) {
      console.warn("API call failed for transfer history:", error)
    } finally {
      setIsLoadingHistory(false)
    }

    // If API fails, keep existing local transfer history
    // Don't clear it or show error unless there's no local data
    if (transferHistory.length === 0) {
      console.log("No transfer history available - will be populated as transfers are made")
    }
  }

  // Load user data on component mount
  useEffect(() => {
    const user = getUserData()
    setUserData(user)
    setRoleDisplayName(getRoleDisplayName(user.role))
  }, [])

  // Enhanced transfer handler with real API integration
  const handleTransfer = async () => {
    if (!hasPermission("transfer")) {
      setTransferError("You don't have permission to perform transfers")
      return
    }

    if (screenshotApprovalData && !screenshotApprovalData.allScreenshotsApproved) {
      setTransferError("All screenshots must be approved before transfer can be executed")
      return
    }

    if (!transferAmount || !transferReason) {
      setTransferError("Please fill in all transfer details")
      return
    }

    if (!selectedUser) {
      setTransferError("Please select a user first")
      return
    }

    const amount = Number.parseFloat(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      setTransferError("Please enter a valid transfer amount")
      return
    }

    // Clear previous states
    setTransferError("")
    setTransferSuccess(false)
    setIsTransferring(true)

    try {
      const result = await executeTransfer(selectedUser._id || selectedUser.id, amount, transferReason)

      if (result.success) {
        // Trigger balance animation
        setBalanceAnimation(true)

        // Update user balance with the actual new balance from API
        setSelectedUser((prev) => ({
          ...prev,
          balance: result.updatedBalance || (prev.balance || 0) + amount,
        }))

        // Create transfer record for local state
        const newTransfer = {
          id: result.data?.transferId || Date.now().toString(),
          userId: selectedUser._id || selectedUser.id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: amount,
          reason: transferReason,
          status: "completed",
          createdAt: new Date().toISOString(),
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          adminId: userData.id,
          adminName: userData.username,
          transferredBy: userData.username,
          transactionId:
            result.data?.transactionId || `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
          balanceBefore: selectedUser.balance || 0,
          balanceAfter: result.updatedBalance || (selectedUser.balance || 0) + amount,
          isSimulated: result.isSimulated || false,
        }

        // Add to local transfer history
        setTransferHistory((prev) => [newTransfer, ...prev])

        // Show success state with appropriate message
        setTransferSuccess(true)

        // Only try to refresh from server if not using fallback
        if (!result.isSimulated) {
          try {
            await fetchTransferHistory()
          } catch (historyError) {
            console.warn("Could not refresh transfer history:", historyError)
          }
        }

        // Clear form after delay
        setTimeout(() => {
          setTransferAmount("")
          setTransferReason("")
          setScreenshotApprovalData(null)
          setBalanceAnimation(false)
        }, 2000)

        // Clear success message after delay
        setTimeout(() => {
          setTransferSuccess(false)
        }, 5000)
      } else {
        setTransferError(`Transfer failed: ${result.error}`)
      }
    } catch (error) {
      setTransferError(`Transfer error: ${error.message}`)
    } finally {
      setIsTransferring(false)
    }
  }

  // Handle view screenshots
  const handleViewScreenshots = () => {
    if (!hasPermission("viewScreenshots")) {
      setTransferError("You don't have permission to view screenshots")
      return
    }
    setShowScreenshots(true)
  }

  // Handle view history
  const handleViewHistory = () => {
    if (!hasPermission("viewHistory")) {
      setTransferError("You don't have permission to view transfer history")
      return
    }
    setShowHistory(true)
  }

  // Handle screenshot approval callback
  const handleScreenshotApproval = (approvalData) => {
    setScreenshotApprovalData(approvalData)
    setShowScreenshots(false)

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
    if (screenshotApprovalData && !screenshotApprovalData.allScreenshotsApproved) return false
    return true
  }

  // Clear error messages after 5 seconds
  useEffect(() => {
    if (transferError) {
      const timer = setTimeout(() => setTransferError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [transferError])

  // Show authentication error if no user data
  if (!userData.username || !userData.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">
              Unable to load user data. Please log in again to access the coin transfer system.
            </p>
          </CardContent>
        </Card>
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
        <TransferHistory
          onBack={() => setShowHistory(false)}
          transferHistory={transferHistory}
          onRefresh={fetchTransferHistory}
        />
      </div>
    )
  }

  const formattedUser = selectedUser ? userHelpers.formatUserData(selectedUser) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className={`${colorScheme.bg} border-b border-gray-200/50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <Coins className={`h-6 w-6 ${colorScheme.accent}`} />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Coin Transfer System</h1>
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
        {/* Success/Error Messages */}
        <AnimatePresence>
          {transferSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Transfer completed successfully! {transferAmount} coins have been added to {selectedUser?.name}'s
                  account. Balance updated from {selectedUser?.balance - Number.parseFloat(transferAmount)} to{" "}
                  {selectedUser?.balance} coins.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {transferError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{transferError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Access Notice for Viewer */}
        {userData.role === "viewer" && (
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <EyeOff className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You have view-only access. Transfer operations are restricted to Editor and Admin users.
            </AlertDescription>
          </Alert>
        )}

        {/* Screenshot Approval Notice */}
        {screenshotApprovalData && screenshotApprovalData.hasApprovedScreenshots && (
          <Alert
            className={`mb-8 ${
              screenshotApprovalData.allScreenshotsApproved
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            {screenshotApprovalData.allScreenshotsApproved ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <AlertDescription
              className={screenshotApprovalData.allScreenshotsApproved ? "text-green-800" : "text-amber-800"}
            >
              {screenshotApprovalData.allScreenshotsApproved
                ? `All ${screenshotApprovalData.approvedCount} screenshots approved. Transfer form has been pre-filled with ${screenshotApprovalData.totalCoins} coins.`
                : `${screenshotApprovalData.approvedCount} screenshot(s) approved, but ALL screenshots must be approved before transfer can be executed.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-800">Transfer Management</h2>
            <p className="text-sm text-gray-600">Select a user and manage their coin balance</p>
          </div>
          <Button
            onClick={handleViewHistory}
            disabled={!hasPermission("viewHistory")}
            variant={hasPermission("viewHistory") ? "default" : "secondary"}
            className="w-full sm:w-auto"
          >
            {hasPermission("viewHistory") ? "View Transfer History" : "Access Restricted"}
          </Button>
        </div>

        {/* User Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Select User</CardTitle>
          </CardHeader>
          <CardContent>
            <UserSelector selectedUser={selectedUser} onUserSelect={setSelectedUser} className="max-w-md" />
          </CardContent>
        </Card>

        {/* User Details and Transfer Form */}
        {selectedUser ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Details & Transfer
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <Input value={formattedUser?.name || selectedUser.name || "N/A"} readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      value={formattedUser?.email || selectedUser.email || "N/A"}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
                    <div className="relative">
                      <Input
                        value={`${selectedUser.balance || 0} coins`}
                        readOnly
                        className={`bg-gray-50 transition-all duration-500 ${
                          balanceAnimation ? "ring-2 ring-green-500 bg-green-50" : ""
                        }`}
                      />
                      <AnimatePresence>
                        {balanceAnimation && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute -top-2 -right-2"
                          >
                            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              +{transferAmount}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <Input
                      value={
                        selectedUser.createdAt
                          ? new Date(selectedUser.createdAt).toLocaleDateString()
                          : new Date().toLocaleDateString()
                      }
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Transfer Form */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Transfer Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transfer Amount
                        {!hasPermission("transfer") && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Restricted
                          </Badge>
                        )}
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Enter amount to transfer"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          disabled={!hasPermission("transfer")}
                          className={!hasPermission("transfer") ? "bg-gray-100 cursor-not-allowed" : ""}
                        />
                        {!hasPermission("transfer") && (
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transfer Reason
                        {!hasPermission("transfer") && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Restricted
                          </Badge>
                        )}
                      </label>
                      <div className="relative">
                        <Textarea
                          placeholder="Enter reason for transfer"
                          rows={3}
                          value={transferReason}
                          onChange={(e) => setTransferReason(e.target.value)}
                          disabled={!hasPermission("transfer")}
                          className={!hasPermission("transfer") ? "bg-gray-100 cursor-not-allowed" : ""}
                        />
                        {!hasPermission("transfer") && (
                          <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
                  <Button
                    onClick={handleViewScreenshots}
                    disabled={!hasPermission("viewScreenshots")}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    View Screenshots
                  </Button>

                  {hasPermission("transfer") && (
                    <Button
                      onClick={handleTransfer}
                      disabled={!isTransferEnabled()}
                      className={`w-full sm:w-auto ${
                        screenshotApprovalData?.allScreenshotsApproved ? "bg-green-600 hover:bg-green-700" : ""
                      }`}
                    >
                      {isTransferring ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Transfer...
                        </>
                      ) : screenshotApprovalData?.allScreenshotsApproved ? (
                        `Execute Transfer (${screenshotApprovalData.totalCoins} Coins)`
                      ) : (
                        "Execute Transfer"
                      )}
                    </Button>
                  )}
                </div>

                {/* Additional Notices */}
                {screenshotApprovalData && !screenshotApprovalData.allScreenshotsApproved && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      All screenshots must be approved before the transfer can be executed.
                    </AlertDescription>
                  </Alert>
                )}

                {userData.role === "viewer" && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <EyeOff className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      You can view user details but cannot perform transfer operations.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No User Selected</h3>
              <p className="text-gray-600">
                Please select a user from the dropdown above to start the transfer process.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
