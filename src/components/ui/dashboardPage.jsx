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

import { userAPI, userHelpers, withdrawalAPI } from "../../../src/lib/api";

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

      const [usersResponse, withdrawalsResponse] = await Promise.all([
        userAPI.getUsers(1, 1000),
        withdrawalAPI.getWithdrawalRequests({ limit: 5000, status: 'all' })
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
        completedWithdrawalsCount = withdrawalsResponse.data.filter(
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

  const stats = [
    {
      label: "Total Users",
      value: dashboardStats.totalUsers,
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: formatPercentage(dashboardStats.growthMetrics.growthRate30Days),
      changeType:
        dashboardStats.growthMetrics.growthRate30Days >= 0
          ? "positive"
          : "negative",
      description: "Total registered users",
    },
    {
      label: "Active Users",
      value: dashboardStats.activeUsers,
      icon: <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: `${dashboardStats.totalUsers > 0
        ? (
          (dashboardStats.activeUsers / dashboardStats.totalUsers) *
          100
        ).toFixed(1)
        : 0
        }%`,
      changeType: "neutral",
      description: "Currently active users",
    },
    {
      label: "Users with Wallets",
      value: dashboardStats.usersWithWallets,
      icon: <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      change: `${dashboardStats.totalUsers > 0
        ? (
          (dashboardStats.usersWithWallets / dashboardStats.totalUsers) *
          100
        ).toFixed(1)
        : 0
        }%`,
      changeType: "neutral",
      description: "Users with connected wallets",
    },
    {
      label: "Total Referrals",
      value: dashboardStats.totalReferrals,
      icon: <BadgePercent className="h-4 w-4 sm:h-5 sm:w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      change: `${dashboardStats.totalUsers > 0
        ? (
          (dashboardStats.totalReferrals / dashboardStats.totalUsers) *
          100
        ).toFixed(1)
        : 0
        }%`,
      changeType: "neutral",
      description: "Users referred by others",
    },
    {
      label: "Calculator Users",
      value: dashboardStats.calculatorUsers,
      icon: <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      change: `${dashboardStats.totalUsers > 0
        ? (
          (dashboardStats.calculatorUsers / dashboardStats.totalUsers) *
          100
        ).toFixed(1)
        : 0
        }%`,
      changeType: "neutral",
      description: "Users who used calculator",
    },
    {
      label: "Inactive Users",
      value: dashboardStats.inactiveUsers,
      icon: <UserX className="h-4 w-4 sm:h-5 sm:w-5" />,
      allowedRoles: ["superadmin", "admin", "editor"],
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      change: `${dashboardStats.totalUsers > 0
        ? (
          (dashboardStats.inactiveUsers / dashboardStats.totalUsers) *
          100
        ).toFixed(1)
        : 0
        }%`,
      changeType:
        dashboardStats.inactiveUsers > dashboardStats.activeUsers * 0.1
          ? "negative"
          : "neutral",
      description: "Inactive or banned users",
    },
    {
      label: "Total Revenue",
      value: dashboardStats.totalRevenue,
      icon: <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />,
      allowedRoles: ["superadmin", "admin"],
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      change: "+23%",
      changeType: "positive",
      isRevenue: true,
      description: "Total platform revenue",
    },
    {
      label: "Coin Distribution",
      value: dashboardStats.totalCoinDistribution,
      icon: <HandCoins className="h-4 w-4 sm:h-5 sm:w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      change: "+5%",
      changeType: "positive",
      description: "Total coins distributed",
    },
    {
      label: "Completed Withdrawals",
      value: dashboardStats.totalCompletedWithdrawals,
      icon: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />,
      allowedRoles: ["superadmin", "admin", "editor", "viewer"],
      color: "from-sky-500 to-sky-600",
      bgColor: "bg-sky-50",
      textColor: "text-sky-600",
      change: "All time",
      changeType: "neutral",
      description: "Total successful withdrawals",
    },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className={`${colorScheme.bg} border-b border-gray-200/50`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <Activity
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${colorScheme.accent}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                      Welcome back,{" "}
                      <span className={colorScheme.accent}>{userName}</span> 👋
                    </h1>
                    <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                      Here's what's happening with your platform today
                    </p>
                    {userEmail && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:flex-shrink-0">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm bg-transparent"
                >
                  <RefreshCw
                    className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${isRefreshing ? "animate-spin" : ""
                      }`}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Badge
                    variant="outline"
                    className={`${colorScheme.badge} px-2 sm:px-3 py-1 sm:py-1.5 font-medium text-xs sm:text-sm justify-center sm:justify-start`}
                  >
                    <Shield className="h-3 w-3 mr-1 sm:mr-2" />
                    {roleDisplayName}
                  </Badge>

                  <div className="text-xs sm:text-sm text-gray-600 bg-white/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-center sm:text-left">
                    {getPermissionsDescription(userRole)}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div
                className="flex sm:grid sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 px-3 sm:px-0 pb-2 sm:pb-0"
                style={{ minWidth: "max-content" }}
              >
                <div className="bg-white/60 rounded-lg p-2 sm:p-3 flex-shrink-0 w-24 sm:w-auto">
                  <p className="text-xs text-gray-600">Today</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">
                    {dashboardStats.growthMetrics.newUsersToday}
                  </p>
                  <p className="text-xs text-gray-500">new users</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2 sm:p-3 flex-shrink-0 w-24 sm:w-auto">
                  <p className="text-xs text-gray-600">This Week</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">
                    {dashboardStats.growthMetrics.newUsersLast7Days}
                  </p>
                  <p className="text-xs text-gray-500">new users</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2 sm:p-3 flex-shrink-0 w-24 sm:w-auto">
                  <p className="text-xs text-gray-600">This Month</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">
                    {dashboardStats.growthMetrics.newUsersLast30Days}
                  </p>
                  <p className="text-xs text-gray-500">new users</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2 sm:p-3 flex-shrink-0 w-24 sm:w-auto">
                  <p className="text-xs text-gray-600">Weekly Activity</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">
                    {formatPercentage(
                      dashboardStats.growthMetrics.weeklyActivityRate
                    )}
                  </p>
                  <p className="text-xs text-gray-500">active rate</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2 sm:p-3 flex-shrink-0 w-24 sm:w-auto">
                  <p className="text-xs text-gray-600">Growth (7d)</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">
                    {formatPercentage(
                      dashboardStats.growthMetrics.growthRate7Days
                    )}
                  </p>
                  <p className="text-xs text-gray-500">growth rate</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2 sm:p-3 flex-shrink-0 w-24 sm:w-auto">
                  <p className="text-xs text-gray-600">Growth (30d)</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">
                    {formatPercentage(
                      dashboardStats.growthMetrics.growthRate30Days
                    )}
                  </p>
                  <p className="text-xs text-gray-500">growth rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {!canViewRevenue(userRole) && (
          <Alert className="mb-6 sm:mb-8 border-amber-200 bg-amber-50">
            <EyeOff className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>Limited Access Notice:</strong> Revenue data and financial
              analytics are restricted to Admin users only. Contact your
              administrator if you need access to this information.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {filteredStats.map((item, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
              />
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${item.bgColor} rounded-xl flex items-center justify-center`}
                  >
                    <div className={item.textColor}>{item.icon}</div>
                  </div>
                  {item.isRevenue && (
                    <Badge className="bg-red-100 text-red-800 text-xs px-2 py-1">
                      Admin Only
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    {item.label}
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                      {item.isRevenue
                        ? formatCurrency(item.value)
                        : formatNumber(item.value) + (item.suffix || "")}
                    </p>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${item.changeType === "positive"
                        ? "text-green-600"
                        : item.changeType === "negative"
                          ? "text-red-600"
                          : "text-gray-500"
                        }`}
                    >
                      {item.changeType === "positive" && (
                        <TrendingUp className="h-3 w-3" />
                      )}
                      {item.changeType === "negative" && (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="truncate">{item.change}</span>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {canViewSensitiveData(userRole) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    High Engagement
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    High Engagement Users
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {formatNumber(
                      dashboardStats.engagementMetrics.highEngagementUsers
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Users with 70+ engagement score
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    Average
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Average Engagement
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {dashboardStats.engagementMetrics.averageEngagementScore}
                    /100
                  </p>
                  <p className="text-xs text-gray-500">
                    Platform-wide engagement score
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center">
                    <UserX className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    Low Engagement
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Low Engagement Users
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {formatNumber(
                      dashboardStats.engagementMetrics.lowEngagementUsers
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Users with &lt;30 engagement score
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                    User Growth
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Track user registration over time
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[350px] sm:h-[380px] w-full">
                <UserGrowthChart users={users} />
              </div>
            </CardContent>
          </Card>

          {canViewRevenue(userRole) ? (
            <Card className="border rounded-2xl shadow-sm w-full">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                      Revenue Analytics
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Financial performance overview
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    </div>
                    <Badge className="bg-red-100 text-red-800 text-xs sm:text-sm">
                      Admin Only
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="w-full h-[350px] sm:h-[300px] md:h-[350px]">
                  <RewardRevenueChart users={users} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
              <CardContent className="p-6 sm:p-8 h-[320px] sm:h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <EyeOff className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3">
                  Revenue Analytics
                </h3>
                <p className="text-gray-500 mb-4 sm:mb-6 max-w-sm leading-relaxed text-sm sm:text-base">
                  This section contains sensitive financial data and is only
                  accessible to Admin users.
                </p>
                <div className="space-y-3">
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200 px-3 sm:px-4 py-1.5 sm:py-2"
                  >
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Admin Access Required
                  </Badge>
                  <p className="text-xs text-gray-400">
                    Contact your system administrator for access
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-500">
                Last updated:{" "}
                {lastUpdated ? lastUpdated.toLocaleString() : "Never"}
              </p>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={isRefreshing}
                className="text-xs sm:text-sm"
              >
                <RefreshCw
                  className={`h-3 w-3 mr-1 ${isRefreshing ? "animate-spin" : ""
                    }`}
                />
                Refresh
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-right">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                System Status: Online
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                {formatNumber(dashboardStats.totalUsers)} users •{" "}
                {formatNumber(dashboardStats.activeUsers)} active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}