// API service for handling user data
const API_BASE_URL = "http://localhost:5000/api"

export const userAPI = {
  // Fetch all users
  async getUsers(page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`)
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching user:", error)
      throw error
    }
  },
}

// Helper functions for user data
export const userHelpers = {
  // Calculate user statistics
  calculateStats(users) {
    const totalUsers = users.length
    const totalReferrals = users.filter((user) => user.referredBy).length
    const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0)
    const usersWithWallets = users.filter(
      (user) => user.walletAddresses?.metamask || user.walletAddresses?.trustWallet,
    ).length

    return {
      totalUsers,
      totalReferrals,
      totalBalance,
      usersWithWallets,
      averageBalance: totalUsers > 0 ? totalBalance / totalUsers : 0,
    }
  },

  // Format user for display
  formatUser(user) {
    return {
      id: user._id,
      name: user.name || "Unknown User",
      email: user.email,
      balance: user.balance || 0,
      walletAddress: user.walletAddresses?.metamask || user.walletAddresses?.trustWallet || "No wallet connected",
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      inviteCode: user.inviteCode,
      referredBy: user.referredBy,
    }
  },
}
