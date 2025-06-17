"use client"

import { useState } from "react"

export default function CalculatorChart() {
  const [hoveredBar, setHoveredBar] = useState(null)

  const chartData = [
    { month: "JAN", value: 1850, users: "1.85K" },
    { month: "FEB", value: 2400, users: "2.4K" },
    { month: "MAR", value: 1900, users: "1.9K" },
    { month: "APR", value: 2100, users: "2.1K" },
    { month: "MAY", value: 1600, users: "1.6K" },
    { month: "JUN", value: 2800, users: "2.8K" },
    { month: "JUL", value: 3200, users: "3.2K" },
    { month: "AUG", value: 1800, users: "1.8K" },
    { month: "SEP", value: 2600, users: "2.6K" },
    { month: "OCT", value: 2200, users: "2.2K" },
    { month: "NOV", value: 3000, users: "3.0K" },
    { month: "DEC", value: 3400, users: "3.4K" },
  ]

  const maxValue = Math.max(...chartData.map((d) => d.value))

  const getBarHeight = (value) => {
    const percentage = (value / maxValue) * 80
    return Math.max(percentage, 10)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      {/* Chart Header */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Calculator user Graph</h3>

        {/* Total User Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-2 sm:space-y-0">
          <span className="text-sm font-medium text-gray-700">TOTAL USER</span>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
            <span className="text-gray-600 font-medium text-sm sm:text-base">2422134</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 h-64 sm:h-80 flex flex-col justify-between text-xs text-gray-500 pr-4 sm:pr-6 z-10">
          <span>TODAY</span>
          <span>1DAY AGO</span>
          <span>7DAY AGO</span>
          <span>90DAY AGO</span>
          <span>120DAY AGO</span>
        </div>

        {/* Chart Area */}
        <div className="ml-16 sm:ml-24 relative">
          {/* Chart Background with Grid */}
          <div className="h-64 sm:h-80 border-l-2 border-b-2 border-gray-200 relative">
            {/* Chart Bars Container */}
            <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-2 sm:px-4">
              {chartData.map((data, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center relative group cursor-pointer"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip */}
                  {hoveredBar === index && (
                    <div className="absolute bottom-full mb-2 bg-gray-800 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xs whitespace-nowrap z-20">
                      {data.month}: {data.users} users
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    className={`w-4 sm:w-6 bg-teal-500 transition-all duration-300 ${
                      hoveredBar === index ? "bg-teal-600 scale-105" : "hover:bg-teal-600"
                    }`}
                    style={{
                      height: `${getBarHeight(data.value)}%`,
                      minHeight: "20px",
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* X-axis Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2 sm:mt-4 px-2 sm:px-4">
            {chartData.map((data, index) => (
              <span key={index} className="text-center">
                {data.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
