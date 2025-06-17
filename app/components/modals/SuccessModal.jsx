"use client"

import { User } from "lucide-react"

export default function SuccessModal({ onClose }) {
  return (
    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 text-center shadow-2xl border border-gray-200">
      {/* Success Icon with Decorative Dots */}
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <User className="w-10 h-10 text-white" />
        </div>

        {/* Decorative dots around the icon */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-teal-500 rounded-full"></div>
        <div className="absolute top-3 -right-2 w-2 h-2 bg-teal-400 rounded-full"></div>
        <div className="absolute -bottom-1 left-3 w-2 h-2 bg-green-400 rounded-full"></div>
        <div className="absolute bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
        <div className="absolute top-6 left-1 w-1 h-1 bg-teal-300 rounded-full"></div>
        <div className="absolute -top-0 right-5 w-1 h-1 bg-teal-600 rounded-full"></div>
        <div className="absolute top-8 -right-3 w-2 h-2 bg-teal-400 rounded-full"></div>
        <div className="absolute bottom-6 -left-2 w-1 h-1 bg-green-300 rounded-full"></div>
      </div>

      <h2 className="text-xl font-semibold text-teal-600 mb-1">Your Coin is</h2>
      <h3 className="text-xl font-semibold text-teal-600 mb-6">Successfully Transfer</h3>

      <p className="text-gray-600 mb-1">Please wait...</p>
      <p className="text-gray-600 mb-8">You will be directed to the homepage soon.</p>

      {/* Loading Spinner */}
      <div className="flex justify-center mb-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>

      <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors font-medium">
        Close
      </button>
    </div>
  )
}
