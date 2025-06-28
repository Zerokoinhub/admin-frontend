"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Users,
  MessageSquare,
  X,
  Loader2,
  Search,
  Filter,
  Calendar,
  Coins,
  Activity,
  Wallet,
  Calculator,
  TrendingUp,
  Edit,
  RefreshCw,
  Download,
  User,
  Mail,
  Shield,
  Clock,
  Hash,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Lock,
  ChevronLeft,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { userHelpers, userAPI } from "../../src/lib/api"

// Enhanced User Selector Component
const UserSelector = ({ selectedUser, onUserSelect, className }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    page: 1,
    limit: 200,
    search: "",
    status: "all",
  })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await userAPI.getUsers(filters.page, filters.limit, {
        search: filters.search,
        isActive: filters.status === "active" ? true : filters.status === "inactive" ? false : undefined,
      })
      if (response && (response.users || response.data)) {
        const usersData = response.users || response.data || response
        const formattedUsers = userHelpers.formatUserList(usersData)
        setUsers(formattedUsers)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (apiError) {
      console.warn("API call failed, using fallback data:", apiError)
      setError("Failed to load users from API")
      // Fallback data
      const mockUsers = [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          balance: 1250,
          isActive: true,
          role: "user",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          walletAddresses: { metamask: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4" },
          calculatorUsage: 15,
          inviteCode: "JOHN2024",
          referredBy: "ALICE2023",
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          balance: 2750,
          isActive: true,
          role: "user",
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          walletAddresses: { trustWallet: "0x456def789abc123456789def456abc123456789d" },
          calculatorUsage: 28,
          inviteCode: "JANE2024",
          lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          _id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          balance: 875,
          isActive: true,
          role: "user",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          calculatorUsage: 8,
          inviteCode: "BOB2024",
          referredBy: "JOHN2024",
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "4",
          name: "Alice Brown",
          email: "alice@example.com",
          balance: 3200,
          isActive: true,
          role: "user",
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          walletAddresses: { metamask: "0x789abc123def456789abc123def456789abc123d" },
          calculatorUsage: 42,
          inviteCode: "ALICE2023",
          lastLogin: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
        {
          _id: "5",
          name: "Charlie Wilson",
          email: "charlie@example.com",
          balance: 450,
          isActive: false,
          role: "user",
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          calculatorUsage: 3,
          inviteCode: "CHARLIE2023",
          lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      const formattedMockUsers = userHelpers.formatUserList(mockUsers)
      setUsers(formattedMockUsers)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.inviteCode && user.inviteCode.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className={className}>
      <div className="space-y-3 sm:space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name, email, or invite code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 sm:h-auto"
          />
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
          <SelectTrigger className="h-10 sm:h-auto">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active Users</SelectItem>
            <SelectItem value="inactive">Inactive Users</SelectItem>
          </SelectContent>
        </Select>

        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Loading users...</span>
          </div>
        ) : error ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-amber-700">{error}</span>
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm" className="mt-2 w-full sm:w-auto bg-transparent">
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
              <SelectTrigger className="h-10 sm:h-auto">
                <SelectValue placeholder="Select a user to view profile..." />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map((user) => (
                  <SelectItem key={user.id || user._id} value={user.id || user._id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${user.isActive ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <span className="font-medium truncate">{user.name}</span>
                        <span className="text-sm text-gray-500 truncate hidden sm:inline">({user.email})</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {user.coins || user.balance || 0}
                        </Badge>
                        {user.hasWallet && <Wallet className="h-3 w-3 text-green-500" />}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-500">
              {searchTerm ? (
                <>
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
                </>
              ) : (
                <>
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} available
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Enhanced Coin History Component
const CoinHistoryView = ({ selectedUser, onBack }) => {
  const [transferHistory, setTransferHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    dateRange: "",
    status: "",
  })
  const [stats, setStats] = useState(null)

  const fetchTransferHistory = useCallback(async () => {
    if (!selectedUser) return
    setLoading(true)
    setError("")
    try {
      const response = await userAPI.getTransferHistory({
        ...filters,
        userId: selectedUser.id || selectedUser._id,
      })
      if (response.success && response.data) {
        const formattedTransfers = response.data.transfers.map((transfer) => userHelpers.formatTransferData(transfer))
        setTransferHistory(formattedTransfers)
        const transferStats = userHelpers.calculateTransferStats(formattedTransfers)
        setStats(transferStats)
      } else {
        throw new Error(response.message || "Failed to fetch transfer history")
      }
    } catch (apiError) {
      console.warn("API call failed, using mock data:", apiError)
      setError("Using mock data - API unavailable")
      // Enhanced mock data for demonstration
      const mockTransfers = [
        {
          id: "1",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: 100,
          reason: "Course completion reward",
          status: "completed",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          transferredBy: "System",
          transactionId: "TXN001",
          balanceBefore: (selectedUser.balance || 0) - 100,
          balanceAfter: selectedUser.balance || 0,
        },
        {
          id: "2",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: 50,
          reason: "Referral bonus",
          status: "completed",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          transferredBy: "System",
          transactionId: "TXN002",
          balanceBefore: (selectedUser.balance || 0) - 150,
          balanceAfter: (selectedUser.balance || 0) - 100,
        },
        {
          id: "3",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: 75,
          reason: "Survey completion",
          status: "completed",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          transferredBy: "Admin",
          transactionId: "TXN003",
          balanceBefore: (selectedUser.balance || 0) - 225,
          balanceAfter: (selectedUser.balance || 0) - 150,
        },
        {
          id: "4",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: 200,
          reason: "Monthly bonus",
          status: "completed",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          transferredBy: "System",
          transactionId: "TXN004",
          balanceBefore: (selectedUser.balance || 0) - 425,
          balanceAfter: (selectedUser.balance || 0) - 225,
        },
        {
          id: "5",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: 25,
          reason: "Daily check-in",
          status: "pending",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          transferredBy: "System",
          transactionId: "TXN005",
          balanceBefore: selectedUser.balance || 0,
          balanceAfter: (selectedUser.balance || 0) + 25,
        },
      ]
      const formattedMockTransfers = mockTransfers.map((transfer) => userHelpers.formatTransferData(transfer))
      setTransferHistory(formattedMockTransfers)
      const mockStats = userHelpers.calculateTransferStats(formattedMockTransfers)
      setStats(mockStats)
    } finally {
      setLoading(false)
    }
  }, [selectedUser, filters])

  useEffect(() => {
    fetchTransferHistory()
  }, [fetchTransferHistory])

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed", icon: CheckCircle },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending", icon: Clock },
      failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed", icon: AlertTriangle },
    }
    const config = statusConfig[status] || statusConfig.pending
    const IconComponent = config.icon
    return (
      <Badge className={`${config.bg} ${config.text} flex items-center gap-1 text-xs`}>
        <IconComponent className="h-3 w-3" />
        <span className="hidden sm:inline">{config.label}</span>
      </Badge>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Button onClick={onBack} variant="outline" className="mb-4 w-full sm:w-auto bg-transparent">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Coin History</h2>
          <p className="text-sm sm:text-base text-gray-600 truncate">{selectedUser?.name}</p>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between">
        <div>
          <Button onClick={onBack} variant="outline" className="mb-4 bg-transparent">
            <User className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h2 className="text-2xl font-bold">Coin History - {selectedUser?.name}</h2>
          <p className="text-gray-600">Complete transaction history and statistics</p>
        </div>
        <Button onClick={fetchTransferHistory} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Mobile Refresh Button */}
      <div className="lg:hidden">
        <Button onClick={fetchTransferHistory} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Transfers</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.totalTransfers}</p>
                </div>
                <Activity className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Earned</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">+{stats.totalAmount}</p>
                </div>
                <Coins className="h-6 sm:h-8 w-6 sm:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">This Month</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.monthTransfers}</p>
                </div>
                <Calendar className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Average Amount</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">{Math.round(stats.averageAmount)}</p>
                </div>
                <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 sm:h-5 w-4 sm:w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="h-10 sm:h-auto">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger className="h-10 sm:h-auto">
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Per Page</label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, limit: Number.parseInt(value) }))}
              >
                <SelectTrigger className="h-10 sm:h-auto">
                  <SelectValue placeholder={filters.limit.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer History */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg">Transaction History</CardTitle>
            <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base">Loading transaction history...</span>
            </div>
          ) : error ? (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">{error}</AlertDescription>
            </Alert>
          ) : transferHistory.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No transaction history found</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {transferHistory.map((transfer) => (
                <div key={transfer.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Coins className="h-4 sm:h-5 w-4 sm:w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-green-600 text-sm sm:text-base">+{transfer.amount} coins</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{transfer.reason}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {getStatusBadge(transfer.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transfer.createdAt).toLocaleDateString()}{" "}
                        <span className="hidden sm:inline">{new Date(transfer.createdAt).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="truncate">
                      <span className="font-medium">By:</span> {transfer.transferredBy}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">ID:</span> {transfer.transactionId}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">Balance:</span> {transfer.balanceBefore} → {transfer.balanceAfter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Main Component
export default function UserProfilePage() {
  const [showCoinHistory, setShowCoinHistory] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState("")

  // Role-based access control
  const [userRole, setUserRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)

  // Get user role from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user") || localStorage.getItem("role") || "viewer"
    const user = JSON.parse(userStr)
    const role = user.role
    setUserRole(role)
    setRoleLoading(false)
  }, [])

  // Role-based permission helpers
  const canEdit = userRole === "superadmin"
  const canViewAll = userRole === "superadmin" || userRole === "editor"
  const isViewer = userRole === "viewer"

  // Fetch users and calculate statistics
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await userAPI.getUsers(1, 200) // Get more users for better stats
      if (response && (response.users || response.data)) {
        const usersData = response.users || response.data || response
        const formattedUsers = userHelpers.formatUserList(usersData)
        setUsers(formattedUsers)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (apiError) {
      console.warn("API call failed, using fallback data:", apiError)
      setError("Failed to load users from API - using demo data")
      // Enhanced fallback data
      const mockUsers = [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          balance: 1250,
          isActive: true,
          role: "user",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          walletAddresses: { metamask: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4" },
          calculatorUsage: 15,
          inviteCode: "JOHN2024",
          referredBy: "ALICE2023",
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          balance: 2750,
          isActive: true,
          role: "user",
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          walletAddresses: { trustWallet: "0x456def789abc123456789def456abc123456789d" },
          calculatorUsage: 28,
          inviteCode: "JANE2024",
          lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          _id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          balance: 875,
          isActive: true,
          role: "user",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          calculatorUsage: 8,
          inviteCode: "BOB2024",
          referredBy: "JOHN2024",
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "4",
          name: "Alice Brown",
          email: "alice@example.com",
          balance: 3200,
          isActive: true,
          role: "user",
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          walletAddresses: { metamask: "0x789abc123def456789abc123def456789abc123d" },
          calculatorUsage: 42,
          inviteCode: "ALICE2023",
          lastLogin: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
        {
          _id: "5",
          name: "Charlie Wilson",
          email: "charlie@example.com",
          balance: 450,
          isActive: false,
          role: "user",
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          calculatorUsage: 3,
          inviteCode: "CHARLIE2023",
          lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: "6",
          name: "Diana Prince",
          email: "diana@example.com",
          balance: 1890,
          isActive: true,
          role: "user",
          createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
          walletAddresses: { metamask: "0xabc123def456789abc123def456789abc123def4" },
          calculatorUsage: 22,
          inviteCode: "DIANA2024",
          referredBy: "BOB2024",
          lastLogin: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
      ]
      const formattedMockUsers = userHelpers.formatUserList(mockUsers)
      setUsers(formattedMockUsers)
    } finally {
      setLoading(false)
    }
  }, [])

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    if (!users.length) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalReferrals: 0,
        usersWithWallets: 0,
        calculatorUsers: 0,
        totalBalance: 0,
        averageBalance: 0,
        newUsersThisMonth: 0,
      }
    }
    const baseStats = userHelpers.calculateStats(users)
    const growthMetrics = userHelpers.calculateGrowthMetrics(users)
    return {
      ...baseStats,
      averageBalance: baseStats.totalUsers > 0 ? Math.round(baseStats.totalBalance / baseStats.totalUsers) : 0,
      newUsersThisMonth: growthMetrics.newUsersLast30Days,
    }
  }, [users])

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchUsers()
    setRefreshing(false)
  }

  // Load data on mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Format selected user data
  const formattedUser = selectedUser ? userHelpers.formatUserData(selectedUser) : null

  // Get user activity status
  const getUserActivityStatus = (user) => {
    return userHelpers.getUserActivityStatus(user)
  }

  // Initialize edit form with current user data
  const initializeEditForm = (user) => {
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      balance: user.balance || 0,
      isActive: user.isActive || false,
      role: user.role || "user",
      calculatorUsage: user.calculatorUsage || 0,
      inviteCode: user.inviteCode || "",
      referredBy: user.referredBy || "",
      walletAddresses: {
        metamask: user.walletAddresses?.metamask || "",
        trustWallet: user.walletAddresses?.trustWallet || "",
      },
    })
  }

  // Handle form input changes
  const handleEditFormChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setEditFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  // Save edited user data
  const handleSaveEdit = async () => {
    setSaving(true)
    setEditError("")
    try {
      const response = await userAPI.updateUser(selectedUser._id || selectedUser.id, editFormData)
      if (response.success) {
        // Update the selected user with new data
        setSelectedUser((prev) => ({ ...prev, ...editFormData }))
        setEditMode(false)
        // Refresh users list
        await fetchUsers()
      } else {
        throw new Error(response.message || "Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      setEditError("Failed to update user profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditMode(false)
    setEditFormData({})
    setEditError("")
  }

  // Enable edit mode
  const handleEditProfile = () => {
    if (selectedUser && canEdit) {
      initializeEditForm(selectedUser)
      setEditMode(true)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  // Show coin history view
  if (showCoinHistory && selectedUser) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        <CoinHistoryView selectedUser={selectedUser} onBack={() => setShowCoinHistory(false)} />
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col space-y-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
              User Profile Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              View detailed user information and transaction history
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="w-full sm:w-auto order-2 sm:order-1 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {selectedUser && (
              <Button
                onClick={() => setShowCoinHistory(!showCoinHistory)}
                className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto order-1 sm:order-2"
              >
                {showCoinHistory ? (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">View Profile</span>
                    <span className="sm:hidden">Profile</span>
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">View Coin History</span>
                    <span className="sm:hidden">Coin History</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Role Indicator */}
      {!roleLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 ${
            userRole === "superadmin"
              ? "bg-green-100 text-green-800 border border-green-200"
              : userRole === "editor"
                ? "bg-blue-100 text-blue-800 border border-blue-200"
                : "bg-orange-100 text-orange-800 border border-orange-200"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              userRole === "superadmin" ? "bg-green-500" : userRole === "editor" ? "bg-blue-500" : "bg-orange-500"
            }`}
          />
          {userRole === "superadmin" ? "Super Admin" : userRole === "editor" ? "Editor" : "Viewer"} Access
          {!canEdit && <span className="ml-2 text-xs bg-orange-200 px-2 py-1 rounded">Read Only</span>}
        </motion.div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="mb-4 sm:mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
              </div>
              <span className="text-gray-600 font-medium text-sm sm:text-base">Total Users</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalUsers}</div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{stats.activeUsers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
              </div>
              <span className="text-gray-600 font-medium text-sm sm:text-base">Total Referrals</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalReferrals}</div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Referral network</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />
              </div>
              <span className="text-gray-600 font-medium text-sm sm:text-base">Connected Wallets</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.usersWithWallets}</div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Wallet integration</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Calculator className="w-4 sm:w-5 h-4 sm:h-5 text-orange-600" />
              </div>
              <span className="text-gray-600 font-medium text-sm sm:text-base">Calculator Users</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.calculatorUsers}</div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Active calculators</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Balance</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">
                  {stats.totalBalance.toLocaleString()} coins
                </p>
              </div>
              <Coins className="h-6 sm:h-8 w-6 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Average Balance</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600">{stats.averageBalance} coins</p>
              </div>
              <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">New This Month</p>
                <p className="text-lg sm:text-xl font-bold text-purple-600">{stats.newUsersThisMonth}</p>
              </div>
              <UserCheck className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Selection */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Search className="h-4 sm:h-5 w-4 sm:w-5" />
            Select User to View Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <UserSelector selectedUser={selectedUser} onUserSelect={setSelectedUser} className="max-w-full" />
        </CardContent>
      </Card>

      {/* User Profile Details */}
      {selectedUser && formattedUser ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2 min-w-0 flex-1">
                  <User className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
                  <span className="truncate">User Profile Details</span>
                  {!canEdit && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-orange-50 text-orange-700 border-orange-200 text-xs flex-shrink-0"
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Read Only</span>
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 pt-0">
              {/* User Status and Activity */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">{formattedUser.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 truncate">{formattedUser.email}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={formattedUser.isActive ? "default" : "secondary"}
                    className={`text-xs ${formattedUser.isActive ? "bg-green-100 text-green-800" : ""}`}
                  >
                    {formattedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="capitalize text-xs">
                    {getUserActivityStatus(selectedUser)}
                  </Badge>
                </div>
              </div>

              {/* User Information Grid - Conditionally Editable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </label>
                  {editMode && canEdit ? (
                    <Input
                      value={editFormData.name || ""}
                      onChange={(e) => handleEditFormChange("name", e.target.value)}
                      placeholder="Enter full name"
                      className="h-10 sm:h-auto"
                    />
                  ) : (
                    <Input value={formattedUser.name} readOnly className="bg-gray-50 h-10 sm:h-auto" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  {editMode && canEdit ? (
                    <Input
                      type="email"
                      value={editFormData.email || ""}
                      onChange={(e) => handleEditFormChange("email", e.target.value)}
                      placeholder="Enter email address"
                      className="h-10 sm:h-auto"
                    />
                  ) : (
                    <Input value={formattedUser.email} readOnly className="bg-gray-50 h-10 sm:h-auto" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    Current Balance
                  </label>
                  {editMode && canEdit ? (
                    <Input
                      type="number"
                      value={editFormData.balance || 0}
                      onChange={(e) => handleEditFormChange("balance", Number.parseInt(e.target.value) || 0)}
                      placeholder="Enter balance"
                      className="h-10 sm:h-auto"
                    />
                  ) : (
                    <Input
                      value={`${formattedUser.balance} coins`}
                      readOnly
                      className="bg-gray-50 font-semibold text-green-600 h-10 sm:h-auto"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </label>
                  <Input
                    value={new Date(selectedUser.createdAt).toLocaleDateString()}
                    readOnly
                    className="bg-gray-50 h-10 sm:h-auto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last Login
                  </label>
                  <Input
                    value={selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "Never"}
                    readOnly
                    className="bg-gray-50 h-10 sm:h-auto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Invite Code
                  </label>
                  {editMode && canEdit ? (
                    <Input
                      value={editFormData.inviteCode || ""}
                      onChange={(e) => handleEditFormChange("inviteCode", e.target.value)}
                      placeholder="Enter invite code"
                      className="h-10 sm:h-auto"
                    />
                  ) : (
                    <Input
                      value={selectedUser.inviteCode || "N/A"}
                      readOnly
                      className="bg-gray-50 font-mono text-sm h-10 sm:h-auto"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Referred By
                  </label>
                  {editMode && canEdit ? (
                    <Input
                      value={editFormData.referredBy || ""}
                      onChange={(e) => handleEditFormChange("referredBy", e.target.value)}
                      placeholder="Enter referrer code"
                      className="h-10 sm:h-auto"
                    />
                  ) : (
                    <Input
                      value={selectedUser.referredBy || "Direct signup"}
                      readOnly
                      className="bg-gray-50 h-10 sm:h-auto"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculator Usage
                  </label>
                  {editMode && canEdit ? (
                    <Input
                      type="number"
                      value={editFormData.calculatorUsage || 0}
                      onChange={(e) => handleEditFormChange("calculatorUsage", Number.parseInt(e.target.value) || 0)}
                      placeholder="Enter usage count"
                      className="h-10 sm:h-auto"
                    />
                  ) : (
                    <Input
                      value={`${selectedUser.calculatorUsage || 0} times`}
                      readOnly
                      className="bg-gray-50 h-10 sm:h-auto"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </label>
                  {editMode && canEdit ? (
                    <Select
                      value={editFormData.role || "user"}
                      onValueChange={(value) => handleEditFormChange("role", value)}
                    >
                      <SelectTrigger className="h-10 sm:h-auto">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={selectedUser.role || "user"}
                      readOnly
                      className="bg-gray-50 capitalize h-10 sm:h-auto"
                    />
                  )}
                </div>
              </div>

              {/* Account Status Toggle - Only for superadmin in edit mode */}
              {editMode && canEdit && (
                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editFormData.isActive || false}
                      onChange={(e) => handleEditFormChange("isActive", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-600">Account Active</span>
                  </label>
                </div>
              )}

              {/* Wallet Information */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Wallet Addresses
                </label>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 flex-shrink-0">
                      MetaMask
                    </Badge>
                    {editMode && canEdit ? (
                      <Input
                        value={editFormData.walletAddresses?.metamask || ""}
                        onChange={(e) => handleEditFormChange("walletAddresses.metamask", e.target.value)}
                        placeholder="Enter MetaMask wallet address"
                        className="font-mono text-xs flex-1 h-10 sm:h-auto"
                      />
                    ) : (
                      <Input
                        value={selectedUser.walletAddresses?.metamask || "Not connected"}
                        readOnly
                        className="bg-gray-50 font-mono text-xs flex-1 h-10 sm:h-auto"
                      />
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 flex-shrink-0">
                      Trust Wallet
                    </Badge>
                    {editMode && canEdit ? (
                      <Input
                        value={editFormData.walletAddresses?.trustWallet || ""}
                        onChange={(e) => handleEditFormChange("walletAddresses.trustWallet", e.target.value)}
                        placeholder="Enter Trust Wallet address"
                        className="font-mono text-xs flex-1 h-10 sm:h-auto"
                      />
                    ) : (
                      <Input
                        value={selectedUser.walletAddresses?.trustWallet || "Not connected"}
                        readOnly
                        className="bg-gray-50 font-mono text-xs flex-1 h-10 sm:h-auto"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Permission Restriction Notice */}
              {!canEdit && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Lock className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <strong>Edit Restricted:</strong> Only Super Admin users can edit profile information.
                        <br />
                        <span className="text-sm">
                          Current role: <strong className="capitalize">{userRole}</strong>
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 w-fit">
                        {userRole === "editor" ? "Editor" : "Viewer"} Access
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Edit Error Display */}
              {editError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">{editError}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t">
                <Button onClick={() => setShowCoinHistory(true)} className="flex-1 h-10 sm:h-auto">
                  <Coins className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">View Coin History</span>
                  <span className="sm:hidden">Coin History</span>
                </Button>

                {editMode && canEdit ? (
                  <>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex-1 bg-green-600 hover:bg-green-700 h-10 sm:h-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Save Changes</span>
                          <span className="sm:hidden">Save</span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="flex-1 h-10 sm:h-auto bg-transparent"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : canEdit ? (
                  <Button
                    onClick={handleEditProfile}
                    variant="outline"
                    className="flex-1 h-10 sm:h-auto bg-transparent"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Edit Profile</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                ) : (
                  <Button
                    disabled
                    variant="outline"
                    className="flex-1 opacity-50 cursor-not-allowed h-10 sm:h-auto bg-transparent"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Edit Restricted</span>
                    <span className="sm:hidden">Restricted</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <Users className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">No User Selected</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Please select a user from the dropdown above to view their detailed profile information.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Use the search functionality to quickly find specific users by name, email, or invite code.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
