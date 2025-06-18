"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const UserModal = ({ user, open, onClose }) => {
  const [isBanned, setIsBanned] = useState(false);

  // Reset toggle when modal opens
  useEffect(() => {
    if (open && user) {
      setIsBanned(false);
    }
  }, [open, user]);

  if (!user) return null; // ✅ Prevent rendering if user is null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">User Info</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <Input value={user.name} readOnly />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input value={user.email} readOnly />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input value={user.country} readOnly />
          </div>
          <div>
            <label className="block text-sm mb-1">Wallet Address</label>
            <Input value={user.wallet} readOnly />
          </div>
          <div>
            <label className="block text-sm mb-1">Coins Earned</label>
            <Input value={user.coins} readOnly />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Joined Date</label>
              <Input value={user.joinedDate || "12 Jan 2022"} readOnly />
            </div>
            <div>
              <label className="block text-sm mb-1">Last Activity</label>
              <Input value={user.lastActivity || "Today"} readOnly />
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              className={`px-6 py-2 text-sm font-medium rounded-md ${
                isBanned
                  ? "bg-[#0F82F4] text-white"
                  : "border border-[#0F82F4] text-[#0F82F4] bg-transparent"
              }`}
              onClick={() => setIsBanned(true)}
            >
              Banned
            </Button>
            <Button
              className={`px-6 py-2 text-sm font-medium rounded-md ${
                !isBanned
                  ? "bg-[#0F82F4] text-white"
                  : "border border-[#0F82F4] text-[#0F82F4] bg-transparent hover:bg-tansparent"
              }`}
              onClick={() => setIsBanned(false)}
            >
              Unbanned
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
