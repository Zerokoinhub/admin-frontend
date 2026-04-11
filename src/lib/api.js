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

// Helper: Get auth headers for form data
const getFormDataHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// ========================
// API SERVICE
// ========================
export const userAPI = {
  // Fetch paginated user list - Enhanced to handle multiple response structures
  async getUsers(page = 1, limit = 100, filters = {}) {
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
          users = result.data.users
          pagination = result.data.pagination || pagination
        } else if (Array.isArray(result.data)) {
          users = result.data
          pagination.totalItems = users.length
        }
      } else if (result.users) {
        users = result.users
        pagination = result.pagination || pagination
      } else if (Array.isArray(result)) {
        users = result
        pagination.totalItems = users.length
      }
      
      // ✅ Ensure users array exists
      users = users || []
      
      return {
        success: true,
        users: users,
        data: users,
        pagination: pagination,
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      return {
        success: false,
        users: [],
        data: [],
        error: error.message,
      }
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

  // Update user - Enhanced to handle new fields
  async updateUser(userId, userData) {
    try {
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

  // ===== SESSION MANAGEMENT =====
  async getUserSessions(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch user sessions")
      const result = await response.json()
      return {
        success: true,
        sessions: result.sessions || [],
        data: result.sessions || [],
      }
    } catch (error) {
      console.error("Error fetching user sessions:", error)
      return {
        success: false,
        message: error.message,
        sessions: [],
      }
    }
  },

  async updateUserSession(userId, sessionNumber, action) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sessionNumber: Number(sessionNumber),
          action: action,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update session")
      }
      const result = await response.json()
      return {
        success: true,
        session: result.session,
        message: result.message || `Session ${sessionNumber} ${action}ed successfully`,
      }
    } catch (error) {
      console.error("Error updating user session:", error)
      return {
        success: false,
        message: error.message || "Failed to update session",
      }
    }
  },

  // ===== NOTIFICATION SETTINGS =====
  async updateNotificationSettings(userId, settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/notifications`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update notification settings")
      }
      const result = await response.json()
      return {
        success: true,
        notificationSettings: result.notificationSettings,
        message: result.message || "Notification settings updated successfully",
      }
    } catch (error) {
      console.error("Error updating notification settings:", error)
      return {
        success: false,
        message: error.message || "Failed to update notification settings",
      }
    }
  },

  // ===== NOTIFICATION MANAGEMENT =====
  async sendGeneralNotification(notificationData) {
    try {
      const { title, message, imageUrl, link, priority = "old-user" } = notificationData
      if (!title || !message) {
        throw new Error("Title and message are required")
      }
      const response = await fetch(`${API_BASE_URL}/notifications/general`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          message,
          imageUrl,
          link,
          priority,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to send general notification")
      }
      const result = await response.json()
      return {
        success: true,
        message: result.message || "General notification sent successfully",
        data: result.data,
      }
    } catch (error) {
      console.error("Error sending general notification:", error)
      return {
        success: false,
        message: error.message || "Failed to send general notification",
      }
    }
  },

  async sendTopUsersNotification(notificationData) {
    try {
      const { title, message, imageUrl, link, limit = 10, priority = "top-rated-user" } = notificationData
      if (!title || !message) {
        throw new Error("Title and message are required")
      }
      const response = await fetch(`${API_BASE_URL}/notifications/top-users`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          message,
          imageUrl,
          link,
          limit,
          priority,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to send notification to top users")
      }
      const result = await response.json()
      return {
        success: true,
        message: result.message || "Notification sent to top users successfully",
        data: result.data,
      }
    } catch (error) {
      console.error("Error sending notification to top users:", error)
      return {
        success: false,
        message: error.message || "Failed to send notification to top users",
      }
    }
  },

  async sendSingleUserNotification(notificationData) {
    try {
      const { title, message, imageUrl, link, firebaseUid, priority = "old-user" } = notificationData
      if (!title || !message || !firebaseUid) {
        throw new Error("Title, message, and firebaseUid are required")
      }
      const response = await fetch(`${API_BASE_URL}/notifications/single-user`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          message,
          imageUrl,
          link,
          firebaseUid,
          priority,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to send notification to user")
      }
      const result = await response.json()
      return {
        success: true,
        message: result.message || "Notification sent to user successfully",
        data: result.data,
      }
    } catch (error) {
      console.error("Error sending notification to user:", error)
      return {
        success: false,
        message: error.message || "Failed to send notification to user",
      }
    }
  },

  async sendGeneralNotificationWithImage(notificationData, imageFile) {
    try {
      const { title, message, link, priority = "old-user" } = notificationData
      if (!title || !message) {
        throw new Error("Title and message are required")
      }
      const formData = new FormData()
      formData.append("title", title)
      formData.append("message", message)
      if (link) formData.append("link", link)
      formData.append("priority", priority)
      if (imageFile) formData.append("image", imageFile)
      const response = await fetch(`${API_BASE_URL}/notifications/general-with-image`, {
        method: "POST",
        headers: getFormDataHeaders(),
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to send notification with image")
      }
      const result = await response.json()
      return {
        success: true,
        message: result.message || "Notification with image sent successfully",
        data: result.data,
      }
    } catch (error) {
      console.error("Error sending notification with image:", error)
      return {
        success: false,
        message: error.message || "Failed to send notification with image",
      }
    }
  },

  async getNotifications(filters = {}) {
    try {
      const { page = 1, limit = 10, type, priority } = filters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (type) params.append("type", type)
      if (priority) params.append("priority", priority)
      const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch notifications")
      }
      const result = await response.json()
      return {
        success: true,
        data: result.data || [],
        notifications: result.data || [],
        pagination: result.pagination || {
          currentPage: page,
          totalPages: 1,
          totalNotifications: 0,
          hasNext: false,
          hasPrev: false,
        },
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      return {
        success: false,
        message: error.message || "Failed to fetch notifications",
        data: [],
        notifications: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalNotifications: 0,
          hasNext: false,
          hasPrev: false,
        },
      }
    }
  },

  async getNotificationById(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch notification")
      }
      const result = await response.json()
      return {
        success: true,
        data: result.data,
        notification: result.data,
      }
    } catch (error) {
      console.error("Error fetching notification:", error)
      return {
        success: false,
        message: error.message || "Failed to fetch notification",
        data: null,
        notification: null,
      }
    }
  },

  // ===== FCM TOKEN MANAGEMENT =====
  async addFcmToken(userId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/fcm-token`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ token }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to add FCM token")
      }
      const result = await response.json()
      return {
        success: true,
        fcmTokens: result.fcmTokens || [],
        message: result.message || "FCM token added successfully",
      }
    } catch (error) {
      console.error("Error adding FCM token:", error)
      return {
        success: false,
        message: error.message || "Failed to add FCM token",
      }
    }
  },

  async removeFcmToken(userId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/fcm-token`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ token }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to remove FCM token")
      }
      const result = await response.json()
      return {
        success: true,
        fcmTokens: result.fcmTokens || [],
        message: result.message || "FCM token removed successfully",
      }
    } catch (error) {
      console.error("Error removing FCM token:", error)
      return {
        success: false,
        message: error.message || "Failed to remove FCM token",
      }
    }
  },

  // ===== SCREENSHOT MANAGEMENT =====
  async getUserScreenshots(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/screenshots`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch user screenshots")
      }
      const result = await response.json()
      return {
        success: true,
        screenshots: result.screenshots || [],
        data: result.screenshots || [],
        message: result.message || "Screenshots fetched successfully",
      }
    } catch (error) {
      console.error("Error fetching user screenshots:", error)
      return {
        success: false,
        message: error.message || "Failed to fetch user screenshots",
        screenshots: [],
        data: [],
      }
    }
  },

  async addScreenshot(userId, screenshotData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/screenshots`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ screenshot: screenshotData }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to add screenshot")
      }
      const result = await response.json()
      return {
        success: true,
        screenshots: result.screenshots || [],
        message: result.message || "Screenshot added successfully",
      }
    } catch (error) {
      console.error("Error adding screenshot:", error)
      return {
        success: false,
        message: error.message || "Failed to add screenshot",
      }
    }
  },

  // ===== ENHANCED STATISTICS =====
  async getUserStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats/overview`, {
        method: "GET",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch user statistics")
      const result = await response.json()
      return {
        success: true,
        stats: result.stats || {},
        countryStats: result.countryStats || [],
        data: result.stats || {},
      }
    } catch (error) {
      console.error("Error fetching user statistics:", error)
      return {
        success: false,
        message: error.message,
        stats: {},
        countryStats: [],
      }
    }
  },

  // ===== USER MANAGEMENT ACTIONS =====
  async banUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
        method: "PUT",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to ban user")
      return await response.json()
    } catch (error) {
      console.error("Error banning user:", error)
      throw error
    }
  },

  async unbanUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/unban`, {
        method: "PUT",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Failed to unban user")
      return await response.json()
    } catch (error) {
      console.error("Error unbanning user:", error)
      throw error
    }
  },

  async updateUserStatus(userId, isActive) {
    try {
      return await this.updateUser(userId, { isActive })
    } catch (error) {
      console.error("Error updating user status:", error)
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
          transactionId: result.transactionId || `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
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

  async editUserBalance(email, newBalance, admin) {
    try {
      if (!email || typeof newBalance !== "number") {
        throw new Error("Invalid input: email and numeric newBalance are required.")
      }
      const response = await fetch(`${API_BASE_URL}/users/edit-balance`, {
        method: "POST",
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

  // ===== TRANSFER HISTORY =====
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

  // ===== AUTHENTICATION & PROFILE =====
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "PUT",
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
          data: result.user,
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

  // ===== LEGACY STATISTICS ENDPOINTS =====
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

  async adminUpdateUser(userId, userData) {
    console.warn("adminUpdateUser is deprecated, use updateUser instead")
    return await this.updateUser(userId, userData)
  },
}

// ========================
// HELPER FUNCTIONS - FULLY FIXED
// ========================
export const userHelpers = {
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
        usersWithNotifications: 0,
        usersWithFcmTokens: 0,
        usersWithScreenshots: 0,
        connectedWallets: 0,
        notConnectedWallets: 0,
        pendingWallets: 0,
        totalRecentAmount: 0,
      }
    }
    const now = new Date()
    const recentThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
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
      usersWithNotifications: users.filter((user) => user.notificationSettings).length,
      usersWithFcmTokens: users.filter((user) => user.fcmTokens && user.fcmTokens.length > 0).length,
      usersWithScreenshots: users.filter((user) => user.screenshots && user.screenshots.length > 0).length,
      connectedWallets: users.filter((user) => user.walletStatus === "Connected").length,
      notConnectedWallets: users.filter((user) => user.walletStatus === "Not Connected").length,
      pendingWallets: users.filter((user) => user.walletStatus === "Pending").length,
      totalRecentAmount: users.reduce((sum, user) => sum + (user.recentAmount || 0), 0),
    }
    return stats
  },

  formatUserData(user) {
    if (!user) return null
    return {
      id: user._id || user.id,
      _id: user._id || user.id,
      name: user.name || "N/A",
      email: user.email || "No email",
      role: user.role || "user",
      isActive: user.isActive === true,
      balance: user.balance || 0,
      recentAmount: user.recentAmount || 0,
      hasWallet: !!(user.walletAddresses && (user.walletAddresses.metamask || user.walletAddresses.trustWallet)),
      calculatorUsage: user.calculatorUsage || 0,
      inviteCode: user.inviteCode || null,
      referredBy: user.referredBy || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || null,
      lastLogin: user.lastSignInAt || null,
      firebaseUid: user.firebaseUid || user.uid || null,
      uid: user.uid || user.firebaseUid || null,
      sessions: user.sessions || [],
      walletAddresses: user.walletAddresses || { metamask: null, trustWallet: null },
      walletStatus: user.walletStatus || "Not Connected",
      country: user.country || "Unknown",
      notificationSettings: user.notificationSettings || { sessionUnlocked: true, pushEnabled: true },
      fcmTokens: user.fcmTokens || [],
      screenshots: user.screenshots || [],
      deviceId: user.deviceId || null,
      lastSignInDevice: user.lastSignInDevice || null,
      isSignedIn: user.isSignedIn || false,
      photoURL: user.photoURL || user.profileImage || user.avatar || user.imageUrl || null,
    }
  },

  getUserActivityStatus(user) {
    if (user.isActive === false) return "inactive"
    if (!user.lastSignInAt && !user.updatedAt) return "new"
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

  formatUserList(users) {
    if (!Array.isArray(users)) return []
    return users.map((user) => this.formatUserData(user))
  },

  hasWallet(user) {
    return !!(user.walletAddresses && (user.walletAddresses.metamask || user.walletAddresses.trustWallet))
  },

  getSessionProgress(user) {
    if (!user.sessions || !Array.isArray(user.sessions)) {
      return {
        totalSessions: 0,
        unlockedSessions: 0,
        completedSessions: 0,
        claimedSessions: 0,
        progressPercentage: 0,
      }
    }
    const totalSessions = user.sessions.length
    const unlockedSessions = user.sessions.filter((s) => !s.isLocked).length
    const completedSessions = user.sessions.filter((s) => s.completedAt).length
    const claimedSessions = user.sessions.filter((s) => s.claimedAt || s.isClaimed).length
    
    return {
      totalSessions,
      unlockedSessions,
      completedSessions,
      claimedSessions,
      progressPercentage: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    }
  },

  // ✅ NEW: Calculate transfer statistics
  calculateTransferStats(transfers) {
    if (!Array.isArray(transfers) || transfers.length === 0) {
      return {
        totalTransfers: 0,
        totalAmount: 0,
        completedTransfers: 0,
        pendingTransfers: 0,
        failedTransfers: 0,
        averageAmount: 0,
        successRate: 0,
        transfersByStatus: {
          completed: 0,
          pending: 0,
          failed: 0,
        },
        recentTransfers: [],
      }
    }

    const totalAmount = transfers.reduce((sum, t) => sum + (t.amount || 0), 0)
    const completedTransfers = transfers.filter(t => t.status === 'completed' || t.status === 'success').length
    const pendingTransfers = transfers.filter(t => t.status === 'pending').length
    const failedTransfers = transfers.filter(t => t.status === 'failed' || t.status === 'error').length
    const successRate = transfers.length > 0 ? (completedTransfers / transfers.length) * 100 : 0

    return {
      totalTransfers: transfers.length,
      totalAmount: totalAmount,
      completedTransfers: completedTransfers,
      pendingTransfers: pendingTransfers,
      failedTransfers: failedTransfers,
      averageAmount: transfers.length > 0 ? totalAmount / transfers.length : 0,
      successRate: successRate,
      transfersByStatus: {
        completed: completedTransfers,
        pending: pendingTransfers,
        failed: failedTransfers,
      },
      recentTransfers: transfers.slice(0, 10),
    }
  },
}
