"use client"

import { useEffect, useState } from "react"
import RewardRevenueChart from "./charts/RewardRevenueChart"
import UserGrowthChart from "./charts/UserGrowthChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  HandCoins,
  Calculator,
  Wallet,
  BadgePercent,
  Shield,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  UserCheck,
  UserX,
  Crown,
} from "lucide-react"
import { userAPI, userHelpers } from "@/lib/api"

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalReferrals: 0,
    calculatorUsers: 0,
    totalRevenue: 0,
    totalCoinDistribution: 0,
    usersWithWallets: 0,
    adminUsers: 0,
    regularUsers: 0,
    growthMetrics: {
      newUsersLast30Days: 0,
      newUsersLast7Days: 0,
      growthRate30Days: 0,
      growthRate7Days: 0,
    },
  })

  const [users, setUsers] = useState([])
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState("")
  const [roleDisplayName, setRoleDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get user data from localStorage
  const getUserData = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const userData = JSON.parse(userStr)
          return {
            id: userData.id || "",
            username: userData.username || "",
            email: userData.email || "",
            role: userData.role?.toLowerCase() || "",
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
        return "Super Admin"
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

  // Check if user has permission to view revenue data
  const canViewRevenue = (role) => {
    return role === "superadmin" || role === "admin"
  }

  // Get permissions description
  const getPermissionsDescription = (role) => {
    switch (role) {
      case "superadmin":
      case "admin":
        return "Full Dashboard Access"
      case "editor":
        return "Limited Access (No Revenue Data)"
      case "viewer":
        return "Limited Access (No Revenue Data)"
      default:
        return "No Permissions"
    }
  }

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (num) => {
    return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`
  }

  useEffect(() => {
    const userData = getUserData()
    setUserName(userData.username)
    setUserEmail(userData.email)
    setUserRole(userData.role)
    setRoleDisplayName(getRoleDisplayName(userData.role))

    async function loadDashboardData() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all users with a higher limit to get comprehensive data
        const usersResponse = await userAPI.getUsers(1, 1000)
        const usersData = usersResponse.data?.users || []

        // Calculate comprehensive stats
        const stats = userHelpers.calculateStats(usersData)
        const growthMetrics = userHelpers.calculateGrowthMetrics(usersData)

        // Try to get additional data from specific endpoints
        let calculatorUsersCount = stats.calculatorUsers
        let totalWalletsCount = stats.usersWithWallets
        let totalReferralsCount = stats.totalReferrals

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

        setDashboardStats({
          totalUsers: stats.totalUsers,
          activeUsers: stats.activeUsers,
          inactiveUsers: stats.inactiveUsers,
          totalReferrals: totalReferralsCount,
          calculatorUsers: calculatorUsersCount,
          totalRevenue: stats.totalRevenue,
          totalCoinDistribution: stats.totalBalance,
          usersWithWallets: totalWalletsCount,
          adminUsers: stats.adminUsers,
          regularUsers: stats.regularUsers,
          growthMetrics,
        })

        setUsers(usersData)
      } catch (error) {
        console.error("Failed to load dashboard stats:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const colorScheme = getRoleColorScheme(userRole)

  const stats = [
    {
      label: "Total Users",
      value: dashboardStats.totalUsers,
      icon: <Users className="h-5 w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: formatPercentage(dashboardStats.growthMetrics.growthRate30Days),
      changeType: dashboardStats.growthMetrics.growthRate30Days >= 0 ? "positive" : "negative",
    },
    {
      label: "Active Users",
      value: dashboardStats.activeUsers,
      icon: <UserCheck className="h-5 w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: `${dashboardStats.totalUsers > 0 ? ((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100).toFixed(1) : 0}%`,
      changeType: "neutral",
    },
    {
      label: "Users with Wallets",
      value: dashboardStats.usersWithWallets,
      icon: <Wallet className="h-5 w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      change: `${dashboardStats.totalUsers > 0 ? ((dashboardStats.usersWithWallets / dashboardStats.totalUsers) * 100).toFixed(1) : 0}%`,
      changeType: "neutral",
    },
    {
      label: "Total Referrals",
      value: dashboardStats.totalReferrals,
      icon: <BadgePercent className="h-5 w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      change: `${dashboardStats.totalUsers > 0 ? ((dashboardStats.totalReferrals / dashboardStats.totalUsers) * 100).toFixed(1) : 0}%`,
      changeType: "neutral",
    },
    {
      label: "Calculator Users",
      value: dashboardStats.calculatorUsers,
      icon: <Calculator className="h-5 w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      change: `${dashboardStats.totalUsers > 0 ? ((dashboardStats.calculatorUsers / dashboardStats.totalUsers) * 100).toFixed(1) : 0}%`,
      changeType: "neutral",
    },
    {
      label: "Admin Users",
      value: dashboardStats.adminUsers,
      icon: <Crown className="h-5 w-5" />,
      allowedRoles: ["superadmin", "admin"],
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      change: `${dashboardStats.totalUsers > 0 ? ((dashboardStats.adminUsers / dashboardStats.totalUsers) * 100).toFixed(1) : 0}%`,
      changeType: "neutral",
    },
    {
      label: "Inactive Users",
      value: dashboardStats.inactiveUsers,
      icon: <UserX className="h-5 w-5" />,
      allowedRoles: ["superadmin", "admin", "editor"],
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      change: `${dashboardStats.totalUsers > 0 ? ((dashboardStats.inactiveUsers / dashboardStats.totalUsers) * 100).toFixed(1) : 0}%`,
      changeType: dashboardStats.inactiveUsers > dashboardStats.activeUsers * 0.1 ? "negative" : "neutral",
    },
    {
      label: "Total Revenue",
      value: dashboardStats.totalRevenue,
      icon: <DollarSign className="h-5 w-5" />,
      allowedRoles: ["superadmin", "admin"],
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      change: "+23%",
      changeType: "positive",
      isRevenue: true,
    },
    {
      label: "Coin Distribution",
      value: dashboardStats.totalCoinDistribution,
      icon: <HandCoins className="h-5 w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      change: "+5%",
      changeType: "positive",
    },
  ]

  // Filter stats based on user role
  const filteredStats = stats.filter((stat) => {
    return stat.allowedRoles.includes(userRole)
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Dashboard</h2>
          <p className="text-gray-600 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show error state if no user data
  if (!userName || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
          <p className="text-gray-600 max-w-md">
            Unable to load user data from localStorage. Please log in again to access the dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className={`${colorScheme.bg} border-b border-gray-200/50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <Activity className={`h-6 w-6 ${colorScheme.accent}`} />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Welcome back, <span className={colorScheme.accent}>{userName}</span> 👋
                  </h1>
                  <p className="text-gray-600 text-sm lg:text-base">Here's what's happening with your platform today</p>
                  {userEmail && <p className="text-xs text-gray-500 mt-1">{userEmail}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Badge variant="outline" className={`${colorScheme.badge} px-3 py-1.5 font-medium`}>
                <Shield className="h-3 w-3 mr-2" />
                {roleDisplayName}
              </Badge>
              <div className="text-sm text-gray-600 bg-white/60 px-3 py-1.5 rounded-lg">
                {getPermissionsDescription(userRole)}
              </div>
            </div>
          </div>

          {/* Growth Metrics Summary */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-600">New Users (7 days)</p>
              <p className="text-lg font-semibold text-gray-900">{dashboardStats.growthMetrics.newUsersLast7Days}</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-600">New Users (30 days)</p>
              <p className="text-lg font-semibold text-gray-900">{dashboardStats.growthMetrics.newUsersLast30Days}</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-600">Growth Rate (7d)</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatPercentage(dashboardStats.growthMetrics.growthRate7Days)}
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-600">Growth Rate (30d)</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatPercentage(dashboardStats.growthMetrics.growthRate30Days)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Revenue Access Notice */}
        {!canViewRevenue(userRole) && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <EyeOff className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-amber-900 mb-1">Limited Access Notice</h3>
                <p className="text-sm text-amber-800">
                  Revenue data and financial analytics are restricted to Admin users only. Contact your administrator if
                  you need access to this information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredStats.map((item, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
              />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center`}>
                    <div className={item.textColor}>{item.icon}</div>
                  </div>
                  {item.isRevenue && <Badge className="bg-red-100 text-red-800 text-xs px-2 py-1">Admin Only</Badge>}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900">
                      {item.isRevenue ? formatCurrency(item.value) : formatNumber(item.value)}
                    </p>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${
                        item.changeType === "positive"
                          ? "text-green-600"
                          : item.changeType === "negative"
                            ? "text-red-600"
                            : "text-gray-500"
                      }`}
                    >
                      {item.changeType === "positive" && <TrendingUp className="h-3 w-3" />}
                      {item.changeType === "negative" && <TrendingDown className="h-3 w-3" />}
                      {item.change}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* User Growth Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">User Growth</CardTitle>
                  <p className="text-sm text-gray-600">Track user registration over time</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px] w-full">
                <UserGrowthChart users={users} />
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart or Placeholder */}
          {canViewRevenue(userRole) ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">Revenue Analytics</CardTitle>
                    <p className="text-sm text-gray-600">Financial performance overview</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-red-600" />
                    </div>
                    <Badge className="bg-red-100 text-red-800 text-xs">Admin Only</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px] w-full">
                  <RewardRevenueChart users={users} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
              <CardContent className="p-8 h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <EyeOff className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Revenue Analytics</h3>
                <p className="text-gray-500 mb-6 max-w-sm leading-relaxed">
                  This section contains sensitive financial data and is only accessible to Admin users.
                </p>
                <div className="space-y-3">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-4 py-2">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Access Required
                  </Badge>
                  <p className="text-xs text-gray-400">Contact your system administrator for access</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              System Status: Online
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
