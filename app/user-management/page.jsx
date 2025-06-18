"use client";

import React, { useEffect, useState } from "react";
import DashboardStatCard from "../../src/components/ui/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Wallet, Coins } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import DataTable from "../../src/components/ui/tables/DataTable";
import UserModal from "../../src/components/ui/modals/UserModal";
import { userAPI, userHelpers } from "@/lib/api";
import FullScreenLoader from "../../src/components/ui/FullScreenLoader"; // ✅ loader import

const Page = () => {
  const [users, setUsers] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ loading state

  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithWallets: 0,
    totalBalance: 0,
  });

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await userAPI.getUsers(1, 100);
        const userList = res.data.users || [];

        setUsers(userList);

        const calculated = userHelpers.calculateStats(userList);
        setStats({
          totalUsers: calculated.totalUsers,
          usersWithWallets: calculated.usersWithWallets,
          totalBalance: calculated.totalBalance,
        });
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false); // ✅ hide loader after fetch
      }
    }

    loadUsers();
  }, []);

  const chartData = users
    .reduce((acc, user) => {
      const year = new Date(user.createdAt).getFullYear().toString();
      const existing = acc.find((item) => item.year === year);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ year, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  return (
    <div className="space-y-4">
      {loading && <FullScreenLoader />} {/* ✅ loader show while fetching */}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button
          onClick={() => setShowTable(!showTable)}
          className="bg-[#0F82F4] hover:bg-[#0d6fd1] text-white rounded-md px-6 py-2 text-sm font-medium"
        >
          {showTable ? "View Status" : "View All Users"}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard icon={User} label="Total Users" value={stats.totalUsers.toString()} />
        <DashboardStatCard icon={Wallet} label="Wallet Connected" value={stats.usersWithWallets.toString()} />
        <DashboardStatCard icon={Coins} label="Total Coin Earned" value={stats.totalBalance.toString()} />
      </div>

      {/* Data Table or Chart */}
      {showTable ? (
        <DataTable
          data={users.map((user) => ({
            name: user.name || "Unnamed",
            email: user.email,
            country: "Pakistan",
            wallet:
              user.walletAddresses?.metamask ||
              user.walletAddresses?.trustWallet ||
              "Not Connected",
            referral: user.referredBy || "None",
            coins: user.balance || 0,
            status:
              user.walletAddresses?.metamask || user.walletAddresses?.trustWallet
                ? "Connected"
                : "Not Connected",
            role: user.role,
          }))}
          onView={(user) => {
            setSelectedUser(user);
            setOpen(true);
          }}
        />
      ) : (
        <Card>
          <CardContent className="p-2">
            <h3 className="text-lg font-semibold mb-4">
              Status User Range per Year
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <XAxis dataKey="year" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0F82F4"
                  strokeWidth={2}
                  name="User Count"
                  animationDuration={800}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <UserModal user={selectedUser} open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default Page;
