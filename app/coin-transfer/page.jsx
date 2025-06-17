"use client"

import { useState } from "react"
import { X } from "lucide-react"
import ViewScreenshots from "../components/ViewScreenshots"
import TransferHistory from "../components/TransferHistory"

export default function CoinTransferPage() {
  const [showScreenshots, setShowScreenshots] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(true) // Show by default

  if (showScreenshots) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <ViewScreenshots
          onBack={() => setShowScreenshots(false)}
          onApprove={() => {
            setShowScreenshots(false)
          }}
        />
      </div>
    )
  }

  if (showHistory) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <TransferHistory onBack={() => setShowHistory(false)} />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Manual Zero Koin Transfer</h1>
        <button
          onClick={() => setShowHistory(true)}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          View All User
        </button>
      </div>

      {/* User Details Form - Main Content */}
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
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

          <div>
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

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowScreenshots(true)}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-lg"
          >
            View Screenshots
          </button>
        </div>
      </div>
    </div>
  )
}
