"use client"

import { useEffect, useState } from "react"
import DashboardStatCard from "../../src/components/ui/StatCard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Wallet, Coins, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts"
import { motion } from "framer-motion"
import DataTable from "../../src/components/ui/tables/DataTable"
import UserModal from "../../src/components/ui/modals/UserModal"
import { userAPI, userHelpers } from "@/lib/api"
import FullScreenLoader from "../../src/components/ui/FullScreenLoader"

const Page = () => {
  const [users, setUsers] = useState([])
  const [showTable, setShowTable] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithWallets: 0,
    totalBalance: 0,
    activeUsers: 0,
    calculatorUsers: 0,
  })

  const loadUsers = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      setError(null)

      // Fetch users with higher limit to get more comprehensive data
      const res = await userAPI.getUsers(1, 1000)
      const allUsers = res.data?.users || []

      // Filter only regular users (not admins)
      const userList = allUsers.filter((user) => user.role === "user")
      const formattedUsers = userHelpers.formatUserList(userList)

      setUsers(formattedUsers)

      // Calculate comprehensive stats
      const calculated = userHelpers.calculateStats(userList)
      setStats({
        totalUsers: calculated.totalUsers,
        usersWithWallets: calculated.usersWithWallets,
        totalBalance: calculated.totalBalance,
        activeUsers: calculated.activeUsers,
        calculatorUsers: calculated.calculatorUsers,
      })
    } catch (err) {
      console.error("Failed to load users:", err)
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setSuccessMessage("")
    setError(null)
    await loadUsers(false)
    setSuccessMessage("Data refreshed successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleUserStatusChange = async (userId, currentStatus) => {
    try {
      setRefreshing(true)
      setError(null)

      const isCurrentlyActive = currentStatus === "Active"
      const newStatus = !isCurrentlyActive

      // Call the appropriate API
      if (isCurrentlyActive) {
        await userAPI.banUser(userId)
      } else {
        await userAPI.unbanUser(userId)
      }

      // Update the users list immediately for better UX
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isActive: newStatus, status: newStatus ? "Active" : "Banned" } : user,
        ),
      )

      // Recalculate stats
      const updatedUserList = users.map((user) => (user.id === userId ? { ...user, isActive: newStatus } : user))

      const calculated = userHelpers.calculateStats(updatedUserList)
      setStats({
        totalUsers: calculated.totalUsers,
        usersWithWallets: calculated.usersWithWallets,
        totalBalance: calculated.totalBalance,
        activeUsers: calculated.activeUsers,
        calculatorUsers: calculated.calculatorUsers,
      })

      setSuccessMessage(`User ${newStatus ? "unbanned" : "banned"} successfully!`)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to update user status:", error)
      setError(`Failed to ${currentStatus === "Active" ? "ban" : "unban"} user: ${error.message}`)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Generate chart data for user registration over time
  const generateChartData = () => {
    if (!users.length) return []

    // Group users by month for better granularity
    const groupedByMonth = users.reduce((acc, user) => {
      const date = new Date(user.joinedDate)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      acc[monthYear] = (acc[monthYear] || 0) + 1
      return acc
    }, {})

    // Sort by date and create chart data
    return Object.entries(groupedByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthYear, count]) => ({
        period: monthYear,
        count,
        displayName: new Date(monthYear + "-01").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
      }))
  }

  // Generate activity chart data
  const generateActivityData = () => {
    const activeCount = users.filter((user) => user.isActive).length
    const inactiveCount = users.length - activeCount
    const withWallets = stats.usersWithWallets
    const withoutWallets = stats.totalUsers - withWallets
    const calculatorUsers = stats.calculatorUsers
    const nonCalculatorUsers = stats.totalUsers - calculatorUsers

    return [
      { name: "Active Users", value: activeCount, color: "#10B981" },
      { name: "Inactive Users", value: inactiveCount, color: "#EF4444" },
      { name: "With Wallets", value: withWallets, color: "#3B82F6" },
      { name: "Without Wallets", value: withoutWallets, color: "#6B7280" },
      { name: "Calculator Users", value: calculatorUsers, color: "#F59E0B" },
      { name: "Non-Calculator", value: nonCalculatorUsers, color: "#8B5CF6" },
    ]
  }

  const chartData = generateChartData()
  const activityData = generateActivityData()

  if (loading) {
    return <FullScreenLoader />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor your platform users</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            onClick={() => setShowTable(!showTable)}
            className="bg-[#0F82F4] hover:bg-[#0d6fd1] text-white rounded-md px-6 py-2 text-sm font-medium"
          >
            {showTable ? "View Analytics" : "View All Users"}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <Button onClick={() => loadUsers()} variant="outline" size="sm" className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      {/* Enhanced Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardStatCard
          icon={User}
          label="Total Users"
          value={stats.totalUsers.toString()}
          subtitle={`${stats.activeUsers} active`}
          trend={stats.totalUsers > 0 ? "+12%" : "0%"}
        />
        <DashboardStatCard
          icon={Wallet}
          label="Wallet Connected"
          value={stats.usersWithWallets.toString()}
          subtitle={`${((stats.usersWithWallets / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% of users`}
          trend={stats.usersWithWallets > 0 ? "+8%" : "0%"}
        />
        <DashboardStatCard
          icon={Coins}
          label="Total Coins"
          value={stats.totalBalance.toLocaleString()}
          subtitle="Distributed"
          trend="+15%"
        />
        <DashboardStatCard
          icon={User}
          label="Active Users"
          value={stats.activeUsers.toString()}
          subtitle={`${((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% active rate`}
          trend={stats.activeUsers > stats.totalUsers * 0.8 ? "+5%" : "-2%"}
        />
        <DashboardStatCard
          icon={User}
          label="Calculator Users"
          value={stats.calculatorUsers.toString()}
          subtitle={`${((stats.calculatorUsers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% usage`}
          trend={stats.calculatorUsers > 0 ? "+3%" : "0%"}
        />
      </div>

      {/* Main Content */}
      {showTable ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <DataTable
            data={users.map((user) => ({
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
            }))}
            onView={(userRow) => {
              setSelectedUser(userRow)
              setOpen(true)
            }}
            onStatusChange={handleUserStatusChange}
            refreshing={refreshing}
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
                    <p className="text-sm text-gray-600">Monthly user registration over time</p>
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
        </div>
      )}

      {/* User Modal */}
      <UserModal
        user={selectedUser}
        open={open}
        onClose={() => setOpen(false)}
        onStatusChange={(updatedUser) => {
          console.log("Status changed for user:", updatedUser) // Debug log

          // Update the selected user immediately
          setSelectedUser(updatedUser)

          // Update the users list with the new status - this is the key fix
          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.map((u) =>
              u.id === updatedUser.id
                ? {
                    ...u,
                    isActive: updatedUser.isActive,
                    status: updatedUser.isActive ? "Active" : "Banned",
                  }
                : u,
            )

            // Recalculate stats with the updated user list
            const calculated = userHelpers.calculateStats(updatedUsers.filter((user) => user.role === "user"))
            setStats({
              totalUsers: calculated.totalUsers,
              usersWithWallets: calculated.usersWithWallets,
              totalBalance: calculated.totalBalance,
              activeUsers: calculated.activeUsers,
              calculatorUsers: calculated.calculatorUsers,
            })

            return updatedUsers
          })

          // Show success message
          setSuccessMessage(`User ${updatedUser.isActive ? "unbanned" : "banned"} successfully!`)
          setTimeout(() => setSuccessMessage(""), 3000)
        }}
      />
    </div>
  )
}

export default Page
