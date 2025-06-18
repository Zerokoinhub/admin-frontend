"use client"

import { useState } from "react"
import { ChevronDown, Search, User } from "lucide-react"
import { useUsers } from "../../../hooks/useUsers"

export default function UserSelector({ selectedUser, onUserSelect, className = "" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { users, loading, error } = useUsers(1, 50) // Get more users for selection

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-4 py-3 border border-red-200 rounded-lg bg-red-50 text-red-600 text-sm">
          Error loading users: {error}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <div className="font-medium text-gray-800">{selectedUser ? selectedUser.name : "Select a user"}</div>
            {selectedUser && <div className="text-sm text-gray-500">{selectedUser.email}</div>}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* User List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    onUserSelect(user)
                    setIsOpen(false)
                    setSearchTerm("")
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-50 last:border-b-0"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{user.name || "Unknown User"}</div>
                    <div className="text-sm text-gray-500 truncate">{user.email}</div>
                    <div className="text-xs text-gray-400">Balance: {user.balance || 0} coins</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
