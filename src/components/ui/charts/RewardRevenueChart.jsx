"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

// Props type
const RewardRevenueChart = ({ users = [] }) => {
  const [animationKey, setAnimationKey] = useState(0)
  const [currentValue, setCurrentValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredBar, setHoveredBar] = useState(null)

  // Generate chart data from user `createdAt`
  const chartData = generateChartData(users)
  const totalRewardValue = users.length * 10 // Example reward logic
  const targetValue = totalRewardValue

  // Animate value on mount/update
  useEffect(() => {
    setIsVisible(true)
    const duration = 2500
    const steps = 60
    const increment = targetValue / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      setCurrentValue(increment * step)
      if (step >= steps) {
        setCurrentValue(targetValue)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [animationKey, targetValue])

  const handleRefresh = () => {
    setAnimationKey((prev) => prev + 1)
    setCurrentValue(0)
    setIsVisible(false)
    setHoveredBar(null)
    setTimeout(() => setIsVisible(true), 100)
  }

  // Generate chart data logic
  function generateChartData(users) {
    const dayMap = {}
    const now = new Date()

    users.forEach((user) => {
      const created = new Date(user.createdAt)
      const day = Math.floor((now - created) / (1000 * 60 * 60 * 24))
      const label = `Day ${9 - day}`

      if (!dayMap[label]) {
        dayMap[label] = { baseRewards: 0, bonusRewards: 0, projectedRewards: 0 }
      }

      // Example logic — customize as needed
      dayMap[label].baseRewards += 5
      dayMap[label].bonusRewards += 2
      dayMap[label].projectedRewards += 7
    })

    const result = []
    for (let i = 1; i <= 9; i++) {
      const label = `Day ${i}`
      result.push({
        period: label,
        ...(dayMap[label] || {
          baseRewards: 0,
          bonusRewards: 0,
          projectedRewards: 0,
        }),
      })
    }

    return result
  }

  return (
    <Card className="rounded-xl sm:rounded-2xl  duration-300 h-[300px] sm:h-[350px] md:h-[800px] lg:h-[51vh] min-h-[280px]">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pb-3 sm:pb-4 px-4 sm:px-6">
        <CardTitle
          className={`text-lg sm:text-xl lg:text-2xl font-bold transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95"
          }`}
        >
          Rewards Revenue
        </CardTitle>
        <button
          onClick={handleRefresh}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-lg transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:shadow-md active:scale-95 font-medium touch-manipulation"
        >
          <span className="inline-flex items-center gap-1 sm:gap-2">
            <span className="text-sm sm:text-base">🔄</span>
            <span>Refresh</span>
          </span>
        </button>
      </CardHeader>

      <CardContent className="pt-0 px-3 sm:px-6 pb-4 sm:pb-6 h-[calc(100%-4rem)] sm:h-[calc(100%-4.5rem)] lg:h-[calc(100%-5rem)]">
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              key={animationKey}
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 5,
                bottom: 5,
                // Responsive margins
                ...(window.innerWidth < 640 && {
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 0,
                }),
              }}
              onMouseMove={(e) => e?.activeLabel && setHoveredBar(e.activeLabel)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: window.innerWidth < 640 ? 10 : window.innerWidth < 768 ? 11 : 12,
                  fill: "#6b7280",
                }}
                interval={window.innerWidth < 480 ? 1 : 0} // Show every other tick on very small screens
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: window.innerWidth < 640 ? 10 : window.innerWidth < 768 ? 11 : 12,
                  fill: "#6b7280",
                }}
                domain={[0, 35]}
                label={{
                  value: "Zero Koin",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fontSize: window.innerWidth < 640 ? "10px" : "12px",
                    fill: "#6b7280",
                  },
                }}
                width={window.innerWidth < 640 ? 30 : 40}
              />
              <Tooltip
                cursor={{
                  fill: "rgba(59, 130, 246, 0.1)",
                  stroke: "#3b82f6",
                  strokeWidth: 2,
                  strokeDasharray: "5,5",
                }}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: window.innerWidth < 640 ? "8px" : "12px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
                  backdropFilter: "blur(8px)",
                  fontSize: window.innerWidth < 640 ? "12px" : "14px",
                  fontWeight: "500",
                  padding: window.innerWidth < 640 ? "8px" : "12px",
                  maxWidth: window.innerWidth < 640 ? "200px" : "none",
                }}
                labelStyle={{
                  color: "#374151",
                  fontWeight: "bold",
                  fontSize: window.innerWidth < 640 ? "12px" : "14px",
                }}
                animationDuration={200}
                position={window.innerWidth < 640 ? { x: 10, y: 10 } : undefined}
              />

              <Bar
                dataKey="baseRewards"
                stackId="rewards"
                fill="#0e7490"
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
                radius={window.innerWidth < 640 ? [2, 2, 0, 0] : [4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`base-${index}`} fill={hoveredBar === entry.period ? "#0891b2" : "#0e7490"} />
                ))}
              </Bar>

              <Bar
                dataKey="bonusRewards"
                stackId="rewards"
                fill="#84cc16"
                animationBegin={500}
                animationDuration={1500}
                animationEasing="ease-out"
                radius={window.innerWidth < 640 ? [2, 2, 0, 0] : [4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`bonus-${index}`} fill={hoveredBar === entry.period ? "#65a30d" : "#84cc16"} />
                ))}
              </Bar>

              <Bar
                dataKey="projectedRewards"
                stackId="rewards"
                fill="#c4b5fd"
                radius={window.innerWidth < 640 ? [4, 4, 0, 0] : [8, 8, 0, 0]}
                animationBegin={1000}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`projected-${index}`} fill={hoveredBar === entry.period ? "#a78bfa" : "#c4b5fd"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer with responsive layout */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="transition-all duration-300 hover:text-gray-700 hover:scale-105 text-xs sm:text-sm">
            Current start: sending Koin
          </span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 transition-all duration-300 hover:text-blue-600 tabular-nums">
              ${currentValue.toFixed(2)}
            </span>
            <div
              className={`w-2 h-2 rounded-full bg-green-500 transition-all duration-300 ${
                currentValue === targetValue ? "animate-pulse" : ""
              }`}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RewardRevenueChart
