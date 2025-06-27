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
  Mail,
  MapPin,
  Wallet,
  Coins,
  Calendar,
  Activity,
  Shield,
  AlertCircle,
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
    if (!user?.id) {
      setError("User ID not found");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let response;
      const newActiveStatus = isBanned;

      if (isBanned) {
        response = await userAPI.unbanUser(user.id);
        setSuccess("User unbanned successfully!");
      } else {
        response = await userAPI.banUser(user.id);
        setSuccess("User banned successfully!");
      }

      setIsBanned(!newActiveStatus);

      const updatedUser = {
        ...user,
        isActive: newActiveStatus,
        status: newActiveStatus ? "Active" : "Banned",
      };

      if (onStatusChange) onStatusChange(updatedUser);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Ban/Unban error:", err);
      setError(err.message || "Failed to update user status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = () =>
    isBanned ? (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Banned
      </Badge>
    ) : (
      <Badge className="flex items-center gap-1 bg-green-100 text-green-800">
        <Shield className="h-3 w-3" />
        Active
      </Badge>
    );

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </DialogTitle>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-green-800 text-sm font-medium">{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800 text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* Basic Info */}
            <div className="w-full space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-4 w-4" /> Basic Info
              </h3>

              <Input readOnly value={user.name || "Unnamed"} placeholder="Name" />
              <Input readOnly value={user.email || "No email"} placeholder="Email" />
              <Input readOnly value={user.country || "Unknown"} placeholder="Country" />
              <Input readOnly value={user.role || "user"} placeholder="Role" />
            </div>

            {/* Wallet & Activity */}
            <div className="w-full space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Wallet & Activity
              </h3>

              <Input readOnly value={user.wallet || "Not Connected"} placeholder="Wallet" />
              <Input readOnly value={(user.coins || 0).toLocaleString()} placeholder="Coins" />
              <Input readOnly value={user.calculatorUsage || 0} placeholder="Calculator Usage" />
              <Input readOnly value={user.inviteCode || "N/A"} placeholder="Referral Code" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <Input readOnly value={formatDate(user.joinedDate)} placeholder="Joined Date" />
            <Input readOnly value={formatDate(user.lastLogin)} placeholder="Last Login" />
          </div>

          {user.referredBy && (
            <div className="pt-4 border-t">
              <Input readOnly value={user.referredBy} placeholder="Referred By" />
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pt-6 border-t gap-3">
            <div className="text-sm text-gray-500">
              User ID: <span className="font-mono">{user.id}</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Close
              </Button>
              <Button
                onClick={toggleBanStatus}
                disabled={loading}
                className={`px-6 py-2 text-sm font-medium rounded-md ${
                  isBanned
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : isBanned ? (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Unban User
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Ban User
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
