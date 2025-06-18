"use client"

import { useState, useMemo } from "react"
import { Users, MessageSquare, Plus, X, Loader2 } from "lucide-react"
import { useUsers } from "../../hooks/useUsers"
import { userHelpers } from "../../lib/api"
import UserSelector from "../components/UserSelector"

export default function UserProfilePage() {
  const [showCoinHistory, setShowCoinHistory] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const { users, loading, error } = useUsers(1, 100) // Get more users for better stats

  // Calculate real statistics from API data
  const stats = useMemo(() => {
    if (!users.length) return { totalUsers: 0, totalReferrals: 0, usersWithWallets: 0 }
    return userHelpers.calculateStats(users)
  }, [users])

  // Mock coin history - this would come from another API endpoint
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

  const formattedUser = selectedUser ? userHelpers.formatUser(selectedUser) : null

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Error loading users: {error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-red-600 hover:text-red-800 underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
      {/* Responsive header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">User Profile</h1>
        <button
          onClick={() => setShowCoinHistory(!showCoinHistory)}
          className="w-full sm:w-auto bg-teal-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base"
        >
          {showCoinHistory ? "View User Details" : "View Coin History"}
        </button>
      </div>

      {/* Real-time stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <span className="text-gray-600 font-medium text-sm sm:text-base">Total Users</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalUsers}</div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <span className="text-gray-600 font-medium text-sm sm:text-base">Total Referrals</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.totalReferrals}</div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <span className="text-gray-600 font-medium text-sm sm:text-base">Users with Wallets</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.usersWithWallets}</div>
        </div>
      </div>

      {/* User Selection */}
      {!showCoinHistory && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select User to View Profile</label>
          <UserSelector selectedUser={selectedUser} onUserSelect={setSelectedUser} className="max-w-md" />
        </div>
      )}

      {/* Conditional responsive content */}
      {!showCoinHistory ? (
        selectedUser && formattedUser ? (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                <input
                  type="text"
                  value={formattedUser.name}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                <input
                  type="email"
                  value={formattedUser.email}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                  readOnly
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2">Wallet Address</label>
                <input
                  type="text"
                  value={formattedUser.walletAddress}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm bg-gray-50 font-mono break-all"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Current Balance</label>
                <input
                  type="text"
                  value={`${formattedUser.balance} coins`}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Member Since</label>
                <input
                  type="text"
                  value={formattedUser.createdAt}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Invite Code</label>
                <input
                  type="text"
                  value={formattedUser.inviteCode}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-xs sm:text-sm font-mono"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Referred By</label>
                <input
                  type="text"
                  value={formattedUser.referredBy || "Direct signup"}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                  readOnly
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500 mb-4">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No User Selected</h3>
              <p className="text-gray-600">Please select a user from the dropdown above to view their profile.</p>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Zero Koin History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-600 text-sm">Date</th>
                  <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-600 text-sm">Type</th>
                  <th className="hidden sm:table-cell text-left py-3 px-6 font-medium text-gray-600 text-sm">Source</th>
                  <th className="text-left py-3 px-3 sm:px-6 font-medium text-gray-600 text-sm">Coins</th>
                  <th className="hidden md:table-cell text-left py-3 px-6 font-medium text-gray-600 text-sm">Notes</th>
                  <th className="hidden lg:table-cell text-left py-3 px-6 font-medium text-gray-600 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {coinHistory.map((record, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 sm:px-6 text-gray-800 text-sm">{record.date}</td>
                    <td className="py-3 px-3 sm:px-6 text-gray-800 text-sm">{record.type}</td>
                    <td className="hidden sm:table-cell py-3 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.source === "Learning" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {record.source}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-6">
                      <span className="text-green-600 font-semibold text-sm">{record.coins}</span>
                    </td>
                    <td className="hidden md:table-cell py-3 px-6 text-gray-600 text-sm">{record.notes}</td>
                    <td className="hidden lg:table-cell py-3 px-6">
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

          <div className="p-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
              <span>Showing {coinHistory.length} entries</span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors text-sm">
                  Previous
                </button>
                <span className="px-3 py-1">1</span>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors text-sm">
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
