"use client"

import { ArrowLeft } from "lucide-react"
import SuccessModal from "./modals/SuccessModal"
import { useState } from "react"

export default function ViewScreenshots({ onBack, onApprove, selectedUser }) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [approvedScreenshots, setApprovedScreenshots] = useState([])
  const [totalCoinsApproved, setTotalCoinsApproved] = useState(0)

  const screenshots = [
    {
      id: 1,
      type: "desktop",
      imageUrl: "/screenshot-1.png",
      alt: "Desktop Screenshot 1",
      coins: 50,
      status: "pending",
    },
    {
      id: 2,
      type: "laptop",
      imageUrl: "/screenshot-2.png",
      alt: "Laptop Screenshot 1",
      coins: 75,
      status: "pending",
    },
    {
      id: 3,
      type: "mobile",
      imageUrl: "/screenshot-3.png",
      alt: "Mobile Screenshot 1",
      coins: 25,
      status: "pending",
    },
    {
      id: 4,
      type: "tablet",
      imageUrl: "/screenshot-4.png",
      alt: "Tablet Screenshot 1",
      coins: 40,
      status: "pending",
    },
    {
      id: 5,
      type: "desktop",
      imageUrl: "/screenshot-5.png",
      alt: "Desktop Screenshot 2",
      coins: 60,
      status: "pending",
    },
    {
      id: 6,
      type: "laptop",
      imageUrl: "/screenshot-6.png",
      alt: "Laptop Screenshot 2",
      coins: 30,
      status: "pending",
    },
  ]

  const handleApprove = (screenshot) => {
    // Add to approved screenshots
    const newApproved = [...approvedScreenshots, screenshot.id]
    setApprovedScreenshots(newApproved)

    // Calculate total coins
    const newTotal = totalCoinsApproved + screenshot.coins
    setTotalCoinsApproved(newTotal)

    // If all screenshots are approved, show success modal
    if (newApproved.length === screenshots.length) {
      setShowSuccess(true)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)

    // Call parent callback with approval data
    if (onApprove) {
      onApprove({
        approvedCount: approvedScreenshots.length,
        totalCoins: totalCoinsApproved,
        hasApprovedScreenshots: approvedScreenshots.length > 0,
        allScreenshotsApproved: approvedScreenshots.length === screenshots.length,
      })
    }
  }

  const isApproved = (screenshotId) => {
    return approvedScreenshots.includes(screenshotId)
  }

  const pendingScreenshots = screenshots.filter((s) => !isApproved(s.id))
  const hasApprovedAny = approvedScreenshots.length > 0
  const allApproved = approvedScreenshots.length === screenshots.length

  return (
    <div className="bg-white rounded-lg shadow-sm relative">
      <div className={`p-4 sm:p-6 ${showSuccess ? "blur-sm" : ""} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">User Screenshots</h2>
          </div>

          {/* Approval Status */}
          <div className="flex items-center gap-2">
            {hasApprovedAny && (
              <div
                className={`border rounded-lg px-3 py-2 ${
                  allApproved ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className={`text-sm ${allApproved ? "text-green-800" : "text-blue-800"}`}>
                  <span className="font-medium">
                    {approvedScreenshots.length}/{screenshots.length}
                  </span>{" "}
                  approved •<span className="font-medium"> {totalCoinsApproved}</span> coins
                </div>
              </div>
            )}

            {allApproved && (
              <div className="bg-green-100 border border-green-300 rounded-lg px-3 py-2">
                <div className="text-sm text-green-800 font-medium">✓ All Screenshots Approved!</div>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {selectedUser && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-600">
              Reviewing screenshots for: <span className="font-medium text-gray-900">{selectedUser.name}</span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Approval Progress</span>
            <span>
              {approvedScreenshots.length}/{screenshots.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${allApproved ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${(approvedScreenshots.length / screenshots.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Responsive grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className={`bg-gray-50 rounded-lg h-32 sm:h-36 lg:h-32 flex items-center justify-center relative overflow-hidden border-2 transition-all duration-200 shadow-sm ${
                isApproved(screenshot.id) ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={screenshot.imageUrl || "/placeholder.svg"}
                alt={screenshot.alt}
                className="max-w-full max-h-full object-contain rounded"
              />

              {/* Device type label */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {screenshot.type}
              </div>

              {/* Coins label */}
              <div className="absolute top-2 right-2 bg-teal-600 text-white text-xs px-2 py-1 rounded">
                {screenshot.coins} coins
              </div>

              {/* Approval status */}
              {isApproved(screenshot.id) && (
                <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-medium">✓ Approved</div>
                </div>
              )}

              {/* Approve button for pending screenshots */}
              {!isApproved(screenshot.id) && (
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <button
                    onClick={() => handleApprove(screenshot)}
                    className="bg-teal-600 text-white text-sm px-3 py-1 rounded-full font-medium hover:bg-teal-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Requirement Notice */}
        {!allApproved && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="font-medium text-amber-900 mb-1">All Screenshots Required</h3>
                <p className="text-sm text-amber-800">
                  You must approve all {screenshots.length} screenshots before the transfer can be processed. Currently{" "}
                  {pendingScreenshots.length} screenshot{pendingScreenshots.length !== 1 ? "s" : ""} remaining.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary and Actions */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-600">
              <div>Total Screenshots: {screenshots.length}</div>
              <div>Pending: {pendingScreenshots.length}</div>
              <div className={`font-medium ${allApproved ? "text-green-600" : "text-blue-600"}`}>
                Approved: {approvedScreenshots.length} ({totalCoinsApproved} coins)
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={handleSuccessClose}
                disabled={!allApproved}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2 rounded-lg transition-colors font-medium ${
                  allApproved
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {allApproved
                  ? `Transfer ${totalCoinsApproved} Coins`
                  : `Approve All Screenshots (${pendingScreenshots.length} remaining)`}
              </button>

              <button
                onClick={onBack}
                className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 sm:px-8 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Transfer
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
          <SuccessModal
            onClose={handleSuccessClose}
            approvedCount={approvedScreenshots.length}
            totalCoins={totalCoinsApproved}
            allApproved={allApproved}
          />
        </div>
      )}
    </div>
  )
}
