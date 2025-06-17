"use client"

import { useState } from "react"
import { Users, MessageSquare, Plus, X } from "lucide-react"

export default function UserProfilePage() {
  const [showCoinHistory, setShowCoinHistory] = useState(false)

  // Mock data for Zero Koin History
  const coinHistory = [
    { date: "05/05/2025", type: "Earn", source: "Learning", coins: "+100", notes: "Watched Course" },
    { date: "05/05/2025", type: "Earn", source: "Learning", coins: "+100", notes: "Watched Course" },
    { date: "05/05/2025", type: "Earn", source: "Referrals", coins: "+100", notes: "Watched Course" },
    { date: "05/05/2025", type: "Earn", source: "Referrals", coins: "+100", notes: "Watched Course" },
    { date: "05/05/2025", type: "Earn", source: "Referrals", coins: "+100", notes: "Watched Course" },
    { date: "05/05/2025", type: "Earn", source: "Learning", coins: "+100", notes: "Watched Course" },
    { date: "05/05/2025", type: "Earn", source: "Learning", coins: "+100", notes: "Watched Course" },
    { date: "05/05/2025", type: "Earn", source: "Learning", coins: "+100", notes: "Watched Course" },
    { date: "05/05/2025", type: "Earn", source: "Referrals", coins: "+100", notes: "Watched Course" },
    { date: "05/05/2025", type: "Earn", source: "Referrals", coins: "+100", notes: "Watched Course" },
    { date: "05/05/2025", type: "Earn", source: "Referrals", coins: "+100", notes: "Watched Course" },
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">User Profile</h1>
        <button
          onClick={() => setShowCoinHistory(!showCoinHistory)}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          {showCoinHistory ? "View User Details" : "View Coin History"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Learning User Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-600 font-medium">Learning User</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">00</div>
        </div>

        {/* Total Referrals Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-600 font-medium">Total Referrals</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">00</div>
        </div>

        {/* Total Adds Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-600 font-medium">Total Adds</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">00</div>
        </div>
      </div>

      {/* Conditional Content - Either User Details OR Coin History */}
      {!showCoinHistory ? (
        /* User Details Form */
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
              <input
                type="text"
                defaultValue="Anas"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <input
                type="email"
                defaultValue="anas@767.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Wallet Address</label>
              <input
                type="text"
                defaultValue="XXNSJDBSJSJKABDKSBDMSJCHNA1JASN0N"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 font-mono"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Country</label>
              <input
                type="text"
                defaultValue="Pakistan"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>
          </div>
        </div>
      ) : (
        /* Zero Koin History Table */
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Zero Koin History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Source</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Coins</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Notes</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coinHistory.map((record, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-800">{record.date}</td>
                    <td className="py-4 px-6 text-gray-800">{record.type}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.source === "Learning" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {record.source}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-green-600 font-semibold">{record.coins}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{record.notes}</td>
                    <td className="py-4 px-6">
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {coinHistory.length} entries</span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors">
                  Previous
                </button>
                <span className="px-3 py-1">1</span>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
