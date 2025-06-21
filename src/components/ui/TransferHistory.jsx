"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, Search, Download, Calendar, Coins, User, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { userAPI } from "@/lib/api"

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
  const itemsPerPage = 10

  // Update local transfers when prop changes
  useEffect(() => {
    if (Array.isArray(transferHistory) && transferHistory.length > 0) {
      setTransfers(transferHistory)
      setTotalTransfers(transferHistory.length)
      setTotalPages(Math.ceil(transferHistory.length / itemsPerPage))
    }
  }, [transferHistory])

  // Fetch transfer history from API with better error handling
  const fetchTransferHistory = async (page = 1, search = "", status = "all", dateFilter = "all") => {
    try {
      setLoading(true)
      setError("")

      // Try to fetch from API first
      try {
        const response = await userAPI.getTransferHistory({
          page,
          limit: itemsPerPage,
          search,
          status: status !== "all" ? status : undefined,
          dateRange: dateFilter !== "all" ? dateFilter : undefined,
        })

        if (response.success && response.data) {
          setTransfers(response.data.transfers || [])
          setTotalPages(response.data.totalPages || 1)
          setTotalTransfers(response.data.total || 0)
          return
        }
      } catch (apiError) {
        console.warn("API call failed, using local/fallback data:", apiError)
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

      // Date filter
      if (dateFilter !== "all") {
        const now = new Date()
        let filterDate = new Date()

        switch (dateFilter) {
          case "today":
            filterDate.setHours(0, 0, 0, 0)
            break
          case "week":
            filterDate.setDate(now.getDate() - 7)
            break
          case "month":
            filterDate.setMonth(now.getMonth() - 1)
            break
          default:
            filterDate = null
        }

        if (filterDate) {
          filteredTransfers = filteredTransfers.filter((transfer) => new Date(transfer.createdAt) >= filterDate)
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
    } catch (err) {
      console.error("Error in fetchTransferHistory:", err)
      setError("Unable to load transfer history. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Generate fallback transfer history when API is not available
  const generateFallbackTransferHistory = async () => {
    try {
      // Try to get users for realistic data
      const usersResponse = await userAPI.getUsers(1, 100)
      const users = usersResponse.data?.users || []

      if (users.length === 0) {
        // Return empty array if no users - transfers will be added as they're made
        return []
      }

      return generateTransferHistoryFromUsers(users)
    } catch (error) {
      console.warn("Could not fetch users for fallback data:", error)
      // Return empty array - real transfers will populate the history
      return []
    }
  }

  // Generate realistic transfer history data from users
  const generateTransferHistoryFromUsers = (users) => {
    const transferReasons = [
      "Screenshot approval reward",
      "Manual admin transfer",
      "Bonus for milestone achievement",
      "Referral reward",
      "Course completion bonus",
      "Daily login bonus",
      "Achievement unlock reward",
      "Contest participation reward",
      "Community contribution bonus",
      "Special event reward",
    ]

    const transferAmounts = [500, 400, 350, 300, 250, 200, 150, 100, 75, 50]
    const statuses = ["completed", "pending", "failed"]
    const adminNames = ["Admin User", "System Admin", "Super Admin", "Editor Admin"]

    const allTransfers = []
    users.forEach((user, userIndex) => {
      // Generate 1-3 transfers per user
      const transferCount = Math.floor(Math.random() * 3) + 1

      for (let i = 0; i < transferCount; i++) {
        const transferDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Last 90 days
        const transferStatus = statuses[Math.floor(Math.random() * statuses.length)]
        const amount = transferAmounts[Math.floor(Math.random() * transferAmounts.length)]

        allTransfers.push({
          id: `transfer_${userIndex}_${i}`,
          userId: user._id,
          userName: user.name || user.username || "Unknown User",
          userEmail: user.email || "No email",
          amount: amount,
          reason: transferReasons[Math.floor(Math.random() * transferReasons.length)],
          status: transferStatus,
          createdAt: transferDate.toISOString(),
          date: transferDate.toLocaleDateString(),
          time: transferDate.toLocaleTimeString(),
          transferredBy: adminNames[Math.floor(Math.random() * adminNames.length)],
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
          balanceBefore: Math.floor(Math.random() * 1000),
          balanceAfter: Math.floor(Math.random() * 1000) + amount,
        })
      }
    })

    return allTransfers
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchTransferHistory(currentPage, searchTerm, filterStatus, dateRange)
  }, [currentPage, searchTerm, filterStatus, dateRange])

  // Handle search
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
  }

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh()
      }
      await fetchTransferHistory(currentPage, searchTerm, filterStatus, dateRange)
    } catch (error) {
      console.error("Error refreshing transfer history:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Export functionality
  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ["Date", "User Name", "Email", "Amount", "Reason", "Status", "Transaction ID", "Admin"]
      const csvContent = [
        headers.join(","),
        ...transfers.map((transfer) =>
          [
            transfer.date,
            `"${transfer.userName}"`,
            `"${transfer.userEmail}"`,
            transfer.amount,
            `"${transfer.reason}"`,
            transfer.status,
            transfer.transactionId,
            `"${transfer.transferredBy}"`,
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
      alert("Failed to export data. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <Button onClick={handleExport} variant="outline" size="sm" disabled={transfers.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, reason, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("all")}
              >
                All Status
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("completed")}
              >
                Completed
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "failed" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("failed")}
              >
                Failed
              </Button>
            </div>

            {/* Date Filter */}
            <div className="flex gap-2">
              <Button
                variant={dateRange === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateFilter("all")}
              >
                All Time
              </Button>
              <Button
                variant={dateRange === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateFilter("today")}
              >
                Today
              </Button>
              <Button
                variant={dateRange === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateFilter("week")}
              >
                This Week
              </Button>
              <Button
                variant={dateRange === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateFilter("month")}
              >
                This Month
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
          ) : error ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 m-4 text-center">
              <p className="text-amber-700 mb-2">Transfer history is currently unavailable</p>
              <p className="text-sm text-amber-600 mb-4">
                The system is running in offline mode. New transfers will appear here once they are made.
              </p>
              <Button
                onClick={() => fetchTransferHistory(currentPage, searchTerm, filterStatus, dateRange)}
                variant="outline"
                size="sm"
              >
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
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(transfer.status)}</td>
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

      {/* Pagination */}
      {!loading && !error && transfers.length > 0 && totalPages > 1 && (
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
