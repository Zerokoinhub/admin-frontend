"use client"

import { CheckCircle, X, Star } from "lucide-react"

export default function SuccessModal({ onClose, approvedCount = 1, totalCoins = 0, allApproved = false }) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
        <X className="w-5 h-5" />
      </button>

      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
          <CheckCircle className="w-8 h-8 text-green-600" />
          {allApproved && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {allApproved ? "All Screenshots Approved!" : "Screenshots Approved!"}
        </h3>

        <div className="text-gray-600 mb-6 space-y-1">
          <p>
            {approvedCount} screenshot{approvedCount > 1 ? "s" : ""} approved
          </p>
          <p className="font-medium text-green-600">{totalCoins} coins ready for transfer</p>
          {allApproved && (
            <p className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full inline-block mt-2">
              ✓ All requirements met
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className={`w-full px-4 py-2 rounded-lg transition-colors font-medium ${
            allApproved ? "bg-green-600 text-white hover:bg-green-700" : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {allApproved ? "Proceed to Transfer" : "Continue to Transfer"}
        </button>
      </div>
    </div>
  )
}
