"use client"

import { useState, useEffect } from "react"
import { DollarSign, Calculator, Users, TrendingUp, RefreshCw, Activity, BarChart3, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { userAPI } from "@/lib/api"
import CalculatorChart from "@/components/ui/charts/CalculatorChart"

export default function CalculatorPage() {
  const [calculatorUsers, setCalculatorUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCalculatorUsers: 0,
    totalCalculatorUsage: 0,
    averageUsage: 0,
    topUsers: [],
    usageGrowth: 0,
    recentActivity: 0,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch calculator users data
  const fetchCalculatorData = async () => {
    try {
      setLoading(true)
      setError("")
      // Fetch calculator users
      const calculatorResponse = await userAPI.getUsers()
      console.log("Calculator Response:", calculatorResponse)

      // Fetch all users for comprehensive stats
      const allUsersResponse = await userAPI.getUsers(1, 1000)
      const allUsers = allUsersResponse.data?.users || []

      if (calculatorResponse.success) {
        const calculatorUsersData = calculatorResponse.data || []
        setCalculatorUsers(calculatorUsersData)

        // Calculate comprehensive statistics
        const calculatorStats = calculateCalculatorStats(calculatorUsersData, allUsers)
        setStats(calculatorStats)
      } else {
        throw new Error(calculatorResponse.message || "Failed to fetch calculator data")
      }
    } catch (err) {
      console.error("Error fetching calculator data:", err)
      setError("Unable to load calculator data. Please try again.")
      // Set fallback stats
      setStats({
        totalUsers: 0,
        activeCalculatorUsers: 0,
        totalCalculatorUsage: 0,
        averageUsage: 0,
        topUsers: [],
        usageGrowth: 0,
        recentActivity: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate calculator statistics
  const calculateCalculatorStats = (calculatorUsers, allUsers) => {
    const activeCalculatorUsers = calculatorUsers.filter((user) => user.calculatorUsage > 0 && user.isActive !== false)
    const totalCalculatorUsage = calculatorUsers.reduce((sum, user) => sum + (user.calculatorUsage || 0), 0)
    const averageUsage = activeCalculatorUsers.length > 0 ? totalCalculatorUsage / activeCalculatorUsers.length : 0

    // Get top 5 calculator users
    const topUsers = [...calculatorUsers]
      .sort((a, b) => (b.calculatorUsage || 0) - (a.calculatorUsage || 0))
      .slice(0, 5)
      .map((user) => ({
        name: user.name || "Unknown User",
        email: user.email || "No email",
        usage: user.calculatorUsage || 0,
        isActive: user.isActive !== false,
      }))

    // Calculate growth (mock calculation - in real app, you'd compare with historical data)
    const usageGrowth = Math.floor(Math.random() * 20) + 5 // 5-25% growth

    // Recent activity (users who used calculator in last 7 days)
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentActivity = calculatorUsers.filter((user) => {
      const lastActivity = user.updatedAt || user.lastSignInAt
      return lastActivity && new Date(lastActivity) >= sevenDaysAgo && user.calculatorUsage > 0
    }).length

    return {
      totalUsers: allUsers.length,
      activeCalculatorUsers: activeCalculatorUsers.length,
      totalCalculatorUsage,
      averageUsage: Math.round(averageUsage * 100) / 100,
      topUsers,
      usageGrowth,
      recentActivity,
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchCalculatorData()
    setIsRefreshing(false)
  }

  // Load data on component mount
  useEffect(() => {
    fetchCalculatorData()
  }, [])

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num)
  }

  // Get usage level badge
  const getUsageBadge = (usage) => {
    if (usage >= 100) return <Badge className="bg-green-100 text-green-800 text-xs">Power User</Badge>
    if (usage >= 50) return <Badge className="bg-blue-100 text-blue-800 text-xs">Heavy User</Badge>
    if (usage >= 25) return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Regular User</Badge>
    if (usage >= 10) return <Badge className="bg-purple-100 text-purple-800 text-xs">Moderate User</Badge>
    return (
      <Badge variant="secondary" className="text-xs">
        Light User
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <Calculator className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600" />
              Calculator Analytics
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Monitor calculator usage and user engagement
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            className="self-start sm:self-auto text-sm px-3 py-2 bg-transparent"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh Data</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
        </div>

        {/* Enhanced Hero Card */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-xl sm:shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-white text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3">
              Calculator Users
            </h2>
            {loading ? (
              <div className="flex items-center text-white text-base sm:text-lg lg:text-xl opacity-90">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 animate-spin" />
                Loading...
              </div>
            ) : error ? (
              <p className="text-red-200 text-sm sm:text-base lg:text-lg">Unable to load data</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <p className="text-white text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold">
                  {formatNumber(stats.activeCalculatorUsers)} Active Users
                </p>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  {formatNumber(stats.totalCalculatorUsage)} Total Calculations
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                  <div className="flex items-center text-green-200">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                    <span className="font-semibold text-sm sm:text-base">+{stats.usageGrowth}% Growth</span>
                  </div>
                  <div className="flex items-center text-yellow-200">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                    <span className="text-sm sm:text-base">{stats.recentActivity} Recent Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Decorative Elements - Hidden on very small screens */}
          <div className="absolute right-2 sm:right-4 lg:right-8 top-1/2 transform -translate-y-1/2 hidden xs:flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
            {/* Animated Calculator */}
            <div className="relative group">
              <div className="w-10 h-12 sm:w-12 sm:h-14 lg:w-16 lg:h-20 xl:w-20 xl:h-24 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex flex-col items-center justify-center shadow-lg sm:shadow-xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                <div className="w-6 h-2 sm:w-8 sm:h-2.5 lg:w-10 lg:h-3 xl:w-12 xl:h-4 bg-white/40 rounded-sm mb-1 sm:mb-2"></div>
                <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 bg-white/60 rounded-sm animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Animated Chart Icon */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg sm:shadow-xl border border-white/30 hover:rotate-12 transition-transform duration-300">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8 text-white" />
            </div>

            {/* Animated Dollar Sign */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg sm:shadow-xl hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8 text-white font-bold animate-bounce" />
            </div>
          </div>

          {/* Enhanced Background Decorations */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  width: `${Math.random() * 6 + 3}px`,
                  height: `${Math.random() * 6 + 3}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total Users</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.activeCalculatorUsers} using calculator</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Active Calculator Users</CardTitle>
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {formatNumber(stats.activeCalculatorUsers)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalUsers > 0 ? Math.round((stats.activeCalculatorUsers / stats.totalUsers) * 100) : 0}% of
                total users
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total Calculations</CardTitle>
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {formatNumber(stats.totalCalculatorUsage)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Avg: {stats.averageUsage} per user</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Recent Activity</CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Users Section */}
        {stats.topUsers.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Top Calculator Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {stats.topUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs sm:text-sm font-semibold text-blue-600">#{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 ml-9 sm:ml-0">
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-sm sm:text-base text-gray-900">{user.usage} calculations</p>
                        <div className="mt-1">{getUsageBadge(user.usage)}</div>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${user.isActive ? "bg-green-500" : "bg-gray-400"}`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Chart Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Calculator Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600 mb-3" />
                <span className="text-sm sm:text-base text-gray-600">Loading chart data...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Unable to load chart data</p>
                <Button onClick={handleRefresh} variant="outline" size="sm" className="text-sm bg-transparent">
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <CalculatorChart data={calculatorUsers} stats={stats} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
