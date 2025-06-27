"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Shield,
  Lock,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Coins,
  ArrowRight,
  Loader2,
  User,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Activity,
  Users,
  Wallet,
  Calculator,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { userHelpers, userAPI } from "../../src/lib/api";
import { transferAPI } from "../../src/lib/transferAPI";

// Enhanced Transfer History Component
const TransferHistory = ({ onBack, onRefresh }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    dateRange: "",
    userId: "all",
  });
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
  });

  const memoizedFilters = useMemo(
    () => filters,
    [
      filters.page,
      filters.limit,
      filters.search,
      filters.status,
      filters.dateRange,
      filters.userId,
    ]
  );

  const fetchTransferHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await userAPI.getTransferHistory(memoizedFilters);

      if (response.success) {
        const formattedTransfers = response.data.transfers.map((transfer) =>
          userHelpers.formatTransferData(transfer)
        );
        setTransfers(formattedTransfers);
        setPagination({
          total: response.data.total,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        });

        // Calculate transfer statistics
        const transferStats =
          userHelpers.calculateTransferStats(formattedTransfers);
        setStats(transferStats);
      } else {
        setError(response.message || "Failed to fetch transfer history");
      }
    } catch (err) {
      setError("Error loading transfer history: " + err.message);
      console.error("Transfer history error:", err);
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchTransferHistory();
  }, [fetchTransferHistory]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Completed",
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
      },
      failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.bg} ${config.text}`}>{config.label}</Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Transfer
          </Button>
          <h2 className="text-2xl font-bold">Transfer History</h2>
          <p className="text-gray-600">View and manage all coin transfers</p>
        </div>
        <Button onClick={fetchTransferHistory} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transfers</p>
                  <p className="text-2xl font-bold">{stats.totalTransfers}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {stats.totalAmount.toLocaleString()}
                  </p>
                </div>
                <Coins className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completedTransfers}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Amount</p>
                  <p className="text-2xl font-bold">
                    {Math.round(stats.averageAmount)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by user name or email"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Date Range
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  handleFilterChange("dateRange", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Per Page</label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) =>
                  handleFilterChange("limit", Number.parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer List */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading transfers...</span>
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          ) : transfers.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No transfers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{transfer.userName}</p>
                        <p className="text-sm text-gray-600">
                          {transfer.userEmail}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +{transfer.amount} coins
                      </p>
                      {getStatusBadge(transfer.status)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Reason:</span>{" "}
                      {transfer.reason}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {transfer.date}{" "}
                      {transfer.time}
                    </div>
                    <div>
                      <span className="font-medium">By:</span>{" "}
                      {transfer.transferredBy}
                    </div>
                  </div>
                  {transfer.transactionId && (
                    <div className="mt-2 text-xs text-gray-500">
                      Transaction ID: {transfer.transactionId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {(pagination.currentPage - 1) * filters.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * filters.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} transfers
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced User Selector Component with refresh capability
const UserSelector = ({
  selectedUser,
  onUserSelect,
  className,
  onUsersRefresh,
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 200,
    search: "",
    status: "all",
  });
  const [userStats, setUserStats] = useState(null);

  // Add debouncing effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update filters to use debounced search
  const memoizedFilters = useMemo(
    () => ({
      page: filters.page,
      limit: filters.limit,
      search: debouncedSearchTerm,
      status: filters.status,
    }),
    [filters.page, filters.limit, debouncedSearchTerm, filters.status]
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await userAPI.getUsers(
        memoizedFilters.page,
        memoizedFilters.limit,
        {
          search: memoizedFilters.search,
          ...(memoizedFilters.status === "active" && { isActive: true }),
          ...(memoizedFilters.status === "inactive" && { isActive: false }),
        }
      );

      if (response && (response.users || response.data)) {
        const usersData = response.users || response.data || response;
        const formattedUsers = userHelpers.formatUserList
          ? userHelpers.formatUserList(usersData)
          : usersData.map((user) => ({
              ...user,
              id: user._id || user.id,
              balance: user.balance || user.coins || 0,
              hasWallet: !!(
                user.walletAddresses &&
                (user.walletAddresses.metamask ||
                  user.walletAddresses.trustWallet)
              ),
            }));

        setUsers(formattedUsers);

        // Calculate user statistics
        const stats = userHelpers.calculateStats
          ? userHelpers.calculateStats(usersData)
          : {
              totalUsers: usersData.length,
              activeUsers: usersData.filter((u) => u.isActive !== false).length,
              usersWithWallets: usersData.filter(
                (u) =>
                  u.walletAddresses &&
                  (u.walletAddresses.metamask || u.walletAddresses.trustWallet)
              ).length,
              calculatorUsers: usersData.filter((u) => u.calculatorUsage > 0)
                .length,
            };
        setUserStats(stats);

        if (onUsersRefresh) {
          onUsersRefresh(formattedUsers);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (apiError) {
      console.warn("API call failed, using fallback data:", apiError);
      setError("Failed to load users from API - using sample data");

      // Keep the existing fallback logic but ensure firebaseUid is present
      const mockUsers = [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          balance: 100,
          isActive: true,
          role: "user",
          createdAt: new Date().toISOString(),
          walletAddresses: { metamask: "0x123..." },
          calculatorUsage: 5,
          firebaseUid: "firebase_uid_1",
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          balance: 250,
          isActive: true,
          role: "user",
          createdAt: new Date().toISOString(),
          walletAddresses: { trustWallet: "0x456..." },
          calculatorUsage: 12,
          firebaseUid: "firebase_uid_2",
        },
        {
          _id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          balance: 75,
          isActive: true,
          role: "user",
          createdAt: new Date().toISOString(),
          calculatorUsage: 3,
          firebaseUid: "firebase_uid_3",
        },
        {
          _id: "4",
          name: "Alice Brown",
          email: "alice@example.com",
          balance: 320,
          isActive: true,
          role: "user",
          createdAt: new Date().toISOString(),
          walletAddresses: { metamask: "0x789..." },
          calculatorUsage: 8,
          firebaseUid: "firebase_uid_4",
        },
        {
          _id: "5",
          name: "Charlie Wilson",
          email: "charlie@example.com",
          balance: 180,
          isActive: false,
          role: "user",
          createdAt: new Date().toISOString(),
          calculatorUsage: 0,
          firebaseUid: "firebase_uid_5",
        },
      ];

      const formattedMockUsers = mockUsers.map((user) => ({
        ...user,
        id: user._id,
        hasWallet: !!(
          user.walletAddresses &&
          (user.walletAddresses.metamask || user.walletAddresses.trustWallet)
        ),
      }));

      setUsers(formattedMockUsers);

      if (onUsersRefresh) {
        onUsersRefresh(formattedMockUsers);
      }
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters, onUsersRefresh]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (!debouncedSearchTerm) return true;
      const searchLower = debouncedSearchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.id && user.id.toLowerCase().includes(searchLower))
      );
    });
  }, [users, debouncedSearchTerm]);

  const filteredUsersByStatus = useMemo(() => {
    return filteredUsers.filter((user) => {
      if (filters.status === "active") return user.isActive !== false;
      if (filters.status === "inactive") return user.isActive === false;
      return true;
    });
  }, [filteredUsers, filters.status]);

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* User Statistics */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Users</span>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {userStats.totalUsers}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {userStats.activeUsers}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">With Wallets</span>
              </div>
              <p className="text-lg font-bold text-purple-600">
                {userStats.usersWithWallets}
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Calculator Users</span>
              </div>
              <p className="text-lg font-bold text-orange-600">
                {userStats.calculatorUsers}
              </p>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Status Filter
          </label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active Users Only</SelectItem>
              <SelectItem value="inactive">Inactive Users Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Loading users...</span>
          </div>
        ) : error ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
              <span className="text-sm text-amber-700">{error}</span>
            </div>
            <Button
              onClick={fetchUsers}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <Select
              value={selectedUser?.id || selectedUser?._id || ""}
              onValueChange={(value) => {
                const user = filteredUsersByStatus.find(
                  (u) => (u.id || u._id) === value
                );
                onUserSelect(user);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {filteredUsersByStatus.map((user) => (
                  <SelectItem
                    key={user.id || user._id}
                    value={user.id || user._id || "none"}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({user.email})
                        </span>
                        {user.isActive === false && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {user.coins || user.balance || 0} coins
                        </Badge>
                        {user.hasWallet && (
                          <Wallet className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User count info */}
            <div className="text-xs text-gray-500">
              {searchTerm ? (
                <>
                  {filteredUsersByStatus.length} user
                  {filteredUsersByStatus.length !== 1 ? "s" : ""} found
                  {filters.status === "all" && (
                    <span className="ml-2">
                      (
                      {filteredUsers.filter((u) => u.isActive !== false).length}{" "}
                      active,{" "}
                      {filteredUsers.filter((u) => u.isActive === false).length}{" "}
                      inactive)
                    </span>
                  )}
                </>
              ) : (
                <>
                  {filteredUsersByStatus.length} user
                  {filteredUsersByStatus.length !== 1 ? "s" : ""} available
                  {filters.status === "all" && (
                    <span className="ml-2">
                      ({users.filter((u) => u.isActive !== false).length}{" "}
                      active, {users.filter((u) => u.isActive === false).length}{" "}
                      inactive)
                    </span>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Mock Screenshots Component (Enhanced)
const ViewScreenshots = ({ onBack, onApprove, selectedUser }) => {
  const [screenshots, setScreenshots] = useState([
    { id: 1, approved: false, coins: 50, description: "Daily task completion" },
    { id: 2, approved: false, coins: 75, description: "Referral bonus" },
    { id: 3, approved: false, coins: 25, description: "Survey completion" },
  ]);
  const [loading, setLoading] = useState(false);

  const toggleApproval = (id) => {
    setScreenshots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, approved: !s.approved } : s))
    );
  };

  const approveAll = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedScreenshots = screenshots.map((s) => ({
      ...s,
      approved: true,
    }));
    setScreenshots(updatedScreenshots);

    const totalCoins = updatedScreenshots.reduce((sum, s) => sum + s.coins, 0);
    const approvedCount = updatedScreenshots.filter((s) => s.approved).length;

    onApprove({
      allScreenshotsApproved: approvedCount === screenshots.length,
      approvedCount,
      totalCoins,
      hasApprovedScreenshots: true,
    });

    setLoading(false);
  };

  const approvedCount = screenshots.filter((s) => s.approved).length;
  const totalCoins = screenshots
    .filter((s) => s.approved)
    .reduce((sum, s) => sum + s.coins, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Transfer
          </Button>
          <h2 className="text-2xl font-bold">
            Screenshots for {selectedUser?.name}
          </h2>
          <p className="text-gray-600">Review and approve user screenshots</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Approved: {approvedCount}/{screenshots.length}
          </p>
          <p className="text-lg font-bold text-green-600">
            Total: {totalCoins} coins
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {screenshots.map((screenshot) => (
          <Card
            key={screenshot.id}
            className={`transition-all ${
              screenshot.approved ? "ring-2 ring-green-500 bg-green-50" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">
                      Screenshot {screenshot.id}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{screenshot.description}</p>
                    <p className="text-sm text-gray-600">
                      {screenshot.coins} coins
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {screenshot.approved && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  )}
                  <Button
                    onClick={() => toggleApproval(screenshot.id)}
                    variant={screenshot.approved ? "outline" : "default"}
                    size="sm"
                  >
                    {screenshot.approved ? "Unapprove" : "Approve"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          onClick={approveAll}
          disabled={loading || approvedCount === screenshots.length}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Approve All (${screenshots.reduce(
              (sum, s) => sum + s.coins,
              0
            )} coins)`
          )}
        </Button>
      </div>
    </div>
  );
};

// Main Component
export default function CoinTransferPage() {
  const [showScreenshots, setShowScreenshots] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    role: "",
    id: "",
  });
  const [roleDisplayName, setRoleDisplayName] = useState("");
  const [transferHistory, setTransferHistory] = useState([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [screenshotApprovalData, setScreenshotApprovalData] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [balanceAnimation, setBalanceAnimation] = useState(false);
  const [lastTransferResult, setLastTransferResult] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [usersData, setUsersData] = useState([]);

  // Enhanced user data retrieval
  const getUserData = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          return {
            id: user._id || user.id || "",
            username: user.username || user.name || "",
            email: user.email || "",
            role: user.role?.toLowerCase() || "",
          };
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    return {
      id: "",
      username: "Admin User",
      email: "admin@example.com",
      role: "admin",
    };
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "superadmin":
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

  const hasPermission = (action) => {
    const role = userData.role;
    switch (role) {
      case "superadmin":
      case "admin":
        return [
          "view",
          "transfer",
          "viewHistory",
          "viewScreenshots",
          "editTransfer",
          "banUser",
          "updateProfile",
        ].includes(action);
      case "editor":
        return [
          "view",
          "transfer",
          "viewHistory",
          "viewScreenshots",
          "editTransfer",
        ].includes(action);
      case "viewer":
        return ["view", "viewHistory", "viewScreenshots"].includes(action);
      default:
        return false;
    }
  };

  const getPermissionsDescription = (role) => {
    switch (role) {
      case "superadmin":
      case "admin":
        return "Full Access (All Operations)";
      case "editor":
        return "Full Access (All Operations)";
      case "viewer":
        return "Limited Access (View Only)";
      default:
        return "No Permissions";
    }
  };

 // 1. Execute the transfer logic
const executeTransfer = async (userId, amount, reason) => {
  try {
    console.log("🚀 Starting transfer:", { userId, amount, reason });
    console.log("👤 Selected user:", selectedUser);

    if (!selectedUser?.firebaseUid) {
      throw new Error("User does not have a Firebase UID. This is required for balance updates.");
    }

    const currentBalance = Number(selectedUser.balance || 0);
    const transferAmount = Number(amount);
    const newBalance = currentBalance + transferAmount;

    const result = await userAPI.editUserBalance(selectedUser.firebaseUid, newBalance);
    console.log("📥 Transfer API result:", result);

    if (result.success) {
      setLastTransferResult({
        transferId: null,
        transactionId: result.data.transactionId || null,
        newBalance: result.data.newBalance,
        amount: transferAmount,
        reason,
        balanceBefore: currentBalance,
        balanceAfter: result.data.newBalance,
        timestamp: result.data.timestamp || new Date().toISOString(),
      });

      return {
        success: true,
        data: result.data,
        updatedBalance: result.data.newBalance,
      };
    } else {
      return { success: false, error: result.message || "Transfer failed" };
    }
  } catch (error) {
    return { success: false, error: `Transfer failed: ${error.message}` };
  }
};

// 2. Refresh user data
const refreshUserData = async (userId) => {
  try {
    const refreshedUser = await transferAPI.refreshUserData(userId);
    if (refreshedUser.success) {
      setSelectedUser((prev) => ({
        ...prev,
        ...refreshedUser.data,
        balance: refreshedUser.data.balance,
        coins: refreshedUser.data.balance,
      }));
      return refreshedUser.data;
    }
  } catch (error) {
    console.warn("⚠️ Could not refresh user data:", error);
  }
  return null;
};

// 3. Fetch transfer history
const fetchTransferHistory = useCallback(async () => {
  if (!selectedUser) return [];

  try {
    setIsLoadingHistory(true);
    const response = await transferAPI.getHistory({
      page: 1,
      limit: 50,
      userId: selectedUser?.id || selectedUser?._id,
    });

    if (response.success && response.data) {
      const formattedTransfers = response.data.transfers.map((transfer) =>
        userHelpers.formatTransferData
          ? userHelpers.formatTransferData(transfer)
          : {
              id: transfer.id || transfer._id,
              userId: transfer.userId,
              userName: transfer.userName || transfer.user?.name || "Unknown User",
              userEmail: transfer.userEmail || transfer.user?.email || "No email",
              amount: Number(transfer.amount) || 0,
              reason: transfer.reason || "No reason provided",
              status: transfer.status || "completed",
              createdAt: transfer.createdAt || transfer.timestamp,
              date: transfer.date || new Date(transfer.createdAt || transfer.timestamp).toLocaleDateString(),
              time: transfer.time || new Date(transfer.createdAt || transfer.timestamp).toLocaleTimeString(),
              transferredBy: transfer.transferredBy || transfer.adminName || "System",
              transactionId: transfer.transactionId || `TXN${Date.now()}`,
              balanceBefore: transfer.balanceBefore || 0,
              balanceAfter: transfer.balanceAfter || 0,
            }
      );
      setTransferHistory(formattedTransfers);
      return formattedTransfers;
    }
  } catch (error) {
    console.warn("Transfer history API failed:", error);
  } finally {
    setIsLoadingHistory(false);
  }

  return transferHistory;
}, [selectedUser?.id, selectedUser?._id, transferHistory]);

// 4. Update transfer status
const updateTransferStatus = async (transferId, newStatus) => {
  try {
    const result = await transferAPI.updateTransferStatus(transferId, newStatus);
    if (result.success) {
      setTransferHistory((prev) =>
        prev.map((t) => (t.id === transferId ? { ...t, status: newStatus } : t))
      );
      setSuccessMessage(`Transfer status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  } catch (error) {
    setTransferError(`Failed to update transfer status: ${error.message}`);
  }
};

// 5. Main transfer handler
const handleTransfer = async () => {
  if (!hasPermission("transfer")) {
    setTransferError("You don't have permission to perform transfers");
    return;
  }

  if (screenshotApprovalData && !screenshotApprovalData.allScreenshotsApproved) {
    setTransferError("All screenshots must be approved before transfer can be executed");
    return;
  }

  if (!selectedUser?.firebaseUid) {
    setTransferError("Selected user does not have a Firebase UID required for balance updates.");
    return;
  }

  if (!transferAmount || !transferReason) {
    setTransferError("Please fill in all transfer details");
    return;
  }

  const amount = parseFloat(transferAmount);
  if (isNaN(amount) || amount <= 0) {
    setTransferError("Please enter a valid transfer amount");
    return;
  }

  if (amount > 10000) {
    setTransferError("Transfer amount cannot exceed 10,000 coins");
    return;
  }

  if (transferReason.length < 5) {
    setTransferError("Transfer reason must be at least 5 characters long");
    return;
  }

  setTransferError("");
  setTransferSuccess(false);
  setIsTransferring(true);

  try {
    const result = await executeTransfer(selectedUser.id || selectedUser._id, amount, transferReason);

    if (result.success) {
      const newBalance = result.updatedBalance;

      setSelectedUser((prev) => ({
        ...prev,
        balance: newBalance,
        coins: newBalance,
      }));

      if (!result.isSimulated) {
        await refreshUserData(selectedUser.id || selectedUser._id);
      }

      const newTransfer = {
        id: result.data?.transferId || Date.now().toString(),
        userId: selectedUser._id || selectedUser.id,
        userName: selectedUser.name,
        userEmail: selectedUser.email,
        amount,
        reason: transferReason,
        status: "completed",
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        adminId: userData.id,
        adminName: userData.username,
        transferredBy: userData.username,
        transactionId: result.data?.transactionId || `TXN${Date.now()}`,
        balanceBefore: result.data?.balanceBefore || selectedUser.balance || 0,
        balanceAfter: newBalance,
        isSimulated: result.isSimulated || false,
      };

      setTransferHistory((prev) => [newTransfer, ...prev]);
      setTransferSuccess(true);
      setBalanceAnimation(true);

      try {
        await fetchTransferHistory();
      } catch (historyError) {
        console.warn("Could not refresh transfer history:", historyError);
      }

      setTimeout(() => {
        setTransferAmount("");
        setTransferReason("");
        setScreenshotApprovalData(null);
        setBalanceAnimation(false);
      }, 3000);

      setTimeout(() => setTransferSuccess(false), 8000);
    } else {
      setTransferError(`Transfer failed: ${result.error}`);
    }
  } catch (error) {
    setTransferError(`Transfer error: ${error.message}`);
  } finally {
    setIsTransferring(false);
  }
};

// 6. Screenshot approval logic
const handleScreenshotApproval = (approvalData) => {
  setScreenshotApprovalData(approvalData);
  setShowScreenshots(false);

  if (approvalData.allScreenshotsApproved) {
    setTransferAmount(approvalData.totalCoins.toString());
    setTransferReason(
      `Screenshot approval reward - ${approvalData.approvedCount} screenshot${
        approvalData.approvedCount > 1 ? "s" : ""
      } approved (Auto-generated)`
    );
  }
};

// 7. Refresh users and maintain selected user
const handleUsersRefresh = useCallback(
  (refreshedUsers) => {
    setUsersData(refreshedUsers);
    if (selectedUser) {
      const updatedSelectedUser = refreshedUsers.find(
        (u) => (u.id || u._id) === (selectedUser.id || selectedUser._id)
      );
      if (updatedSelectedUser) {
        setSelectedUser(updatedSelectedUser);
      }
    }
  },
  [selectedUser?.id, selectedUser?._id]
);

// 8. On mount, get current admin
useEffect(() => {
  const user = getUserData();
  setUserData(user);
  setRoleDisplayName(getRoleDisplayName(user.role));
}, []);

  useEffect(() => {
    if (userData.role && hasPermission("viewHistory")) {
      fetchTransferHistory();
    }
  }, [userData.role, fetchTransferHistory]);

  // Enhanced transfer validation
  const isTransferEnabled = () => {
    if (!hasPermission("transfer")) return false;
    if (!transferAmount || !transferReason) return false;
    if (isTransferring) return false;
    if (
      screenshotApprovalData &&
      !screenshotApprovalData.allScreenshotsApproved
    )
      return false;

    const amount = Number.parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0 || amount > 10000) return false;

    if (transferReason.length < 5) return false;

    return true;
  };

  // Auto-clear error messages
  useEffect(() => {
    if (transferError) {
      const timer = setTimeout(() => setTransferError(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [transferError]);

  // Authentication check
  if (!userData.username || !userData.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Unable to load user data. Please log in again to access the coin
              transfer system.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const colorScheme = getRoleColorScheme(userData.role);

  // Show different views based on state
  if (showScreenshots) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
        <ViewScreenshots
          onBack={() => setShowScreenshots(false)}
          onApprove={handleScreenshotApproval}
          selectedUser={selectedUser}
        />
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
        <TransferHistory
          onBack={() => setShowHistory(false)}
          onRefresh={fetchTransferHistory}
        />
      </div>
    );
  }

  const formattedUser = selectedUser
    ? userHelpers.formatUserData(selectedUser)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Header Section */}
      <div className={`${colorScheme.bg} border-b border-gray-200/50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <Coins className={`h-6 w-6 ${colorScheme.accent}`} />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Coin Transfer System
                  </h1>
                  <p className="text-gray-600 text-sm lg:text-base">
                    Manage coin transfers and user balances •{" "}
                    {transferHistory.length} transfers processed
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Badge
                variant="outline"
                className={`${colorScheme.badge} px-3 py-1.5 font-medium`}
              >
                <Shield className="h-3 w-3 mr-2" />
                {roleDisplayName}
              </Badge>
              <div className="text-sm text-gray-600 bg-white/60 px-3 py-1.5 rounded-lg">
                {getPermissionsDescription(userData.role)}
              </div>
              <div className="text-xs text-gray-500 bg-white/40 px-2 py-1 rounded">
                {userData.username} • {userData.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Success/Error Messages */}
        <AnimatePresence>
          {transferSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-1">
                    <p className="font-medium">
                      ✅ Transfer completed successfully!
                    </p>
                    <p>
                      {transferAmount} coins transferred to {selectedUser?.name}
                      's account
                    </p>
                    <p className="text-sm">
                      Balance updated: {lastTransferResult?.balanceBefore || 0}{" "}
                      →{" "}
                      {lastTransferResult?.balanceAfter ||
                        selectedUser?.balance}{" "}
                      coins
                    </p>
                    {lastTransferResult?.transactionId && (
                      <p className="text-xs font-mono">
                        Transaction ID: {lastTransferResult.transactionId}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {transferError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Transfer Error:</strong> {transferError}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Access Notice for Viewer */}
        {userData.role === "viewer" && (
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <EyeOff className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>View-Only Access:</strong> Transfer operations are
              restricted to Editor and Admin users. You can view user details
              and transfer history only.
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Screenshot Approval Notice */}
        {screenshotApprovalData &&
          screenshotApprovalData.hasApprovedScreenshots && (
            <Alert
              className={`mb-8 ${
                screenshotApprovalData.allScreenshotsApproved
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              {screenshotApprovalData.allScreenshotsApproved ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              <AlertDescription
                className={
                  screenshotApprovalData.allScreenshotsApproved
                    ? "text-green-800"
                    : "text-amber-800"
                }
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {screenshotApprovalData.allScreenshotsApproved
                      ? "Screenshots Approved ✅"
                      : "Partial Screenshot Approval ⚠️"}
                  </p>
                  <p>
                    {screenshotApprovalData.allScreenshotsApproved
                      ? `All ${screenshotApprovalData.approvedCount} screenshots approved. Transfer form pre-filled with ${screenshotApprovalData.totalCoins} coins.`
                      : `${screenshotApprovalData.approvedCount} screenshot(s) approved, but ALL screenshots must be approved before transfer execution.`}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

        {/* Enhanced Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-800">
              Transfer Management
            </h2>
            <p className="text-sm text-gray-600">
              Select a user and manage their coin balance •
              {transferHistory.length > 0 &&
                ` ${transferHistory.length} transfers in history`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowHistory(true)}
              disabled={!hasPermission("viewHistory")}
              variant={hasPermission("viewHistory") ? "default" : "secondary"}
              className="w-full sm:w-auto"
            >
              <Activity className="h-4 w-4 mr-2" />
              {hasPermission("viewHistory")
                ? "View Transfer History"
                : "Access Restricted"}
            </Button>
            {selectedUser && (
              <Button
                onClick={() => setShowScreenshots(true)}
                disabled={!hasPermission("viewScreenshots")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                View Screenshots
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced User Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select User
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Enhanced User Selector Component with better API integration */}
            <UserSelector
              selectedUser={selectedUser}
              onUserSelect={setSelectedUser}
              onUsersRefresh={handleUsersRefresh}
              className="max-w-full"
            />
          </CardContent>
        </Card>

        {/* Enhanced User Details and Transfer Form */}
        {selectedUser ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Details & Transfer
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced User Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <Input
                      value={formattedUser?.name || selectedUser.name || "N/A"}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      value={
                        formattedUser?.email || selectedUser.email || "N/A"
                      }
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Balance
                    </label>
                    <div className="relative">
                      <Input
                        value={`${
                          selectedUser.balance || selectedUser.coins || 0
                        } coins`}
                        readOnly
                        className={`bg-gray-50 transition-all duration-500 ${
                          balanceAnimation
                            ? "ring-2 ring-green-500 bg-green-50"
                            : ""
                        }`}
                      />
                      <AnimatePresence>
                        {balanceAnimation && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute -top-2 -right-2"
                          >
                            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              +{transferAmount}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <Input
                      value={
                        selectedUser.createdAt
                          ? new Date(
                              selectedUser.createdAt
                            ).toLocaleDateString()
                          : new Date().toLocaleDateString()
                      }
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          selectedUser.isActive !== false
                            ? "default"
                            : "secondary"
                        }
                        className={
                          selectedUser.isActive !== false
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {selectedUser.isActive !== false
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                      {formattedUser?.hasWallet && (
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700"
                        >
                          <Wallet className="h-3 w-3 mr-1" />
                          Wallet Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calculator Usage
                    </label>
                    <Input
                      value={`${selectedUser.calculatorUsage || 0} times`}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Enhanced Transfer Form */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Transfer Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transfer Amount (coins)
                          {!hasPermission("transfer") && (
                            <Badge
                              variant="destructive"
                              className="ml-2 text-xs"
                            >
                              Restricted
                            </Badge>
                          )}
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="Enter amount (1-10,000)"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            disabled={!hasPermission("transfer")}
                            className={
                              !hasPermission("transfer")
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }
                            min="1"
                            max="10000"
                          />
                          {!hasPermission("transfer") && (
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        {hasPermission("transfer") && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-2">
                              Quick amounts:
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {[10, 25, 50, 100, 250, 500].map((amount) => (
                                <Button
                                  key={amount}
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setTransferAmount(amount.toString())
                                  }
                                  className="text-xs"
                                >
                                  {amount}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {transferAmount && (
                          <p className="text-xs text-gray-500 mt-1">
                            New balance will be:{" "}
                            {(selectedUser.balance || 0) +
                              Number.parseFloat(transferAmount || 0)}{" "}
                            coins
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transfer Reason
                        {!hasPermission("transfer") && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Restricted
                          </Badge>
                        )}
                      </label>
                      <div className="relative">
                        <Textarea
                          placeholder="Enter detailed reason for transfer (minimum 5 characters)"
                          rows={4}
                          value={transferReason}
                          onChange={(e) => setTransferReason(e.target.value)}
                          disabled={!hasPermission("transfer")}
                          className={
                            !hasPermission("transfer")
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                          }
                          maxLength={500}
                        />
                        {!hasPermission("transfer") && (
                          <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {transferReason.length}/500 characters
                        {transferReason.length < 5 &&
                          transferReason.length > 0 &&
                          " (minimum 5)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
                  <Button
                    onClick={() => setShowScreenshots(true)}
                    disabled={!hasPermission("viewScreenshots")}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    View Screenshots
                  </Button>

                  {hasPermission("transfer") && (
                    <Button
                      onClick={handleTransfer}
                      disabled={!isTransferEnabled()}
                      className={`w-full sm:w-auto ${
                        screenshotApprovalData?.allScreenshotsApproved
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }`}
                    >
                      {isTransferring ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Transfer...
                        </>
                      ) : screenshotApprovalData?.allScreenshotsApproved ? (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Execute Transfer ({
                            screenshotApprovalData.totalCoins
                          }{" "}
                          Coins)
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Execute Transfer
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Enhanced Transfer Validation Messages */}
                <div className="space-y-2">
                  {screenshotApprovalData &&
                    !screenshotApprovalData.allScreenshotsApproved && (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          All screenshots must be approved before the transfer
                          can be executed.
                        </AlertDescription>
                      </Alert>
                    )}

                  {userData.role === "viewer" && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <EyeOff className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        You can view user details but cannot perform transfer
                        operations.
                      </AlertDescription>
                    </Alert>
                  )}

                  {transferAmount &&
                    Number.parseFloat(transferAmount) > 1000 && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Large Transfer Notice:</strong> You are about
                          to transfer {transferAmount} coins. Please ensure this
                          amount is correct and justified.
                        </AlertDescription>
                      </Alert>
                    )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No User Selected
              </h3>
              <p className="text-gray-600 mb-4">
                Please select a user from the dropdown above to start the
                transfer process.
              </p>
              <p className="text-sm text-gray-500">
                Use the search functionality to quickly find specific users by
                name, email, or ID.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
