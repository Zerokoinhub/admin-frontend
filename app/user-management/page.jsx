"use client"

import { useEffect, useState, useCallback } from "react"
import DashboardStatCard from "../../src/components/ui/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wallet,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  Activity,
  Calculator,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Search,
  Smartphone,
  Zap,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import DataTable from "../../src/components/ui/tables/DataTable"
import UserModal from "../../src/components/ui/modals/UserModal"
import { userAPI, userHelpers } from "../../src/lib/api"
import FullScreenLoader from "../../src/components/ui/FullScreenLoader"

const ManagementPage = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [showTable, setShowTable] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [walletFilter, setWalletFilter] = useState("all")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  })
  const [userRole, setUserRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)

  // Get user role from localStorage with enhanced checking
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user") || localStorage.getItem("role") || '"viewer"'
      let role = "viewer"

      try {
        const parsed = JSON.parse(userStr)
        role = typeof parsed === "string" ? parsed : parsed.role || "viewer"
      } catch {
        role = userStr || "viewer"
      }

      console.log("the current mode ", role)
      setUserRole(role)
    } catch (error) {
      console.error("Error getting user role:", error)
      setUserRole("viewer")
    } finally {
      setRoleLoading(false)
    }
  }, [])

  // Role-based permission helpers
  const canViewAll = userRole === "superadmin"
  const canEdit = userRole === "superadmin" || userRole === "editor"
  const canViewGraphs = userRole === "superadmin"
  const isViewer = userRole === "viewer"

  // Enhanced stats with new metrics
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    usersWithWallets: 0,
    totalBalance: 0,
    calculatorUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    usersWithFirebase: 0,
    usersWithSessions: 0,
    recentlyUpdated: 0,
    totalReferrals: 0,
    growthMetrics: {
      newUsersLast30Days: 0,
      newUsersLast7Days: 0,
      newUsersToday: 0,
      activeUsersLast7Days: 0,
      growthRate30Days: 0,
      growthRate7Days: 0,
      weeklyActivityRate: 0,
    },
    engagementMetrics: {
      averageEngagementScore: 0,
      highEngagementUsers: 0,
      lowEngagementUsers: 0,
    },
  })

  // Calculate engagement metrics
  const calculateEngagementMetrics = (users) => {
    if (!Array.isArray(users) || users.length === 0) {
      return {
        averageEngagementScore: 0,
        highEngagementUsers: 0,
        lowEngagementUsers: 0,
      }
    }

    const engagementScores = users.map((user) => userHelpers.getUserEngagementScore(user))
    const averageScore = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length

    return {
      averageEngagementScore: Math.round(averageScore),
      highEngagementUsers: engagementScores.filter((score) => score >= 70).length,
      lowEngagementUsers: engagementScores.filter((score) => score < 30).length,
    }
  }

  // Enhanced user loading with comprehensive data handling
  const loadUsers = useCallback(async (showLoader = true, page = 1, limit = 1000) => {
    try {
      if (showLoader) setLoading(true)
      setError(null)

      // Fetch users with enhanced API response handling
      const response = await userAPI.getUsers(page, limit)

      let allUsers = []
      if (response.success) {
        allUsers = response.users || response.data || []
        setPagination(
          response.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: allUsers.length,
            itemsPerPage: limit,
          },
        )
      } else {
        throw new Error("Failed to fetch users")
      }

      console.log("Loaded users:", allUsers.length)

      // Format users with enhanced helper
      const formattedUsers = userHelpers.formatUserList(allUsers)
      setUsers(formattedUsers)
      setFilteredUsers(formattedUsers)

      // Calculate comprehensive stats using enhanced helpers
      const calculatedStats = userHelpers.calculateStats(allUsers)
      const growthMetrics = userHelpers.calculateGrowthMetrics(allUsers)
      const engagementMetrics = calculateEngagementMetrics(allUsers)

      // Try to get additional data from specific endpoints
      let calculatorUsersCount = calculatedStats.calculatorUsers
      let totalWalletsCount = calculatedStats.usersWithWallets
      let totalReferralsCount = calculatedStats.totalReferrals

      try {
        const [calculatorRes, walletsRes, referralsRes] = await Promise.allSettled([
          userAPI.getCalculatorUsers(),
          userAPI.getTotalWallets(),
          userAPI.getTotalReferrals(),
        ])

        if (calculatorRes.status === "fulfilled" && calculatorRes.value?.data) {
          calculatorUsersCount = Array.isArray(calculatorRes.value.data)
            ? calculatorRes.value.data.length
            : calculatorRes.value.data.count || calculatorUsersCount
        }

        if (walletsRes.status === "fulfilled" && walletsRes.value?.data) {
          totalWalletsCount = walletsRes.value.data.count || walletsRes.value.data || totalWalletsCount
        }

        if (referralsRes.status === "fulfilled" && referralsRes.value?.data) {
          totalReferralsCount = referralsRes.value.data.count || referralsRes.value.data || totalReferralsCount
        }
      } catch (apiError) {
        console.warn("Some API endpoints failed, using calculated values:", apiError)
      }

      // Set enhanced stats
      setStats({
        totalUsers: calculatedStats.totalUsers,
        activeUsers: calculatedStats.activeUsers,
        inactiveUsers: calculatedStats.inactiveUsers,
        usersWithWallets: totalWalletsCount,
        totalBalance: calculatedStats.totalBalance,
        calculatorUsers: calculatorUsersCount,
        adminUsers: calculatedStats.adminUsers,
        regularUsers: calculatedStats.regularUsers,
        usersWithFirebase: calculatedStats.usersWithFirebase,
        usersWithSessions: calculatedStats.usersWithSessions,
        recentlyUpdated: calculatedStats.recentlyUpdated,
        totalReferrals: totalReferralsCount,
        growthMetrics,
        engagementMetrics,
      })
    } catch (err) {
      console.error("Failed to load users:", err)
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Enhanced refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true)
    setSuccessMessage("")
    setError(null)
    await loadUsers(false)
    setSuccessMessage("Data refreshed successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  // Enhanced user status change with better error handling using the updated API
  const handleUserStatusChange = async (userId, currentStatus) => {
    try {
      setRefreshing(true)
      setError(null)

      const isCurrentlyActive = currentStatus === "Active"
      const newStatus = !isCurrentlyActive

      // Use the enhanced updateUserStatus function from api.js
      const result = await userAPI.updateUserStatus(userId, newStatus)

      if (result && !result.success) {
        throw new Error(result.message || "Failed to update user status")
      }

      // Update users list immediately for better UX
      const updateUsersList = (prevUsers) => {
        return prevUsers.map((user) =>
          (user.id || user._id) === userId
            ? {
                ...user,
                isActive: newStatus,
                status: newStatus ? "Active" : "Banned",
              }
            : user,
        )
      }

      setUsers(updateUsersList)
      setFilteredUsers(updateUsersList)

      // Recalculate stats with updated data
      const updatedUserList = users.map((user) =>
        (user.id || user._id) === userId ? { ...user, isActive: newStatus } : user,
      )

      const calculatedStats = userHelpers.calculateStats(updatedUserList)
      const engagementMetrics = calculateEngagementMetrics(updatedUserList)

      setStats((prevStats) => ({
        ...prevStats,
        activeUsers: calculatedStats.activeUsers,
        inactiveUsers: calculatedStats.inactiveUsers,
        engagementMetrics,
      }))

      setSuccessMessage(`User ${newStatus ? "unbanned" : "banned"} successfully!`)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to update user status:", error)
      setError(`Failed to ${currentStatus === "Active" ? "ban" : "unban"} user: ${error.message}`)
    } finally {
      setRefreshing(false)
    }
  }

  // Enhanced filtering functionality
  const applyFilters = useCallback(() => {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          (user.inviteCode && user.inviteCode.toLowerCase().includes(searchLower)),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => {
        switch (statusFilter) {
          case "active":
            return user.isActive === true
          case "inactive":
            return user.isActive === false
          case "high-engagement":
            return userHelpers.getUserEngagementScore(user) >= 70
          case "low-engagement":
            return userHelpers.getUserEngagementScore(user) < 30
          default:
            return true
        }
      })
    }

    // Wallet filter
    if (walletFilter !== "all") {
      filtered = filtered.filter((user) => {
        const hasWallet = userHelpers.hasWallet(user)
        return walletFilter === "with-wallet" ? hasWallet : !hasWallet
      })
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, statusFilter, walletFilter])

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Initialize component
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Enhanced chart data generation
  const generateChartData = () => {
    if (!users.length) return []

    // Group users by month with better date handling
    const groupedByMonth = users.reduce((acc, user) => {
      const date = new Date(user.joinedDate || user.createdAt)
      if (isNaN(date.getTime())) return acc // Skip invalid dates

      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      acc[monthYear] = (acc[monthYear] || 0) + 1
      return acc
    }, {})

    // Sort by date and create chart data
    return Object.entries(groupedByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Show last 12 months
      .map(([monthYear, count]) => ({
        period: monthYear,
        count,
        displayName: new Date(monthYear + "-01").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
      }))
  }

  // Enhanced activity data with more metrics
  const generateActivityData = () => {
    return [
      { name: "Active Users", value: stats.activeUsers, color: "#10B981" },
      { name: "Inactive Users", value: stats.inactiveUsers, color: "#EF4444" },
      { name: "With Wallets", value: stats.usersWithWallets, color: "#3B82F6" },
      { name: "Calculator Users", value: stats.calculatorUsers, color: "#F59E0B" },
      { name: "Firebase Users", value: stats.usersWithFirebase, color: "#8B5CF6" },
      { name: "High Engagement", value: stats.engagementMetrics.highEngagementUsers, color: "#06B6D4" },
    ]
  }

  // Generate engagement distribution data
  const generateEngagementData = () => {
    const highEngagement = stats.engagementMetrics.highEngagementUsers
    const lowEngagement = stats.engagementMetrics.lowEngagementUsers
    const mediumEngagement = stats.totalUsers - highEngagement - lowEngagement

    return [
      { name: "High (70+)", value: highEngagement, color: "#10B981" },
      { name: "Medium (30-69)", value: mediumEngagement, color: "#F59E0B" },
      { name: "Low (<30)", value: lowEngagement, color: "#EF4444" },
    ]
  }

  const chartData = generateChartData()
  const activityData = generateActivityData()
  const engagementData = generateEngagementData()

  if (loading) {
    return <FullScreenLoader />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor your platform users • {stats.totalUsers} total users</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setShowTable(!showTable)}
            className="bg-[#0F82F4] hover:bg-[#0d6fd1] text-white rounded-md px-6 py-2 text-sm font-medium"
          >
            {showTable ? "View Analytics" : "View All Users"}
          </Button>
        </div>
      </div>

      {/* Role Indicator */}
      {!roleLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
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
          {isViewer && <span className="ml-2 text-xs bg-orange-200 px-2 py-1 rounded">Read Only</span>}
        </motion.div>
      )}

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">{successMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div>
                  <h3 className="font-medium text-red-900">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <DashboardStatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers.toString()}
          subtitle={`${stats.growthMetrics.newUsersLast30Days} this month`}
          trend={
            stats.growthMetrics.growthRate30Days >= 0
              ? `+${stats.growthMetrics.growthRate30Days.toFixed(1)}%`
              : `${stats.growthMetrics.growthRate30Days.toFixed(1)}%`
          }
        />
        <DashboardStatCard
          icon={UserCheck}
          label="Active Users"
          value={stats.activeUsers.toString()}
          subtitle={`${((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% active rate`}
          trend={stats.activeUsers > stats.totalUsers * 0.8 ? "+5%" : "-2%"}
        />
        <DashboardStatCard
          icon={Wallet}
          label="Wallet Connected"
          value={stats.usersWithWallets.toString()}
          subtitle={`${((stats.usersWithWallets / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% of users`}
          trend={stats.usersWithWallets > 0 ? "+8%" : "0%"}
        />
        <DashboardStatCard
          icon={Calculator}
          label="Calculator Users"
          value={stats.calculatorUsers.toString()}
          subtitle={`${((stats.calculatorUsers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% usage`}
          trend={stats.calculatorUsers > 0 ? "+3%" : "0%"}
        />
        <DashboardStatCard
          icon={Smartphone}
          label="Firebase Users"
          value={stats.usersWithFirebase.toString()}
          subtitle={`${((stats.usersWithFirebase / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% integrated`}
          trend={stats.usersWithFirebase > 0 ? "+12%" : "0%"}
        />
        <DashboardStatCard
          icon={Zap}
          label="Avg Engagement"
          value={`${stats.engagementMetrics.averageEngagementScore}/100`}
          subtitle={`${stats.engagementMetrics.highEngagementUsers} high performers`}
          trend={stats.engagementMetrics.averageEngagementScore > 50 ? "+7%" : "-3%"}
        />
      </div>

      {/* Filters Section (only show when table is visible) */}
      {showTable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or invite code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
                <option value="high-engagement">High Engagement</option>
                <option value="low-engagement">Low Engagement</option>
              </select>
              <select
                value={walletFilter}
                onChange={(e) => setWalletFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Wallets</option>
                <option value="with-wallet">With Wallet</option>
                <option value="without-wallet">Without Wallet</option>
              </select>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {showTable ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <DataTable
            data={filteredUsers.map((user) => ({
              ...user,
              name: user.name || "Unnamed",
              email: user.email,
              country: user.country,
              wallet: user.wallet,
              referral: user.referredBy,
              coins: user.coins,
              status: user.isActive ? "Active" : "Banned",
              role: user.role,
              calculatorUsage: user.calculatorUsage,
              lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never",
              engagementScore: userHelpers.getUserEngagementScore(user),
              activityStatus: userHelpers.getUserActivityStatus(user),
              hasWallet: userHelpers.hasWallet(user),
            }))}
            onView={
              canViewAll
                ? (userRow) => {
                    setSelectedUser(userRow)
                    setOpen(true)
                  }
                : undefined
            }
            onStatusChange={canEdit ? handleUserStatusChange : undefined}
            refreshing={refreshing}
            hideActions={!canViewAll}
            disableView={!canViewAll}
            userRole={userRole}
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* User Registration Chart */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">User Registration Trend</h3>
                    <p className="text-sm text-gray-600">Monthly user registration over time (last 12 months)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0F82F4]">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500">Total Users</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="displayName" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} domain={[0, "auto"]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(label) => `Period: ${label}`}
                      formatter={(value) => [value, "New Users"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#0F82F4"
                      strokeWidth={3}
                      name="New Users"
                      animationDuration={800}
                      dot={{ r: 5, fill: "#0F82F4" }}
                      activeDot={{ r: 7, fill: "#0d6fd1" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Activity Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">User Activity Breakdown</h3>
                    <p className="text-sm text-gray-600">Distribution of user activities and features</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Bar dataKey="value" fill="#0F82F4" radius={[4, 4, 0, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Engagement Distribution - Only for superadmin */}
          {canViewGraphs ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">User Engagement Distribution</h3>
                      <p className="text-sm text-gray-600">Breakdown of user engagement levels</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {stats.engagementMetrics.averageEngagementScore}
                      </p>
                      <p className="text-xs text-gray-500">Avg Score</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={800}
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Users"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-10">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Restricted Access</h3>
                    <p className="text-sm text-gray-600">Engagement metrics available for Super Admin only</p>
                    <div className="mt-3 px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full inline-block">
                      {userRole === "editor" ? "Editor" : "Viewer"} Role
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 opacity-20 blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">User Engagement Distribution</h3>
                      <p className="text-sm text-gray-600">Breakdown of user engagement levels</p>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Growth Metrics - Only for superadmin */}
          {canViewGraphs ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Growth Metrics</h3>
                      <p className="text-sm text-gray-600">Recent growth and activity statistics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">New Users Today</p>
                          <p className="text-2xl font-bold text-blue-600">{stats.growthMetrics.newUsersToday}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">New Users (7d)</p>
                          <p className="text-2xl font-bold text-green-600">{stats.growthMetrics.newUsersLast7Days}</p>
                        </div>
                        <Users className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Weekly Activity</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {stats.growthMetrics.weeklyActivityRate.toFixed(1)}%
                          </p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Growth Rate (30d)</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {stats.growthMetrics.growthRate30Days >= 0 ? "+" : ""}
                            {stats.growthMetrics.growthRate30Days.toFixed(1)}%
                          </p>
                        </div>
                        {stats.growthMetrics.growthRate30Days >= 0 ? (
                          <TrendingUp className="h-8 w-8 text-orange-500" />
                        ) : (
                          <TrendingDown className="h-8 w-8 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-10">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 00-2 2H9a2 2 0 00-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Restricted Access</h3>
                    <p className="text-sm text-gray-600">Growth metrics available for Super Admin only</p>
                    <div className="mt-3 px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full inline-block">
                      {userRole === "editor" ? "Editor" : "Viewer"} Role
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 opacity-20 blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Growth Metrics</h3>
                      <p className="text-sm text-gray-600">Recent growth and activity statistics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Enhanced User Modal */}
      <UserModal
        user={selectedUser}
        open={open}
        onClose={() => setOpen(false)}
        onStatusChange={
          canEdit
            ? (updatedUser) => {
                console.log("Status changed for user:", updatedUser)
                // Update the selected user immediately
                setSelectedUser(updatedUser)
                // Update both users lists with the new status
                const updateUsersList = (prevUsers) => {
                  return prevUsers.map((u) =>
                    (u.id || u._id) === (updatedUser.id || updatedUser._id)
                      ? {
                          ...u,
                          isActive: updatedUser.isActive,
                          status: updatedUser.isActive ? "Active" : "Banned",
                        }
                      : u,
                  )
                }
                setUsers(updateUsersList)
                setFilteredUsers(updateUsersList)
                // Recalculate stats with the updated user list
                const updatedUserList = users.map((user) =>
                  (user.id || user._id) === (updatedUser.id || updatedUser._id)
                    ? { ...user, isActive: updatedUser.isActive }
                    : user,
                )
                const calculatedStats = userHelpers.calculateStats(updatedUserList)
                const engagementMetrics = calculateEngagementMetrics(updatedUserList)
                setStats((prevStats) => ({
                  ...prevStats,
                  activeUsers: calculatedStats.activeUsers,
                  inactiveUsers: calculatedStats.inactiveUsers,
                  engagementMetrics,
                }))
                // Show success message
                setSuccessMessage(`User ${updatedUser.isActive ? "unbanned" : "banned"} successfully!`)
                setTimeout(() => setSuccessMessage(""), 3000)
              }
            : undefined
        }
        userRole={userRole}
        readOnly={!canEdit}
      />
    </div>
  )
}

export default ManagementPage
