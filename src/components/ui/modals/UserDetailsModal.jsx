"use client"

import { X } from "lucide-react"

export default function UserDetailsModal({ onClose, showCloseButton = true }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
        {showCloseButton && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
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
  )
}
