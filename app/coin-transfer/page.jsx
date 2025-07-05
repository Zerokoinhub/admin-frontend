"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "lucide-react"
import { userAPI, userHelpers } from "../../src/lib/api"

export default function CoinTransferPage() {
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
  const [activeTab, setActiveTab] = useState("history") // Default to history for all users
  const [historyFilters, setHistoryFilters] = useState({
    search: "",
    status: "all",
    dateRange: "all",
  })

  // Get user role from localStorage
  useEffect(() => {
    try {
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        setUserRole(userData.role || "")
        console.log("her i am", userData.role)
        // Set default tab based on role
        if (userData.role === "superadmin") {
          setActiveTab("transfer") // Super admin starts with transfer tab
        } else {
          setActiveTab("history") // Others start with history tab
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
    }
  }, [])

  // Check permissions
  const hasTransferAccess = userRole === "superadmin"
  const hasHistoryAccess = true // All users can access history

  // Fetch users on component mount (only for super admin)
  useEffect(() => {
    if (hasTransferAccess) {
      fetchUsers()
    }
    if (activeTab === "history") {
      fetchTransferHistory()
    }
  }, [currentPage, activeTab, hasTransferAccess])

  // Fetch users from API
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

  // Fetch transfer history
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

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setMessage({ type: "", text: "" })
    setIsMobileMenuOpen(false)
  }

  // Handle transfer execution
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
      const currentBalance = selectedUser.balance || 0
      const newBalance = amount
      const adminUser = localStorage.getItem("user")
      const adminUserStr = JSON.parse(adminUser)
      const admin = adminUserStr.username

      const response = await userAPI.editUserBalance(selectedUser.email, newBalance, admin)

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

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter transfer history
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

  // Export transfer history to CSV
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

  // Calculate transfer statistics
  const transferStats = userHelpers.calculateTransferStats(filteredHistory)

  // Get role icon and color
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
                  ? "Manage and track coin transfers efficiently"
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

        {/* Message Alert */}
        {message.text && (
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
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 m-1 rounded-lg">
              {hasTransferAccess && (
                <TabsTrigger
                  value="transfer"
                  className="flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2"
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:hidden">Transfer</span>
                  <span className="hidden sm:inline">Transfer Coins</span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="history"
                className={`flex items-center gap-1.5 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2 ${
                  !hasTransferAccess ? "col-span-2" : ""
                }`}
              >
                <History className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:hidden">History</span>
                <span className="hidden sm:inline">Transfer History</span>
              </TabsTrigger>
            </TabsList>

            {/* Transfer Tab - Only for Super Admin */}
            {hasTransferAccess && (
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
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        <Input
                          placeholder="Search users by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 sm:pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <ScrollArea className="h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg border bg-white">
                        <div className="p-2 space-y-2">
                          {loading ? (
                            <div className="text-center py-6 sm:py-8">
                              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4 text-blue-500" />
                              <p className="text-gray-600 text-sm">Loading users...</p>
                            </div>
                          ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-6 sm:py-8 text-gray-500">
                              <User className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                              <p className="text-sm">No users found</p>
                            </div>
                          ) : (
                            filteredUsers.map((user) => (
                              <div
                                key={user._id}
                                className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                  selectedUser?._id === user._id
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                                onClick={() => handleUserSelect(user)}
                              >
                                <div className="flex justify-between items-start gap-2 sm:gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate text-sm sm:text-base">
                                      {user.name || "Unnamed"}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                                    <div className="flex items-center mt-1.5 sm:mt-2">
                                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
                                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                                        {user.balance || 0} coins
                                      </span>
                                    </div>
                                  </div>
                                  <Badge variant={user.isActive ? "default" : "secondary"} className="shrink-0 text-xs">
                                    {user.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-between items-center pt-3 sm:pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="text-xs sm:text-sm px-2 sm:px-3"
                          >
                            Previous
                          </Button>
                          <span className="text-xs sm:text-sm text-gray-600 px-2">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="text-xs sm:text-sm px-2 sm:px-3"
                          >
                            Next
                          </Button>
                        </div>
                      )}
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
                                <p className="font-medium text-gray-900">{selectedUser.balance || 0} coins</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Status:</span>
                                <Badge
                                  className="ml-2 text-xs"
                                  variant={selectedUser.isActive ? "default" : "secondary"}
                                >
                                  {selectedUser.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
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
                                Reason (Optional)
                              </Label>
                              <Textarea
                                id="reason"
                                placeholder="Enter reason for transfer"
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
                                !selectedUser.email ||
                                Number.parseInt(transferAmount) <= 0
                              }
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 sm:py-2.5 text-sm"
                            >
                              {loading ? (
                                <>
                                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                                  Processing Transfer...
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
            )}

            {/* History Tab - Available for All Users */}
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
                      <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Export */}
              <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <History className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                      Transfer History
                    </CardTitle>
                    <Button
                      onClick={exportToCSV}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                      disabled={filteredHistory.length === 0}
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      <Input
                        placeholder="Search transfers..."
                        value={historyFilters.search}
                        onChange={(e) => setHistoryFilters((prev) => ({ ...prev, search: e.target.value }))}
                        className="pl-8 sm:pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                      />
                    </div>
                    <Select
                      value={historyFilters.status}
                      onValueChange={(value) => setHistoryFilters((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-sm">
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
                      value={historyFilters.dateRange}
                      onValueChange={(value) => setHistoryFilters((prev) => ({ ...prev, dateRange: value }))}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-sm">
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

                  {/* Transfer History */}
                  <div className="rounded-lg border bg-white overflow-hidden">
                    {historyLoading ? (
                      <div className="text-center py-8 sm:py-12">
                        <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4 text-purple-500" />
                        <p className="text-gray-600 text-sm">Loading transfer history...</p>
                      </div>
                    ) : filteredHistory.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-gray-500">
                        <History className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                        <p className="text-base sm:text-lg font-medium mb-2">No Transfer History</p>
                        <p className="text-xs sm:text-sm">No transfers found matching your criteria</p>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="text-left p-3 sm:p-4 font-semibold text-gray-900 text-xs sm:text-sm">
                                  Transaction ID
                                </th>
                                <th className="text-left p-3 sm:p-4 font-semibold text-gray-900 text-xs sm:text-sm">
                                  User
                                </th>
                                <th className="text-left p-3 sm:p-4 font-semibold text-gray-900 text-xs sm:text-sm">
                                  Email
                                </th>
                                <th className="text-left p-3 sm:p-4 font-semibold text-gray-900 text-xs sm:text-sm">
                                  Amount
                                </th>
                                <th className="text-left p-3 sm:p-4 font-semibold text-gray-900 text-xs sm:text-sm">
                                  Date
                                </th>
                                <th className="text-left p-3 sm:p-4 font-semibold text-gray-900 text-xs sm:text-sm">
                                  Time
                                </th>
                                <th className="text-left p-3 sm:p-4 font-semibold text-gray-900 text-xs sm:text-sm">
                                  Admin
                                </th>
                                <th className="text-left p-3 sm:p-4 font-semibold text-gray-900 text-xs sm:text-sm">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredHistory.map((transfer, index) => (
                                <tr
                                  key={transfer.id}
                                  className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                                >
                                  <td className="p-3 sm:p-4">
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                                      {transfer.transactionId}
                                    </code>
                                  </td>
                                  <td className="p-3 sm:p-4">
                                    <p className="font-medium text-gray-900 text-sm break-words">{transfer.userName}</p>
                                  </td>
                                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600 break-all">
                                    {transfer.userEmail}
                                  </td>
                                  <td className="p-3 sm:p-4">
                                    <div className="flex items-center">
                                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
                                      <span className="font-semibold text-gray-900 text-sm">{transfer.amount}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600">{transfer.date}</td>
                                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600">{transfer.time}</td>
                                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600 break-words">
                                    {transfer.transferredBy}
                                  </td>
                                  <td className="p-3 sm:p-4">
                                    <Badge
                                      variant={
                                        transfer.status === "completed"
                                          ? "default"
                                          : transfer.status === "pending"
                                            ? "secondary"
                                            : "destructive"
                                      }
                                      className="text-xs"
                                    >
                                      {transfer.status}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-3 p-3 sm:p-4">
                          {filteredHistory.map((transfer, index) => (
                            <Card key={transfer.id} className="border border-gray-200">
                              <CardContent className="p-3 sm:p-4">
                                <div className="space-y-2 sm:space-y-3">
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 text-sm break-words">
                                        {transfer.userName}
                                      </p>
                                      <p className="text-xs text-gray-600 break-all">{transfer.userEmail}</p>
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
                                      {transfer.status}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
                                      <span className="font-semibold text-gray-900 text-sm">
                                        {transfer.amount} coins
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {transfer.date} {transfer.time}
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">Transaction ID:</span>
                                        <code className="ml-1 bg-gray-100 px-1 py-0.5 rounded font-mono break-all">
                                          {transfer.transactionId}
                                        </code>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Admin:</span>
                                        <span className="ml-1 text-gray-700 break-words">{transfer.transferredBy}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
