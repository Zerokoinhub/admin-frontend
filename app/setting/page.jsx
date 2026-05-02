"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  User,
  Shield,
  Eye,
  Edit,
  GraduationCap,
  Target,
  Bell,
  ChevronDown,
  X,
  Upload,
  ArrowLeft,
  Edit3,
  Trash2,
  ExternalLink,
  Save,
  XCircle,
  Pencil,
  Loader2,
  DollarSign,
  Gift,
  Users,
  Video,
  Calendar,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { userAPI, userHelpers } from "../../src/lib/api";
import { useUsers } from "../../hooks/useUsers";
import { useAdmins } from "../../hooks/useAdmins";

export default function SettingPage() {
  // User role state
  const [userRole, setUserRole] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("history");
  const [historyFilters, setHistoryFilters] = useState({
    search: "",
    status: "all",
    dateRange: "all",
  });

  // Settings specific state
  const [currentView, setCurrentView] = useState("main");
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false);
  const [selectedExpiry, setSelectedExpiry] = useState("02:00");
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSendToDropdown, setShowSendToDropdown] = useState(false);
  const [selectedSendTo, setSelectedSendTo] = useState("Send to");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificationView, setNotificationView] = useState("list");

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://admin-backend-production-4ff2.up.railway.app/api";

  const [notificationData, setNotificationData] = useState({
    title: "",
    description: "",
    link: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "Fayhan",
    email: "Menog",
    role: "Super Admin",
    time: "1 Month",
  });

  const [sentNotifications, setSentNotifications] = useState([]);
  const [editingNotification, setEditingNotification] = useState(null);

  // Fetch sent notifications from backend
  const fetchSentNotifications = async () => {
    try {
      const response = await fetch(`${BASE_URL}/notifications`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const formattedNotifications = result.data.map((notification) => ({
            id: notification._id,
            title: notification.title,
            description: notification.message,
            image: notification.imageUrl,
            link: notification.link || "",
            timestamp: notification.createdAt,
            sentTo:
              notification.priority === "new-user"
                ? "New User"
                : notification.priority === "top-rated-user"
                  ? "Top rated user"
                  : "Old User",
            type: notification.type,
            priority: notification.priority,
          }));
          setSentNotifications(formattedNotifications);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Get user role from localStorage
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setUserRole(userData.role || "");
        if (userData.role === "superadmin") {
          setActiveTab("transfer");
        } else {
          setActiveTab("history");
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  // Check permissions
  const hasTransferAccess = userRole === "superadmin";
  const hasHistoryAccess = true;

  // Fetch users on component mount (only for super admin)
  useEffect(() => {
    if (hasTransferAccess) {
      fetchUsers();
    }
    if (activeTab === "history") {
      fetchTransferHistory();
    }
  }, [currentPage, activeTab, hasTransferAccess]);

  // Fetch sent notifications from backend
  useEffect(() => {
    fetchSentNotifications();
  }, [BASE_URL]);

  // Fetch admins data
  const { admins, loading: adminsLoading, error: adminsError, addAdmin, editAdmin, removeAdmin } = useAdmins();
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentAdminPassword, setCurrentAdminPassword] = useState("");

  // Fetch users data for statistics
  const { users: allUsers, loading: usersLoading, error: usersError } = useUsers(1, 100);

  // Calculate real statistics from users
  const stats = useMemo(() => {
    if (!allUsers || allUsers.length === 0) {
      return {
        learningRewards: 0,
        referralsRewards: 0,
        adBaseRewards: 0,
      };
    }
    const userStats = userHelpers.calculateStats(allUsers);
    return {
      learningRewards: allUsers.length,
      referralsRewards: userStats.totalReferrals,
      adBaseRewards: Math.floor(allUsers.length * 0.3),
    };
  }, [allUsers]);

  // Fetch users from API
  const fetchUsers = async () => {
    if (!hasTransferAccess) return;
    try {
      setLoading(true);
      const response = await userAPI.getUsers(currentPage, 10);
      if (response.success) {
        setUsers(response.users || response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setMessage({ type: "error", text: "Failed to fetch users" });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage({ type: "error", text: "Error fetching users" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch transfer history
  const fetchTransferHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await userAPI.getTransferHistory(historyFilters);
      if (response.success) {
        const transfers = response.data || [];
        const formattedTransfers = transfers.map((transfer) => userHelpers.formatTransferData(transfer));
        setTransferHistory(formattedTransfers);
      } else {
        setMessage({ type: "error", text: response.message || "Failed to fetch transfer history" });
      }
    } catch (error) {
      console.error("Error fetching transfer history:", error);
      setMessage({ type: "error", text: "Error fetching transfer history" });
      setTransferHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessage({ type: "", text: "" });
    setIsMobileMenuOpen(false);
  };

  // Handle transfer execution
  const handleTransfer = async () => {
    if (!hasTransferAccess) {
      setMessage({ type: "error", text: "You don't have permission to transfer coins" });
      return;
    }
    if (!selectedUser || !transferAmount || !selectedUser.email) {
      setMessage({
        type: "error",
        text: "Please select a user with email and enter transfer amount",
      });
      return;
    }

    const amount = Number.parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" });
      return;
    }

    try {
      setLoading(true);
      const adminUser = localStorage.getItem("user");
      const adminUserStr = JSON.parse(adminUser);
      const admin = adminUserStr.username;

      const response = await userAPI.editUserBalance(selectedUser.email, amount, admin);
      if (response.success) {
        setMessage({
          type: "success",
          text: `Successfully transferred ${amount} coins to ${selectedUser.name}. New balance: ${response.data.newBalance}`,
        });
        setSelectedUser((prev) => ({
          ...prev,
          balance: response.data.newBalance,
        }));
        setUsers((prev) =>
          prev.map((user) =>
            user.email === selectedUser.email ? { ...user, balance: response.data.newBalance } : user,
          ),
        );
        setTransferAmount("");
        setTransferReason("");
        fetchTransferHistory();
      } else {
        setMessage({
          type: "error",
          text: response.message || "Transfer failed",
        });
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setMessage({
        type: "error",
        text: error.message || "Transfer failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Filter transfer history
  const filteredHistory = transferHistory.filter((transfer) => {
    const matchesSearch =
      !historyFilters.search ||
      transfer.userName?.toLowerCase().includes(historyFilters.search.toLowerCase()) ||
      transfer.userEmail?.toLowerCase().includes(historyFilters.search.toLowerCase()) ||
      transfer.transactionId?.toLowerCase().includes(historyFilters.search.toLowerCase());

    const matchesStatus = historyFilters.status === "all" || transfer.status === historyFilters.status;

    let matchesDate = true;
    if (historyFilters.dateRange !== "all") {
      const transferDate = new Date(transfer.dateTime || transfer.createdAt);
      const now = new Date();
      switch (historyFilters.dateRange) {
        case "today":
          matchesDate = transferDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transferDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = transferDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Export transfer history to CSV
  const exportToCSV = () => {
    const headers = ["Transaction ID", "User Name", "Email", "Amount", "Date", "Time", "Admin", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredHistory.map((transfer) =>
        [
          transfer.transactionId,
          `"${transfer.userName}"`,
          transfer.userEmail,
          transfer.amount,
          transfer.date,
          transfer.time,
          `"${transfer.transferredBy}"`,
          transfer.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transfer-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate transfer statistics
  const transferStats = userHelpers.calculateTransferStats(filteredHistory);

  // Get role icon and color
  const getRoleDisplay = (role) => {
    switch (role) {
      case "superadmin":
        return { icon: Shield, color: "text-red-600", bg: "bg-red-50", label: "Super Admin" };
      case "editor":
        return { icon: Edit, color: "text-blue-600", bg: "bg-blue-50", label: "Editor" };
      case "viewer":
        return { icon: Eye, color: "text-green-600", bg: "bg-green-50", label: "Viewer" };
      default:
        return { icon: User, color: "text-gray-600", bg: "bg-gray-50", label: "User" };
    }
  };

  const roleDisplay = getRoleDisplay(userRole);
  const RoleIcon = roleDisplay.icon;

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (userRole === "viewer") {
      alert("You don't have permission to upload images.");
      return;
    }

    setIsUploading(true);
    try {
      setUploadedImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle notification sending
  const handleSendNotification = async () => {
    if (userRole === "viewer") {
      alert("You don't have permission to send notifications.");
      return;
    }

    if (!notificationData.title.trim() || !notificationData.description.trim()) {
      alert("Please fill in both title and description.");
      return;
    }

    if (selectedSendTo === "Send to") {
      alert("Please select who to send the notification to.");
      return;
    }

    setIsSending(true);
    try {
      let endpoint = "";
      let requestBody = null;
      const headers = {};

      let priority = "old-user";
      switch (selectedSendTo) {
        case "New User":
          priority = "new-user";
          endpoint = `${BASE_URL}/notifications/general-with-image`;
          break;
        case "Old User":
          priority = "old-user";
          endpoint = `${BASE_URL}/notifications/general-with-image`;
          break;
        case "Top rated user":
          priority = "top-rated-user";
          endpoint = `${BASE_URL}/notifications/top-users`;
          break;
        default:
          throw new Error("Invalid recipient selection");
      }

      if (selectedSendTo === "Top rated user") {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify({
          title: notificationData.title,
          message: notificationData.description,
          imageUrl: uploadedImage || null,
          link: notificationData.link || null,
          priority: priority,
          limit: 10,
        });
      } else {
        const formData = new FormData();
        formData.append("title", notificationData.title);
        formData.append("message", notificationData.description);
        formData.append("priority", priority);
        if (notificationData.link) {
          formData.append("link", notificationData.link);
        }
        if (uploadedImageFile) {
          formData.append("image", uploadedImageFile);
        }
        requestBody = formData;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: requestBody,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // ✅ FIXED: Refresh notifications list to get actual backend IDs
        await fetchSentNotifications();
        
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
          setNotificationView("list");
          setUploadedImage(null);
          setUploadedImageFile(null);
          setSelectedSendTo("Send to");
          setNotificationData({
            title: "",
            description: "",
            link: "",
          });
        }, 2000);
      } else {
        throw new Error(result.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert(`Failed to send notification: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddNewAdmin = () => {
    if (userRole === "superadmin") {
      setAdminFormData({
        username: "",
        email: "",
        role: "",
        password: "",
      });
      setShowAddAdminModal(true);
    }
  };

  const handleViewControl = () => {
    setCurrentView("control");
  };

  const handleNotificationSettings = () => {
    if (userRole === "superadmin" || userRole === "editor") {
      setCurrentView("notifications");
      setNotificationView("list");
    }
  };

  const handleCreateNotification = () => {
    if (userRole === "superadmin" || userRole === "editor") {
      setNotificationData({
        title: "",
        description: "",
        link: "",
      });
      setUploadedImage(null);
      setUploadedImageFile(null);
      setSelectedSendTo("Send to");
      setNotificationView("create");
    }
  };

  const handleUploadClick = () => {
    if (userRole === "viewer") {
      alert("You don't have permission to upload images.");
      return;
    }
    document.getElementById("image-upload").click();
  };

  const handleAddAdminSubmit = async () => {
    if (!adminFormData.username || !adminFormData.email || !adminFormData.role || !adminFormData.password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const result = await addAdmin(adminFormData);
      if (result.success) {
        alert("Admin added successfully!");
        setShowAddAdminModal(false);
        setAdminFormData({ username: "", email: "", role: "", password: "" });
      } else {
        alert(`Failed to add admin: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditAdmin = (admin) => {
    if (userRole === "superadmin") {
      setEditingAdmin(admin);
      setAdminFormData({
        username: admin.username || "",
        email: admin.email || "",
        role: admin.role || "",
        password: "",
      });
      setCurrentAdminPassword(admin.password || "");
      setShowEditAdminModal(true);
    } else {
      alert("You don't have permission to edit admins.");
    }
  };

  const handleEditAdminSubmit = async () => {
    if (!adminFormData.username || !adminFormData.email || !adminFormData.role) {
      alert("Please fill in required fields");
      return;
    }

    const updateData = {
      username: adminFormData.username,
      email: adminFormData.email,
      role: adminFormData.role,
    };

    if (adminFormData.password?.trim()) {
      updateData.password = adminFormData.password.trim();
    }

    try {
      const result = await editAdmin(editingAdmin._id, updateData);
      if (result && result.success) {
        alert("Admin updated successfully!");
        setShowEditAdminModal(false);
        setEditingAdmin(null);
        setAdminFormData({ username: "", email: "", role: "", password: "" });
      } else {
        throw new Error(result?.error || "Unknown error");
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert(`Failed to update admin: ${error.message}`);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (userRole === "superadmin") {
      if (confirm("Are you sure you want to remove this admin?")) {
        const result = await removeAdmin(adminId);
        if (result.success) {
          alert("Admin removed successfully!");
        } else {
          alert(`Failed to remove admin: ${result.error}`);
        }
      }
    } else {
      alert("You don't have permission to remove admins.");
    }
  };

  const handleEditNotification = (notification) => {
    if (userRole === "viewer") {
      alert("You don't have permission to edit notifications.");
      return;
    }
    setEditingNotification(notification);
    setNotificationData({
      title: notification.title,
      description: notification.description,
      link: notification.link || "",
    });
    setUploadedImage(notification.image);
    setSelectedSendTo(
      notification.priority === "new-user"
        ? "New User"
        : notification.priority === "top-rated-user"
          ? "Top rated user"
          : "Old User",
    );
    setNotificationView("edit");
  };

  // ✅ FIXED: Delete notification with proper error handling
  const handleDeleteNotification = async (notificationId) => {
    if (userRole === "viewer") {
      alert("You don't have permission to delete notifications.");
      return;
    }
    
    if (!notificationId) {
      console.error("No notification ID provided");
      alert("Cannot delete notification: Invalid ID");
      return;
    }
    
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
          method: "DELETE",
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setSentNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            alert("Notification deleted successfully!");
          } else {
            throw new Error(result.message || "Failed to delete notification");
          }
        } else if (response.status === 404) {
          // If notification not found, remove it from local state anyway
          setSentNotifications((prev) => prev.filter((n) => n.id !== notificationId));
          alert("Notification removed from list (already deleted on server)");
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error("Delete failed:", error);
        // Still remove from local state if it's a frontend fake ID
        if (notificationId && notificationId.toString().length !== 24) {
          setSentNotifications((prev) => prev.filter((n) => n.id !== notificationId));
          alert("Notification removed from list (invalid ID format)");
        } else {
          alert("Failed to delete notification. Please try again.");
        }
      }
    }
  };

  const handleUpdateNotification = async () => {
    if (userRole === "viewer") {
      alert("You don't have permission to update notifications.");
      return;
    }

    const priorityMap = {
      "New User": "new-user",
      "Old User": "old-user",
      "Top rated user": "top-rated-user",
    };

    const priority = priorityMap[selectedSendTo] || "old-user";

    const updatedNotification = {
      ...editingNotification,
      title: notificationData.title,
      description: notificationData.description,
      link: notificationData.link,
      image: uploadedImage,
      priority: priority,
      sentTo: selectedSendTo,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/notifications/${editingNotification.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(updatedNotification),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await fetchSentNotifications(); // Refresh the list
          alert("Notification updated successfully!");
          setEditingNotification(null);
          setNotificationView("list");
          setNotificationData({
            title: "",
            description: "",
            link: "",
          });
          setUploadedImage(null);
          setUploadedImageFile(null);
          setSelectedSendTo("Send to");
        } else {
          throw new Error(result.message || "Failed to update notification");
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update notification. Please try again.");
    }
  };

  if (loading || usersLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main Settings View (without reward cards)
  if (currentView === "main") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Success/Error Message */}
        {message.text && (
          <div className={`p-3 rounded-lg ${
            message.type === "success" ? "bg-green-100 text-green-700 border border-green-300" : 
            message.type === "error" ? "bg-red-100 text-red-700 border border-red-300" :
            "bg-yellow-100 text-yellow-700 border border-yellow-300"
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage admin control and notifications</p>
          </div>
        </div>

        {/* Expiry Dropdown */}
        {(userRole === "superadmin" || userRole === "editor") && (
          <div className="flex justify-center sm:justify-end">
            <div className="relative">
              <Button
                onClick={() => setShowExpiryDropdown(!showExpiryDropdown)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 h-8"
              >
                Expiry {selectedExpiry}
                <ChevronDown className="h-3 w-3" />
              </Button>
              {showExpiryDropdown && (
                <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded shadow-lg z-10">
                  <div className="py-1">
                    {["1 Day", "2 Day", "3 Day", "4 Day", "5 Day"].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedExpiry(option.split(" ")[0] + ":00");
                          setShowExpiryDropdown(false);
                        }}
                        className="block w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4 sm:pt-8">
          <Button
            onClick={handleViewControl}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            View Admin Control
          </Button>
          {(userRole === "superadmin" || userRole === "editor") && (
            <Button
              onClick={handleNotificationSettings}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
            >
              Notification Settings
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Admin Control View
  if (currentView === "control") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <Button onClick={() => setCurrentView("main")} variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </Button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Admin Control</h1>
          </div>
          {userRole === "superadmin" && (
            <Button onClick={handleAddNewAdmin} className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto">
              Add New Admin
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Learning Rewards Given</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {userRole === "superadmin" ? stats.learningRewards : "***"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Referrals Rewards Given</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.referralsRewards}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Video className="h-5 sm:h-6 w-5 sm:w-6 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Ad Base Rewards Given</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {userRole === "superadmin" ? stats.adBaseRewards : "***"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Access Table */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-3 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Access Table</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[200px]">Admin Email</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[120px]">Role</TableHead>
                    {userRole === "superadmin" && (
                      <TableHead className="font-semibold text-gray-700 py-3 min-w-[160px]">Action</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminsLoading ? (
                    <TableRow>
                      <TableCell colSpan={userRole === "superadmin" ? 3 : 2} className="text-center py-8">
                        <div className="flex justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : adminsError ? (
                    <TableRow>
                      <TableCell colSpan={userRole === "superadmin" ? 3 : 2} className="text-center py-8 text-red-600">
                        Error loading admins: {adminsError}
                      </TableCell>
                    </TableRow>
                  ) : admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={userRole === "superadmin" ? 3 : 2} className="text-center py-8 text-gray-500">
                        No admins found
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="py-3 text-gray-900 text-sm">{admin.email}</TableCell>
                        <TableCell className="py-3 text-gray-900 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            admin.role === "superadmin" ? "bg-purple-100 text-purple-800" :
                            admin.role === "editor" ? "bg-blue-100 text-blue-800" :
                            admin.role === "viewer" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {admin.role === "superadmin" ? "Super Admin" :
                             admin.role === "editor" ? "Editor" :
                             admin.role === "viewer" ? "Viewer" : admin.role}
                          </span>
                        </TableCell>
                        {userRole === "superadmin" && (
                          <TableCell className="py-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleRemoveAdmin(admin._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs flex items-center gap-1 justify-center"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span className="hidden sm:inline">Remove</span>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleEditAdmin(admin)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 text-xs flex items-center gap-1 justify-center"
                              >
                                <Edit3 className="h-3 w-3" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Admin Modal */}
        <Dialog open={showAddAdminModal} onOpenChange={setShowAddAdminModal}>
          <DialogContent className="sm:max-w-md bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Add New Admin</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowAddAdminModal(false)} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name" className="text-sm font-medium text-gray-700">Username *</Label>
                  <Input
                    id="add-name"
                    value={adminFormData.username}
                    onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                    className="border-gray-200"
                    placeholder="Enter admin username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-email" className="text-sm font-medium text-gray-700">Email *</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    className="border-gray-200"
                    placeholder="Enter admin email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-role" className="text-sm font-medium text-gray-700">Role *</Label>
                  <Select
                    value={adminFormData.role}
                    onValueChange={(value) => setAdminFormData({ ...adminFormData, role: value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-password" className="text-sm font-medium text-gray-700">Password *</Label>
                  <Input
                    id="add-password"
                    type="password"
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    className="border-gray-200"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAddAdminModal(false)}>Cancel</Button>
                  <Button onClick={handleAddAdminSubmit} className="bg-teal-600 hover:bg-teal-700 text-white">Add Admin</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Admin Modal */}
        <Dialog open={showEditAdminModal} onOpenChange={setShowEditAdminModal}>
          <DialogContent className="sm:max-w-md bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Edit Admin</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowEditAdminModal(false)} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Username *</Label>
                  <Input
                    id="edit-name"
                    value={adminFormData.username}
                    onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                    disabled={userRole !== "superadmin"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    disabled={userRole !== "superadmin"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select
                    value={adminFormData.role}
                    onValueChange={(value) => setAdminFormData({ ...adminFormData, role: value })}
                    disabled={userRole !== "superadmin"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowEditAdminModal(false)}>Cancel</Button>
                  {userRole === "superadmin" && (
                    <Button onClick={handleEditAdminSubmit} className="bg-teal-600 hover:bg-teal-700 text-white">Update Admin</Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Notification List View
  if (currentView === "notifications" && notificationView === "list") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <Button onClick={() => setCurrentView("main")} variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </Button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Notification Settings</h1>
          </div>
          {(userRole === "superadmin" || userRole === "editor") && (
            <Button onClick={handleCreateNotification} className="bg-teal-600 hover:bg-teal-700 text-white">
              Create Notification
            </Button>
          )}
        </div>

        {sentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="w-24 sm:w-32 h-24 sm:h-32 bg-teal-100 rounded-full flex items-center justify-center">
              <Bell className="h-12 sm:h-16 w-12 sm:w-16 text-teal-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg sm:text-xl font-medium text-gray-900">No Notifications Yet!</h2>
              <p className="text-gray-600">Click "Create Notification" to get started.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sentNotifications.map((notification) => (
              <Card key={notification.id} className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{notification.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                      notification.priority === "new-user" ? "bg-green-100 text-green-800" :
                      notification.priority === "top-rated-user" ? "bg-purple-100 text-purple-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {notification.sentTo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{notification.description}</p>
                  <p className="text-xs text-gray-400">{new Date(notification.timestamp).toLocaleDateString()}</p>
                  {(userRole === "superadmin" || userRole === "editor") && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Button size="sm" variant="outline" onClick={() => handleEditNotification(notification)} className="flex-1">
                        <Edit3 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteNotification(notification.id)} className="flex-1 text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Create Notification View
  if (currentView === "notifications" && notificationView === "create") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center gap-3 mb-6">
          <Button onClick={() => setNotificationView("list")} variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Create Notification</h1>
        </div>

        <Card className="bg-white border border-gray-200 max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Send To Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Send To *</Label>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSendToDropdown(!showSendToDropdown)}
                    className="w-full justify-between border-gray-200"
                  >
                    {selectedSendTo}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                  {showSendToDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {["Send to", "New User", "Old User", "Top rated user"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedSendTo(option);
                            setShowSendToDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title *</Label>
                <Input
                  id="title"
                  value={notificationData.title}
                  onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                  placeholder="Enter notification title"
                  className="border-gray-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
                <textarea
                  id="description"
                  value={notificationData.description}
                  onChange={(e) => setNotificationData({ ...notificationData, description: e.target.value })}
                  placeholder="Enter notification description"
                  className="w-full min-h-[120px] px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="link" className="text-sm font-medium text-gray-700">Link (Optional)</Label>
                <Input
                  id="link"
                  value={notificationData.link}
                  onChange={(e) => setNotificationData({ ...notificationData, link: e.target.value })}
                  placeholder="https://example.com"
                  className="border-gray-200"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadClick}
                    className="border-gray-200"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Image
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadedImage && (
                    <div className="relative w-12 h-12">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setUploadedImageFile(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Section */}
              {(notificationData.title || notificationData.description || uploadedImage) && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {uploadedImage && (
                      <div className="relative w-full h-32 mb-3">
                        <img
                          src={uploadedImage}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mb-1">To: {selectedSendTo !== "Send to" ? selectedSendTo : "Not selected"}</p>
                    <h4 className="font-semibold text-gray-900">{notificationData.title || "Title will appear here"}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notificationData.description || "Description will appear here"}</p>
                    {notificationData.link && (
                      <a href="#" className="text-teal-600 text-sm mt-2 inline-flex items-center gap-1">
                        View Link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setNotificationView("list")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendNotification}
                  disabled={isSending || selectedSendTo === "Send to" || !notificationData.title || !notificationData.description}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Notification'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <Card className="bg-white max-w-md mx-4">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Sent!</h3>
                <p className="text-gray-600">Your notification has been sent successfully.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Edit Notification View
  if (currentView === "notifications" && notificationView === "edit") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center gap-3 mb-6">
          <Button onClick={() => setNotificationView("list")} variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Notification</h1>
        </div>

        <Card className="bg-white border border-gray-200 max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Send To Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Send To *</Label>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSendToDropdown(!showSendToDropdown)}
                    className="w-full justify-between border-gray-200"
                  >
                    {selectedSendTo}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                  {showSendToDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {["New User", "Old User", "Top rated user"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedSendTo(option);
                            setShowSendToDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">Title *</Label>
                <Input
                  id="edit-title"
                  value={notificationData.title}
                  onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                  className="border-gray-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">Description *</Label>
                <textarea
                  id="edit-description"
                  value={notificationData.description}
                  onChange={(e) => setNotificationData({ ...notificationData, description: e.target.value })}
                  className="w-full min-h-[120px] px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="edit-link" className="text-sm font-medium text-gray-700">Link (Optional)</Label>
                <Input
                  id="edit-link"
                  value={notificationData.link}
                  onChange={(e) => setNotificationData({ ...notificationData, link: e.target.value })}
                  className="border-gray-200"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadClick}
                    className="border-gray-200"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploadedImage ? "Change Image" : "Upload Image"}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadedImage && (
                    <div className="relative w-12 h-12">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setUploadedImageFile(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setNotificationView("list")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateNotification}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Update Notification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
