"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { userAPI } from "@/lib/api";
import {
  User,
  Shield,
  AlertCircle,
  X,
} from "lucide-react";

const UserModal = ({ user, open, onClose, onStatusChange }) => {
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open && user) {
      setIsBanned(!user.isActive);
      setError("");
      setSuccess("");
    }
  }, [open, user]);

  const toggleBanStatus = async () => {
    if (!user?.id) return setError("User ID not found");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const newStatus = isBanned;
      const response = isBanned
        ? await userAPI.unbanUser(user.id)
        : await userAPI.banUser(user.id);

      setIsBanned(!newStatus);
      setSuccess(isBanned ? "User unbanned successfully!" : "User banned successfully!");

      const updatedUser = {
        ...user,
        isActive: newStatus,
        status: newStatus ? "Active" : "Banned",
      };

      onStatusChange?.(updatedUser);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update user status.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "N/A";

  const getStatusBadge = () =>
    isBanned ? (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Banned
      </Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Active
      </Badge>
    );

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col p-0 rounded-xl">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 border-b relative">
          <div className="flex flex-col items-center gap-2">
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <User className="w-5 h-5" /> {user.name}
            </DialogTitle>
            {getStatusBadge()}
          </div>
          {/* Close button on top-right */}
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black p-1 h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button> */}
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 sm:px-6 pt-4 pb-6 flex-1">
          {success && (
            <div className="bg-green-50 text-green-800 border border-green-200 rounded px-4 py-2 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-800 border border-red-200 rounded px-4 py-2 mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ["Full Name", user.name],
              ["Email", user.email],
              ["Country", user.country || "Unknown"],
              ["Role", user.role],
              ["Wallet", user.wallet || "Not Connected"],
              ["Coins", (user.coins || 0).toLocaleString()],
              ["Calculator Usage", user.calculatorUsage || 0],
              ["Invite Code", user.inviteCode || "N/A"],
              ["Joined Date", formatDate(user.joinedDate)],
              ["Last Login", formatDate(user.lastLogin)],
              ["Referred By", user.referredBy || "Direct signup"],
            ].map(([label, value]) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <Input readOnly value={value} />
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="border-t px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white">
          <div className="text-sm text-gray-500 font-mono truncate">
            User ID: {user.id}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              onClick={toggleBanStatus}
              disabled={loading}
              className={`w-full sm:w-auto ${
                isBanned
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : isBanned ? (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Unban User
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Ban User
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
