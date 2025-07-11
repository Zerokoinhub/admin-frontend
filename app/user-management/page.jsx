"use client";
import { useEffect, useState, useCallback } from "react";
import DashboardStatCard from "../../src/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  Activity,
  Calculator,
  UserCheck,
  TrendingUp,
  Download,
  Filter,
  Search,
  Smartphone,
  Zap,
  User,
  Mail,
  Shield,
  Clock,
  Hash,
  Lock,
  Edit,
  X,
  ChevronLeft,
  Coins,
  Calendar,
  Loader2,
  AlertTriangle,
  BarChart3,
  TrendingDown,
  ChevronRight,
  Eye,
  Ban,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { userAPI, userHelpers } from "../../src/lib/api";
import FullScreenLoader from "../../src/components/ui/FullScreenLoader";

// Enhanced Coin History Component
const CoinHistoryView = ({ selectedUser, onBack }) => {
  const [transferHistory, setTransferHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    dateRange: "",
    status: "",
  });
  const [stats, setStats] = useState(null);

  const fetchTransferHistory = useCallback(async () => {
    if (!selectedUser) return;
    setLoading(true);
    setError("");
    try {
      const response = await userAPI.getTransferHistory({
        ...filters,
        userId: selectedUser.id || selectedUser._id,
      });
      if (response.success && response.data) {
        const formattedTransfers = response.data.transfers.map((transfer) =>
          userHelpers.formatTransferData(transfer)
        );
        setTransferHistory(formattedTransfers);
        const transferStats =
          userHelpers.calculateTransferStats(formattedTransfers);
        setStats(transferStats);
      } else {
        throw new Error(response.message || "Failed to fetch transfer history");
      }
    } catch (apiError) {
      console.warn("API call failed, using mock data:", apiError);
      setError("Using mock data - API unavailable");
      // Enhanced mock data for demonstration
      const mockTransfers = [
        {
          id: "1",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: 100,
          reason: "Course completion reward",
          status: "completed",
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          transferredBy: "System",
          transactionId: "TXN001",
          balanceBefore: (selectedUser.balance || 0) - 100,
          balanceAfter: selectedUser.balance || 0,
        },
        {
          id: "2",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: 50,
          reason: "Referral bonus",
          status: "completed",
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          transferredBy: "System",
          transactionId: "TXN002",
          balanceBefore: (selectedUser.balance || 0) - 150,
          balanceAfter: (selectedUser.balance || 0) - 100,
        },
        {
          id: "3",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: 75,
          reason: "Survey completion",
          status: "completed",
          createdAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          transferredBy: "Admin",
          transactionId: "TXN003",
          balanceBefore: (selectedUser.balance || 0) - 225,
          balanceAfter: (selectedUser.balance || 0) - 150,
        },
        {
          id: "4",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: 200,
          reason: "Monthly bonus",
          status: "completed",
          createdAt: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          transferredBy: "System",
          transactionId: "TXN004",
          balanceBefore: (selectedUser.balance || 0) - 425,
          balanceAfter: (selectedUser.balance || 0) - 225,
        },
        {
          id: "5",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: 25,
          reason: "Daily check-in",
          status: "pending",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          transferredBy: "System",
          transactionId: "TXN005",
          balanceBefore: selectedUser.balance || 0,
          balanceAfter: (selectedUser.balance || 0) + 25,
        },
      ];
      const formattedMockTransfers = mockTransfers.map((transfer) =>
        userHelpers.formatTransferData(transfer)
      );
      setTransferHistory(formattedMockTransfers);
      const mockStats = userHelpers.calculateTransferStats(
        formattedMockTransfers
      );
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  }, [selectedUser, filters]);

  useEffect(() => {
    fetchTransferHistory();
  }, [fetchTransferHistory]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Completed",
        icon: CheckCircle,
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
        icon: Clock,
      },
      failed: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Failed",
        icon: AlertTriangle,
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    return (
      <Badge
        className={`${config.bg} ${config.text} flex items-center gap-1 text-xs`}
      >
        <IconComponent className="h-3 w-3" />
        <span className="hidden sm:inline">{config.label}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Button
            onClick={onBack}
            variant="outline"
            className="w-fit bg-transparent hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Management
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Coin History - {selectedUser?.name}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Complete transaction history and statistics
            </p>
          </div>
        </div>
        <Button
          onClick={fetchTransferHistory}
          disabled={loading}
          className="w-fit"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Transfers
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {stats.totalTransfers}
                  </p>
                </div>
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Earned
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    +{stats.totalAmount}
                  </p>
                </div>
                <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">This Month</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">
                    {stats.monthTransfers}
                  </p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Average Amount
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">
                    {Math.round(stats.averageAmount)}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                Date Range
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, dateRange: value }))
                }
              >
                <SelectTrigger className="h-9 sm:h-10">
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
              <label className="block text-xs sm:text-sm font-medium mb-2">
                Per Page
              </label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    limit: Number.parseInt(value),
                  }))
                }
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder={filters.limit.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg">
              Transaction History
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="w-fit bg-transparent hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base">
                Loading transaction history...
              </span>
            </div>
          ) : error ? (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {error}
              </AlertDescription>
            </Alert>
          ) : transferHistory.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No transaction history found</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {transferHistory.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-green-600 text-sm sm:text-base">
                          +{transfer.amount} coins
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {transfer.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {getStatusBadge(transfer.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transfer.createdAt).toLocaleDateString()}{" "}
                        <span className="hidden sm:inline">
                          {new Date(transfer.createdAt).toLocaleTimeString()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="truncate">
                      <span className="font-medium">By:</span>{" "}
                      {transfer.transferredBy}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">ID:</span>{" "}
                      {transfer.transactionId}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">Balance:</span>{" "}
                      {transfer.balanceBefore} → {transfer.balanceAfter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced User Profile Modal
const EnhancedUserModal = ({
  user,
  open,
  onClose,
  onStatusChange,
  userRole,
  readOnly,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [showCoinHistory, setShowCoinHistory] = useState(false);

  const canEdit = userRole === "superadmin";
  const formattedUser = user ? userHelpers.formatUserData(user) : null;

  // Initialize edit form with current user data
  const initializeEditForm = (userData) => {
    setEditFormData({
      name: userData.name || "",
      email: userData.email || "",
      balance: userData.balance || 0,
      isActive: userData.isActive || false,
      role: userData.role || "user",
      calculatorUsage: userData.calculatorUsage || 0,
      inviteCode: userData.inviteCode || "",
      referredBy: userData.referredBy || "",
      walletAddresses: {
        metamask: userData.walletAddresses?.metamask || "",
        trustWallet: userData.walletAddresses?.trustWallet || "",
      },
    });
  };

  // Handle form input changes
  const handleEditFormChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setEditFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Save edited user data
  const handleSaveEdit = async () => {
    setSaving(true);
    setEditError("");
    try {
      const response = await userAPI.updateUser(
        user._id || user.id,
        editFormData
      );
      if (response.success) {
        // Update the user with new data
        const updatedUser = { ...user, ...editFormData };
        if (onStatusChange) {
          onStatusChange(updatedUser);
        }
        setEditMode(false);
      } else {
        throw new Error(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setEditError("Failed to update user profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditFormData({});
    setEditError("");
  };

  // Enable edit mode
  const handleEditProfile = () => {
    if (user && canEdit) {
      initializeEditForm(user);
      setEditMode(true);
    }
  };

  // Handle status change
  const handleStatusToggle = async () => {
    if (onStatusChange && canEdit) {
      const updatedUser = { ...user, isActive: !user.isActive };
      onStatusChange(updatedUser);
    }
  };

  if (!open || !user) return null;

  // Show coin history view
  if (showCoinHistory) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl"
        >
          <CoinHistoryView
            selectedUser={user}
            onBack={() => setShowCoinHistory(false)}
          />
          <div className="p-4 border-t bg-gray-50">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full bg-transparent hover:bg-gray-100"
            >
              Close Modal
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>{" "}
                <span className="truncate">{formattedUser?.name}</span>
                {readOnly && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-orange-50 text-orange-700 border-orange-200 flex-shrink-0"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Read Only</span>
                  </Badge>
                )}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {formattedUser?.email}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <Badge
                variant={formattedUser?.isActive ? "default" : "secondary"}
                className={
                  formattedUser?.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-500 text-white"
                }
              >
                {formattedUser?.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Status and Activity */}

          {/* User Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                Full Name
              </label>
              {editMode && canEdit ? (
                <Input
                  value={editFormData.name || ""}
                  onChange={(e) => handleEditFormChange("name", e.target.value)}
                  placeholder="Enter full name"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input
                  value={formattedUser?.name}
                  readOnly
                  className="bg-gray-50 h-9 sm:h-10"
                />
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                Email Address
              </label>
              {editMode && canEdit ? (
                <Input
                  type="email"
                  value={editFormData.email || ""}
                  onChange={(e) =>
                    handleEditFormChange("email", e.target.value)
                  }
                  placeholder="Enter email address"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input
                  value={formattedUser?.email}
                  readOnly
                  className="bg-gray-50 h-9 sm:h-10"
                />
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Coins className="h-3 w-3 sm:h-4 sm:w-4" />
                Current Balance
              </label>
              {editMode && canEdit ? (
                <Input
                  type="number"
                  value={editFormData.balance || 0}
                  onChange={(e) =>
                    handleEditFormChange(
                      "balance",
                      Number.parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="Enter balance"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input
                  value={`${formattedUser?.balance} coins`}
                  readOnly
                  className="bg-gray-50 font-semibold text-green-600 h-9 sm:h-10"
                />
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                Member Since
              </label>
              <Input
                value={new Date(user.createdAt).toLocaleDateString()}
                readOnly
                className="bg-gray-50 h-9 sm:h-10"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                Last Login
              </label>
              <Input
                value={
                  user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "Never"
                }
                readOnly
                className="bg-gray-50 h-9 sm:h-10"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Hash className="h-3 w-3 sm:h-4 sm:w-4" />
                Invite Code
              </label>
              {editMode && canEdit ? (
                <Input
                  value={editFormData.inviteCode || ""}
                  onChange={(e) =>
                    handleEditFormChange("inviteCode", e.target.value)
                  }
                  placeholder="Enter invite code"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input
                  value={user.inviteCode || "N/A"}
                  readOnly
                  className="bg-gray-50 font-mono text-xs sm:text-sm h-9 sm:h-10"
                />
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                Referred By
              </label>
              {editMode && canEdit ? (
                <Input
                  value={editFormData.referredBy || ""}
                  onChange={(e) =>
                    handleEditFormChange("referredBy", e.target.value)
                  }
                  placeholder="Enter referrer code"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input
                  value={user.referredBy || "Direct signup"}
                  readOnly
                  className="bg-gray-50 h-9 sm:h-10"
                />
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
                Calculator Usage
              </label>
              {editMode && canEdit ? (
                <Input
                  type="number"
                  value={editFormData.calculatorUsage || 0}
                  onChange={(e) =>
                    handleEditFormChange(
                      "calculatorUsage",
                      Number.parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="Enter usage count"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input
                  value={`${user.calculatorUsage || 0} times`}
                  readOnly
                  className="bg-gray-50 h-9 sm:h-10"
                />
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                Role
              </label>
              {editMode && canEdit ? (
                <Select
                  value={editFormData.role || "user"}
                  onValueChange={(value) => handleEditFormChange("role", value)}
                >
                  <SelectTrigger className="h-9 sm:h-10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={user.role || "user"}
                  readOnly
                  className="bg-gray-50 capitalize h-9 sm:h-10"
                />
              )}
            </div>
          </div>

          {/* Account Status Toggle - Only for superadmin in edit mode */}
          {editMode && canEdit && (
            <div className="mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editFormData.isActive || false}
                  onChange={(e) =>
                    handleEditFormChange("isActive", e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  Account Active
                </span>
              </label>
            </div>
          )}

          {/* Wallet Information */}
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
              Wallet Addresses
            </label>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 flex-shrink-0"
                >
                  MetaMask
                </Badge>
                {editMode && canEdit ? (
                  <Input
                    value={editFormData.walletAddresses?.metamask || ""}
                    onChange={(e) =>
                      handleEditFormChange(
                        "walletAddresses.metamask",
                        e.target.value
                      )
                    }
                    placeholder="Enter MetaMask wallet address"
                    className="font-mono text-xs sm:text-sm flex-1 h-9 sm:h-10"
                  />
                ) : (
                  <Input
                    value={user.walletAddresses?.metamask || "Not connected"}
                    readOnly
                    className="bg-gray-50 font-mono text-xs sm:text-sm flex-1 h-9 sm:h-10"
                  />
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 flex-shrink-0"
                >
                  Trust Wallet
                </Badge>
                {editMode && canEdit ? (
                  <Input
                    value={editFormData.walletAddresses?.trustWallet || ""}
                    onChange={(e) =>
                      handleEditFormChange(
                        "walletAddresses.trustWallet",
                        e.target.value
                      )
                    }
                    placeholder="Enter Trust Wallet address"
                    className="font-mono text-xs sm:text-sm flex-1 h-9 sm:h-10"
                  />
                ) : (
                  <Input
                    value={user.walletAddresses?.trustWallet || "Not connected"}
                    readOnly
                    className="bg-gray-50 font-mono text-xs sm:text-sm flex-1 h-9 sm:h-10"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Permission Restriction Notice */}
          {!canEdit && (
            <Alert className="border-orange-200 bg-orange-50 mb-6">
              <Lock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <strong>Edit Restricted:</strong> Only Super Admin users can
                    edit profile information.
                    <br />
                    <span className="text-sm">
                      Current role:{" "}
                      <strong className="capitalize">{userRole}</strong>
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-700 border-orange-300 w-fit"
                  >
                    {userRole === "editor" ? "Editor" : "Viewer"} Access
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Edit Error Display */}
          {editError && (
            <Alert className="border-red-200 bg-red-50 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {editError}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button onClick={() => setShowCoinHistory(true)} className="flex-1">
              <Coins className="h-4 w-4 mr-2" />
              View Coin History
            </Button>
            {editMode && canEdit ? (
              <>
                <Button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1 bg-transparent hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : canEdit ? (
              <>
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  className="flex-1 bg-transparent hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={handleStatusToggle}
                  variant={user.isActive ? "destructive" : "default"}
                  className={`flex-1 ${user.isActive?"bg-red-800":"g-green-800"}`}
                >
                  {user.isActive ? "Ban User" : "Unban User"}
                </Button>
              </>
            ) : (
              <Button
                disabled
                variant="outline"
                className="flex-1 opacity-50 cursor-not-allowed bg-transparent"
              >
                <Lock className="h-4 w-4 mr-2" />
                Edit Restricted
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Enhanced User Table Component with Pagination
const UserTable = ({
  users,
  onView,
  onStatusChange,
  userRole,
  refreshing,
  searchTerm,
  statusFilter,
  walletFilter,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const canEdit = userRole === "superadmin" || userRole === "editor";
  const canViewAll = userRole === "superadmin";

  // Filter users based on all criteria
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        (user.inviteCode &&
          user.inviteCode.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      const now = new Date();
      const userCreatedAt = new Date(user.createdAt);
      const daysDiff = Math.floor(
        (now - userCreatedAt) / (1000 * 60 * 60 * 24)
      );

      switch (statusFilter) {
        case "active":
          if (!user.isActive) return false;
          break;
        case "inactive":
          if (user.isActive) return false;
          break;
        case "top-users":
          if ((user.balance || user.coins || 0) <= 1000) return false;
          break;
        case "old-users":
          if (daysDiff < 15) return false;
          break;
        case "new-users":
          if (daysDiff >= 15) return false;
          break;
        default:
          break;
      }
    }

    // Wallet filter
    if (walletFilter !== "all") {
      const hasWallet = userHelpers.hasWallet(user);
      if (walletFilter === "wallet-connected" && !hasWallet) return false;
      if (walletFilter === "wallet-not-connected" && hasWallet) return false;
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, walletFilter]);

  const handleStatusChange = async (userId, currentStatus) => {
    if (onStatusChange) {
      await onStatusChange(userId, currentStatus);
    }
  };

  const getStatusBadge = (user) => {
    return (
      <Badge
        variant={user.isActive ? "default" : "secondary"}
        className={
          user.isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }
      >
        {user.isActive ? "Active" : "Banned"}
      </Badge>
    );
  };

  const getUserTypeBadge = (user) => {
    const now = new Date();
    const userCreatedAt = new Date(user.createdAt);
    const daysDiff = Math.floor((now - userCreatedAt) / (1000 * 60 * 60 * 24));
    const balance = user.balance || user.coins || 0;

    if (balance > 1000) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
          Top User
        </Badge>
      );
    }
    if (daysDiff < 15) {
      return (
        <Badge className="bg-blue-100 text-blue-800 text-xs">New User</Badge>
      );
    }
    if (daysDiff >= 15) {
      return (
        <Badge className="bg-gray-100 text-gray-800 text-xs">Old User</Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg">
              Users ({filteredUsers.length})
            </CardTitle>
            <div className="text-xs sm:text-sm text-gray-500">
              Page {currentPage} of {totalPages} • Showing {currentUsers.length}{" "}
              of {filteredUsers.length} users
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {refreshing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base">Loading users...</span>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                No users found matching your criteria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">
                      User
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">
                      Email
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">
                      Balance
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">
                      Status
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">
                      Type
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">
                      Wallet
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">
                      Joined
                    </th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr
                      key={user.id || user._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">
                              {user.name || "Unnamed"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.inviteCode || "No code"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <p className="text-xs sm:text-sm truncate max-w-[150px]">
                          {user.email}
                        </p>
                      </td>
                      <td className="p-2 sm:p-3">
                        <p className="font-semibold text-green-600 text-xs sm:text-sm">
                          {user.balance || user.coins || 0} coins
                        </p>
                      </td>
                      <td className="p-2 sm:p-3">{getStatusBadge(user)}</td>
                      <td className="p-2 sm:p-3">{getUserTypeBadge(user)}</td>
                      <td className="p-2 sm:p-3">
                        {userHelpers.hasWallet(user) ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <Wallet className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Connected</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-gray-600 text-xs"
                          >
                            <span className="hidden sm:inline">
                              Not Connected
                            </span>
                            <span className="sm:hidden">No</span>
                          </Badge>
                        )}
                      </td>
                      <td className="p-2 sm:p-3">
                        <p className="text-xs sm:text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {canViewAll && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onView(user)}
                              className="bg-transparent hover:bg-gray-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          {canEdit && (
                            <Button
                              size="sm"
                              variant={
                                user.isActive ? "destructive" : "default"
                              }
                              onClick={() =>
                                handleStatusChange(
                                  user.id || user._id,
                                  user.isActive ? "Active" : "Banned"
                                )
                              }
                              disabled={refreshing}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              {user.isActive ? (
                                <Ban className="h-3 w-3" />
                              ) : (
                                <UserCheck className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-transparent hover:bg-gray-50 h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 ${
                          currentPage === pageNum
                            ? "bg-[#0F82F4] hover:bg-[#0d6fd1]"
                            : "bg-transparent hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-transparent hover:bg-gray-50 h-8"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Main Enhanced User Management Component
const EnhancedUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [viewMode, setViewMode] = useState("analytics"); // 'analytics', 'profile'
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [walletFilter, setWalletFilter] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // Get user role from localStorage with enhanced checking
  useEffect(() => {
    try {
      const userStr =
        localStorage.getItem("user") ||
        localStorage.getItem("role") ||
        '"viewer"';
      let role = "viewer";
      try {
        const parsed = JSON.parse(userStr);
        role = typeof parsed === "string" ? parsed : parsed.role || "viewer";
      } catch {
        role = userStr || "viewer";
      }
      console.log("the current mode ", role);
      setUserRole(role);
    } catch (error) {
      console.error("Error getting user role:", error);
      setUserRole("viewer");
    } finally {
      setRoleLoading(false);
    }
  }, []);

  // Role-based permission helpers
  const canViewAll = userRole === "superadmin";
  const canEdit = userRole === "superadmin" || userRole === "editor";
  const canViewGraphs = userRole === "superadmin";
  const isViewer = userRole === "viewer";

  // Enhanced stats with new metrics
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    usersWithWallets: 0,
    totalBalance: 0,
    calculatorUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    usersWithFirebase: 0,
    usersWithSessions: 0,
    recentlyUpdated: 0,
    totalReferrals: 0,
    topUsers: 0,
    newUsers: 0,
    oldUsers: 0,
    growthMetrics: {
      newUsersLast30Days: 0,
      newUsersLast7Days: 0,
      newUsersToday: 0,
      activeUsersLast7Days: 0,
      growthRate30Days: 0,
      growthRate7Days: 0,
      weeklyActivityRate: 0,
    },
    engagementMetrics: {
      averageEngagementScore: 0,
      highEngagementUsers: 0,
      lowEngagementUsers: 0,
    },
  });

  // Calculate engagement metrics
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

  // Calculate additional user metrics
  const calculateAdditionalMetrics = (users) => {
    const now = new Date();
    let topUsers = 0;
    let newUsers = 0;
    let oldUsers = 0;

    users.forEach((user) => {
      const balance = user.balance || user.coins || 0;
      const userCreatedAt = new Date(user.createdAt);
      const daysDiff = Math.floor(
        (now - userCreatedAt) / (1000 * 60 * 60 * 24)
      );

      if (balance > 1000) topUsers++;
      if (daysDiff < 15) newUsers++;
      if (daysDiff >= 15) oldUsers++;
    });

    return { topUsers, newUsers, oldUsers };
  };

  // Enhanced user loading with comprehensive data handling
  const loadUsers = useCallback(
    async (showLoader = true, page = 1, limit = 1000) => {
      try {
        if (showLoader) setLoading(true);
        setError(null);
        // Fetch users with enhanced API response handling
        const response = await userAPI.getUsers(page, limit);
        let allUsers = [];
        if (response.success) {
          allUsers = response.users || response.data || [];
          setPagination(
            response.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalItems: allUsers.length,
              itemsPerPage: limit,
            }
          );
        } else {
          throw new Error("Failed to fetch users");
        }
        console.log("Loaded users:", allUsers.length);
        // Format users with enhanced helper
        const formattedUsers = userHelpers.formatUserList(allUsers);
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        // Calculate comprehensive stats using enhanced helpers
        const calculatedStats = userHelpers.calculateStats(allUsers);
        const growthMetrics = userHelpers.calculateGrowthMetrics(allUsers);
        const engagementMetrics = calculateEngagementMetrics(allUsers);
        const additionalMetrics = calculateAdditionalMetrics(allUsers);
        // Try to get additional data from specific endpoints
        let calculatorUsersCount = calculatedStats.calculatorUsers;
        let totalWalletsCount = calculatedStats.usersWithWallets;
        let totalReferralsCount = calculatedStats.totalReferrals;
        try {
          const [calculatorRes, walletsRes, referralsRes] =
            await Promise.allSettled([
              userAPI.getCalculatorUsers(),
              userAPI.getTotalWallets(),
              userAPI.getTotalReferrals(),
            ]);
          if (
            calculatorRes.status === "fulfilled" &&
            calculatorRes.value?.data
          ) {
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
        // Set enhanced stats
        setStats({
          totalUsers: calculatedStats.totalUsers,
          activeUsers: calculatedStats.activeUsers,
          inactiveUsers: calculatedStats.inactiveUsers,
          usersWithWallets: totalWalletsCount,
          totalBalance: calculatedStats.totalBalance,
          calculatorUsers: calculatorUsersCount,
          adminUsers: calculatedStats.adminUsers,
          regularUsers: calculatedStats.regularUsers,
          usersWithFirebase: calculatedStats.usersWithFirebase,
          usersWithSessions: calculatedStats.usersWithSessions,
          recentlyUpdated: calculatedStats.recentlyUpdated,
          totalReferrals: totalReferralsCount,
          ...additionalMetrics,
          growthMetrics,
          engagementMetrics,
        });
      } catch (err) {
        console.error("Failed to load users:", err);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Enhanced refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    setSuccessMessage("");
    setError(null);
    await loadUsers(false);
    setSuccessMessage("Data refreshed successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Enhanced user status change with better error handling using the updated API
  const handleUserStatusChange = async (userId, currentStatus) => {
    try {
      setRefreshing(true);
      setError(null);
      const isCurrentlyActive = currentStatus === "Active";
      const newStatus = !isCurrentlyActive;
      // Use the enhanced updateUserStatus function from api.js
      const result = await userAPI.updateUserStatus(userId, newStatus);
      if (result && !result.success) {
        throw new Error(result.message || "Failed to update user status");
      }
      // Update users list immediately for better UX
      const updateUsersList = (prevUsers) => {
        return prevUsers.map((user) =>
          (user.id || user._id) === userId
            ? {
                ...user,
                isActive: newStatus,
                status: newStatus ? "Active" : "Banned",
              }
            : user
        );
      };
      setUsers(updateUsersList);
      setFilteredUsers(updateUsersList);
      // Recalculate stats with updated data
      const updatedUserList = users.map((user) =>
        (user.id || user._id) === userId
          ? { ...user, isActive: newStatus }
          : user
      );
      const calculatedStats = userHelpers.calculateStats(updatedUserList);
      const engagementMetrics = calculateEngagementMetrics(updatedUserList);
      setStats((prevStats) => ({
        ...prevStats,
        activeUsers: calculatedStats.activeUsers,
        inactiveUsers: calculatedStats.inactiveUsers,
        engagementMetrics,
      }));
      setSuccessMessage(
        `User ${newStatus ? "unbanned" : "banned"} successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update user status:", error);
      setError(
        `Failed to ${currentStatus === "Active" ? "ban" : "unban"} user: ${
          error.message
        }`
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Initialize component
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Enhanced chart data generation
  const generateChartData = () => {
    if (!users.length) return [];
    // Group users by month with better date handling
    const groupedByMonth = users.reduce((acc, user) => {
      const date = new Date(user.joinedDate || user.createdAt);
      if (isNaN(date.getTime())) return acc; // Skip invalid dates
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});
    // Sort by date and create chart data
    return Object.entries(groupedByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Show last 12 months
      .map(([monthYear, count]) => ({
        period: monthYear,
        count,
        displayName: new Date(monthYear + "-01").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
      }));
  };

  // Enhanced activity data with more metrics
  const generateActivityData = () => {
    return [
      { name: "Active Users", value: stats.activeUsers, color: "#10B981" },
      { name: "Inactive Users", value: stats.inactiveUsers, color: "#EF4444" },
      { name: "With Wallets", value: stats.usersWithWallets, color: "#3B82F6" },
      {
        name: "Calculator Users",
        value: stats.calculatorUsers,
        color: "#F59E0B",
      },
      {
        name: "Firebase Users",
        value: stats.usersWithFirebase,
        color: "#8B5CF6",
      },
      {
        name: "High Engagement",
        value: stats.engagementMetrics.highEngagementUsers,
        color: "#06B6D4",
      },
    ];
  };

  // Generate engagement distribution data
  const generateEngagementData = () => {
    const highEngagement = stats.engagementMetrics.highEngagementUsers;
    const lowEngagement = stats.engagementMetrics.lowEngagementUsers;
    const mediumEngagement = stats.totalUsers - highEngagement - lowEngagement;
    return [
      { name: "High (70+)", value: highEngagement, color: "#10B981" },
      { name: "Medium (30-69)", value: mediumEngagement, color: "#F59E0B" },
      { name: "Low (<30)", value: lowEngagement, color: "#EF4444" },
    ];
  };

  const chartData = generateChartData();
  const activityData = generateActivityData();
  const engagementData = generateEngagementData();

  // Handle user selection for profile view
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // Handle modal status change
  const handleModalStatusChange = (updatedUser) => {
    // Update the users list with the updated user
    const updateUsersList = (prevUsers) => {
      return prevUsers.map((u) =>
        (u.id || u._id) === (updatedUser.id || updatedUser._id)
          ? {
              ...u,
              ...updatedUser,
              status: updatedUser.isActive ? "Active" : "Banned",
            }
          : u
      );
    };
    setUsers(updateUsersList);
    setFilteredUsers(updateUsersList);
    setSelectedUser(updatedUser);
    // Recalculate stats
    const updatedUserList = users.map((user) =>
      (user.id || user._id) === (updatedUser.id || updatedUser._id)
        ? { ...user, ...updatedUser }
        : user
    );
    const calculatedStats = userHelpers.calculateStats(updatedUserList);
    const engagementMetrics = calculateEngagementMetrics(updatedUserList);
    setStats((prevStats) => ({
      ...prevStats,
      activeUsers: calculatedStats.activeUsers,
      inactiveUsers: calculatedStats.inactiveUsers,
      engagementMetrics,
    }));
    // Show success message
    setSuccessMessage(`User profile updated successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Enhanced User Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Comprehensive user management with analytics and detailed profiles •{" "}
            {stats.totalUsers} total users
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2 bg-transparent hover:bg-gray-50 flex-1 sm:flex-none"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent hover:bg-gray-50 flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setViewMode("analytics")}
          variant={viewMode === "analytics" ? "default" : "outline"}
          className={`${
            viewMode === "analytics"
              ? "bg-[#0F82F4] hover:bg-[#0d6fd1]"
              : "bg-transparent hover:bg-gray-50"
          } flex-1 sm:flex-none`}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
        <Button
          onClick={() => setViewMode("profile")}
          variant={viewMode === "profile" ? "default" : "outline"}
          className={`${
            viewMode === "profile"
              ? "bg-[#0F82F4] hover:bg-[#0d6fd1]"
              : "bg-transparent hover:bg-gray-50"
          } flex-1 sm:flex-none`}
        >
          <User className="h-4 w-4 mr-2" />
          User Profiles
        </Button>
      </div>

      {/* Role Indicator */}
      {!roleLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${
            userRole === "superadmin"
              ? "bg-green-100 text-green-800 border border-green-200"
              : userRole === "editor"
              ? "bg-blue-100 text-blue-800 border border-blue-200"
              : "bg-orange-100 text-orange-800 border border-orange-200"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              userRole === "superadmin"
                ? "bg-green-500"
                : userRole === "editor"
                ? "bg-blue-500"
                : "bg-orange-500"
            }`}
          />
          {userRole === "superadmin"
            ? "Super Admin"
            : userRole === "editor"
            ? "Editor"
            : "Viewer"}{" "}
          Access
          {isViewer && (
            <span className="ml-2 text-xs bg-orange-200 px-2 py-1 rounded">
              Read Only
            </span>
          )}
        </motion.div>
      )}

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                {successMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div>
                  <h3 className="font-medium text-red-900">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <DashboardStatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers.toString()}
          subtitle={`${stats.growthMetrics.newUsersLast30Days} this month`}
          trend={
            stats.growthMetrics.growthRate30Days >= 0
              ? `+${stats.growthMetrics.growthRate30Days.toFixed(1)}%`
              : `${stats.growthMetrics.growthRate30Days.toFixed(1)}%`
          }
        />
        <DashboardStatCard
          icon={UserCheck}
          label="Active Users"
          value={stats.activeUsers.toString()}
          subtitle={`${(
            (stats.activeUsers / Math.max(stats.totalUsers, 1)) *
            100
          ).toFixed(1)}% active rate`}
          trend={stats.activeUsers > stats.totalUsers * 0.8 ? "+5%" : "-2%"}
        />
        <DashboardStatCard
          icon={Wallet}
          label="Wallet Connected"
          value={stats.usersWithWallets.toString()}
          subtitle={`${(
            (stats.usersWithWallets / Math.max(stats.totalUsers, 1)) *
            100
          ).toFixed(1)}% of users`}
          trend={stats.usersWithWallets > 0 ? "+8%" : "0%"}
        />
        <DashboardStatCard
          icon={Calculator}
          label="Calculator Users"
          value={stats.calculatorUsers.toString()}
          subtitle={`${(
            (stats.calculatorUsers / Math.max(stats.totalUsers, 1)) *
            100
          ).toFixed(1)}% usage`}
          trend={stats.calculatorUsers > 0 ? "+3%" : "0%"}
        />
        <DashboardStatCard
          icon={Smartphone}
          label="Firebase Users"
          value={stats.usersWithFirebase.toString()}
          subtitle={`${(
            (stats.usersWithFirebase / Math.max(stats.totalUsers, 1)) *
            100
          ).toFixed(1)}% integrated`}
          trend={stats.usersWithFirebase > 0 ? "+12%" : "0%"}
        />
        <DashboardStatCard
          icon={Zap}
          label="Avg Engagement"
          value={`${stats.engagementMetrics.averageEngagementScore}/100`}
          subtitle={`${stats.engagementMetrics.highEngagementUsers} high performers`}
          trend={
            stats.engagementMetrics.averageEngagementScore > 50 ? "+7%" : "-3%"
          }
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Top Users (&gt;1000 coins)
                </p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {stats.topUsers}
                </p>
              </div>
              <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  New Users (Last 15 days)
                </p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {stats.newUsers}
                </p>
              </div>
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Old Users (15+ days)
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-600">
                  {stats.oldUsers}
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditional Content Based on View Mode */}
      {viewMode === "profile" && (
        <>
          {/* Enhanced Filters Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or invite code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Users</option>
                  <option value="inactive">Inactive Users</option>
                  <option value="top-users">Top Users (&gt;1000 coins)</option>
                  <option value="new-users">New Users (Last 15 days)</option>
                  <option value="old-users">Old Users (15+ days)</option>
                </select>
                <select
                  value={walletFilter}
                  onChange={(e) => setWalletFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Wallets</option>
                  <option value="wallet-connected">Wallet Connected</option>
                  <option value="wallet-not-connected">
                    Wallet Not Connected
                  </option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* User Table with Pagination */}
          <UserTable
            users={users}
            onView={canViewAll ? handleUserSelect : undefined}
            onStatusChange={canEdit ? handleUserStatusChange : undefined}
            userRole={userRole}
            refreshing={refreshing}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            walletFilter={walletFilter}
          />
        </>
      )}

      {viewMode === "analytics" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* User Registration Chart */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      User Registration Trend
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Monthly user registration over time (last 12 months)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold text-[#0F82F4]">
                      {stats.totalUsers}
                    </p>
                    <p className="text-xs text-gray-500">Total Users</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="displayName"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      allowDecimals={false}
                      domain={[0, "auto"]}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      labelFormatter={(label) => `Period: ${label}`}
                      formatter={(value) => [value, "New Users"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#0F82F4"
                      strokeWidth={3}
                      name="New Users"
                      animationDuration={800}
                      dot={{ r: 4, fill: "#0F82F4" }}
                      activeDot={{ r: 6, fill: "#0d6fd1" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Activity Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      User Activity Breakdown
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Distribution of user activities and features
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={activityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Bar
                      dataKey="value"
                      fill="#0F82F4"
                      radius={[4, 4, 0, 0]}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Engagement Distribution - Only for superadmin */}
          {canViewGraphs ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        User Engagement Distribution
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Breakdown of user engagement levels
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        {stats.engagementMetrics.averageEngagementScore}
                      </p>
                      <p className="text-xs text-gray-500">Avg Score</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={800}
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Users"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="text-center p-4 sm:p-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                      Restricted Access
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Engagement metrics available for Super Admin only
                    </p>
                    <div className="mt-3 px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full inline-block">
                      {userRole === "editor" ? "Editor" : "Viewer"} Role
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6 opacity-20 blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        User Engagement Distribution
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Breakdown of user engagement levels
                      </p>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Growth Metrics - Only for superadmin */}
          {canViewGraphs ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Growth Metrics
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Recent growth and activity statistics
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            New Users Today
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-blue-600">
                            {stats.growthMetrics.newUsersToday}
                          </p>
                        </div>
                        <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            New Users (7d)
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-green-600">
                            {stats.growthMetrics.newUsersLast7Days}
                          </p>
                        </div>
                        <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Weekly Activity
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-purple-600">
                            {stats.growthMetrics.weeklyActivityRate.toFixed(1)}%
                          </p>
                        </div>
                        <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Growth Rate (30d)
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-orange-600">
                            {stats.growthMetrics.growthRate30Days >= 0
                              ? "+"
                              : ""}
                            {stats.growthMetrics.growthRate30Days.toFixed(1)}%
                          </p>
                        </div>
                        {stats.growthMetrics.growthRate30Days >= 0 ? (
                          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                        ) : (
                          <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="text-center p-4 sm:p-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 00-2 2H9a2 2 0 00-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                      Restricted Access
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Growth metrics available for Super Admin only
                    </p>
                    <div className="mt-3 px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full inline-block">
                      {userRole === "editor" ? "Editor" : "Viewer"} Role
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6 opacity-20 blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Growth Metrics
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Recent growth and activity statistics
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Enhanced User Modal */}
      <AnimatePresence>
        {modalOpen && (
          <EnhancedUserModal
            user={selectedUser}
            open={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedUser(null);
            }}
            onStatusChange={canEdit ? handleModalStatusChange : undefined}
            userRole={userRole}
            readOnly={!canEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedUserManagement;
