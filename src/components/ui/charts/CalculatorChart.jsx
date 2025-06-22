"use client"

import { useState, useEffect } from "react"
import { User, Calculator, TrendingUp } from "lucide-react"

export default function CalculatorChart({ data = [], stats = {} }) {
  const [hoveredBar, setHoveredBar] = useState(null)
  const [animatedHeights, setAnimatedHeights] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)

  // Filter and prepare chart data from actual API response
  const chartData = data
    .filter((user) => user.calculatorUsage && user.calculatorUsage > 0)
    .sort((a, b) => (b.calculatorUsage || 0) - (a.calculatorUsage || 0))
    .slice(0, 12) // Show top 12 users for better visibility
    .map((user, index) => ({
      id: user._id || user.id,
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

  const maxUsage = Math.max(...chartData.map((d) => d.usage), 1)

  const getBarHeight = (usage) => {
    const percentage = (usage / maxUsage) * 75
    return Math.max(percentage, 5)
  }

  // Animation effect
  useEffect(() => {
    if (chartData.length > 0) {
      setIsAnimating(true)
      const newHeights = {}

      // Start with 0 height
      chartData.forEach((user) => {
        newHeights[user.id] = 0
      })
      setAnimatedHeights(newHeights)

      // Animate to full height with staggered timing
      const animateBar = (index) => {
        setTimeout(() => {
          setAnimatedHeights((prev) => ({
            ...prev,
            [chartData[index].id]: getBarHeight(chartData[index].usage),
          }))

          if (index === chartData.length - 1) {
            setTimeout(() => setIsAnimating(false), 300)
          }
        }, index * 150) // Stagger animation by 150ms per bar
      }

      chartData.forEach((_, index) => animateBar(index))
    }
  }, [data])

  const getUsageColor = (usage) => {
    if (usage >= 100) return "bg-gradient-to-t from-green-500 to-green-400"
    if (usage >= 50) return "bg-gradient-to-t from-blue-500 to-blue-400"
    if (usage >= 25) return "bg-gradient-to-t from-yellow-500 to-yellow-400"
    if (usage >= 10) return "bg-gradient-to-t from-purple-500 to-purple-400"
    return "bg-gradient-to-t from-teal-500 to-teal-400"
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
    return new Date(dateString).toLocaleDateString()
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Calculator Usage Data</h3>
          <p className="text-gray-500">No users have used the calculator yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      {/* Chart Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Calculator Usage by User
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{chartData.length} Users</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{chartData.reduce((sum, user) => sum + user.usage, 0)} Total Uses</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-t from-green-500 to-green-400 rounded-sm"></div>
            <span className="text-gray-600">Power User (100+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm"></div>
            <span className="text-gray-600">Heavy User (50-99)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-sm"></div>
            <span className="text-gray-600">Regular User (25-49)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-t from-purple-500 to-purple-400 rounded-sm"></div>
            <span className="text-gray-600">Moderate User (10-24)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-t from-teal-500 to-teal-400 rounded-sm"></div>
            <span className="text-gray-600">Light User (1-9)</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 h-80 flex flex-col justify-between text-xs text-gray-500 pr-6 z-10">
          <span>{maxUsage}</span>
          <span>{Math.floor(maxUsage * 0.75)}</span>
          <span>{Math.floor(maxUsage * 0.5)}</span>
          <span>{Math.floor(maxUsage * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart Area */}
        <div className="ml-16 relative">
          {/* Chart Background with Grid */}
          <div className="h-80 border-l-2 border-b-2 border-gray-200 relative bg-gradient-to-t from-gray-50 to-white">
            {/* Horizontal Grid Lines */}
            {[0.25, 0.5, 0.75].map((ratio, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 border-t border-gray-100"
                style={{ bottom: `${ratio * 100}%` }}
              />
            ))}

            {/* Chart Bars Container */}
            <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-2">
              {chartData.map((user, index) => (
                <div
                  key={user.id}
                  className="flex flex-col items-center relative group cursor-pointer flex-1 max-w-[80px]"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Enhanced Tooltip with real user data */}
                  {hoveredBar === index && (
                    <div className="absolute bottom-full mb-3 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap z-20 shadow-lg max-w-xs">
                      <div className="font-semibold text-blue-300">{user.name}</div>
                      <div className="text-gray-300 truncate">{user.email}</div>
                      <div className="text-green-300 font-medium">{user.usage} calculations</div>
                      <div className="text-yellow-300">{getUsageLevel(user.usage)}</div>
                      {user.balance > 0 && <div className="text-purple-300">Balance: {user.balance} coins</div>}
                      <div className="text-gray-400">Joined: {formatDate(user.createdAt)}</div>
                      {user.lastSignInAt && (
                        <div className="text-gray-400">Last active: {formatDate(user.lastSignInAt)}</div>
                      )}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}

                  {/* User Status Indicator */}
                  <div
                    className={`absolute -top-2 right-1 w-2 h-2 rounded-full ${user.isActive ? "bg-green-400" : "bg-gray-400"} z-10 shadow-sm`}
                  ></div>

                  {/* Bar */}
                  <div
                    className={`w-8 sm:w-10 rounded-t-lg shadow-lg transition-all duration-700 ease-out transform ${getUsageColor(
                      user.usage,
                    )} ${
                      hoveredBar === index
                        ? "scale-110 shadow-xl ring-2 ring-blue-300"
                        : "hover:scale-105 hover:shadow-lg"
                    } ${isAnimating ? "animate-pulse" : ""}`}
                    style={{
                      height: `${animatedHeights[user.id] || 0}%`,
                      minHeight: animatedHeights[user.id] > 0 ? "8px" : "0px",
                      transition: "height 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease",
                    }}
                  >
                    {/* Usage count display on bar */}
                    {animatedHeights[user.id] > 15 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-bold drop-shadow-sm">{user.usage}</span>
                      </div>
                    )}
                  </div>

                  {/* Usage count below bar for small bars */}
                  {animatedHeights[user.id] <= 15 && animatedHeights[user.id] > 0 && (
                    <div className="absolute -top-6 text-xs font-semibold text-gray-700">{user.usage}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* X-axis Labels */}
          <div className="flex justify-between text-xs text-gray-600 mt-3 px-2">
            {chartData.map((user, index) => (
              <div key={user.id} className="text-center flex-1 max-w-[80px]">
                <div className="font-medium truncate" title={user.name}>
                  {user.shortName}
                </div>
                <div className={`text-xs mt-1 ${user.isActive ? "text-green-600" : "text-gray-400"}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats using real API data */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{stats.activeCalculatorUsers || chartData.length}</div>
          <div className="text-xs text-gray-600">Active Users</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {stats.totalCalculatorUsage || chartData.reduce((sum, user) => sum + user.usage, 0)}
          </div>
          <div className="text-xs text-gray-600">Total Uses</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {stats.averageUsage || Math.round(chartData.reduce((sum, user) => sum + user.usage, 0) / chartData.length)}
          </div>
          <div className="text-xs text-gray-600">Avg per User</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">{maxUsage}</div>
          <div className="text-xs text-gray-600">Highest Usage</div>
        </div>
      </div>
    </div>
  )
}
