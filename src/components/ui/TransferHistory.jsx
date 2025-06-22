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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { transferAPI } from "../../src/lib/transferAPI"
import { userHelpers } from "../../src/lib/api"

export default function TransferHistory({ onBack, transferHistory = [], onRefresh }) {
  const [transfers, setTransfers] = useState(transferHistory)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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

      // Calculate stats from local data
      const transferStats = userHelpers.calculateTransferStats(transferHistory)
      setStats(transferStats)
    }
  }, [transferHistory])

  // Enhanced fetch transfer history using transferAPI
  const fetchTransferHistory = async (page = 1, search = "", status = "all", dateFilter = "all", userId = "") => {
    try {
      setLoading(true)
      setError("")

      // Prepare filters for the new transferAPI
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
        // Use the dedicated transferAPI for better handling
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
          return
        }
      } catch (apiError) {
        console.warn("TransferAPI call failed, using fallback:", apiError)
        setError("Unable to connect to transfer service. Using local data.")
      }

      // Fallback: use provided transferHistory or generate mock data if needed
      let allTransfers = []

      if (Array.isArray(transferHistory) && transferHistory.length > 0) {
        allTransfers = transferHistory
      } else {
        // Only generate mock data if no real transfer history exists
        try {
          allTransfers = await generateFallbackTransferHistory()
        } catch (fallbackError) {
          console.warn("Could not generate fallback data:", fallbackError)
          allTransfers = []
        }
      }

      // Apply filters to the available data
      let filteredTransfers = allTransfers

      // Search filter
      if (search) {
        filteredTransfers = filteredTransfers.filter(
          (transfer) =>
            transfer.userName?.toLowerCase().includes(search.toLowerCase()) ||
            transfer.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
            transfer.reason?.toLowerCase().includes(search.toLowerCase()) ||
            transfer.transactionId?.toLowerCase().includes(search.toLowerCase()),
        )
      }

      // Status filter
      if (status !== "all") {
        filteredTransfers = filteredTransfers.filter((transfer) => transfer.status === status)
      }

      // User filter
      if (userId) {
        filteredTransfers = filteredTransfers.filter((transfer) => transfer.userId === userId)
      }

      // Date filter
      if (dateFilter !== "all" || startDate || endDate) {
        const now = new Date()
        let filterStartDate = startDate ? new Date(startDate) : null
        let filterEndDate = endDate ? new Date(endDate) : null

        if (dateFilter !== "all" && !startDate && !endDate) {
          filterStartDate = new Date()
          switch (dateFilter) {
            case "today":
              filterStartDate.setHours(0, 0, 0, 0)
              break
            case "week":
              filterStartDate.setDate(now.getDate() - 7)
              break
            case "month":
              filterStartDate.setMonth(now.getMonth() - 1)
              break
          }
          filterEndDate = now
        }

        if (filterStartDate || filterEndDate) {
          filteredTransfers = filteredTransfers.filter((transfer) => {
            const transferDate = new Date(transfer.createdAt)
            if (filterStartDate && transferDate < filterStartDate) return false
            if (filterEndDate && transferDate > filterEndDate) return false
            return true
          })
        }
      }

      // Sort by date (newest first)
      filteredTransfers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      // Pagination
      const total = filteredTransfers.length
      const totalPages = Math.ceil(total / itemsPerPage)
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedData = filteredTransfers.slice(startIndex, endIndex)

      setTransfers(paginatedData)
      setTotalPages(Math.max(totalPages, 1))
      setTotalTransfers(total)

      // Calculate stats from filtered data
      const transferStats = userHelpers.calculateTransferStats(filteredTransfers)
      setStats(transferStats)
    } catch (err) {
      console.error("Error in fetchTransferHistory:", err)
      setError("Unable to load transfer history. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Generate fallback transfer history when API is not available
  const generateFallbackTransferHistory = async () => {
    // Return empty array - real transfers will populate the history
    return []
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchTransferHistory(currentPage, searchTerm, filterStatus, dateRange, selectedUserId)
  }, [currentPage, searchTerm, filterStatus, dateRange, selectedUserId, startDate, endDate])

  // Handle search with debouncing
  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle filter changes
  const handleStatusFilter = (status) => {
    setFilterStatus(status)
    setCurrentPage(1)
  }

  const handleDateFilter = (range) => {
    setDateRange(range)
    setCurrentPage(1)
    // Clear custom date range when using preset filters
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
      setError("Failed to refresh transfer history")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Update transfer status using transferAPI
  const updateTransferStatus = async (transferId, newStatus) => {
    try {
      const result = await transferAPI.updateTransferStatus(transferId, newStatus)

      if (result.success) {
        // Update local transfer list
        setTransfers((prev) =>
          prev.map((transfer) => (transfer.id === transferId ? { ...transfer, status: newStatus } : transfer)),
        )

        // Refresh the full list to get updated data
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
        {/* Add status update dropdown for pending transfers */}
        {status === "pending" && (
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
    try {
      setLoading(true)

      // Get all transfers for export (not just current page)
      const exportFilters = {
        page: 1,
        limit: 1000, // Large limit to get all transfers
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
        // Fallback to current transfers if API fails
        allTransfersForExport = transfers
      }

      // Create enhanced CSV content
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

      // Create and download file
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
              <Button onClick={handleExport} variant="outline" size="sm" disabled={transfers.length === 0 || loading}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      {stats && (
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

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, reason, or transaction ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row 1: Status and Date Range */}
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

            {/* Custom Date Range */}
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

      {/* Error Alert */}
      {error && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">{error}</AlertDescription>
        </Alert>
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
                            {/* Mobile-only additional info */}
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
      {!loading && transfers.length > 0 && totalPages > 1 && (
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

                {/* Page numbers */}
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
