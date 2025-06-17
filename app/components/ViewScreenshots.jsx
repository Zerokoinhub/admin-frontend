"use client"

import { ArrowLeft } from "lucide-react"
import SuccessModal from "./modals/SuccessModal"
import { useState } from "react"

export default function ViewScreenshots({ onBack, onApprove }) {
  const [showSuccess, setShowSuccess] = useState(false)

  // Replace the screenshots array with direct public folder paths
  const screenshots = [
    {
      id: 1,
      type: "desktop",
      imageUrl: "/screenshot-1.png", // Direct in public folder
      alt: "Desktop Screenshot 1",
    },
    {
      id: 2,
      type: "laptop",
      imageUrl: "/screenshot-2.png", // Direct in public folder
      alt: "Laptop Screenshot 1",
    },
    {
      id: 3,
      type: "mobile",
      imageUrl: "/screenshot-3.png", // Direct in public folder
      alt: "Mobile Screenshot 1",
    },
    {
      id: 4,
      type: "tablet",
      imageUrl: "/screenshot-4.png", // Direct in public folder
      alt: "Tablet Screenshot 1",
    },
    {
      id: 5,
      type: "desktop",
      imageUrl: "/screenshot-5.png", // Direct in public folder
      alt: "Desktop Screenshot 2",
    },
    {
      id: 6,
      type: "laptop",
      imageUrl: "/screenshot-6.png", // Direct in public folder
      alt: "Laptop Screenshot 2",
    },
  ]

  const handleApprove = () => {
    setShowSuccess(true)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    onApprove() // Call the original onApprove to go back to main page
  }

  return (
    <div className="bg-white rounded-lg shadow-sm relative">
      {/* Screenshots Grid */}
      <div className={`p-6 ${showSuccess ? "blur-sm" : ""} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">User Screenshots</h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="bg-gray-100 rounded-lg h-32 flex items-center justify-center relative overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <img
                src={screenshot.imageUrl || "/placeholder.svg"}
                alt={screenshot.alt}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "flex"
                }}
              />
              {/* Fallback placeholder */}
              <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-400 rounded mb-2 mx-auto"></div>
                  <span className="text-xs text-gray-500 capitalize">{screenshot.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleApprove}
            className="bg-teal-600 text-white px-8 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Approved
          </button>
          <button className="border border-gray-300 text-gray-700 px-8 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Reject
          </button>
        </div>
      </div>

      {/* Success Modal - appears over the blurred content */}
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <SuccessModal onClose={handleSuccessClose} />
        </div>
      )}
    </div>
  )
}
