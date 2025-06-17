"use client"

import { ArrowLeft } from "lucide-react"
import SuccessModal from "./modals/SuccessModal"
import { useState } from "react"

export default function ViewScreenshots({ onBack, onApprove }) {
  const [showSuccess, setShowSuccess] = useState(false)

  const screenshots = [
    {
      id: 1,
      type: "desktop",
      imageUrl: "/screenshot-1.png",
      alt: "Desktop Screenshot 1",
    },
    {
      id: 2,
      type: "laptop",
      imageUrl: "/screenshot-2.png",
      alt: "Laptop Screenshot 1",
    },
    {
      id: 3,
      type: "mobile",
      imageUrl: "/screenshot-3.png",
      alt: "Mobile Screenshot 1",
    },
    {
      id: 4,
      type: "tablet",
      imageUrl: "/screenshot-4.png",
      alt: "Tablet Screenshot 1",
    },
    {
      id: 5,
      type: "desktop",
      imageUrl: "/screenshot-5.png",
      alt: "Desktop Screenshot 2",
    },
    {
      id: 6,
      type: "laptop",
      imageUrl: "/screenshot-6.png",
      alt: "Laptop Screenshot 2",
    },
  ]

  const handleApprove = () => {
    setShowSuccess(true)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    onApprove()
  }

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
        </div>

        {/* Responsive grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="bg-gray-50 rounded-lg h-32 sm:h-36 lg:h-32 flex items-center justify-center relative overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
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
            </div>
          ))}
        </div>

        {/* Responsive button layout */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleApprove}
            className="w-full sm:w-auto bg-teal-600 text-white px-6 sm:px-8 py-2 rounded-lg hover:bg-teal-700 transition-colors order-2 sm:order-1"
          >
            Approved
          </button>
          <button className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 sm:px-8 py-2 rounded-lg hover:bg-gray-50 transition-colors order-1 sm:order-2">
            Reject
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
          <SuccessModal onClose={handleSuccessClose} />
        </div>
      )}
    </div>
  )
}
