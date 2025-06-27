"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Loader2,
  Search,
  Download,
  Calendar,
  Coins,
  User,
  Clock,
  RefreshCw,
  Filter,
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock transferAPI for demonstration
const transferAPI = {
  async getHistory(filters) {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate server down scenario (you can toggle this)
    const serverDown = Math.random() > 0.7 // 30% chance server is down

    if (serverDown) {
      throw new Error("Server is down yet")
    }

    // Mock successful response
    const mockTransfers = [
      {
        id: "1",
        userId: "user1",
        userName: "John Doe",
        userEmail: "john@example.com",
        amount: 100,
        reason: "Bonus reward",
        status: "completed",
        createdAt: new Date().toISOString(),
        transferredBy: "Admin",
        transactionId: "TXN001",
        balanceBefore: 500,
        balanceAfter: 600,
      },
      {
        id: "2",
        userId: "user2",
        userName: "Jane Smith",
        userEmail: "jane@example.com",
        amount: 250,
        reason: "Contest prize",
        status: "pending",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        transferredBy: "System",
        transactionId: "TXN002",
        balanceBefore: 300,
        balanceAfter: 550,
      },
    ]

    return {
      success: true,
      data: {
        transfers: mockTransfers,
        total: mockTransfers.length,
        totalPages: 1,
      },
    }
  },

  async updateTransferStatus(transferId, newStatus) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true }
  },
}

// Mock userHelpers
const userHelpers = {
  calculateTransferStats(transfers) {
    return {
      totalTransfers: transfers.length,
      totalAmount: transfers.reduce((sum, t) => sum + t.amount, 0),
      completedTransfers: transfers.filter((t) => t.status === "completed").length,
      averageAmount: transfers.length > 0 ? transfers.reduce((sum, t) => sum + t.amount, 0) / transfers.length : 0,
    }
  },
}

export default function TransferHistory({ onBack, transferHistory = [], onRefresh }) {
  const [transfers, setTransfers] = useState(transferHistory)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [serverDown, setServerDown] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTransfers, setTotalTransfers] = useState(0)
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const itemsPerPage = 10

  // Update local transfers when prop changes
  useEffect(() => {
    if (Array.isArray(transferHistory) && transferHistory.length > 0) {
      setTransfers(transferHistory)
      setTotalTransfers(transferHistory.length)
      setTotalPages(Math.ceil(transferHistory.length / itemsPerPage))
      const transferStats = userHelpers.calculateTransferStats(transferHistory)
      setStats(transferStats)
      setServerDown(false)
    }
  }, [transferHistory])

  // Enhanced fetch transfer history using transferAPI
  const fetchTransferHistory = async (page = 1, search = "", status = "all", dateFilter = "all", userId = "") => {
    try {
      setLoading(true)
      setError("")
      setServerDown(false)

      // Prepare filters for the transferAPI
      const filters = {
        page,
        limit: itemsPerPage,
        ...(search && { search }),
        ...(status !== "all" && { status }),
        ...(userId && { userId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      }

      // Handle date range filters
      if (dateFilter !== "all" && !startDate && !endDate) {
        const now = new Date()
        const filterStartDate = new Date()

        switch (dateFilter) {
          case "today":
            filterStartDate.setHours(0, 0, 0, 0)
            filters.startDate = filterStartDate.toISOString()
            filters.endDate = now.toISOString()
            break
          case "week":
            filterStartDate.setDate(now.getDate() - 7)
            filters.startDate = filterStartDate.toISOString()
            filters.endDate = now.toISOString()
            break
          case "month":
            filterStartDate.setMonth(now.getMonth() - 1)
            filters.startDate = filterStartDate.toISOString()
            filters.endDate = now.toISOString()
            break
        }
      }

      try {
        // Use the transferAPI to fetch data
        const response = await transferAPI.getHistory(filters)

        if (response.success && response.data) {
          const formattedTransfers = response.data.transfers.map((transfer) => ({
            id: transfer.id || transfer._id,
            userId: transfer.userId,
            userName: transfer.userName || transfer.user?.name || "Unknown User",
            userEmail: transfer.userEmail || transfer.user?.email || "No email",
            amount: Number(transfer.amount) || 0,
            reason: transfer.reason || "No reason provided",
            status: transfer.status || "completed",
            createdAt: transfer.createdAt || transfer.timestamp,
            date: transfer.date || new Date(transfer.createdAt || transfer.timestamp).toLocaleDateString(),
            time: transfer.time || new Date(transfer.createdAt || transfer.timestamp).toLocaleTimeString(),
            transferredBy: transfer.transferredBy || transfer.adminName || "System",
            transactionId: transfer.transactionId || `TXN${Date.now()}`,
            balanceBefore: transfer.balanceBefore || 0,
            balanceAfter: transfer.balanceAfter || 0,
          }))

          setTransfers(formattedTransfers)
          setTotalPages(response.data.totalPages || 1)
          setTotalTransfers(response.data.total || 0)

          // Calculate comprehensive stats
          const transferStats = userHelpers.calculateTransferStats(formattedTransfers)
          setStats(transferStats)
          setServerDown(false)
          return
        }
      } catch (apiError) {
        console.error("TransferAPI call failed:", apiError)

        // Check if it's a server down error
        if (apiError.message === "Server is down yet" || apiError.message.includes("Server is down")) {
          setServerDown(true)
          setError("Server is down yet")
        } else {
          setError("Unable to connect to transfer service. Please try again later.")
        }

        // Clear existing data when server is down
        setTransfers([])
        setTotalTransfers(0)
        setTotalPages(1)
        setStats(null)
      }
    } catch (err) {
      console.error("Error in fetchTransferHistory:", err)
      setServerDown(true)
      setError("Server is down yet")
      setTransfers([])
      setTotalTransfers(0)
      setTotalPages(1)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchTransferHistory(currentPage, searchTerm, filterStatus, dateRange, selectedUserId)
  }, [currentPage, searchTerm, filterStatus, dateRange, selectedUserId, startDate, endDate])

  // Handle search with debouncing
  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Handle filter changes
  const handleStatusFilter = (status) => {
    setFilterStatus(status)
    setCurrentPage(1)
  }

  const handleDateFilter = (range) => {
    setDateRange(range)
    setCurrentPage(1)
    if (range !== "custom") {
      setStartDate("")
      setEndDate("")
    }
  }

  const handleUserFilter = (userId) => {
    setSelectedUserId(userId)
    setCurrentPage(1)
  }

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Enhanced refresh with transferAPI
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh()
      }
      await fetchTransferHistory(currentPage, searchTerm, filterStatus, dateRange, selectedUserId)
    } catch (error) {
      console.error("Error refreshing transfer history:", error)
      setServerDown(true)
      setError("Server is down yet")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Update transfer status using transferAPI
  const updateTransferStatus = async (transferId, newStatus) => {
    try {
      const result = await transferAPI.updateTransferStatus(transferId, newStatus)

      if (result.success) {
        setTransfers((prev) =>
          prev.map((transfer) => (transfer.id === transferId ? { ...transfer, status: newStatus } : transfer)),
        )
        await fetchTransferHistory(currentPage, searchTerm, filterStatus, dateRange, selectedUserId)
      }
    } catch (error) {
      console.error("Failed to update transfer status:", error)
      setError(`Failed to update transfer status: ${error.message}`)
    }
  }

  // Get status badge color
  const getStatusBadge = (status, transferId) => {
    const badgeProps = {
      completed: { className: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
      pending: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
      failed: { className: "bg-red-100 text-red-800 border-red-200", label: "Failed" },
    }

    const config = badgeProps[status] || { className: "bg-gray-100 text-gray-800", label: status }

    return (
      <div className="flex items-center gap-2">
        <Badge className={config.className}>{config.label}</Badge>
        {status === "pending" && !serverDown && (
          <Select onValueChange={(newStatus) => updateTransferStatus(transferId, newStatus)}>
            <SelectTrigger className="w-24 h-6 text-xs">
              <SelectValue placeholder="Update" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Complete</SelectItem>
              <SelectItem value="failed">Mark Failed</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }

  // Enhanced export functionality
  const handleExport = async () => {
    if (serverDown) {
      setError("Cannot export data - Server is down yet")
      return
    }

    try {
      setLoading(true)

      const exportFilters = {
        page: 1,
        limit: 1000,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(selectedUserId && { userId: selectedUserId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      }

      let allTransfersForExport = []

      try {
        const response = await transferAPI.getHistory(exportFilters)
        if (response.success && response.data) {
          allTransfersForExport = response.data.transfers
        }
      } catch (apiError) {
        allTransfersForExport = transfers
      }

      const headers = [
        "Date",
        "Time",
        "User Name",
        "Email",
        "Amount",
        "Reason",
        "Status",
        "Transaction ID",
        "Admin",
        "Balance Before",
        "Balance After",
        "User ID",
      ]

      const csvContent = [
        headers.join(","),
        ...allTransfersForExport.map((transfer) =>
          [
            `"${transfer.date || new Date(transfer.createdAt).toLocaleDateString()}"`,
            `"${transfer.time || new Date(transfer.createdAt).toLocaleTimeString()}"`,
            `"${transfer.userName || transfer.user?.name || "Unknown"}"`,
            `"${transfer.userEmail || transfer.user?.email || "No email"}"`,
            transfer.amount || 0,
            `"${transfer.reason || "No reason"}"`,
            transfer.status || "completed",
            `"${transfer.transactionId || ""}"`,
            `"${transfer.transferredBy || transfer.adminName || "System"}"`,
            transfer.balanceBefore || 0,
            transfer.balanceAfter || 0,
            `"${transfer.userId || ""}"`,
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `transfer-history-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting data:", error)
      setError("Failed to export data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Transfer History
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  View all coin transfer transactions ({totalTransfers} total)
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={transfers.length === 0 || loading || serverDown}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Server Down Alert */}
      {serverDown && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">Server is down yet</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && !serverDown && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && !serverDown && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transfers</p>
                  <p className="text-2xl font-bold">{stats.totalTransfers}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString()}</p>
                </div>
                <Coins className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTransfers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Amount</p>
                  <p className="text-2xl font-bold">{Math.round(stats.averageAmount)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Filters - Hidden when server is down */}
      {!serverDown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, reason, or transaction ID..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={filterStatus} onValueChange={handleStatusFilter}>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <Select value={dateRange} onValueChange={handleDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === "custom" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transfer History Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading transfer history...</p>
              </div>
            </div>
          ) : serverDown ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Server is down yet</h3>
              <p className="text-gray-600 mb-4">Unable to connect to the transfer service. Please try again later.</p>
              <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Try Again
              </Button>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Transfers Found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== "all" || dateRange !== "all"
                  ? "No transfer history matches your current filters."
                  : "No transfer history available yet. Transfers will appear here once they are made."}
              </p>
              {(searchTerm || filterStatus !== "all" || dateRange !== "all") && (
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus("all")
                    setDateRange("all")
                    setSelectedUserId("")
                    setStartDate("")
                    setEndDate("")
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{transfer.userName}</div>
                            <div className="text-sm text-gray-500">{transfer.userEmail}</div>
                            <div className="md:hidden text-xs text-gray-400 mt-1">
                              {transfer.reason} • {transfer.date}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">+{transfer.amount} coins</div>
                        {transfer.balanceAfter && (
                          <div className="text-xs text-gray-500">Balance: {transfer.balanceAfter}</div>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={transfer.reason}>
                          {transfer.reason}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {transfer.date}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {transfer.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(transfer.status, transfer.id)}</td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-mono text-gray-600">{transfer.transactionId}</div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.transferredBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Pagination */}
      {!loading && !serverDown && transfers.length > 0 && totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalTransfers)}{" "}
                of {totalTransfers} transfers
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    }
                    return null
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
