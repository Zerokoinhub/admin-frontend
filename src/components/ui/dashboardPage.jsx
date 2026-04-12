"use client";

import { useEffect, useState, useCallback } from "react";
import RewardRevenueChart from "./charts/RewardRevenueChart";
import UserGrowthChart from "./charts/UserGrowthChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  HandCoins,
  Calculator,
  Wallet,
  BadgePercent,
  Shield,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  UserCheck,
  UserX,
  Crown,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  Clock,
  Zap,
  CheckCircle,
} from "lucide-react";

// ✅ FIXED: Import only userAPI (withdrawalAPI is not exported)
import { userAPI, userHelpers } from "../../../src/lib/api";

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalReferrals: 0,
    calculatorUsers: 0,
    totalRevenue: 0,
    totalCoinDistribution: 0,
    usersWithWallets: 0,
    adminUsers: 0,
    regularUsers: 0,
    usersWithFirebase: 0,
    usersWithSessions: 0,
    recentlyUpdated: 0,
    totalCompletedWithdrawals: 0,
    growthMetrics: {
      newUsersLast30Days: 0,
      newUsersLast7Days: 0,
      newUsersToday: 0,
      activeUsersLast7Days: 0,
      growthRate30Days: 0,
      growthRate7Days: 0,
      dailyGrowthRate: 0,
      weeklyActivityRate: 0,
    },
    engagementMetrics: {
      averageEngagementScore: 0,
      highEngagementUsers: 0,
      lowEngagementUsers: 0,
    },
  });

  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [roleDisplayName, setRoleDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getUserData = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          return {
            id: userData._id || userData.id || "",
            username: userData.username || userData.name || "",
            email: userData.email || "",
            role: userData.role?.toLowerCase() || "",
          };
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
    return {
      id: "",
      username: "",
      email: "",
      role: "",
    };
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "superadmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "editor":
        return "Editor";
      case "viewer":
        return "Viewer";
      default:
        return "Unknown";
    }
  };

  const getRoleColorScheme = (role) => {
    switch (role) {
      case "superadmin":
      case "admin":
        return {
          bg: "bg-gradient-to-r from-purple-50 to-indigo-50",
          badge: "bg-purple-100 text-purple-800 border-purple-200",
          accent: "text-purple-600",
        };
      case "editor":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
          badge: "bg-blue-100 text-blue-800 border-blue-200",
          accent: "text-blue-600",
        };
      case "viewer":
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50",
          badge: "bg-green-100 text-green-800 border-green-200",
          accent: "text-green-600",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50",
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          accent: "text-gray-600",
        };
    }
  };

  const canViewRevenue = (role) => {
    return role === "superadmin" || role === "admin";
  };

  const canViewSensitiveData = (role) => {
    return role === "superadmin" || role === "admin";
  };

  const getPermissionsDescription = (role) => {
    switch (role) {
      case "superadmin":
      case "admin":
        return "Full Dashboard Access";
      case "editor":
        return "Limited Access (No Revenue Data)";
      case "viewer":
        return "Limited Access (No Revenue Data)";
      default:
        return "No Permissions";
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (num) => {
    return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
  };

  const calculateEngagementMetrics = (users) => {
    if (!Array.isArray(users) || users.length === 0) {
      return {
        averageEngagementScore: 0,
        highEngagementUsers: 0,
        lowEngagementUsers: 0,
      };
    }

    const engagementScores = users.map((user) =>
      userHelpers.getUserEngagementScore(user)
    );
    const averageScore =
      engagementScores.reduce((sum, score) => sum + score, 0) /
      engagementScores.length;

    return {
      averageEngagementScore: Math.round(averageScore),
      highEngagementUsers: engagementScores.filter((score) => score >= 70)
        .length,
      lowEngagementUsers: engagementScores.filter((score) => score < 30).length,
    };
  };

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // ✅ FIXED: Use userAPI for both calls
      const [usersResponse, withdrawalsResponse] = await Promise.all([
        userAPI.getUsers(1, 1000),
        userAPI.getWithdrawalRequests({ limit: 5000, status: 'all' })
      ]);

      let usersData = [];
      if (
        usersResponse.success &&
        usersResponse.data &&
        usersResponse.data.users
      ) {
        usersData = usersResponse.data.users;
      } else if (usersResponse.users) {
        usersData = usersResponse.users;
      } else if (Array.isArray(usersResponse.data)) {
        usersData = usersResponse.data;
      }

      let completedWithdrawalsCount = 0;
      if (withdrawalsResponse && withdrawalsResponse.success) {
        const withdrawals = withdrawalsResponse.data || withdrawalsResponse.withdrawals || [];
        completedWithdrawalsCount = withdrawals.filter(
          (req) => req.status === "completed"
        ).length;
      }

      console.log("Users data loaded:", usersData.length, "users");

      const stats = userHelpers.calculateStats(usersData);
      const growthMetrics = userHelpers.calculateGrowthMetrics(usersData);
      const engagementMetrics = calculateEngagementMetrics(usersData);

      let calculatorUsersCount = stats.calculatorUsers;
      let totalWalletsCount = stats.usersWithWallets;
      let totalReferralsCount = stats.totalReferrals;

      try {
        const [calculatorRes, walletsRes, referralsRes] =
          await Promise.allSettled([
            userAPI.getCalculatorUsers(),
            userAPI.getTotalWallets(),
            userAPI.getTotalReferrals(),
          ]);

        if (calculatorRes.status === "fulfilled" && calculatorRes.value?.data) {
          calculatorUsersCount = Array.isArray(calculatorRes.value.data)
            ? calculatorRes.value.data.length
            : calculatorRes.value.data.count || calculatorUsersCount;
        }

        if (walletsRes.status === "fulfilled" && walletsRes.value?.data) {
          totalWalletsCount =
            walletsRes.value.data.count ||
            walletsRes.value.data ||
            totalWalletsCount;
        }

        if (referralsRes.status === "fulfilled" && referralsRes.value?.data) {
          totalReferralsCount =
            referralsRes.value.data.count ||
            referralsRes.value.data ||
            totalReferralsCount;
        }
      } catch (apiError) {
        console.warn(
          "Some API endpoints failed, using calculated values:",
          apiError
        );
      }

      setDashboardStats({
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        inactiveUsers: stats.inactiveUsers,
        totalReferrals: totalReferralsCount,
        calculatorUsers: calculatorUsersCount,
        totalRevenue: stats.totalRevenue,
        totalCoinDistribution: stats.totalBalance,
        usersWithWallets: totalWalletsCount,
        adminUsers: stats.adminUsers,
        regularUsers: stats.regularUsers,
        usersWithFirebase: stats.usersWithFirebase,
        usersWithSessions: stats.usersWithSessions,
        recentlyUpdated: stats.recentlyUpdated,
        totalCompletedWithdrawals: completedWithdrawalsCount,
        growthMetrics,
        engagementMetrics,
      });

      setUsers(usersData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  useEffect(() => {
    const userData = getUserData();
    setUserName(userData.username);
    setUserEmail(userData.email);
    setUserRole(userData.role);
    setRoleDisplayName(getRoleDisplayName(userData.role));
    loadDashboardData();
  }, [loadDashboardData]);

  const colorScheme = getRoleColorScheme(userRole);

  // ... rest of your component remains the same (stats array, return statement, etc.)
  // Make sure to keep all the JSX code as is

  const stats = [
    // ... your existing stats array
  ];

  const filteredStats = stats.filter((stat) => {
    return stat.allowedRoles.includes(userRole);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">{error}</p>
          <Button
            onClick={() => loadDashboardData()}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!userName || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Authentication Required
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Unable to load user data from localStorage. Please log in again to
            access the dashboard.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // Keep your existing JSX return statement here
  return (
    // ... your existing JSX
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Rest of your JSX */}
    </div>
  );
}
