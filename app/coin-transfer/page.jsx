"use client"

import { useState } from "react"
import { X } from "lucide-react"
import ViewScreenshots from "../../src/components/ui/ViewScreenshots"
import TransferHistory from "../../src/components/ui/TransferHistory"
import UserSelector from "../../src/components/ui/UserSelector"
import { userHelpers } from "../../src/lib/api"
import {User} from "lucide-react" // Declaring the User variable

export default function CoinTransferPage() {
  const [showScreenshots, setShowScreenshots] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  if (showScreenshots) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
        <ViewScreenshots
          onBack={() => setShowScreenshots(false)}
          onApprove={() => {
            setShowScreenshots(false)
          }}
          selectedUser={selectedUser}
        />
      </div>
    )
  }

  if (showHistory) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
        <TransferHistory onBack={() => setShowHistory(false)} />
      </div>
    )
  }

  const formattedUser = selectedUser ? userHelpers.formatUser(selectedUser) : null

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
      {/* Responsive header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Manual Zero Koin Transfer</h1>
        <button
          onClick={() => setShowHistory(true)}
          className="w-full sm:w-auto bg-teal-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base"
        >
          View All User
        </button>
      </div>

      {/* User Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select User to Transfer Coins</label>
        <UserSelector selectedUser={selectedUser} onUserSelect={setSelectedUser} className="max-w-md" />
      </div>

      {/* User Details Form - Only show if user is selected */}
      {selectedUser ? (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 max-w-full lg:max-w-2xl">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">User Details</h2>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Wallet Address</label>
              <input
                type="text"
                value={formattedUser.walletAddress}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm bg-gray-50 font-mono break-all"
                readOnly
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Transfer Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Transfer Amount</label>
              <input
                type="number"
                placeholder="Enter amount to transfer"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Transfer Reason</label>
              <textarea
                placeholder="Enter reason for transfer"
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base resize-none"
              />
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex justify-end">
            <button
              onClick={() => setShowScreenshots(true)}
              className="w-full sm:w-auto bg-teal-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-lg text-sm sm:text-base"
            >
              View Screenshots
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-500 mb-4">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No User Selected</h3>
            <p className="text-gray-600">Please select a user from the dropdown above to start the transfer process.</p>
          </div>
        </div>
      )}
    </div>
  )
}
