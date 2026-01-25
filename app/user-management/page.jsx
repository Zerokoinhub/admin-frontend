"use client"

import { useEffect, useState, useCallback } from "react"
import DashboardStatCard from "../../src/components/ui/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Zap,
  User,
  Mail,
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
  Bell,
  Camera,
  Globe,
  Play,
  CheckSquare,
  Target,
  MapPin,
  Upload,
  Image as ImageIcon,
} from "lucide-react"
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
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { userAPI, userHelpers } from "../../src/lib/api"
import FullScreenLoader from "../../src/components/ui/FullScreenLoader"

// Helper function to validate and fix image URLs
const validateAndFixImageUrl = (url) => {
  if (!url) return null;
  
  // If it's already a valid URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  // If it's a relative path, try to make it absolute
  if (url.startsWith('/')) {
    // Try to construct absolute URL from current origin
    return window.location.origin + url;
  }
  
  // If it's a base64 string without data: prefix
  if (url.startsWith('base64,') || (url.length > 1000 && url.includes(','))) {
    // Try to fix common base64 issues
    if (!url.startsWith('data:')) {
      if (url.includes('image/jpeg') || url.includes('image/jpg')) {
        return `data:image/jpeg;base64,${url.split(',')[1] || url}`;
      } else if (url.includes('image/png')) {
        return `data:image/png;base64,${url.split(',')[1] || url}`;
      } else {
        return `data:image/*;base64,${url}`;
      }
    }
  }
  
  return url;
};

// Image Component with proper error handling
const UserImage = ({ src, alt, size = "md", className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const sizeClasses = {
    sm: "w-6 h-6 sm:w-8 sm:h-8",
    md: "w-12 h-12 sm:w-16 sm:h-16",
    lg: "w-20 h-20 sm:w-24 sm:h-24",
  };
  
  const validatedSrc = validateAndFixImageUrl(src);
  
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    
    if (validatedSrc) {
      // Preload image to check if it's valid
      const img = new Image();
      img.onload = () => {
        setIsLoading(false);
        console.log(`Image loaded successfully: ${alt}`, validatedSrc);
      };
      img.onerror = () => {
        setIsLoading(false);
        setImageError(true);
        console.error(`Failed to load image for ${alt}:`, validatedSrc);
      };
      img.src = validatedSrc;
    } else {
      setIsLoading(false);
      setImageError(true);
    }
  }, [validatedSrc, alt]);
  
  if (!validatedSrc || imageError) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200 flex-shrink-0 ${className}`}>
        <User className={`${size === 'sm' ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-5 w-5 sm:h-6 sm:w-6'} text-gray-400`} />
      </div>
    );
  }
  
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {isLoading && (
        <div className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200`}>
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
      <img 
        src={validatedSrc} 
        alt={alt || "User"}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-blue-200 ${isLoading ? 'hidden' : ''}`}
        onError={(e) => {
          console.error(`Image error for ${alt}:`, validatedSrc);
          setImageError(true);
          e.target.style.display = 'none';
        }}
        onLoad={() => {
          setIsLoading(false);
          console.log(`Image displayed for ${alt}:`, validatedSrc);
        }}
      />
    </div>
  );
};

// Enhanced Coin History Component
const CoinHistoryView = ({ selectedUser, onBack }) => {
  const [transferHistory, setTransferHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    dateRange: "",
    status: "",
  })
  const [stats, setStats] = useState(null)

  // Log user details when component mounts
  useEffect(() => {
    if (selectedUser) {
      console.log("=== Coin History - User Details ===");
      console.log("User Name:", selectedUser.name);
      console.log("User Email:", selectedUser.email);
      console.log("User ID:", selectedUser.id || selectedUser._id);
      
      if (selectedUser.photoURL) {
        const validatedUrl = validateAndFixImageUrl(selectedUser.photoURL);
        console.log("Original Profile Image:", selectedUser.photoURL);
        console.log("Validated Image URL:", validatedUrl);
        console.log("Image Type:", validatedUrl?.startsWith('data:') ? 'Base64' : 'URL');
      } else {
        console.log("No profile image available");
      }
      
      console.log("=== End User Details ===");
    }
  }, [selectedUser]);

  const fetchTransferHistory = useCallback(async () => {
    if (!selectedUser) return
    setLoading(true)
    setError("")
    try {
      const response = await userAPI.getTransferHistory({
        ...filters,
        userId: selectedUser.id || selectedUser._id,
      })
      if (response.success && response.data) {
        const formattedTransfers = response.data.map((transfer) => userHelpers.formatTransferData(transfer))
        setTransferHistory(formattedTransfers)
        const transferStats = userHelpers.calculateTransferStats(formattedTransfers)
        setStats(transferStats)
      } else {
        throw new Error(response.message || "Failed to fetch transfer history")
      }
    } catch (apiError) {
      console.warn("API call failed, using mock data:", apiError)
      setError("Using mock data - API unavailable")
      // Enhanced mock data for demonstration
      const mockTransfers = [
        {
          id: "1",
          userId: selectedUser.id || selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          amount: selectedUser.recentAmount || 100,
          reason: "Session completion reward",
          status: "completed",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          transferredBy: "System",
          transactionId: "TXN001",
          balanceBefore: (selectedUser.balance || 0) - (selectedUser.recentAmount || 100),
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
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          transferredBy: "System",
          transactionId: "TXN002",
          balanceBefore: (selectedUser.balance || 0) - 150,
          balanceAfter: (selectedUser.balance || 0) - 100,
        },
      ]
      const formattedMockTransfers = mockTransfers.map((transfer) => userHelpers.formatTransferData(transfer))
      setTransferHistory(formattedMockTransfers)
      const mockStats = userHelpers.calculateTransferStats(formattedMockTransfers)
      setStats(mockStats)
    } finally {
      setLoading(false)
    }
  }, [selectedUser, filters])

  useEffect(() => {
    fetchTransferHistory()
  }, [fetchTransferHistory])

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
    }
    const config = statusConfig[status] || statusConfig.pending
    const IconComponent = config.icon
    return (
      <Badge className={`${config.bg} ${config.text} flex items-center gap-1 text-xs`}>
        <IconComponent className="h-3 w-3" />
        <span className="hidden sm:inline">{config.label}</span>
      </Badge>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Button onClick={onBack} variant="outline" className="w-fit bg-transparent hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Coin History - {selectedUser?.name}</h2>
            <p className="text-sm sm:text-base text-gray-600">Complete transaction history and statistics</p>
          </div>
        </div>
        <Button onClick={fetchTransferHistory} disabled={loading} className="w-fit">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
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
                  <p className="text-xs sm:text-sm text-gray-600">Total Transfers</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.totalTransfers}</p>
                </div>
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Earned</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">+{stats.totalAmount}</p>
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
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.monthTransfers}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Recent Amount</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">{selectedUser?.recentAmount || 0}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transfer History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg">Transaction History</CardTitle>
            <Button variant="outline" size="sm" className="w-fit bg-transparent hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base">Loading transaction history...</span>
            </div>
          ) : error ? (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">{error}</AlertDescription>
            </Alert>
          ) : transferHistory.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No transaction history found</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {transferHistory.map((transfer) => (
                <div key={transfer.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-green-600 text-sm sm:text-base">+{transfer.amount} coins</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{transfer.reason}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {getStatusBadge(transfer.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transfer.createdAt).toLocaleDateString()}{" "}
                        <span className="hidden sm:inline">{new Date(transfer.createdAt).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="truncate">
                      <span className="font-medium">By:</span> {transfer.transferredBy}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">ID:</span> {transfer.transactionId}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">Balance:</span> {transfer.balanceBefore} → {transfer.balanceAfter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced User Profile Modal with all API fields
const EnhancedUserModal = ({ user, open, onClose, onStatusChange, userRole, readOnly }) => {
  const [editMode, setEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState("")
  const [showCoinHistory, setShowCoinHistory] = useState(false)

  const canEdit = userRole === "superadmin"

  // Initialize edit form with current user data including new fields
  const initializeEditForm = (userData) => {
    setEditFormData({
      name: userData.name || "",
      email: userData.email || "",
      balance: userData.balance || 0,
      recentAmount: userData.recentAmount || 0,
      isActive: userData.isActive || false,
      role: userData.role || "user",
      calculatorUsage: userData.calculatorUsage || 0,
      inviteCode: userData.inviteCode || "",
      referredBy: userData.referredBy || "",
      country: userData.country || "",
      walletStatus: userData.walletStatus || "Not Connected",
      walletAddresses: {
        metamask: userData.walletAddresses?.metamask || "",
        trustWallet: userData.walletAddresses?.trustWallet || "",
      },
      notificationSettings: {
        sessionUnlocked: userData.notificationSettings?.sessionUnlocked ?? true,
        pushEnabled: userData.notificationSettings?.pushEnabled ?? true,
      },
    })
  }

  // Handle form input changes
  const handleEditFormChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setEditFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  // Save edited user data
  const handleSaveEdit = async () => {
    setSaving(true)
    setEditError("")
    try {
      const response = await userAPI.updateUser(user._id || user.id, editFormData)
      if (response.success) {
        const updatedUser = { ...user, ...editFormData }
        if (onStatusChange) {
          onStatusChange(updatedUser)
        }
        setEditMode(false)
      } else {
        throw new Error(response.message || "Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      setEditError("Failed to update user profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditMode(false)
    setEditFormData({})
    setEditError("")
  }

  // Enable edit mode
  const handleEditProfile = () => {
    if (user && canEdit) {
      initializeEditForm(user)
      setEditMode(true)
    }
  }

  // Handle status change
  const handleStatusToggle = async () => {
    if (onStatusChange && canEdit) {
      const updatedUser = { ...user, isActive: !user.isActive }
      onStatusChange(updatedUser)
    }
  }

  // Get session progress
  const getSessionProgress = () => {
    if (!user.sessions || !Array.isArray(user.sessions)) {
      return { completed: 0, total: 0, percentage: 0 }
    }
    const completed = user.sessions.filter((s) => s.completedAt).length
    const total = user.sessions.length
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }

  // Log user details when modal opens
  useEffect(() => {
    if (open && user) {
      console.log("=== User Profile Details ===");
      console.log("User Name:", user.name);
      console.log("User Email:", user.email);
      console.log("User ID:", user._id || user.id);
      
      // Log image path if it exists
      if (user.photoURL) {
        const validatedUrl = validateAndFixImageUrl(user.photoURL);
        console.log("Original Profile Image:", user.photoURL);
        console.log("Validated Image URL:", validatedUrl);
        console.log("Image Type:", validatedUrl?.startsWith('data:') ? 'Base64' : 'URL');
        
        // Check if it's a valid URL
        if (validatedUrl?.startsWith('http')) {
          try {
            const url = new URL(validatedUrl);
            console.log("Valid HTTP URL: Yes", `(${url.protocol}//${url.hostname})`);
          } catch {
            console.log("Valid HTTP URL: No");
          }
        }
      } else {
        console.log("No profile image available");
      }
      
      // Log all image-related fields
      console.log("All Screenshots:", user.screenshots || []);
      console.log("Screenshot Count:", user.screenshots?.length || 0);
      
      if (user.screenshots && user.screenshots.length > 0) {
        console.log("=== Screenshot Details ===");
        user.screenshots.forEach((screenshot, index) => {
          const validatedScreenshot = validateAndFixImageUrl(screenshot);
          console.log(`${index + 1}. Original: ${screenshot}`);
          console.log(`   Validated: ${validatedScreenshot}`);
        });
      }
      
      console.log("=== End User Details ===");
    }
  }, [open, user]);

  if (!open || !user) return null

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
          <CoinHistoryView selectedUser={user} onBack={() => setShowCoinHistory(false)} />
          <div className="p-4 border-t bg-gray-50">
            <Button onClick={onClose} variant="outline" className="w-full bg-transparent hover:bg-gray-100">
              Close Modal
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const sessionProgress = getSessionProgress()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="min-w-0 flex-1 flex items-center gap-3">
              {/* Profile Image */}
              <UserImage 
                src={user.photoURL} 
                alt={user.name}
                size="md"
              />
              
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold truncate">{user.name}</h2>
                <p className="text-sm sm:text-base text-gray-600 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {readOnly && (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200 flex-shrink-0"
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Read Only</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <Badge
                variant={user.isActive ? "default" : "secondary"}
                className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-500 text-white"}
              >
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0 ml-2">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Image Debug Info - Only in development */}
          {process.env.NODE_ENV === 'development' && user.photoURL && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                <strong>Image Debug:</strong> {user.photoURL.length > 100 ? 
                  `Base64 (${Math.round(user.photoURL.length / 1024)}KB)` : 
                  `URL: ${user.photoURL.substring(0, 50)}${user.photoURL.length > 50 ? '...' : ''}`
                }
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-2 h-6 text-xs"
                  onClick={() => {
                    const validated = validateAndFixImageUrl(user.photoURL);
                    console.log("Image Validation:", {
                      original: user.photoURL,
                      validated: validated,
                      type: validated?.startsWith('data:') ? 'base64' : 'url'
                    });
                  }}
                >
                  Debug
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-green-700">Current Balance</p>
                    <p className="text-lg sm:text-xl font-bold text-green-800">{user.balance || 0}</p>
                  </div>
                  <Coins className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-700">Recent Amount</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-800">{user.recentAmount || 0}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-purple-700">Sessions</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-800">
                      {sessionProgress.completed}/{sessionProgress.total}
                    </p>
                  </div>
                  <Play className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-orange-700">Screenshots</p>
                    <p className="text-lg sm:text-xl font-bold text-orange-800">{user.screenshots?.length || 0}</p>
                  </div>
                  <Camera className="h-6 w-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

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
                <Input value={user.name} readOnly className="bg-gray-50 h-9 sm:h-10" />
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
                  onChange={(e) => handleEditFormChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input value={user.email} readOnly className="bg-gray-50 h-9 sm:h-10" />
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                Profile Image
              </label>
              <div className="flex items-center gap-2">
                <Input 
                  value={user.photoURL ? 
                    (user.photoURL.length > 100 ? 
                      `Base64 (${Math.round(user.photoURL.length / 1024)}KB)` : 
                      user.photoURL
                    ) : "No profile image"
                  } 
                  readOnly 
                  className="bg-gray-50 text-xs h-9 sm:h-10 truncate flex-1" 
                />
                {user.photoURL && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const validatedUrl = validateAndFixImageUrl(user.photoURL);
                      console.log("Opening image URL:", validatedUrl);
                      if (validatedUrl && validatedUrl.startsWith('http')) {
                        window.open(validatedUrl, '_blank', 'noopener,noreferrer');
                      } else if (validatedUrl?.startsWith('data:')) {
                        // For base64 images, create a new window with the image
                        const win = window.open();
                        win.document.write(`<img src="${validatedUrl}" alt="Profile Image" />`);
                      }
                    }}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                Country
              </label>
              {editMode && canEdit ? (
                <Input
                  value={editFormData.country || ""}
                  onChange={(e) => handleEditFormChange("country", e.target.value)}
                  placeholder="Enter country"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input value={user.country || "Unknown"} readOnly className="bg-gray-50 h-9 sm:h-10" />
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
                  onChange={(e) => handleEditFormChange("balance", Number.parseInt(e.target.value) || 0)}
                  placeholder="Enter balance"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input
                  value={`${user.balance} coins`}
                  readOnly
                  className="bg-gray-50 font-semibold text-green-600 h-9 sm:h-10"
                />
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                Recent Amount
              </label>
              {editMode && canEdit ? (
                <Input
                  type="number"
                  value={editFormData.recentAmount || 0}
                  onChange={(e) => handleEditFormChange("recentAmount", Number.parseInt(e.target.value) || 0)}
                  placeholder="Enter recent amount"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input
                  value={`${user.recentAmount || 0} coins`}
                  readOnly
                  className="bg-gray-50 font-semibold text-blue-600 h-9 sm:h-10"
                />
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
                Wallet Status
              </label>
              {editMode && canEdit ? (
                <Select
                  value={editFormData.walletStatus || "Not Connected"}
                  onValueChange={(value) => handleEditFormChange("walletStatus", value)}
                >
                  <SelectTrigger className="h-9 sm:h-10">
                    <SelectValue placeholder="Select wallet status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Connected">Connected</SelectItem>
                    <SelectItem value="Not Connected">Not Connected</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={user.walletStatus || "Not Connected"} readOnly className="bg-gray-50 h-9 sm:h-10" />
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
                <Hash className="h-3 w-3 sm:h-4 sm:w-4" />
                Invite Code
              </label>
              {editMode && canEdit ? (
                <Input
                  value={editFormData.inviteCode || ""}
                  onChange={(e) => handleEditFormChange("inviteCode", e.target.value)}
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
                <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
                Calculator Usage
              </label>
              {editMode && canEdit ? (
                <Input
                  type="number"
                  value={editFormData.calculatorUsage || 0}
                  onChange={(e) => handleEditFormChange("calculatorUsage", Number.parseInt(e.target.value) || 0)}
                  placeholder="Enter usage count"
                  className="h-9 sm:h-10"
                />
              ) : (
                <Input value={`${user.calculatorUsage || 0} times`} readOnly className="bg-gray-50 h-9 sm:h-10" />
              )}
            </div>
          </div>

          {/* Rest of the component remains the same... */}
          {/* (Keep all the other sections from your original code) */}

        </div>
      </motion.div>
    </div>
  )
}

// Enhanced User Table Component with new fields
const UserTable = ({ users, onView, onStatusChange, userRole, refreshing, searchTerm, statusFilter, walletFilter }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const canEdit = userRole === "superadmin" || userRole === "editor"
  const canViewAll = userRole === "superadmin"

  // Filter users based on all criteria
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.country?.toLowerCase().includes(searchLower) ||
        (user.inviteCode && user.inviteCode.toLowerCase().includes(searchLower))
      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter !== "all") {
      const now = new Date()
      const userCreatedAt = new Date(user.createdAt)
      const daysDiff = Math.floor((now - userCreatedAt) / (1000 * 60 * 60 * 24))
      switch (statusFilter) {
        case "active":
          if (!user.isActive) return false
          break
        case "inactive":
          if (user.isActive) return false
          break
        case "top-users":
          if ((user.balance || user.coins || 0) <= 1000) return false
          break
        case "old-users":
          if (daysDiff < 15) return false
          break
        case "new-users":
          if (daysDiff >= 15) return false
          break
        default:
          break
      }
    }

    // Wallet filter
    if (walletFilter !== "all") {
      const hasWallet = user.walletStatus === "Connected"
      if (walletFilter === "wallet-connected" && !hasWallet) return false
      if (walletFilter === "wallet-not-connected" && hasWallet) return false
    }

    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, walletFilter])

  const handleStatusChange = async (userId, currentStatus) => {
    if (onStatusChange) {
      await onStatusChange(userId, currentStatus)
    }
  }

  // Handle view user with logging
  const handleViewUser = (user) => {
    console.log("=== User Clicked ===");
    console.log("User ID:", user._id || user.id);
    console.log("User Name:", user.name);
    console.log("User Email:", user.email);
    
    const validatedUrl = validateAndFixImageUrl(user.photoURL);
    if (user.photoURL) {
      console.log("Original Profile Image:", user.photoURL);
      console.log("Validated Image URL:", validatedUrl);
    } else {
      console.log("No profile image");
    }
    
    console.log("Country:", user.country || "Unknown");
    console.log("Balance:", user.balance || 0);
    console.log("Screenshot Count:", user.screenshots?.length || 0);
    
    if (user.screenshots && user.screenshots.length > 0) {
      console.log("Screenshot URLs:");
      user.screenshots.forEach((screenshot, index) => {
        console.log(`  ${index + 1}. ${screenshot}`);
      });
    }
    
    console.log("=== End User Info ===");
    
    // Call the original onView function
    if (onView) {
      onView(user);
    }
  }

  const getStatusBadge = (user) => {
    return (
      <Badge
        variant={user.isActive ? "default" : "secondary"}
        className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
      >
        {user.isActive ? "Active" : "Banned"}
      </Badge>
    )
  }

  const getUserTypeBadge = (user) => {
    const now = new Date()
    const userCreatedAt = new Date(user.createdAt)
    const daysDiff = Math.floor((now - userCreatedAt) / (1000 * 60 * 60 * 24))
    const balance = user.balance || user.coins || 0

    if (balance > 1000) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Top User</Badge>
    }
    if (daysDiff < 15) {
      return <Badge className="bg-blue-100 text-blue-800 text-xs">New User</Badge>
    }
    if (daysDiff >= 15) {
      return <Badge className="bg-gray-100 text-gray-800 text-xs">Old User</Badge>
    }
    return null
  }

  const getSessionProgress = (user) => {
    if (!user.sessions || !Array.isArray(user.sessions)) return "0/0"
    const completed = user.sessions.filter((s) => s.completedAt).length
    const total = user.sessions.length
    return `${completed}/${total}`
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg">Users ({filteredUsers.length})</CardTitle>
            <div className="text-xs sm:text-sm text-gray-500">
              Page {currentPage} of {totalPages} • Showing {currentUsers.length} of {filteredUsers.length} users
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
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">User</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">Email</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">Country</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">Balance</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">Sessions</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">Status</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">Type</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">Wallet</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">Joined</th>
                    <th className="text-left p-2 sm:p-3 font-medium text-gray-600 text-xs sm:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Profile Image */}
                          <UserImage 
                            src={user.photoURL} 
                            alt={user.name || "User"}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">{user.name || "Unnamed"}</p>
                            <p className="text-xs text-gray-500 truncate">{user.inviteCode || "No code"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <p className="text-xs sm:text-sm truncate max-w-[150px]">{user.email}</p>
                      </td>
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          <p className="text-xs sm:text-sm truncate">{user.country || "Unknown"}</p>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <div>
                          <p className="font-semibold text-green-600 text-xs sm:text-sm">
                            {user.balance || user.coins || 0}
                          </p>
                          {user.recentAmount > 0 && (
                            <p className="text-xs text-blue-600">+{user.recentAmount} recent</p>
                          )}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <Badge variant="outline" className="text-xs">
                          {getSessionProgress(user)}
                        </Badge>
                      </td>
                      <td className="p-2 sm:p-3">{getStatusBadge(user)}</td>
                      <td className="p-2 sm:p-3">{getUserTypeBadge(user)}</td>
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center gap-1">
                          {user.walletStatus === "Connected" ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Wallet className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">{user.walletStatus || "Connected"}</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600 text-xs">
                              <span className="hidden sm:inline">Not Connected</span>
                              <span className="sm:hidden">No</span>
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <p className="text-xs sm:text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {canViewAll && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewUser(user)}
                              className="bg-transparent hover:bg-gray-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          {canEdit && (
                            <Button
                              size="sm"
                              variant={user.isActive ? "destructive" : "default"}
                              onClick={() =>
                                handleStatusChange(user._id, user.isActive ? "Active" : "Banned")
                              }
                              disabled={refreshing}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              {user.isActive ? <Ban className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
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
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
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
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
  )
}

// Main Enhanced User Management Component
const EnhancedUserManagement = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [viewMode, setViewMode] = useState("analytics") // 'analytics', 'profile'
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [walletFilter, setWalletFilter] = useState("all")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  })
  const [userRole, setUserRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)

  // Get user role from localStorage with enhanced checking
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user") || localStorage.getItem("role") || '"viewer"'
      let role = "viewer"
      try {
        const parsed = JSON.parse(userStr)
        role = typeof parsed === "string" ? parsed : parsed.role || "viewer"
      } catch {
        role = userStr || "viewer"
      }
      console.log("the current mode ", role)
      setUserRole(role)
    } catch (error) {
      console.error("Error getting user role:", error)
      setUserRole("viewer")
    } finally {
      setRoleLoading(false)
    }
  }, [])

  // Role-based permission helpers
  const canViewAll = userRole === "superadmin"
  const canEdit = userRole === "superadmin" || userRole === "editor"
  const canViewGraphs = userRole === "superadmin"
  const isViewer = userRole === "viewer"

  // Enhanced stats with new metrics from API response
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
    usersWithNotifications: 0,
    usersWithFcmTokens: 0,
    usersWithScreenshots: 0,
    connectedWallets: 0,
    notConnectedWallets: 0,
    pendingWallets: 0,
    totalRecentAmount: 0,
    completedSessions: 0,
    totalSessions: 0,
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
  })

  // Calculate engagement metrics
  const calculateEngagementMetrics = (users) => {
    if (!Array.isArray(users) || users.length === 0) {
      return {
        averageEngagementScore: 0,
        highEngagementUsers: 0,
        lowEngagementUsers: 0,
      }
    }
    const engagementScores = users.map((user) => {
      let score = 0
      if (user.balance > 100) score += 20
      if (user.recentAmount > 0) score += 15
      if (user.sessions && user.sessions.length > 0) score += 25
      if (user.sessions && user.sessions.some(s => s.completedAt)) score += 30
      if (user.walletStatus === "Connected") score += 10
      return Math.min(100, score)
    })
    const averageScore = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length
    return {
      averageEngagementScore: Math.round(averageScore),
      highEngagementUsers: engagementScores.filter((score) => score >= 70).length,
      lowEngagementUsers: engagementScores.filter((score) => score < 30).length,
    }
  }

  // Calculate additional user metrics from API response
  const calculateAdditionalMetrics = (users) => {
    const now = new Date()
    let topUsers = 0
    let newUsers = 0
    let oldUsers = 0
    let usersWithNotifications = 0
    let usersWithFcmTokens = 0
    let usersWithScreenshots = 0
    let connectedWallets = 0
    let notConnectedWallets = 0
    let pendingWallets = 0
    let totalRecentAmount = 0
    let completedSessions = 0
    let totalSessions = 0

    users.forEach((user) => {
      const balance = user.balance || 0
      const userCreatedAt = new Date(user.createdAt)
      const daysDiff = Math.floor((now - userCreatedAt) / (1000 * 60 * 60 * 24))

      // User categories
      if (balance > 1000) topUsers++
      if (daysDiff < 15) newUsers++
      if (daysDiff >= 15) oldUsers++

      // Notification and FCM metrics
      if (user.notificationSettings) usersWithNotifications++
      if (user.fcmTokens && user.fcmTokens.length > 0) usersWithFcmTokens++

      // Screenshot metrics
      if (user.screenshots && user.screenshots.length > 0) usersWithScreenshots++

      // Wallet status metrics
      if (user.walletStatus === "Connected") connectedWallets++
      else if (user.walletStatus === "Not Connected") notConnectedWallets++
      else if (user.walletStatus === "Pending") pendingWallets++

      // Recent amount
      totalRecentAmount += user.recentAmount || 0

      // Session metrics
      if (user.sessions && Array.isArray(user.sessions)) {
        totalSessions += user.sessions.length
        completedSessions += user.sessions.filter((s) => s.completedAt).length
      }
    })

    return {
      topUsers,
      newUsers,
      oldUsers,
      usersWithNotifications,
      usersWithFcmTokens,
      usersWithScreenshots,
      connectedWallets,
      notConnectedWallets,
      pendingWallets,
      totalRecentAmount,
      completedSessions,
      totalSessions,
    }
  }

  // Function to log all user images
  const logAllUserImages = () => {
    console.log("=== Extracting All User Image Paths ===");
    
    const usersWithImages = users.filter(user => user.photoURL);
    const usersWithoutImages = users.filter(user => !user.photoURL);
    
    console.log(`Total Users: ${users.length}`);
    console.log(`Users with Profile Images: ${usersWithImages.length}`);
    console.log(`Users without Profile Images: ${usersWithoutImages.length}`);
    
    console.log("\n=== Users with Profile Images ===");
    usersWithImages.forEach((user, index) => {
      const validatedUrl = validateAndFixImageUrl(user.photoURL);
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Original Image URL: ${user.photoURL.substring(0, 100)}${user.photoURL.length > 100 ? '...' : ''}`);
      console.log(`   Validated Image URL: ${validatedUrl?.substring(0, 100) || 'Invalid'}${validatedUrl && validatedUrl.length > 100 ? '...' : ''}`);
      console.log(`   Type: ${validatedUrl?.startsWith('data:') ? 'Base64' : validatedUrl?.startsWith('http') ? 'URL' : 'Unknown'}`);
    });
    
    console.log("\n=== Screenshot Summary ===");
    let totalScreenshots = 0;
    users.forEach(user => {
      if (user.screenshots && user.screenshots.length > 0) {
        totalScreenshots += user.screenshots.length;
        console.log(`${user.name}: ${user.screenshots.length} screenshots`);
      }
    });
    console.log(`Total Screenshots: ${totalScreenshots}`);
    
    console.log("=== End Image Extraction ===");
  };

  // Handle image file upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log("=== Image File Info ===");
    console.log("File Name:", file.name);
    console.log("File Size:", file.size, "bytes");
    console.log("File Type:", file.type);
    console.log("Last Modified:", new Date(file.lastModified).toLocaleString());
    const objectUrl = URL.createObjectURL(file);
    console.log("Temporary File URL:", objectUrl);
    console.log("=== End File Info ===");
    
    // You can also display a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("Base64 Data URL (first 100 chars):", e.target.result.substring(0, 100) + "...");
      console.log("Full Base64 length:", e.target.result.length, "chars");
    };
    reader.readAsDataURL(file);
  };

  // Enhanced user loading with image path logging
  const loadUsers = useCallback(async (showLoader = true, page = 1, limit = 1000) => {
    try {
      if (showLoader) setLoading(true)
      setError(null)

      // Fetch users with enhanced API response handling
      const response = await userAPI.getUsers(page, limit)
      let allUsers = []
      if (response.success) {
        allUsers = response.users || response.data || []
        
        // LOG ALL USERS WITH IMAGE PATHS
        console.log("=== All Users with Image Paths ===");
        allUsers.forEach((user, index) => {
          const validatedUrl = validateAndFixImageUrl(user.photoURL);
          console.log(`${index + 1}. ${user.name || "Unnamed"} (${user.email})`);
          if (user.photoURL) {
            console.log(`   Original Profile Image: ${user.photoURL.substring(0, 100)}${user.photoURL.length > 100 ? '...' : ''}`);
            console.log(`   Validated Image URL: ${validatedUrl?.substring(0, 100) || 'Invalid'}${validatedUrl && validatedUrl.length > 100 ? '...' : ''}`);
            console.log(`   Image Type: ${validatedUrl?.startsWith('data:') ? 'Base64' : validatedUrl?.startsWith('http') ? 'URL' : 'Unknown'}`);
          } else {
            console.log(`   No profile image`);
          }
          
          // Log all image fields
          if (user.screenshots && user.screenshots.length > 0) {
            console.log(`   Screenshots: ${user.screenshots.length}`);
            user.screenshots.forEach((screenshot, idx) => {
              const validatedScreenshot = validateAndFixImageUrl(screenshot);
              console.log(`     ${idx + 1}. Original: ${screenshot.substring(0, 50)}${screenshot.length > 50 ? '...' : ''}`);
              console.log(`        Validated: ${validatedScreenshot?.substring(0, 50) || 'Invalid'}${validatedScreenshot && validatedScreenshot.length > 50 ? '...' : ''}`);
            });
          }
        });
        console.log("=== End User List ===");
        
        setPagination(
          response.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: allUsers.length,
            itemsPerPage: limit,
          },
        )
      } else {
        throw new Error("Failed to fetch users")
      }

      console.log("Loaded users:", allUsers.length);
      if (allUsers.length > 0) {
        const sampleUser = allUsers[0];
        const validatedUrl = validateAndFixImageUrl(sampleUser?.photoURL);
        console.log("Sample user photoURL:", sampleUser?.photoURL?.substring(0, 100) || "No photoURL found");
        console.log("Validated sample URL:", validatedUrl?.substring(0, 100) || "Invalid");
        console.log("Image type:", validatedUrl?.startsWith('data:') ? 'Base64' : validatedUrl?.startsWith('http') ? 'URL' : 'Unknown');
      }

      // Set users directly - NO FORMATTING
      setUsers(allUsers)
      setFilteredUsers(allUsers)

      // Calculate comprehensive stats
      const totalUsers = allUsers.length
      const activeUsers = allUsers.filter(u => u.isActive).length
      const inactiveUsers = totalUsers - activeUsers
      const usersWithWallets = allUsers.filter(u => u.walletStatus === "Connected").length
      const totalBalance = allUsers.reduce((sum, user) => sum + (user.balance || 0), 0)
      const calculatorUsers = allUsers.filter(u => u.calculatorUsage > 0).length
      const adminUsers = allUsers.filter(u => u.role === "admin" || u.role === "superadmin").length
      const regularUsers = totalUsers - adminUsers
      const usersWithFirebase = allUsers.filter(u => u.firebaseUid).length
      const usersWithSessions = allUsers.filter(u => u.sessions && u.sessions.length > 0).length
      const recentlyUpdated = allUsers.filter(u => {
        const updatedAt = new Date(u.updatedAt)
        const now = new Date()
        const daysDiff = (now - updatedAt) / (1000 * 60 * 60 * 24)
        return daysDiff < 7
      }).length
      const totalReferrals = allUsers.filter(u => u.referredBy).length

      const additionalMetrics = calculateAdditionalMetrics(allUsers)
      const engagementMetrics = calculateEngagementMetrics(allUsers)

      // Set enhanced stats with API response data
      setStats({
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersWithWallets,
        totalBalance,
        calculatorUsers,
        adminUsers,
        regularUsers,
        usersWithFirebase,
        usersWithSessions,
        recentlyUpdated,
        totalReferrals,
        ...additionalMetrics,
        growthMetrics: {
          newUsersLast30Days: 0,
          newUsersLast7Days: 0,
          newUsersToday: 0,
          activeUsersLast7Days: 0,
          growthRate30Days: 0,
          growthRate7Days: 0,
          weeklyActivityRate: 0,
        },
        engagementMetrics,
      })
    } catch (err) {
      console.error("Failed to load users:", err)
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Enhanced refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true)
    setSuccessMessage("")
    setError(null)
    await loadUsers(false)
    setSuccessMessage("Data refreshed successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  // Enhanced user status change with better error handling using the updated API
  const handleUserStatusChange = async (userId, currentStatus) => {
    try {
      setRefreshing(true)
      setError(null)
      const isCurrentlyActive = currentStatus === "Active"
      const newStatus = !isCurrentlyActive

      // Use the enhanced updateUserStatus function from api.js
      const result = await userAPI.updateUserStatus(userId, newStatus)
      if (result && !result.success) {
        throw new Error(result.message || "Failed to update user status")
      }

      // Update users list immediately for better UX
      const updateUsersList = (prevUsers) => {
        return prevUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                isActive: newStatus,
                status: newStatus ? "Active" : "Banned",
              }
            : user,
        )
      }

      setUsers(updateUsersList)
      setFilteredUsers(updateUsersList)

      // Recalculate stats with updated data
      const updatedUserList = users.map((user) =>
        user._id === userId ? { ...user, isActive: newStatus } : user,
      )
      const activeUsers = updatedUserList.filter(u => u.isActive).length
      const inactiveUsers = updatedUserList.length - activeUsers
      const engagementMetrics = calculateEngagementMetrics(updatedUserList)
      setStats((prevStats) => ({
        ...prevStats,
        activeUsers,
        inactiveUsers,
        engagementMetrics,
      }))

      setSuccessMessage(`User ${newStatus ? "unbanned" : "banned"} successfully!`)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to update user status:", error)
      setError(`Failed to ${currentStatus === "Active" ? "ban" : "unban"} user: ${error.message}`)
    } finally {
      setRefreshing(false)
    }
  }

  // Initialize component
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Enhanced chart data generation
  const generateChartData = () => {
    if (!users.length) return []
    // Group users by month with better date handling
    const groupedByMonth = users.reduce((acc, user) => {
      const date = new Date(user.createdAt)
      if (isNaN(date.getTime())) return acc // Skip invalid dates
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      acc[monthYear] = (acc[monthYear] || 0) + 1
      return acc
    }, {})

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
      }))
  }

  // Enhanced activity data with more metrics from API response
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
        name: "With Sessions",
        value: stats.usersWithSessions,
        color: "#8B5CF6",
      },
      {
        name: "With Notifications",
        value: stats.usersWithNotifications,
        color: "#06B6D4",
      },
    ]
  }

  // Generate engagement distribution data
  const generateEngagementData = () => {
    const highEngagement = stats.engagementMetrics.highEngagementUsers
    const lowEngagement = stats.engagementMetrics.lowEngagementUsers
    const mediumEngagement = stats.totalUsers - highEngagement - lowEngagement
    return [
      { name: "High (70+)", value: highEngagement, color: "#10B981" },
      { name: "Medium (30-69)", value: mediumEngagement, color: "#F59E0B" },
      { name: "Low (<30)", value: lowEngagement, color: "#EF4444" },
    ]
  }

  const chartData = generateChartData()
  const activityData = generateActivityData()
  const engagementData = generateEngagementData()

  // Handle user selection for profile view
  const handleUserSelect = (user) => {
    console.log("Selected user:", user.name);
    const validatedUrl = validateAndFixImageUrl(user.photoURL);
    console.log("Original photoURL:", user.photoURL?.substring(0, 100) || "None");
    console.log("Validated Image URL:", validatedUrl?.substring(0, 100) || "Invalid");
    console.log("Image type:", validatedUrl?.startsWith('data:') ? 'Base64' : validatedUrl?.startsWith('http') ? 'URL' : 'Unknown');
    
    setSelectedUser(user)
    setModalOpen(true)
  }

  // Handle modal status change
  const handleModalStatusChange = (updatedUser) => {
    // Update the users list with the updated user
    const updateUsersList = (prevUsers) => {
      return prevUsers.map((u) =>
        u._id === updatedUser._id
          ? {
              ...u,
              ...updatedUser,
              status: updatedUser.isActive ? "Active" : "Banned",
            }
          : u,
      )
    }

    setUsers(updateUsersList)
    setFilteredUsers(updateUsersList)
    setSelectedUser(updatedUser)

    // Recalculate stats
    const updatedUserList = users.map((user) =>
      user._id === updatedUser._id ? { ...user, ...updatedUser } : user,
    )
    const activeUsers = updatedUserList.filter(u => u.isActive).length
    const inactiveUsers = updatedUserList.length - activeUsers
    const engagementMetrics = calculateEngagementMetrics(updatedUserList)
    setStats((prevStats) => ({
      ...prevStats,
      activeUsers,
      inactiveUsers,
      engagementMetrics,
    }))

    // Show success message
    setSuccessMessage(`User profile updated successfully!`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  if (loading) {
    return <FullScreenLoader />
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Enhanced User Management</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Comprehensive user management with analytics and detailed profiles • {stats.totalUsers} total users
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2 bg-transparent hover:bg-gray-50 flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent hover:bg-gray-50 flex-1 sm:flex-none"
            onClick={logAllUserImages}
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Log Images</span>
          </Button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent hover:bg-gray-50 flex-1 sm:flex-none" asChild>
              <span>
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload Image</span>
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setViewMode("analytics")}
          variant={viewMode === "analytics" ? "default" : "outline"}
          className={`${
            viewMode === "analytics" ? "bg-[#0F82F4] hover:bg-[#0d6fd1]" : "bg-transparent hover:bg-gray-50"
          } flex-1 sm:flex-none`}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
        <Button
          onClick={() => setViewMode("profile")}
          variant={viewMode === "profile" ? "default" : "outline"}
          className={`${
            viewMode === "profile" ? "bg-[#0F82F4] hover:bg-[#0d6fd1]" : "bg-transparent hover:bg-gray-50"
          } flex-1 sm:flex-none`}
        >
          <User className="h-4 w-4 mr-2" />
          User Profiles
        </Button>
      </div>

      {/* Rest of the component remains the same... */}
      {/* (Keep all other sections from your original code) */}
      
    </div>
  )
}

export default EnhancedUserManagement
