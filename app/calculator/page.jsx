"use client"

import { useState, useEffect } from "react"
import { DollarSign, Calculator, Users, TrendingUp, RefreshCw, Activity, BarChart3, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { userAPI , userHelpers} from "@/lib/api"
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
    if (usage >= 100) return <Badge className="bg-green-100 text-green-800">Power User</Badge>
    if (usage >= 50) return <Badge className="bg-blue-100 text-blue-800">Heavy User</Badge>
    if (usage >= 25) return <Badge className="bg-yellow-100 text-yellow-800">Regular User</Badge>
    if (usage >= 10) return <Badge className="bg-purple-100 text-purple-800">Moderate User</Badge>
    return <Badge variant="secondary">Light User</Badge>
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
      {/* Enhanced Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              Calculator Analytics
            </h1>
            <p className="text-gray-600 mt-2">Monitor calculator usage and user engagement</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing} className="self-start sm:self-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Enhanced Hero Card */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-white text-3xl sm:text-4xl font-bold mb-3">Calculator Users</h2>
          {loading ? (
            <div className="flex items-center text-white text-xl opacity-90">
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Loading...
            </div>
          ) : error ? (
            <p className="text-red-200 text-lg">Unable to load data</p>
          ) : (
            <div className="space-y-2">
              <p className="text-white text-2xl sm:text-3xl font-semibold">
                {formatNumber(stats.activeCalculatorUsers)} Active Users
              </p>
              <p className="text-blue-100 text-lg">{formatNumber(stats.totalCalculatorUsage)} Total Calculations</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center text-green-200">
                  <TrendingUp className="w-5 h-5 mr-1" />
                  <span className="font-semibold">+{stats.usageGrowth}% Growth</span>
                </div>
                <div className="flex items-center text-yellow-200">
                  <Activity className="w-5 h-5 mr-1" />
                  <span>{stats.recentActivity} Recent Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Decorative Elements */}
        <div className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 flex items-center space-x-3 sm:space-x-6">
          {/* Animated Calculator */}
          <div className="relative group">
            <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white/20 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center shadow-xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
              <div className="w-10 h-3 sm:w-12 sm:h-4 bg-white/40 rounded-sm mb-2"></div>
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/60 rounded-sm animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Animated Chart Icon */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl border border-white/30 hover:rotate-12 transition-transform duration-300">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>

          {/* Animated Dollar Sign */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white font-bold animate-bounce" />
          </div>
        </div>

        {/* Enhanced Background Decorations */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" ></Users>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">{stats.activeCalculatorUsers} using calculator</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Calculator Users</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.activeCalculatorUsers)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round((stats.activeCalculatorUsers / stats.totalUsers) * 100) : 0}% of total
              users
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calculations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNumber(stats.totalCalculatorUsage)}</div>
            <p className="text-xs text-muted-foreground">Avg: {stats.averageUsage} per user</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Active in last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Users Section */}
      {stats.topUsers.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Calculator Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{user.usage} calculations</p>
                      {getUsageBadge(user.usage)}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-gray-400"}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Calculator Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading chart data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Unable to load chart data</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : (
            <CalculatorChart data={calculatorUsers} stats={stats} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
