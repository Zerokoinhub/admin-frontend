"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  User,
  Coins,
  Send,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Shield,
  Eye,
  Edit,
  ArrowRight,
  Loader2,
  Activity,
  Users,
  Wallet,
  Calculator,
  TrendingUp,
  Filter,
  ImageIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ViewScreenshots from "@/components/ui/ViewScreenshots"
import { userAPI, userHelpers } from "../../src/lib/api"

// Enhanced Transfer History Component
const TransferHistory = ({ onBack, onRefresh }) => {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateRange: "all",
  })

  const fetchTransferHistory = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await userAPI.getTransferHistory(filters)
      if (response.success) {
        const formattedTransfers = response.data.map((transfer) => userHelpers.formatTransferData(transfer))
        setTransfers(formattedTransfers)
      } else {
        setError(response.message || "Failed to fetch transfer history")
      }
    } catch (err) {
      setError("Error loading transfer history: " + err.message)
      console.error("Transfer history error:", err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchTransferHistory()
  }, [fetchTransferHistory])

  const filteredHistory = transfers.filter((transfer) => {
    const matchesSearch =
      !filters.search ||
      transfer.userName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      transfer.userEmail?.toLowerCase().includes(filters.search.toLowerCase()) ||
      transfer.transactionId?.toLowerCase().includes(filters.search.toLowerCase())

    const matchesStatus = filters.status === "all" || transfer.status === filters.status

    let matchesDate = true
    if (filters.dateRange !== "all") {
      const transferDate = new Date(transfer.dateTime || transfer.createdAt)
      const now = new Date()
      switch (filters.dateRange) {
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

  const transferStats = userHelpers.calculateTransferStats(filteredHistory)

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

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={onBack} variant="outline" className="mb-4 bg-transparent">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Transfer
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold">Transfer History</h2>
          <p className="text-gray-600">View and manage all coin transfers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm" disabled={filteredHistory.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchTransferHistory} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Transfers</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">{transferStats.totalTransfers}</p>
              </div>
              <History className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Total Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-900">
                  {transferStats.totalAmount.toLocaleString()}
                </p>
              </div>
              <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{transferStats.completedTransfers}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Average</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">
                  {Math.round(transferStats.averageAmount)}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transfers..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transfer List */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading transfers...</span>
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No transfers found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((transfer) => (
                <div key={transfer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{transfer.userName}</p>
                        <p className="text-sm text-gray-600">{transfer.userEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+{transfer.amount} coins</p>
                      <Badge
                        variant={
                          transfer.status === "completed"
                            ? "default"
                            : transfer.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {transfer.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Reason:</span> {transfer.reason || "No reason provided"}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {transfer.date} {transfer.time}
                    </div>
                    <div>
                      <span className="font-medium">By:</span> {transfer.transferredBy}
                    </div>
                  </div>
                  {transfer.transactionId && (
                    <div className="mt-2 text-xs text-gray-500">Transaction ID: {transfer.transactionId}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced User Selector Component
const UserSelector = ({ selectedUser, onUserSelect, className, onUsersRefresh }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
  })
  const [userStats, setUserStats] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await userAPI.getUsers(1, 200, {
        search: searchTerm,
        ...(filters.status === "active" && { isActive: true }),
        ...(filters.status === "inactive" && { isActive: false }),
      })

      if (response && (response.users || response.data)) {
        const usersData = response.users || response.data || response
        const formattedUsers = usersData.map((user) => ({
          ...user,
          id: user._id || user.id,
          balance: user.balance || user.coins || 0,
          hasWallet: !!(user.walletAddresses && (user.walletAddresses.metamask || user.walletAddresses.trustWallet)),
        }))

        setUsers(formattedUsers)

        const stats = {
          totalUsers: usersData.length,
          activeUsers: usersData.filter((u) => u.isActive !== false).length,
          usersWithWallets: usersData.filter(
            (u) => u.walletAddresses && (u.walletAddresses.metamask || u.walletAddresses.trustWallet),
          ).length,
          calculatorUsers: usersData.filter((u) => u.calculatorUsage > 0).length,
        }
        setUserStats(stats)

        if (onUsersRefresh) {
          onUsersRefresh(formattedUsers)
        }
      } else {
        throw new Error("Invalid response format")
      }
    } catch (apiError) {
      console.warn("API call failed, using fallback data:", apiError)
      setError("Failed to load users from API - using sample data")

      // Mock users with screenshots array structure
      const mockUsers = [
        {
          _id: "6894b393fa0a8cb4aac53db5",
          name: "Mr Sulam",
          email: "yk377623@gmail.com",
          balance: 4223,
          isActive: true,
          role: "user",
          createdAt: new Date().toISOString(),
          walletAddresses: { metamask: "0x123..." },
          calculatorUsage: 5,
          firebaseUid: "QfnqduUOrlhEctkQvtwIIXPnbcN2",
          screenshots: [
            "https://res.cloudinary.com/dw2ybyiek/image/upload/v1754662341/user_scr...",
            "https://res.cloudinary.com/dw2ybyiek/image/upload/v1754662341/user_scr...",
            "https://res.cloudinary.com/dw2ybyiek/image/upload/v1754662343/user_scr...",
          ],
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          balance: 250,
          isActive: true,
          role: "user",
          createdAt: new Date().toISOString(),
          walletAddresses: { trustWallet: "0x456..." },
          calculatorUsage: 12,
          firebaseUid: "firebase_uid_2",
          screenshots: ["/placeholder.svg?height=800&width=1200", "/placeholder.svg?height=800&width=1200"],
        },
        {
          _id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          balance: 75,
          isActive: true,
          role: "user",
          createdAt: new Date().toISOString(),
          calculatorUsage: 3,
          firebaseUid: "firebase_uid_3",
          screenshots: ["/placeholder.svg?height=800&width=1200"],
        },
      ]

      const formattedMockUsers = mockUsers.map((user) => ({
        ...user,
        id: user._id,
        hasWallet: !!(user.walletAddresses && (user.walletAddresses.metamask || user.walletAddresses.trustWallet)),
      }))

      setUsers(formattedMockUsers)
      if (onUsersRefresh) {
        onUsersRefresh(formattedMockUsers)
      }
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filters.status, onUsersRefresh])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" && user.isActive !== false) ||
        (filters.status === "inactive" && user.isActive === false)

      return matchesSearch && matchesStatus
    })
  }, [users, searchTerm, filters.status])

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* User Statistics */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Users</span>
              </div>
              <p className="text-lg font-bold text-blue-600">{userStats.totalUsers}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <p className="text-lg font-bold text-green-600">{userStats.activeUsers}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">With Wallets</span>
              </div>
              <p className="text-lg font-bold text-purple-600">{userStats.usersWithWallets}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Calculator Users</span>
              </div>
              <p className="text-lg font-bold text-orange-600">{userStats.calculatorUsers}</p>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 mb-2">User Status Filter</Label>
          <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active Users Only</SelectItem>
              <SelectItem value="inactive">Inactive Users Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Loading users...</span>
          </div>
        ) : error ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
              <span className="text-sm text-amber-700">{error}</span>
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm" className="mt-2 bg-transparent">
              Retry
            </Button>
          </div>
        ) : (
          <>
            <Select
              value={selectedUser?.id || selectedUser?._id || ""}
              onValueChange={(value) => {
                const user = filteredUsers.find((u) => (u.id || u._id) === value)
                onUserSelect(user)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map((user) => (
                  <SelectItem key={user.id || user._id} value={user.id || user._id || "none"}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({user.email})</span>
                        {user.isActive === false && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {user.coins || user.balance || 0} coins
                        </Badge>
                        {user.hasWallet && <Wallet className="h-3 w-3 text-green-500" />}
                        {user.screenshots && user.screenshots.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {user.screenshots.length} screenshots
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-500">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} available
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Main Component
export default function CoinTransferPage() {
  // State management
  const [userRole, setUserRole] = useState("")
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [transferAmount, setTransferAmount] = useState("")
  const [transferReason, setTransferReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [transferHistory, setTransferHistory] = useState([])
  const [message, setMessage] = useState({ type: "", text: "" })
  const [activeTab, setActiveTab] = useState("history")

  // Enhanced states
  const [showScreenshots, setShowScreenshots] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [screenshotApprovalData, setScreenshotApprovalData] = useState(null)
  const [transferSuccess, setTransferSuccess] = useState(false)
  const [balanceAnimation, setBalanceAnimation] = useState(false)
  const [lastTransferResult, setLastTransferResult] = useState(null)
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    role: "",
    id: "",
  })

  // Get user role from localStorage
  useEffect(() => {
    try {
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        const userRoleValue = userData.role || ""
        setUserRole(userRoleValue)
        setUserData({
          id: userData._id || userData.id || "",
          username: userData.username || userData.name || "",
          email: userData.email || "",
          role: userRoleValue.toLowerCase(),
        })
        if (userRoleValue === "superadmin") {
          setActiveTab("transfer")
        } else {
          setActiveTab("history")
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
    }
  }, [])

  // Check permissions
  const hasTransferAccess = userRole === "superadmin"
  const hasHistoryAccess = true

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

  // Fetch transfer history
  const fetchTransferHistory = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getTransferHistory()
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
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "history") {
      fetchTransferHistory()
    }
  }, [activeTab])

  // Handle screenshot approval
  const handleScreenshotApproval = (approvalData) => {
    setScreenshotApprovalData(approvalData)
    setShowScreenshots(false)
    if (approvalData.allScreenshotsApproved) {
      setTransferAmount(approvalData.totalCoins.toString())
      setTransferReason(
        `Screenshot approval reward - ${approvalData.approvedCount} screenshot${
          approvalData.approvedCount > 1 ? "s" : ""
        } approved (Auto-generated)`,
      )
      setMessage({
        type: "success",
        text: `Screenshots approved! Transfer form pre-filled with ${approvalData.totalCoins} coins.`,
      })
    }
  }

  // Handle transfer execution
  const handleTransfer = async () => {
    if (!hasTransferAccess) {
      setMessage({ type: "error", text: "You don't have permission to transfer coins" })
      return
    }

    // Check screenshot approval requirement
    if (screenshotApprovalData && !screenshotApprovalData.allScreenshotsApproved) {
      setMessage({ type: "error", text: "All screenshots must be approved before transfer can be executed" })
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

    if (!transferReason || transferReason.length < 5) {
      setMessage({ type: "error", text: "Please provide a detailed reason (minimum 5 characters)" })
      return
    }

    try {
      setLoading(true)
      setMessage({ type: "", text: "" })

      const adminUser = localStorage.getItem("user")
      const adminUserStr = JSON.parse(adminUser)
      const admin = adminUserStr.username

      const response = await userAPI.editUserBalance(selectedUser.email, amount, admin)

      if (response.success) {
        // Trigger animations
        setBalanceAnimation(true)
        setTransferSuccess(true)

        // Store transfer result
        setLastTransferResult({
          amount: amount,
          newBalance: response.data.newBalance,
          balanceBefore: selectedUser.balance || 0,
          balanceAfter: response.data.newBalance,
          transactionId: `TXN${Date.now()}`,
          timestamp: new Date().toISOString(),
        })

        setMessage({
          type: "success",
          text: `Successfully transferred ${amount} coins to ${selectedUser.name}. New balance: ${response.data.newBalance}`,
        })

        // Update selected user balance
        setSelectedUser((prev) => ({
          ...prev,
          balance: response.data.newBalance,
        }))

        // Clear form after success
        setTimeout(() => {
          setTransferAmount("")
          setTransferReason("")
          setScreenshotApprovalData(null)
          setBalanceAnimation(false)
        }, 3000)

        setTimeout(() => {
          setTransferSuccess(false)
        }, 8000)

        // Refresh transfer history
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

  // Enhanced role display
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

  // Calculate transfer statistics
  const transferStats = userHelpers.calculateTransferStats(transferHistory)

  // Show different views based on state
  if (showScreenshots) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <TransferHistory onBack={() => setShowHistory(false)} onRefresh={fetchTransferHistory} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                Coin Transfer Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                {hasTransferAccess
                  ? "Manage and track coin transfers with screenshot approval"
                  : "View transfer history and track transactions"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role Badge */}
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${roleDisplay.bg} border`}
            >
              <RoleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${roleDisplay.color}`} />
              <span className={`text-xs sm:text-sm font-medium ${roleDisplay.color}`}>{roleDisplay.label}</span>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="px-2 sm:px-3">
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Access Control Notice for Non-Super Admin */}
        {!hasTransferAccess && (
          <Alert className="border-blue-200 bg-blue-50">
            <Eye className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              You have view-only access to transfer history. Contact your administrator for transfer permissions.
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Success/Error Messages */}
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
                  <div className="space-y-1">
                    <p className="font-medium">✅ Transfer completed successfully!</p>
                    <p>
                      {transferAmount} coins transferred to {selectedUser?.name}'s account
                    </p>
                    <p className="text-sm">
                      Balance updated: {lastTransferResult?.balanceBefore || 0} →{" "}
                      {lastTransferResult?.balanceAfter || selectedUser?.balance} coins
                    </p>
                    {lastTransferResult?.transactionId && (
                      <p className="text-xs font-mono">Transaction ID: {lastTransferResult.transactionId}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          {message.text && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Alert
                className={`${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"} shadow-sm`}
              >
                {message.type === "error" ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={`${message.type === "error" ? "text-red-800" : "text-green-800"} text-sm`}>
                  {message.text}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screenshot Approval Notice */}
        {screenshotApprovalData && screenshotApprovalData.hasApprovedScreenshots && (
          <Alert
            className={`${
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
              <div className="space-y-1">
                <p className="font-medium">
                  {screenshotApprovalData.allScreenshotsApproved
                    ? "Screenshots Approved ✅"
                    : "Partial Screenshot Approval ⚠️"}
                </p>
                <p>
                  {screenshotApprovalData.allScreenshotsApproved
                    ? `All ${screenshotApprovalData.approvedCount} screenshots approved. Transfer form pre-filled with ${screenshotApprovalData.totalCoins} coins.`
                    : `${screenshotApprovalData.approvedCount} screenshot(s) approved, but ALL screenshots must be approved before transfer execution.`}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content - Show transfer interface directly or tabs */}
        {hasTransferAccess ? (
          // Show tabs for super admin
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 m-1 rounded-lg">
                <TabsTrigger
                  value="transfer"
                  className="flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2"
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:hidden">Transfer</span>
                  <span className="hidden sm:inline">Transfer Coins</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2"
                >
                  <History className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:hidden">History</span>
                  <span className="hidden sm:inline">Transfer History</span>
                </TabsTrigger>
              </TabsList>

              {/* Transfer Tab */}
              <TabsContent value="transfer" className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                  {/* User Selection */}
                  <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                        Select User
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UserSelector
                        selectedUser={selectedUser}
                        onUserSelect={setSelectedUser}
                        onUsersRefresh={setUsers}
                        className="max-w-full"
                      />
                    </CardContent>
                  </Card>

                  {/* Transfer Form */}
                  <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                        Transfer Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      {selectedUser ? (
                        <>
                          {/* Selected User Info */}
                          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold mb-2 sm:mb-3 text-gray-900 text-sm sm:text-base">
                              Selected User
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                              <div>
                                <span className="text-gray-600">Name:</span>
                                <p className="font-medium text-gray-900 break-words">{selectedUser.name}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Email:</span>
                                <p className="font-medium text-gray-900 break-all">{selectedUser.email}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Current Balance:</span>
                                <p
                                  className={`font-medium text-gray-900 transition-all duration-500 ${
                                    balanceAnimation ? "text-green-600 font-bold" : ""
                                  }`}
                                >
                                  {selectedUser.balance || 0} coins
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Screenshots:</span>
                                <p className="font-medium text-gray-900">
                                  {selectedUser.screenshots?.length || 0} uploaded
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Screenshot Actions */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setShowScreenshots(true)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              disabled={!selectedUser.screenshots || selectedUser.screenshots.length === 0}
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Review Screenshots ({selectedUser.screenshots?.length || 0})
                            </Button>
                            <Button onClick={() => setShowHistory(true)} variant="outline" size="sm" className="flex-1">
                              <History className="w-4 w-4 mr-2" />
                              View History
                            </Button>
                          </div>

                          {/* Transfer Form */}
                          <div className="space-y-3 sm:space-y-4">
                            <div>
                              <Label htmlFor="amount" className="text-xs sm:text-sm font-medium text-gray-700">
                                Transfer Amount *
                              </Label>
                              <Input
                                id="amount"
                                type="number"
                                placeholder="Enter amount to transfer"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                min="0"
                                step="1"
                                className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor="reason" className="text-xs sm:text-sm font-medium text-gray-700">
                                Transfer Reason *
                              </Label>
                              <Textarea
                                id="reason"
                                placeholder="Enter detailed reason for transfer"
                                value={transferReason}
                                onChange={(e) => setTransferReason(e.target.value)}
                                rows={3}
                                className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                              />
                            </div>

                            {/* Transfer Preview */}
                            {transferAmount &&
                              !isNaN(Number.parseInt(transferAmount)) &&
                              Number.parseInt(transferAmount) > 0 && (
                                <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                  <h4 className="font-semibold mb-2 text-gray-900 text-sm sm:text-base">
                                    Transfer Preview
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                    <div>
                                      <span className="text-gray-600">Amount:</span>
                                      <p className="font-medium text-gray-900">
                                        {Number.parseInt(transferAmount)} coins
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">New Balance:</span>
                                      <p className="font-medium text-gray-900">
                                        {(selectedUser.balance || 0) + Number.parseInt(transferAmount)} coins
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                            <Button
                              onClick={handleTransfer}
                              disabled={
                                loading ||
                                !transferAmount ||
                                !transferReason ||
                                !selectedUser.email ||
                                Number.parseInt(transferAmount) <= 0 ||
                                transferReason.length < 5 ||
                                (screenshotApprovalData && !screenshotApprovalData.allScreenshotsApproved)
                              }
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 sm:py-2.5 text-sm"
                            >
                              {loading ? (
                                <>
                                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                                  Processing Transfer...
                                </>
                              ) : screenshotApprovalData?.allScreenshotsApproved ? (
                                <>
                                  <Coins className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                  Execute Transfer ({screenshotApprovalData.totalCoins} Coins)
                                </>
                              ) : (
                                <>
                                  <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                  Transfer Coins
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 sm:py-12 text-gray-500">
                          <User className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                          <p className="text-base sm:text-lg font-medium mb-2">Select a User</p>
                          <p className="text-xs sm:text-sm">Choose a user from the list to transfer coins</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-blue-700 font-medium">Total Transfers</p>
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">
                            {transferStats.totalTransfers}
                          </p>
                        </div>
                        <History className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-yellow-700 font-medium">Total Amount</p>
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-900">
                            {transferStats.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <Coins className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-green-700 font-medium">Completed</p>
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">
                            {transferStats.completedTransfers}
                          </p>
                        </div>
                        <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-orange-700 font-medium">Average</p>
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-900">
                            {Math.round(transferStats.averageAmount)}
                          </p>
                        </div>
                        <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Transfer History List */}
                <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <History className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                        Transfer History
                      </CardTitle>
                      <Button
                        onClick={fetchTransferHistory}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                        disabled={loading}
                      >
                        <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border bg-white overflow-hidden">
                      {loading ? (
                        <div className="text-center py-8 sm:py-12">
                          <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4 text-purple-500" />
                          <p className="text-gray-600 text-sm">Loading transfer history...</p>
                        </div>
                      ) : transferHistory.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 text-gray-500">
                          <History className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                          <p className="text-base sm:text-lg font-medium mb-2">No Transfer History</p>
                          <p className="text-xs sm:text-sm">No transfers found matching your criteria</p>
                        </div>
                      ) : (
                        <div className="space-y-3 p-3 sm:p-4">
                          {transferHistory.map((transfer, index) => (
                            <Card key={transfer.id || index} className="border border-gray-200">
                              <CardContent className="p-3 sm:p-4">
                                <div className="space-y-2 sm:space-y-3">
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 text-sm break-words">
                                        {transfer.userName || "Unknown User"}
                                      </p>
                                      <p className="text-xs text-gray-600 break-all">
                                        {transfer.userEmail || "No email"}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={
                                        transfer.status === "completed"
                                          ? "default"
                                          : transfer.status === "pending"
                                            ? "secondary"
                                            : "destructive"
                                      }
                                      className="text-xs shrink-0"
                                    >
                                      {transfer.status || "completed"}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
                                      <span className="font-semibold text-gray-900 text-sm">
                                        {transfer.amount || 0} coins
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {transfer.date || new Date().toLocaleDateString()}{" "}
                                      {transfer.time || new Date().toLocaleTimeString()}
                                    </div>
                                  </div>
                                  <div className="pt-2 border-t border-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">Reason:</span>
                                        <span className="ml-1 text-gray-700 break-words">
                                          {transfer.reason || "No reason provided"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Admin:</span>
                                        <span className="ml-1 text-gray-700 break-words">
                                          {transfer.transferredBy || "System"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          // Show only history for non-super admin users
          <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <History className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                  Transfer History
                </CardTitle>
                <Button
                  onClick={fetchTransferHistory}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                  disabled={loading}
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white overflow-hidden">
                {loading ? (
                  <div className="text-center py-8 sm:py-12">
                    <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4 text-purple-500" />
                    <p className="text-gray-600 text-sm">Loading transfer history...</p>
                  </div>
                ) : transferHistory.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <History className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-base sm:text-lg font-medium mb-2">No Transfer History</p>
                    <p className="text-xs sm:text-sm">No transfers found</p>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 sm:p-4">
                    {transferHistory.map((transfer, index) => (
                      <Card key={transfer.id || index} className="border border-gray-200">
                        <CardContent className="p-3 sm:p-4">
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm break-words">
                                  {transfer.userName || "Unknown User"}
                                </p>
                                <p className="text-xs text-gray-600 break-all">{transfer.userEmail || "No email"}</p>
                              </div>
                              <Badge
                                variant={
                                  transfer.status === "completed"
                                    ? "default"
                                    : transfer.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="text-xs shrink-0"
                              >
                                {transfer.status || "completed"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Coins className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
                                <span className="font-semibold text-gray-900 text-sm">
                                  {transfer.amount || 0} coins
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                {transfer.date || new Date().toLocaleDateString()}{" "}
                                {transfer.time || new Date().toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
