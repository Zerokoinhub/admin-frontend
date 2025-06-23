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
  // Fetch paginated user list - Updated to handle actual response structure
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

      // Handle the actual response structure: { success: true, data: { users: [...], pagination: {...} } }
      if (result.success && result.data) {
        return {
          success: true,
          users: result.data.users || [],
          pagination: result.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
          data: result.data.users || [], // For backward compatibility
        }
      }

      return result
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

  // NEW: Edit user balance directly using the edit-balance endpoint
  editUserBalance: async (firebaseUid, newBalance) => {
  try {
    // Input validation
    if (!firebaseUid || typeof newBalance !== "number") {
      throw new Error("Invalid input: firebaseUid and numeric newBalance are required.");
    }

    // API request
    const response = await fetch(`${API_BASE_URL}/users/edit-balance`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firebaseUid,
        newBalance: Number(newBalance),
      }),
    });

    // Handle non-200 response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update user balance");
    }

    // Parse response
    const result = await response.json();

    return {
      success: true,
      data: {
        user: result.user,
        newBalance: result.user.balance,
        message: result.message,
        balanceAfter: result.user.balance,
        // Optional fallback fields
        balanceBefore: null,
        transactionId: null,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error updating user balance:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}
,


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
      const response = await this.getUsers()
      if (!response.ok) throw new Error("Failed to fetch calculator users")
      return await response.json()
    } catch (error) {
      console.error("Error fetching calculator users:", error)
      throw error
    }
  },

  // Update user active status
  async updateUserStatus(userId, isActive) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive }),
      })
      if (!response.ok) throw new Error("Failed to update user status")
      return await response.json()
    } catch (error) {
      console.error("Error updating user status:", error)
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
