"use client"

import { DollarSign } from "lucide-react"
import CalculatorChart from "../../src/components/ui/charts/CalculatorChart"

export default function CalculatorPage() {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
      {/* Responsive header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Calculator User</h1>
      </div>

      {/* Responsive hero card */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">Calculator User</h2>
          <p className="text-white text-lg sm:text-xl opacity-90">345 User</p>
        </div>

        {/* Responsive decorative elements */}
        <div className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 sm:space-x-4">
          {/* Pie Chart Representation */}
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-400 rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300 to-pink-500"></div>
              <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-400 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-tr-full"></div>
            </div>
          </div>

          {/* Calculator */}
          <div className="w-16 h-20 sm:w-20 sm:h-24 bg-purple-400 rounded-lg flex flex-col items-center justify-center relative shadow-lg">
            <div className="w-8 h-2 sm:w-12 sm:h-3 bg-purple-300 rounded-sm mb-2"></div>
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-sm opacity-80"></div>
              ))}
            </div>
          </div>

          {/* Dollar Sign */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white font-bold" />
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-12 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-100"></div>
          <div className="absolute bottom-8 left-1/5 w-3 h-3 bg-white rounded-full animate-pulse delay-200"></div>
          <div className="absolute bottom-4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-white rounded-full animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Chart */}
      <CalculatorChart />
    </div>
  )
}
