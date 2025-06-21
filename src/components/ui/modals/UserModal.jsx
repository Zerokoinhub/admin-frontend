"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { userAPI } from "@/lib/api"
import { User, Mail, MapPin, Wallet, Coins, Calendar, Activity, Shield, AlertCircle } from "lucide-react"

const UserModal = ({ user, open, onClose, onStatusChange }) => {
  const [isBanned, setIsBanned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (open && user) {
      setIsBanned(!user.isActive) // user.isActive === false => banned
      setError("")
      setSuccess("")
    }
  }, [open, user])

  const toggleBanStatus = async () => {
    if (!user?.id) {
      setError("User ID not found")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      let response
      const newActiveStatus = isBanned // If currently banned, new status will be active (true)

      if (isBanned) {
        // User is currently banned, so unban them
        response = await userAPI.unbanUser(user.id)
        setSuccess("User unbanned successfully!")
      } else {
        // User is currently active, so ban them
        response = await userAPI.banUser(user.id)
        setSuccess("User banned successfully!")
      }

      // Update local state immediately for better UX
      setIsBanned(!newActiveStatus)

      // Create updated user object with all necessary fields
      const updatedUser = {
        ...user,
        isActive: newActiveStatus,
        status: newActiveStatus ? "Active" : "Banned",
      }

      console.log("Sending updated user to parent:", updatedUser) // Debug log

      // Call the parent callback to update the table
      if (onStatusChange) {
        onStatusChange(updatedUser)
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Ban/Unban error:", err)
      setError(err.message || "Failed to update user status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getStatusBadge = () => {
    if (isBanned) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Banned
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
        <Shield className="h-3 w-3" />
        Active
      </Badge>
    )
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </DialogTitle>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-green-800 text-sm font-medium">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Name
                </label>
                <Input value={user.name || "Unnamed"} readOnly className="bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </label>
                <Input value={user.email || "No email"} readOnly className="bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Country
                </label>
                <Input value={user.country || "Unknown"} readOnly className="bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Role
                </label>
                <Input value={user.role || "user"} readOnly className="bg-gray-50" />
              </div>
            </div>

            {/* Activity & Wallet Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity & Wallet
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  Wallet Status
                </label>
                <Input value={user.wallet || "Not Connected"} readOnly className="bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  Coins Earned
                </label>
                <Input value={(user.coins || 0).toLocaleString()} readOnly className="bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Calculator Usage
                </label>
                <Input value={user.calculatorUsage || 0} readOnly className="bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Referral Code
                </label>
                <Input value={user.inviteCode || "N/A"} readOnly className="bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined Date
              </label>
              <Input value={formatDate(user.joinedDate)} readOnly className="bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Last Login
              </label>
              <Input value={formatDate(user.lastLogin)} readOnly className="bg-gray-50" />
            </div>
          </div>

          {/* Additional Information */}
          {user.referredBy && (
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">Referred By</label>
              <Input value={user.referredBy} readOnly className="bg-gray-50" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-500">
              User ID: <span className="font-mono">{user.id}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Close
              </Button>
              <Button
                onClick={toggleBanStatus}
                disabled={loading}
                className={`px-6 py-2 text-sm font-medium rounded-md ${
                  isBanned ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : isBanned ? (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Unban User
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Ban User
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserModal
