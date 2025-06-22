const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const transferAPI = {
  // Transfer coins manually to a user
  async transferCoins(userId, amount, reason = "Manual transfer") {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/coin-transfer`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: Number(amount),
          reason,
          timestamp: new Date().toISOString(),
        }),
      })

      const result = await res.json()

      if (!res.ok) throw new Error(result.message || "Failed to transfer coins")

      return {
        success: true,
        data: {
          transferId: result.transferId || `TX-${Date.now()}`,
          user: result.user,
          newBalance: result.newBalance,
          reason: result.reason,
          timestamp: result.timestamp,
          amount: Number(amount),
          balanceBefore: result.balanceBefore,
          balanceAfter: result.newBalance,
        },
      }
    } catch (error) {
      console.error("Transfer API error:", error)
      throw error
    }
  },

  // Get paginated and filtered transfer history
  async getHistory({ page = 1, limit = 10, status, userId, startDate, endDate, search } = {}) {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })

      if (status && status !== "all") params.append("status", status)
      if (userId) params.append("userId", userId)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (search) params.append("search", search)

      const res = await fetch(`${API_BASE_URL}/transfers/history?${params}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Failed to fetch transfer history")

      return {
        success: true,
        data: {
          transfers: result.transfers || [],
          totalPages: result.totalPages || 1,
          total: result.total || 0,
          currentPage: result.currentPage || page,
        },
      }
    } catch (error) {
      console.error("Get history API error:", error)
      throw error
    }
  },

  // Get a specific transfer by ID
  async getTransferById(transferId) {
    try {
      const res = await fetch(`${API_BASE_URL}/transfers/${transferId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Failed to fetch transfer")

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("Get transfer by ID error:", error)
      throw error
    }
  },

  // Update the status of a transfer (completed, pending, failed)
  async updateTransferStatus(transferId, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/transfers/${transferId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Failed to update status")

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("Update transfer status error:", error)
      throw error
    }
  },
}
