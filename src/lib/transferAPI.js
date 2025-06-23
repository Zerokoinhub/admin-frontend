// transferAPI.js - Updated to skip getUserById and use existing user data
import { userAPI, userHelpers } from "./api.js"

// Helper: Get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const transferAPI = {
  // UPDATED: Transfer coins directly using existing user data (no getUserById call)
  async transferCoins(userId, amount, reason = "Manual transfer", existingUserData = null) {
    try {
      console.log("🚀 Starting transfer:", { userId, amount, reason })
      console.log("👤 Using existing user data:", existingUserData)

      // Use existing user data instead of fetching from API
      if (!existingUserData) {
        throw new Error("User data is required for transfer. Please ensure user is selected properly.")
      }

      // Validate that user has firebaseUid
      if (!existingUserData.firebaseUid) {
        throw new Error("User does not have a Firebase UID. This is required for balance updates.")
      }

      const currentBalance = existingUserData.balance || existingUserData.coins || 0
      const newBalance = currentBalance + Number(amount)

      console.log("💰 Balance calculation:", {
        currentBalance,
        amount: Number(amount),
        newBalance,
        firebaseUid: existingUserData.firebaseUid,
      })

      // Use the editUserBalance method from userAPI
      const result = await userAPI.editUserBalance(existingUserData.firebaseUid, newBalance)

      if (result.success) {
        console.log("✅ Balance updated successfully")

        // Create a comprehensive response
        return {
          success: true,
          data: {
            transferId: `transfer_${Date.now()}`,
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            newBalance: newBalance,
            amount: Number(amount),
            reason: reason,
            timestamp: new Date().toISOString(),
            user: result.data.user,
            message: result.data.message,
          },
        }
      } else {
        console.error("❌ Balance update failed:", result.message)
        return {
          success: false,
          error: result.message || "Failed to update balance",
        }
      }
    } catch (error) {
      console.error("💥 Transfer API error:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  },

  // Refresh user data after transfer - simplified version
  async refreshUserData(userId) {
    try {
      console.log("🔄 Attempting to refresh user data for:", userId)

      // Try to get fresh user data, but don't fail if it doesn't work
      const result = await userAPI.getUserById(userId)

      if (result && (result.user || result._id || result.id)) {
        const userData = result.user || result
        console.log("✅ User data refreshed successfully")

        return {
          success: true,
          data: userHelpers.formatUserData(userData),
        }
      } else {
        console.warn("⚠️ Could not refresh user data, but transfer may have succeeded")
        return {
          success: false,
          message: "Could not refresh user data",
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not refresh user data:", error.message)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Get transfer history using the existing API method
  async getHistory(filters = {}) {
    try {
      console.log("📜 Fetching transfer history with filters:", filters)

      const result = await userAPI.getTransferHistory(filters)

      if (result.success) {
        console.log("✅ Transfer history retrieved:", result.data.transfers.length, "transfers")
        return result
      } else {
        console.warn("⚠️ Transfer history API returned error:", result.message)
        return {
          success: false,
          message: result.message,
          data: {
            transfers: [],
            total: 0,
            totalPages: 1,
            currentPage: 1,
          },
        }
      }
    } catch (error) {
      console.error("❌ Error fetching transfer history:", error)
      return {
        success: false,
        message: error.message,
        data: {
          transfers: [],
          total: 0,
          totalPages: 1,
          currentPage: 1,
        },
      }
    }
  },

  // Update transfer status using the existing API method
  async updateTransferStatus(transferId, newStatus) {
    try {
      console.log("🔄 Updating transfer status:", { transferId, newStatus })

      const result = await userAPI.updateTransferStatus(transferId, newStatus)

      if (result && result.success !== false) {
        console.log("✅ Transfer status updated successfully")
        return {
          success: true,
          data: result,
        }
      } else {
        throw new Error(result.message || "Failed to update transfer status")
      }
    } catch (error) {
      console.error("❌ Error updating transfer status:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // UPDATED: Batch transfer coins to multiple users with existing user data
  async batchTransferCoins(transfers) {
    const results = []

    for (const transfer of transfers) {
      try {
        const result = await this.transferCoins(
          transfer.userId,
          transfer.amount,
          transfer.reason || "Batch transfer",
          transfer.existingUserData, // Pass existing user data
        )
        results.push({
          userId: transfer.userId,
          success: result.success,
          data: result.data,
          error: result.error,
        })
      } catch (error) {
        results.push({
          userId: transfer.userId,
          success: false,
          error: error.message,
        })
      }
    }

    return {
      success: true,
      results: results,
      totalProcessed: results.length,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
    }
  },

  // UPDATED: Validate transfer before execution using existing user data
  async validateTransfer(existingUserData, amount, reason) {
    const errors = []

    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      errors.push("Invalid transfer amount")
    }

    if (Number(amount) > 10000) {
      errors.push("Transfer amount cannot exceed 10,000 coins")
    }

    // Validate reason
    if (!reason || reason.trim().length < 5) {
      errors.push("Transfer reason must be at least 5 characters long")
    }

    // Validate user data
    if (!existingUserData) {
      errors.push("User data is required")
    } else if (!existingUserData.firebaseUid) {
      errors.push("User does not have a Firebase UID required for balance updates")
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  },

  // Get transfer statistics
  async getTransferStatistics(filters = {}) {
    try {
      const historyResult = await this.getHistory(filters)

      if (historyResult.success) {
        const stats = userHelpers.calculateTransferStats(historyResult.data.transfers)
        return {
          success: true,
          data: stats,
        }
      } else {
        throw new Error(historyResult.message)
      }
    } catch (error) {
      console.error("❌ Error calculating transfer statistics:", error)
      return {
        success: false,
        message: error.message,
        data: {
          totalTransfers: 0,
          totalAmount: 0,
          completedTransfers: 0,
          pendingTransfers: 0,
          failedTransfers: 0,
          averageAmount: 0,
        },
      }
    }
  },

  // NEW: Helper method to format user data for transfer
  formatUserForTransfer(user) {
    return {
      id: user._id || user.id,
      firebaseUid: user.firebaseUid,
      balance: user.balance || user.coins || 0,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    }
  },

  // NEW: Validate user has required fields for transfer
  validateUserForTransfer(user) {
    const errors = []

    if (!user) {
      errors.push("User data is required")
      return { isValid: false, errors }
    }

    if (!user.firebaseUid) {
      errors.push("User must have a Firebase UID")
    }

    if (user.balance === undefined && user.coins === undefined) {
      errors.push("User must have a balance field")
    }

    if (!user.name) {
      errors.push("User must have a name")
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  },

  // NEW: Create transfer record for local storage/state
  createTransferRecord(transferData, userData, adminData) {
    return {
      id: transferData.transferId || `transfer_${Date.now()}`,
      userId: userData.id || userData._id,
      userName: userData.name,
      userEmail: userData.email,
      amount: transferData.amount,
      reason: transferData.reason,
      status: "completed",
      createdAt: transferData.timestamp || new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      adminId: adminData.id,
      adminName: adminData.username,
      transferredBy: adminData.username,
      transactionId: transferData.transactionId,
      balanceBefore: transferData.balanceBefore,
      balanceAfter: transferData.balanceAfter,
    }
  },
}

// Export default for easier importing
export default transferAPI
