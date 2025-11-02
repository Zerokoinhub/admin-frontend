"use client"

import { useState, useEffect, useRef } from "react"
import { User, Calculator, TrendingUp, Activity } from "lucide-react"

export default function CalculatorChart({ data = [], stats = {} }) {
  const [hoveredBar, setHoveredBar] = useState(null)
  const [animatedHeights, setAnimatedHeights] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const animationRef = useRef(null)

  // Filter and prepare chart data from actual API response
  const chartData = data
    .filter((user) => user.calculatorUsage && user.calculatorUsage > 0)
    .sort((a, b) => (b.calculatorUsage || 0) - (a.calculatorUsage || 0))
    .slice(0, 20) // Show up to 20 users for better scalability
    .map((user, index) => ({
      id: user._id || user.id || `user-${index}-${Date.now()}`,
      name: user.name || `User ${index + 1}`,
      email: user.email || "No email",
      usage: user.calculatorUsage || 0,
      isActive: user.isActive !== false,
      shortName: (user.name || `User ${index + 1}`).split(" ")[0].substring(0, 8),
      balance: user.balance || 0,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      firebaseUid: user.firebaseUid,
    }))

  // Dynamic Y-axis calculation
  const maxUsage = Math.max(...chartData.map((d) => d.usage), 1)
  const yAxisMax = Math.ceil(maxUsage * 1.1) // Add 10% padding to the top
  const yAxisStep = Math.max(1, Math.ceil(yAxisMax / 5)) // Create 5 steps on Y-axis
  const yAxisValues = Array.from({ length: 6 }, (_, i) => Math.round((yAxisMax / 5) * i))

  // Dynamic chart dimensions based on number of users
  const chartHeight = 320 // Fixed height in pixels
  const minBarWidth = 30
  const maxBarWidth = 80
  const barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, Math.floor((600 - 40) / chartData.length)))
  const chartWidth = Math.max(400, chartData.length * (barWidth + 8) + 40) // Dynamic width

  // Height calculation based on dynamic Y-axis
  const getBarHeightPixels = (usage) => {
    const percentage = usage / yAxisMax
    const heightInPixels = Math.max(percentage * chartHeight, usage > 0 ? 8 : 0)
    return Math.min(heightInPixels, chartHeight) // Ensure bars don't exceed chart height
  }

  // Animation effect with pixel-based heights
  useEffect(() => {
    if (chartData.length === 0) return

    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }

    setIsAnimating(true)
    setAnimationComplete(false)

    // Initialize all heights to 0
    const initialHeights = {}
    chartData.forEach((user) => {
      initialHeights[user.id] = 0
    })
    setAnimatedHeights(initialHeights)

    // Start animation after a brief delay
    animationRef.current = setTimeout(() => {
      const targetHeights = {}
      chartData.forEach((user) => {
        targetHeights[user.id] = getBarHeightPixels(user.usage)
      })

      setAnimatedHeights(targetHeights)

      setTimeout(() => {
        setIsAnimating(false)
        setAnimationComplete(true)
      }, 1500)
    }, 200)

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [data.length, yAxisMax])

  const getUsageColor = (usage, isHovered = false) => {
    if (usage >= 100)
      return isHovered ? "bg-gradient-to-t from-green-600 to-green-500" : "bg-gradient-to-t from-green-500 to-green-400"
    if (usage >= 50)
      return isHovered ? "bg-gradient-to-t from-blue-600 to-blue-500" : "bg-gradient-to-t from-blue-500 to-blue-400"
    if (usage >= 25)
      return isHovered
        ? "bg-gradient-to-t from-yellow-600 to-yellow-500"
        : "bg-gradient-to-t from-yellow-500 to-yellow-400"
    if (usage >= 10)
      return isHovered
        ? "bg-gradient-to-t from-purple-600 to-purple-500"
        : "bg-gradient-to-t from-purple-500 to-purple-400"
    return isHovered ? "bg-gradient-to-t from-teal-600 to-teal-500" : "bg-gradient-to-t from-teal-500 to-teal-400"
  }

  const getUsageLevel = (usage) => {
    if (usage >= 100) return "Power User"
    if (usage >= 50) return "Heavy User"
    if (usage >= 25) return "Regular User"
    if (usage >= 10) return "Moderate User"
    return "Light User"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Never"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
        <div className="text-center py-8 sm:py-12">
          <div className="relative inline-block mb-4">
            <Calculator className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-xs text-red-600">0</span>
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Calculator Usage Data</h3>
          <p className="text-sm text-gray-500">No users have used the calculator yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Chart Header */}
      <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            Calculator Usage by User
          </h3>
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span className="font-medium">{chartData.length} Users</span>
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <span className="font-medium">{chartData.reduce((sum, user) => sum + user.usage, 0)} Total</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded-lg">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              <span className="font-medium">Max: {maxUsage}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 text-xs">
          {[
            { color: "bg-gradient-to-t from-green-500 to-green-400", label: "Power User", range: "100+" },
            { color: "bg-gradient-to-t from-blue-500 to-blue-400", label: "Heavy User", range: "50-99" },
            { color: "bg-gradient-to-t from-yellow-500 to-yellow-400", label: "Regular User", range: "25-49" },
            { color: "bg-gradient-to-t from-purple-500 to-purple-400", label: "Moderate User", range: "10-24" },
            { color: "bg-gradient-to-t from-teal-500 to-teal-400", label: "Light User", range: "1-9" },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-50 rounded-lg">
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${item.color} rounded-sm shadow-sm`}></div>
              <div>
                <span className="text-gray-700 font-medium block sm:inline">{item.label}</span>
                <span className="text-gray-500 block sm:inline sm:ml-1">({item.range})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Container with Horizontal Scroll for Many Users */}
      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto">
          <div className="relative" style={{ minWidth: `${chartWidth}px` }}>
            {/* Dynamic Y-axis Labels */}
            <div
              className="absolute left-0 top-0 flex flex-col justify-between text-xs text-gray-500 pr-3 sm:pr-4 z-10"
              style={{ height: `${chartHeight}px` }}
            >
              {yAxisValues.reverse().map((value, index) => (
                <span key={index} className="font-medium">
                  {value}
                </span>
              ))}
            </div>

            {/* Chart Area */}
            <div className="ml-8 sm:ml-12 lg:ml-16 relative">
              {/* Chart Background with Dynamic Grid */}
              <div
                className="border-l-2 border-b-2 border-gray-300 relative bg-gradient-to-t from-gray-50/50 to-white rounded-tl-lg"
                style={{ height: `${chartHeight}px` }}
              >
                {/* Horizontal Grid Lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio, index) => (
                  <div
                    key={index}
                    className="absolute left-0 right-0 border-t border-gray-200 border-dashed"
                    style={{ bottom: `${ratio * 100}%` }}
                  />
                ))}

                {/* Chart Bars Container */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-start px-2 gap-1 sm:gap-2">
                  {chartData.map((user, index) => {
                    const barHeightPx = animatedHeights[user.id] || 0
                    const isHovered = hoveredBar === index

                    return (
                      <div
                        key={user.id}
                        className="flex flex-col items-center relative group cursor-pointer"
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                        style={{ width: `${barWidth}px` }}
                      >
                        {/* Enhanced Tooltip */}
                        {isHovered && (
                          <div className="absolute bottom-full mb-3 bg-gray-900 text-white px-3 py-2.5 rounded-xl text-xs whitespace-nowrap z-30 shadow-2xl max-w-xs border border-gray-700">
                            <div className="space-y-1">
                              <div className="font-semibold text-blue-300 text-sm">{user.name}</div>
                              <div className="text-gray-300 truncate text-xs">{user.email}</div>
                              <div className="flex items-center gap-2 text-green-300 font-medium">
                                <Calculator className="w-3 h-3" />
                                {user.usage} calculations
                              </div>
                              <div className="text-yellow-300 text-xs">{getUsageLevel(user.usage)}</div>
                              {user.balance > 0 && (
                                <div className="text-purple-300 text-xs">Balance: {user.balance} coins</div>
                              )}
                              <div className="text-gray-400 text-xs border-t border-gray-700 pt-1 mt-1">
                                Joined: {formatDate(user.createdAt)}
                              </div>
                              {user.lastSignInAt && (
                                <div className="text-gray-400 text-xs">
                                  Last active: {formatDate(user.lastSignInAt)}
                                </div>
                              )}
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}

                        {/* User Status Indicator */}
                        <div
                          className={`absolute -top-1 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                            user.isActive ? "bg-green-400 shadow-green-200" : "bg-gray-400"
                          } z-10 shadow-lg border border-white`}
                        >
                          {user.isActive && (
                            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                          )}
                        </div>

                        {/* Dynamic Animated Bar */}
                        <div
                          className={`rounded-t-lg shadow-lg transition-all duration-1000 ease-out transform ${getUsageColor(
                            user.usage,
                            isHovered,
                          )} ${
                            isHovered
                              ? "scale-110 shadow-2xl ring-2 ring-blue-300 ring-opacity-50"
                              : "hover:scale-105 hover:shadow-xl"
                          } relative overflow-hidden`}
                          style={{
                            width: `${Math.max(barWidth - 8, 20)}px`,
                            height: `${barHeightPx}px`,
                            minHeight: barHeightPx > 0 ? "8px" : "0px",
                            maxHeight: `${chartHeight}px`, // Ensure bars don't exceed chart height
                            transition: `height 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms, transform 0.3s ease, box-shadow 0.3s ease`,
                          }}
                        >
                          {/* Shimmer Effect During Animation */}
                          {isAnimating && barHeightPx > 0 && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                          )}

                          {/* Usage count display on bar */}
                          {barHeightPx > 30 && animationComplete && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold drop-shadow-lg">{user.usage}</span>
                            </div>
                          )}

                          {/* Glow effect for high usage */}
                          {user.usage >= 50 && isHovered && (
                            <div className="absolute inset-0 bg-white/10 rounded-t-lg"></div>
                          )}
                        </div>

                        {/* Usage count below bar for small bars */}
                        {barHeightPx <= 30 && barHeightPx > 0 && animationComplete && (
                          <div className="absolute -top-5 sm:-top-6 text-xs font-semibold text-gray-700 bg-white px-1 rounded shadow-sm">
                            {user.usage}
                          </div>
                        )}

                        {/* User name label */}
                        <div className="mt-2 text-center" style={{ width: `${barWidth}px` }}>
                          <div className="font-medium truncate text-xs" title={user.name}>
                            {user.shortName}
                          </div>
                          <div className={`text-xs mt-0.5 ${user.isActive ? "text-green-600" : "text-gray-400"}`}>
                            <div
                              className={`w-1.5 h-1.5 rounded-full mx-auto ${user.isActive ? "bg-green-500" : "bg-gray-400"}`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Stats */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
          {[
            {
              value: stats.activeCalculatorUsers || chartData.length,
              label: "Active Users",
              color: "text-blue-600",
              bg: "bg-blue-50",
              icon: User,
            },
            {
              value: stats.totalCalculatorUsage || chartData.reduce((sum, user) => sum + user.usage, 0),
              label: "Total Uses",
              color: "text-green-600",
              bg: "bg-green-50",
              icon: Calculator,
            },
            {
              value:
                stats.averageUsage ||
                Math.round(chartData.reduce((sum, user) => sum + user.usage, 0) / chartData.length),
              label: "Avg per User",
              color: "text-purple-600",
              bg: "bg-purple-50",
              icon: TrendingUp,
            },
            {
              value: maxUsage,
              label: "Highest Usage",
              color: "text-orange-600",
              bg: "bg-orange-50",
              icon: Activity,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`text-center p-3 sm:p-4 rounded-xl ${stat.bg} border border-gray-100 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-center mb-2">
                <div className={`p-1.5 rounded-lg bg-white shadow-sm`}>
                  {stat.icon && <stat.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${stat.color}`} />}
                </div>
              </div>
              <div className={`text-lg sm:text-xl font-bold ${stat.color}`}>
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
