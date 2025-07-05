// API service for handling user data and helpers
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Helper: Get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// ========================
// API SERVICE
// ========================
export const userAPI = {
  // Fetch paginated user list - Enhanced to handle multiple response structures
  async getUsers(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })
    try {
      const response = await fetch(`${API_BASE_URL}/users?${params}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch users")
      const result = await response.json()
      console.log("API Response:", result)

      // Handle multiple possible response structures
      let users = []
      let pagination = {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPrevPage: false,
      }

      if (result.success && result.data) {
        if (result.data.users) {
          // Structure: { success: true, data: { users: [...], pagination: {...} } }
          users = result.data.users
          pagination = result.data.pagination || pagination
        } else if (Array.isArray(result.data)) {
          // Structure: { success: true, data: [...] }
          users = result.data
          pagination.totalItems = users.length
        }
      } else if (result.users) {
        // Structure: { users: [...], pagination: {...} }
        users = result.users
        pagination = result.pagination || pagination
      } else if (Array.isArray(result)) {
        // Structure: [...]
        users = result
        pagination.totalItems = users.length
      }

      return {
        success: true,
        users: users,
        data: users, // For backward compatibility
        pagination: pagination,
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch user")
      return await response.json()
    } catch (error) {
      console.error("Error fetching user:", error)
      throw error
    }
  },

  // FIXED: Update user - Now properly calls the backend PUT /users/:id endpoint
  async updateUser(userId, userData) {
    try {
      console.log("Updating user:", userId, "with data:", userData)

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to update user: ${response.status}`)
      }

      const result = await response.json()
      console.log("Update result:", result)

      return {
        success: true,
        user: result.user,
        message: result.message || "User updated successfully",
        changes: result.changes,
      }
    } catch (error) {
      console.error("Error updating user:", error)
      return {
        success: false,
        message: error.message || "Failed to update user",
      }
    }
  },

  // Ban a user
  async banUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
        method: "PUT", // Changed from POST to PUT to match backend
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to ban user")
      return await response.json()
    } catch (error) {
      console.error("Error banning user:", error)
      throw error
    }
  },

  // Unban a user
  async unbanUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/unban`, {
        method: "PUT", // Changed from POST to PUT to match backend
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to unban user")
      return await response.json()
    } catch (error) {
      console.error("Error unbanning user:", error)
      throw error
    }
  },

  // Update user status (enhanced version that works with both ban/unban and direct status update)
  async updateUserStatus(userId, isActive) {
    try {
      // Use the updateUser function to update the isActive status
      return await this.updateUser(userId, { isActive })
    } catch (error) {
      console.error("Error updating user status:", error)
      // Fallback to ban/unban if status update fails
      try {
        if (isActive) {
          return await this.unbanUser(userId)
        } else {
          return await this.banUser(userId)
        }
      } catch (fallbackError) {
        console.error("Fallback status update also failed:", fallbackError)
        throw fallbackError
      }
    }
  },

  // Manual coin transfer - Enhanced with reason parameter
  async transferCoins(userId, amount, reason = "Manual transfer") {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/transfer`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: Number(amount),
          reason: reason,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to transfer coins")
      }

      const result = await response.json()
      return {
        success: true,
        data: {
          transferId: result.transferId || `transfer_${Date.now()}`,
          transactionId:
            result.transactionId || `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
          newBalance: result.transaction?.newBalance || result.user?.balance,
          amount: amount,
          reason: reason,
        },
      }
    } catch (error) {
      console.error("Error transferring coins:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Edit user balance directly using the edit-balance endpoint
  async editUserBalance(email, newBalance, admin) {
    try {
      if (!email || typeof newBalance !== "number") {
        throw new Error("Invalid input: email and numeric newBalance are required.")
      }

      const response = await fetch(`${API_BASE_URL}/users/edit-balance`, {
        method: "POST", // Changed from PUT to POST to match backend
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, newBalance, admin }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Failed to update user balance")
      }

      return {
        success: true,
        data: {
          user: result.user,
          newBalance: result.transaction.newBalance,
          previousBalance: result.transaction.balanceBefore,
          amountChanged: result.transaction.amountChanged,
          message: result.message,
          transactionLogged: true,
          timestamp: result.transaction.timestamp,
        },
      }
    } catch (error) {
      console.error("Error updating user balance:", error)
      return {
        success: false,
        message: error.message || "Unexpected error occurred",
      }
    }
  },

  // Get Transfer History
  async getTransferHistory(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.page) params.append("page", filters.page)
      if (filters.limit) params.append("limit", filters.limit)
      if (filters.search) params.append("search", filters.search)
      if (filters.status) params.append("status", filters.status)
      if (filters.dateRange) params.append("dateRange", filters.dateRange)
      if (filters.userId) params.append("userId", filters.userId)

      const url = `${API_BASE_URL}/transfer/transferHistory?${params.toString()}`
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch transfer history")
      }

      const result = await response.json()

      // Handle the exact API response structure where data is directly an array
      if (result.success && result.data) {
        return {
          success: true,
          data: Array.isArray(result.data) ? result.data : result.data.transfers || [],
        }
      }

      return {
        success: false,
        message: "Invalid response format",
        data: [],
      }
    } catch (error) {
      console.error("❌ Error fetching transfer history:", error)
      return {
        success: false,
        message: error.message,
        data: [],
      }
    }
  },

  // Get Transfer By ID
  async getTransferById(transferId) {
    try {
      const response = await fetch(`${API_BASE_URL}/transfers/${transferId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to fetch transfer")
      }
      return await response.json()
    } catch (error) {
      console.error("❌ Error fetching transfer by ID:", error)
      throw error
    }
  },

  // Update Transfer Status
  async updateTransferStatus(transferId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/transfers/${transferId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to update transfer status")
      }
      return await response.json()
    } catch (error) {
      console.error("❌ Error updating transfer status:", error)
      throw error
    }
  },

  // Change user password
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "PUT", // Changed from POST to PUT to match backend
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to change password")
      }
      const result = await response.json()

      if (result.success) {
        return {
          success: true,
          message: result.message || "Password changed successfully",
        }
      }
      return result
    } catch (error) {
      console.error("Error changing password:", error)
      return {
        success: false,
        message: error.message || "Failed to change password",
      }
    }
  },

  // Get logged-in user's profile
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to get profile")
      }
      const result = await response.json()

      if (result.success) {
        return {
          success: true,
          user: result.user,
          data: result.user, // For backward compatibility
        }
      }
      return result
    } catch (error) {
      console.error("Error getting profile:", error)
      return {
        success: false,
        message: error.message || "Failed to get profile",
      }
    }
  },

  // Update logged-in user's profile
  async updateProfile(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }
      const result = await response.json()

      if (result.success) {
        return {
          success: true,
          user: result.user,
          message: "Profile updated successfully",
        }
      }
      return result
    } catch (error) {
      console.error("Error updating profile:", error)
      return {
        success: false,
        message: error.message || "Failed to update profile",
      }
    }
  },

  // Get total referrals
  async getTotalReferrals() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats/referrals`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch total referrals")
      return await response.json()
    } catch (error) {
      console.error("Error fetching total referrals:", error)
      throw error
    }
  },

  // Get total connected wallets
  async getTotalWallets() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats/wallets`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch wallet count")
      return await response.json()
    } catch (error) {
      console.error("Error fetching wallet count:", error)
      throw error
    }
  },

  // Get users with calculator usage
  async getCalculatorUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/calculator-users`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch calculator users")
      return await response.json()
    } catch (error) {
      console.error("Error fetching calculator users:", error)
      throw error
    }
  },

  // Get total calculator usage
  async getTotalCalculatorUsage() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats/calculator-usage`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch calculator usage")
      return await response.json()
    } catch (error) {
      console.error("Error fetching calculator usage:", error)
      throw error
    }
  },

  // Get user sessions
  async getUserSessions(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch user sessions")
      return await response.json()
    } catch (error) {
      console.error("Error fetching user sessions:", error)
      throw error
    }
  },

  // Alternative function for admin to update any user (deprecated - use updateUser instead)
  async adminUpdateUser(userId, userData) {
    console.warn("adminUpdateUser is deprecated, use updateUser instead")
    return await this.updateUser(userId, userData)
  },
}

// ========================
// HELPER FUNCTIONS - Updated for actual data structure
// ========================
export const userHelpers = {
  // Calculate comprehensive stats from user data - Updated for actual structure
  calculateStats(users) {
    if (!Array.isArray(users)) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalReferrals: 0,
        totalBalance: 0,
        usersWithWallets: 0,
        calculatorUsers: 0,
        totalRevenue: 0,
        adminUsers: 0,
        regularUsers: 0,
        usersWithFirebase: 0,
        usersWithSessions: 0,
        recentlyUpdated: 0,
      }
    }

    const now = new Date()
    const recentThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive === true).length,
      inactiveUsers: users.filter((user) => user.isActive === false).length,
      totalReferrals: users.filter((user) => user.referredBy && user.referredBy !== null).length,
      totalBalance: users.reduce((sum, user) => sum + (user.balance || 0), 0),
      usersWithWallets: users.filter(
        (user) => user.walletAddresses && (user.walletAddresses.metamask || user.walletAddresses.trustWallet),
      ).length,
      calculatorUsers: users.filter((user) => user.calculatorUsage !== undefined && user.calculatorUsage > 0).length,
      totalRevenue: users.reduce((sum, user) => sum + (user.recentAmount || 0), 0),
      adminUsers: users.filter((user) => user.role === "admin").length,
      regularUsers: users.filter((user) => user.role === "user").length,
      usersWithFirebase: users.filter((user) => user.firebaseUid && user.firebaseUid !== null).length,
      usersWithSessions: users.filter(
        (user) => user.sessions && Array.isArray(user.sessions) && user.sessions.length > 0,
      ).length,
      recentlyUpdated: users.filter((user) => user.updatedAt && new Date(user.updatedAt) >= recentThreshold).length,
    }

    return stats
  },

  // Format user data for display - Updated for actual structure
  formatUserData(user) {
    if (!user) return null

    return {
      id: user._id,
      _id: user._id, // Keep original for compatibility
      name: user.name || "N/A",
      email: user.email || "No email",
      role: user.role || "user",
      isActive: user.isActive === true, // Explicit check since some users don't have this field
      balance: user.balance || 0,
      recentAmount: user.recentAmount || 0,
      hasWallet: !!(user.walletAddresses && (user.walletAddresses.metamask || user.walletAddresses.trustWallet)),
      calculatorUsage: user.calculatorUsage || 0,
      inviteCode: user.inviteCode || null,
      referredBy: user.referredBy || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || null,
      lastLogin: user.lastSignInAt || null, // Use lastSignInAt from actual data
      firebaseUid: user.firebaseUid || null,
      sessions: user.sessions || [],
      walletAddresses: user.walletAddresses || { metamask: null, trustWallet: null },
      deviceId: user.deviceId || null,
      lastSignInDevice: user.lastSignInDevice || null,
      isSignedIn: user.isSignedIn || false,
    }
  },

  // Get user activity status - Updated for actual data structure
  getUserActivityStatus(user) {
    // Check if user is explicitly inactive
    if (user.isActive === false) return "inactive"

    // Check if user has never signed in
    if (!user.lastSignInAt && !user.updatedAt) return "new"

    // Use lastSignInAt or updatedAt for activity calculation
    const lastActivity = user.lastSignInAt || user.updatedAt
    if (lastActivity) {
      const lastActivityDate = new Date(lastActivity)
      const daysSinceActivity = (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceActivity <= 1) return "active"
      if (daysSinceActivity <= 7) return "recent"
      if (daysSinceActivity <= 30) return "dormant"
      return "inactive"
    }

    return "new"
  },

  // Calculate growth metrics - Updated for actual data structure
  calculateGrowthMetrics(users) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const newUsersLast30Days = users.filter(
      (user) => user.createdAt && new Date(user.createdAt) >= thirtyDaysAgo,
    ).length

    const newUsersLast7Days = users.filter((user) => user.createdAt && new Date(user.createdAt) >= sevenDaysAgo).length

    const newUsersToday = users.filter((user) => user.createdAt && new Date(user.createdAt) >= oneDayAgo).length

    const activeUsersLast7Days = users.filter((user) => {
      const lastActivity = user.lastSignInAt || user.updatedAt
      return lastActivity && new Date(lastActivity) >= sevenDaysAgo
    }).length

    return {
      newUsersLast30Days,
      newUsersLast7Days,
      newUsersToday,
      activeUsersLast7Days,
      growthRate30Days: users.length > 0 ? (newUsersLast30Days / users.length) * 100 : 0,
      growthRate7Days: users.length > 0 ? (newUsersLast7Days / users.length) * 100 : 0,
      dailyGrowthRate: users.length > 0 ? (newUsersToday / users.length) * 100 : 0,
      weeklyActivityRate: users.length > 0 ? (activeUsersLast7Days / users.length) * 100 : 0,
    }
  },

  // Format user list for display - Updated for actual structure
  formatUserList(users) {
    if (!Array.isArray(users)) return []

    return users.map((user) => ({
      id: user._id,
      _id: user._id, // Keep original
      name: user.name || "Unnamed",
      email: user.email || "No email",
      country: user.country || "Unknown",
      wallet: this.hasWallet(user) ? "Connected" : "Not Connected",
      referredBy: user.referredBy || "Direct",
      coins: user.balance || 0,
      balance: user.balance || 0, // Keep both for compatibility
      isActive: user.isActive === true,
      role: user.role || "user",
      joinedDate: user.createdAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastSignInAt,
      lastSignInAt: user.lastSignInAt,
      inviteCode: user.inviteCode,
      calculatorUsage: user.calculatorUsage || 0,
      recentAmount: user.recentAmount || 0,
      walletAddresses: user.walletAddresses || { metamask: null, trustWallet: null },
      firebaseUid: user.firebaseUid,
      sessions: user.sessions || [],
      deviceId: user.deviceId,
      lastSignInDevice: user.lastSignInDevice,
      isSignedIn: user.isSignedIn || false,
      hasWallet: this.hasWallet(user),
    }))
  },

  // Helper function to check if user has wallet - Updated for actual structure
  hasWallet(user) {
    return !!(user.walletAddresses && (user.walletAddresses.metamask || user.walletAddresses.trustWallet))
  },

  // Format transfer data for display - Updated for MongoDB structure
  formatTransferData(transfer) {
    const dateTime = new Date(transfer.dateTime)
    return {
      id: transfer._id,
      userId: transfer.userId || transfer._id,
      userName: transfer.userName || "Unknown User",
      userEmail: transfer.email || "No email",
      amount: Number(transfer.amount) || 0,
      reason: transfer.reason || "Coin transfer",
      status: transfer.status || "completed",
      createdAt: transfer.dateTime,
      date: dateTime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: dateTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      transferredBy: transfer.adminName || "System",
      transactionId: `TXN${transfer._id}`,
      balanceBefore: transfer.balanceBefore || 0,
      balanceAfter: transfer.balanceAfter || 0,
      dateTime: transfer.dateTime,
    }
  },

  // Calculate transfer statistics - Updated helper
  calculateTransferStats(transfers) {
    if (!Array.isArray(transfers)) {
      return {
        totalTransfers: 0,
        totalAmount: 0,
        completedTransfers: 0,
        pendingTransfers: 0,
        failedTransfers: 0,
        averageAmount: 0,
        todayTransfers: 0,
        weekTransfers: 0,
        monthTransfers: 0,
      }
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const stats = {
      totalTransfers: transfers.length,
      totalAmount: transfers.reduce((sum, transfer) => sum + (Number(transfer.amount) || 0), 0),
      completedTransfers: transfers.filter((t) => t.status === "completed").length,
      pendingTransfers: transfers.filter((t) => t.status === "pending").length,
      failedTransfers: transfers.filter((t) => t.status === "failed").length,
      averageAmount: 0,
      todayTransfers: transfers.filter((t) => new Date(t.createdAt || t.dateTime) >= today).length,
      weekTransfers: transfers.filter((t) => new Date(t.createdAt || t.dateTime) >= weekAgo).length,
      monthTransfers: transfers.filter((t) => new Date(t.createdAt || t.dateTime) >= monthAgo).length,
    }

    stats.averageAmount = stats.totalTransfers > 0 ? stats.totalAmount / stats.totalTransfers : 0
    return stats
  },

  // New helper: Get user wallet info
  getUserWalletInfo(user) {
    if (!user.walletAddresses) {
      return {
        hasWallet: false,
        walletTypes: [],
        walletCount: 0,
        primaryWallet: null,
      }
    }

    const walletTypes = []
    let primaryWallet = null

    if (user.walletAddresses.metamask) {
      walletTypes.push("MetaMask")
      if (!primaryWallet) primaryWallet = { type: "MetaMask", address: user.walletAddresses.metamask }
    }

    if (user.walletAddresses.trustWallet) {
      walletTypes.push("Trust Wallet")
      if (!primaryWallet) primaryWallet = { type: "Trust Wallet", address: user.walletAddresses.trustWallet }
    }

    return {
      hasWallet: walletTypes.length > 0,
      walletTypes,
      walletCount: walletTypes.length,
      primaryWallet,
      metamask: user.walletAddresses.metamask,
      trustWallet: user.walletAddresses.trustWallet,
    }
  },

  // New helper: Get user engagement score
  getUserEngagementScore(user) {
    let score = 0

    // Base score for being active
    if (user.isActive === true) score += 20

    // Score for having wallet
    if (this.hasWallet(user)) score += 15

    // Score for calculator usage
    if (user.calculatorUsage > 0) {
      score += Math.min(user.calculatorUsage * 2, 20) // Max 20 points
    }

    // Score for recent activity
    const activityStatus = this.getUserActivityStatus(user)
    switch (activityStatus) {
      case "active":
        score += 25
        break
      case "recent":
        score += 15
        break
      case "dormant":
        score += 5
        break
      default:
        score += 0
    }

    // Score for having referrals
    if (user.referredBy) score += 10

    // Score for balance
    if (user.balance > 0) {
      score += Math.min(Math.floor(user.balance / 100), 10) // 1 point per 100 coins, max 10
    }

    return Math.min(score, 100) // Cap at 100
  },

  // New helper: Format user for export
  formatUserForExport(user) {
    const formatted = this.formatUserData(user)
    const walletInfo = this.getUserWalletInfo(user)
    const engagementScore = this.getUserEngagementScore(user)

    return {
      ID: formatted.id,
      Name: formatted.name,
      Email: formatted.email,
      Role: formatted.role,
      Status: formatted.isActive ? "Active" : "Inactive",
      Balance: formatted.balance,
      "Calculator Usage": formatted.calculatorUsage,
      "Invite Code": formatted.inviteCode || "N/A",
      "Referred By": formatted.referredBy || "Direct",
      "Has Wallet": walletInfo.hasWallet ? "Yes" : "No",
      "Wallet Types": walletInfo.walletTypes.join(", ") || "None",
      "Created Date": formatted.createdAt ? new Date(formatted.createdAt).toLocaleDateString() : "N/A",
      "Last Activity": formatted.lastLogin ? new Date(formatted.lastLogin).toLocaleDateString() : "Never",
      "Activity Status": this.getUserActivityStatus(user),
      "Engagement Score": engagementScore,
      "Firebase UID": formatted.firebaseUid || "N/A",
      "Recent Amount": formatted.recentAmount,
    }
  },
}
