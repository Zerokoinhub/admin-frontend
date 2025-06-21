// API service for handling user data and helpers
const API_BASE_URL = "http://localhost:5000/api"

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
  // Fetch paginated user list
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
      return await response.json()
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

  // Ban a user
  async banUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
        method: "POST",
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
        method: "POST",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to unban user")
      return await response.json()
    } catch (error) {
      console.error("Error unbanning user:", error)
      throw error
    }
  },

  // Manual coin transfer - Enhanced with reason parameter
  async transferCoins(userId, amount, reason = "Manual transfer") {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/coin-transfer`, {
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
          newBalance: result.newBalance,
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

  // Get transfer history - New method
  async getTransferHistory(filters = {}) {
    try {
      const params = new URLSearchParams()

      if (filters.page) params.append("page", filters.page.toString())
      if (filters.limit) params.append("limit", filters.limit.toString())
      if (filters.search) params.append("search", filters.search)
      if (filters.status) params.append("status", filters.status)
      if (filters.dateRange) params.append("dateRange", filters.dateRange)
      if (filters.userId) params.append("userId", filters.userId)

      const response = await fetch(`${API_BASE_URL}/transfers/history?${params}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch transfer history")
      }

      const result = await response.json()
      return {
        success: true,
        data: {
          transfers: result.transfers || [],
          total: result.total || 0,
          totalPages: result.totalPages || 1,
          currentPage: result.currentPage || 1,
        },
      }
    } catch (error) {
      console.error("Error fetching transfer history:", error)
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

  // Get transfer by ID - New method
  async getTransferById(transferId) {
    try {
      const response = await fetch(`${API_BASE_URL}/transfers/${transferId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch transfer")
      return await response.json()
    } catch (error) {
      console.error("Error fetching transfer:", error)
      throw error
    }
  },

  // Update transfer status - New method
  async updateTransferStatus(transferId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/transfers/${transferId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update transfer status")
      return await response.json()
    } catch (error) {
      console.error("Error updating transfer status:", error)
      throw error
    }
  },

  // Change user password
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      })
      if (!response.ok) throw new Error("Failed to change password")
      return await response.json()
    } catch (error) {
      console.error("Error changing password:", error)
      throw error
    }
  },

  // Get logged-in user's profile
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to get profile")
      return await response.json()
    } catch (error) {
      console.error("Error getting profile:", error)
      throw error
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
      if (!response.ok) throw new Error("Failed to update profile")
      return await response.json()
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  },

  // Get total referrals
  async getTotalReferrals() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/total-referrals`, {
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
      const response = await fetch(`${API_BASE_URL}/users/total-wallets`, {
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
}

// ========================
// HELPER FUNCTIONS
// ========================
export const userHelpers = {
  // Calculate comprehensive stats from user data
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
      }
    }

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive !== false).length,
      inactiveUsers: users.filter((user) => user.isActive === false).length,
      totalReferrals: users.filter((user) => user.referredBy).length,
      totalBalance: users.reduce((sum, user) => sum + (user.balance || 0), 0),
      usersWithWallets: users.filter(
        (user) => user.walletAddresses && (user.walletAddresses.metamask || user.walletAddresses.trustWallet),
      ).length,
      calculatorUsers: users.filter((user) => user.calculatorUsage !== undefined && user.calculatorUsage > 0).length,
      totalRevenue: users.reduce((sum, user) => sum + (user.recentAmount || 0), 0),
      adminUsers: users.filter((user) => user.role === "admin").length,
      regularUsers: users.filter((user) => user.role === "user").length,
    }

    return stats
  },

  // Format user data for display
  formatUserData(user) {
    return {
      id: user._id,
      name: user.name || user.username || "N/A",
      email: user.email,
      role: user.role,
      isActive: user.isActive !== false,
      balance: user.balance || 0,
      recentAmount: user.recentAmount || 0,
      hasWallet: !!(user.walletAddresses && (user.walletAddresses.metamask || user.walletAddresses.trustWallet)),
      calculatorUsage: user.calculatorUsage || 0,
      inviteCode: user.inviteCode,
      referredBy: user.referredBy,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }
  },

  // Get user activity status
  getUserActivityStatus(user) {
    if (user.isActive === false) return "inactive"
    if (user.lastLogin) {
      const lastLogin = new Date(user.lastLogin)
      const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLogin <= 1) return "active"
      if (daysSinceLogin <= 7) return "recent"
      return "dormant"
    }
    return "new"
  },

  // Calculate growth metrics
  calculateGrowthMetrics(users) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const newUsersLast30Days = users.filter((user) => new Date(user.createdAt) >= thirtyDaysAgo).length

    const newUsersLast7Days = users.filter((user) => new Date(user.createdAt) >= sevenDaysAgo).length

    return {
      newUsersLast30Days,
      newUsersLast7Days,
      growthRate30Days: users.length > 0 ? (newUsersLast30Days / users.length) * 100 : 0,
      growthRate7Days: users.length > 0 ? (newUsersLast7Days / users.length) * 100 : 0,
    }
  },

  // Format user list for display
  formatUserList(users) {
    if (!Array.isArray(users)) return []

    return users.map((user) => ({
      id: user._id,
      name: user.name || user.username || "Unnamed",
      email: user.email || "No email",
      country: user.country || "Unknown",
      wallet: this.hasWallet(user) ? "Connected" : "Not Connected",
      referredBy: user.referredBy || "Direct",
      coins: user.balance || 0,
      isActive: user.isActive !== false,
      role: user.role || "user",
      joinedDate: user.createdAt,
      lastLogin: user.lastLogin,
      inviteCode: user.inviteCode,
      calculatorUsage: user.calculatorUsage || 0,
      recentAmount: user.recentAmount || 0,
      walletAddresses: user.walletAddresses,
      firebaseUid: user.firebaseUid,
      sessions: user.sessions || [],
    }))
  },

  // Helper function to check if user has wallet
  hasWallet(user) {
    return !!(user.walletAddresses && (user.walletAddresses.metamask || user.walletAddresses.trustWallet))
  },

  // Format transfer data for display - New helper
  formatTransferData(transfer) {
    return {
      id: transfer.id || transfer._id,
      userId: transfer.userId,
      userName: transfer.userName || "Unknown User",
      userEmail: transfer.userEmail || "No email",
      amount: Number(transfer.amount) || 0,
      reason: transfer.reason || "No reason provided",
      status: transfer.status || "pending",
      createdAt: transfer.createdAt,
      date: transfer.date || new Date(transfer.createdAt).toLocaleDateString(),
      time: transfer.time || new Date(transfer.createdAt).toLocaleTimeString(),
      transferredBy: transfer.transferredBy || transfer.adminName || "System",
      transactionId: transfer.transactionId || `TXN${Date.now()}`,
      balanceBefore: transfer.balanceBefore || 0,
      balanceAfter: transfer.balanceAfter || 0,
    }
  },

  // Calculate transfer statistics - New helper
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
      todayTransfers: transfers.filter((t) => new Date(t.createdAt) >= today).length,
      weekTransfers: transfers.filter((t) => new Date(t.createdAt) >= weekAgo).length,
      monthTransfers: transfers.filter((t) => new Date(t.createdAt) >= monthAgo).length,
    }

    stats.averageAmount = stats.totalTransfers > 0 ? stats.totalAmount / stats.totalTransfers : 0

    return stats
  },
}
