import { userAPI, userHelpers } from "./api.js";

// Helper: Get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const transferAPI = {
  // ✅ Transfer coins using backend-logged transaction
  async transferCoins(userId, amount, reason = "Manual transfer", existingUserData = null) {
    try {
      if (!existingUserData) {
        throw new Error("User data is required for transfer.");
      }

      if (!existingUserData.firebaseUid) {
        throw new Error("User does not have a Firebase UID.");
      }

      const currentBalance = existingUserData.balance || existingUserData.coins || 0;
      const newBalance = currentBalance + Number(amount);

      const result = await userAPI.editUserBalance(existingUserData.firebaseUid, newBalance);

      if (result.success) {
        return {
          success: true,
          data: {
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            amount: Number(amount),
            reason,
            timestamp: new Date().toISOString(),
            user: result.data.user,
            message: result.data.message,
          },
        };
      } else {
        return {
          success: false,
          error: result.message || "Failed to update balance",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // ✅ Refresh user data after transfer
  async refreshUserData(userId) {
    try {
      const result = await userAPI.getUserById(userId);

      if (result && (result.user || result._id || result.id)) {
        const userData = result.user || result;
        return {
          success: true,
          data: userHelpers.formatUserData(userData),
        };
      } else {
        return {
          success: false,
          message: "Could not refresh user data",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // ✅ Get transfer history
  async getHistory(filters = {}) {
    try {
      const result = await userAPI.getTransferHistory(filters);
      if (result.success) {
        return result;
      } else {
        return {
          success: false,
          message: result.message,
          data: {
            transfers: [],
            total: 0,
            totalPages: 1,
            currentPage: 1,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: {
          transfers: [],
          total: 0,
          totalPages: 1,
          currentPage: 1,
        },
      };
    }
  },

  // ✅ Update transfer status
  async updateTransferStatus(transferId, newStatus) {
    try {
      const result = await userAPI.updateTransferStatus(transferId, newStatus);
      if (result && result.success !== false) {
        return {
          success: true,
          data: result,
        };
      } else {
        throw new Error(result.message || "Failed to update transfer status");
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // ✅ Batch transfer coins
  async batchTransferCoins(transfers) {
    const results = [];

    for (const transfer of transfers) {
      try {
        const result = await this.transferCoins(
          transfer.userId,
          transfer.amount,
          transfer.reason || "Batch transfer",
          transfer.existingUserData
        );
        results.push({
          userId: transfer.userId,
          success: result.success,
          data: result.data,
          error: result.error,
        });
      } catch (error) {
        results.push({
          userId: transfer.userId,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      results,
      totalProcessed: results.length,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
    };
  },

  // ✅ Validate before transfer
  async validateTransfer(existingUserData, amount, reason) {
    const errors = [];

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      errors.push("Invalid transfer amount");
    }

    if (Number(amount) > 10000) {
      errors.push("Transfer amount cannot exceed 10,000 coins");
    }

    if (!reason || reason.trim().length < 5) {
      errors.push("Transfer reason must be at least 5 characters");
    }

    if (!existingUserData) {
      errors.push("User data is required");
    } else if (!existingUserData.firebaseUid) {
      errors.push("User must have a Firebase UID");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // ✅ Transfer statistics
  async getTransferStatistics(filters = {}) {
    try {
      const historyResult = await this.getHistory(filters);
      if (historyResult.success) {
        const stats = userHelpers.calculateTransferStats(historyResult.data.transfers);
        return {
          success: true,
          data: stats,
        };
      } else {
        throw new Error(historyResult.message);
      }
    } catch (error) {
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
      };
    }
  },

  // ✅ Format user for transfer
  formatUserForTransfer(user) {
    return {
      id: user._id || user.id,
      firebaseUid: user.firebaseUid,
      balance: user.balance || user.coins || 0,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    };
  },

  // ✅ Validate user for transfer
  validateUserForTransfer(user) {
    const errors = [];

    if (!user) {
      errors.push("User data is required");
      return { isValid: false, errors };
    }

    if (!user.firebaseUid) {
      errors.push("User must have a Firebase UID");
    }

    if (user.balance === undefined && user.coins === undefined) {
      errors.push("User must have a balance field");
    }

    if (!user.name) {
      errors.push("User must have a name");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // ✅ Create transfer record for local display
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
    };
  },
};

export default transferAPI;
