"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../src/components/ui/card"
import { Button } from "../../src/components/ui/button"
import { Input } from "../../src/components/ui/input"
import { Label } from "../../src/components/ui/label"
import { Textarea } from "../../src/components/ui/textarea"
import { Badge } from "../../src/components/ui/badge"
import { Alert, AlertDescription } from "../../src/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../src/components/ui/tabs"
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
} from "lucide-react"
import { userAPI, userHelpers } from "../../src/lib/api"

export default function CoinTransferPage() {
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
  const [activeTab, setActiveTab] = useState("transfer")
  const [historyFilters, setHistoryFilters] = useState({
    search: "",
    status: "all",
    dateRange: "all",
  })

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
    if (activeTab === "history") {
      fetchTransferHistory()
    }
  }, [currentPage, activeTab])

  // Fetch users from API
  const fetchUsers = async () => {
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
        // Handle your exact API response structure: { success: true, data: [...] }
        const transfers = response.data || []
        const formattedTransfers = transfers.map((transfer) => userHelpers.formatTransferData(transfer))
        setTransferHistory(formattedTransfers)
      } else {
        setMessage({ type: "error", text: response.message || "Failed to fetch transfer history" })
      }
    } catch (error) {
      console.error("Error fetching transfer history:", error)
      setMessage({ type: "error", text: "Error fetching transfer history" })
      setTransferHistory([]) // Set empty array on error
    } finally {
      setHistoryLoading(false)
    }
  }

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setMessage({ type: "", text: "" })
  }

  // Handle transfer execution
  const handleTransfer = async () => {
    if (!selectedUser || !transferAmount || !selectedUser.email) {
      setMessage({
        type: "error",
        text: "Please select a user with email and enter transfer amount",
      })
      return
    }

    const amount = Number.parseFloat(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" })
      return
    }

    try {
      setLoading(true)

      // Calculate new balance
      const currentBalance = selectedUser.balance || 0
      const newBalance = currentBalance + amount
      const adminUser = localStorage.getItem('user');
      const adminUserStr = JSON.parse(adminUser) ;
      const admin = adminUserStr.username;
      console.log("this is" ,admin);
      // Use editUserBalance API with email
      const response = await userAPI.editUserBalance(selectedUser.email, newBalance , admin)

      if (response.success) {
        setMessage({
          type: "success",
          text: `Successfully transferred ${amount} coins to ${selectedUser.name}. New balance: ${response.data.newBalance}`,
        })

        // Update selected user's balance in the UI
        setSelectedUser((prev) => ({
          ...prev,
          balance: response.data.newBalance,
        }))

        // Update user in the users list
        setUsers((prev) =>
          prev.map((user) =>
            user.email === selectedUser.email ? { ...user, balance: response.data.newBalance } : user,
          ),
        )

        // Clear form
        setTransferAmount("")
        setTransferReason("")

        // Refresh transfer history if on history tab
        if (activeTab === "history") {
          fetchTransferHistory()
        }
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coin Transfer Management</h1>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
          {message.type === "error" ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transfer">
            <Send className="w-4 h-4 mr-2" />
            Transfer Coins
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Transfer History
          </TabsTrigger>
        </TabsList>

        {/* Transfer Tab */}
        <TabsContent value="transfer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Select User
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="text-center py-4">Loading users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No users found</div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedUser?._id === user._id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{user.name || "Unnamed"}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center mt-1">
                              <Coins className="w-4 h-4 mr-1 text-yellow-500" />
                              <span className="text-sm font-medium">{user.balance || 0} coins</span>
                            </div>
                          </div>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transfer Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Transfer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedUser ? (
                  <>
                    {/* Selected User Info */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Selected User</h3>
                      <p className="text-sm">
                        <strong>Name:</strong> {selectedUser.name}
                      </p>
                      <p className="text-sm">
                        <strong>Email:</strong> {selectedUser.email}
                      </p>
                      <p className="text-sm">
                        <strong>Current Balance:</strong> {selectedUser.balance || 0} coins
                      </p>
                      <p className="text-sm">
                        <strong>Status:</strong>
                        <Badge className="ml-2" variant={selectedUser.isActive ? "default" : "secondary"}>
                          {selectedUser.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </p>
                    </div>

                    {/* Transfer Form */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Transfer Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount to transfer"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Textarea
                          id="reason"
                          placeholder="Enter reason for transfer"
                          value={transferReason}
                          onChange={(e) => setTransferReason(e.target.value)}
                          rows={3}
                        />
                      </div>

                      {/* Transfer Preview */}
                      {transferAmount && !isNaN(Number.parseFloat(transferAmount)) && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium mb-2">Transfer Preview</h4>
                          <p className="text-sm">
                            <strong>Amount:</strong> {Number.parseFloat(transferAmount)} coins
                          </p>
                          <p className="text-sm">
                            <strong>New Balance:</strong>{" "}
                            {(selectedUser.balance || 0) + Number.parseFloat(transferAmount)} coins
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={handleTransfer}
                        disabled={loading || !transferAmount || !selectedUser.email}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Transfer Coins
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Please select a user to transfer coins</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Transfers</p>
                    <p className="text-2xl font-bold">{transferStats.totalTransfers}</p>
                  </div>
                  <History className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold">{transferStats.totalAmount.toLocaleString()}</p>
                  </div>
                  <Coins className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{transferStats.completedTransfers}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Amount</p>
                    <p className="text-2xl font-bold">{Math.round(transferStats.averageAmount)}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Export */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Transfer History
                </CardTitle>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transfers..."
                    value={historyFilters.search}
                    onChange={(e) => setHistoryFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={historyFilters.status}
                  onValueChange={(value) => setHistoryFilters((prev) => ({ ...prev, status: value }))}
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
                  value={historyFilters.dateRange}
                  onValueChange={(value) => setHistoryFilters((prev) => ({ ...prev, dateRange: value }))}
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

              {/* Transfer History Table */}
              <div className="overflow-x-auto">
                {historyLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading transfer history...</p>
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No transfer history found</p>
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Transaction ID</th>
                        <th className="text-left p-3 font-medium">User</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Amount</th>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Time</th>
                        <th className="text-left p-3 font-medium">Admin</th>
                        <th className="text-left p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((transfer) => (
                        <tr key={transfer.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{transfer.transactionId}</code>
                          </td>
                          <td className="p-3 font-medium">{transfer.userName}</td>
                          <td className="p-3 text-sm text-gray-600">{transfer.userEmail}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <Coins className="w-4 h-4 mr-1 text-yellow-500" />
                              <span className="font-medium">{transfer.amount}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm">{transfer.date}</td>
                          <td className="p-3 text-sm">{transfer.time}</td>
                          <td className="p-3 text-sm">{transfer.transferredBy}</td>
                          <td className="p-3">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
