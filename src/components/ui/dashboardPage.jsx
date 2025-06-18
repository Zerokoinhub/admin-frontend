"use client";

import { useEffect, useState } from "react";
import RewardRevenueChart from "./charts/RewardRevenueChart";
import UserGrowthChart from "./charts/UserGrowthChart";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Eye,
  HandCoins,
  Calculator,
  Wallet,
  BadgePercent,
} from "lucide-react";
import { userAPI, userHelpers } from "@/lib/api";

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalReferrals: 0,
    calculatorUser: 0,
    totalRevenue: 0,
    totalCoinDistribution: 0,
    viewRewards: 0,
    usersWithWallets: 0,
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const response = await userAPI.getUsers(1, 100);
        const usersData = response.data.users || [];

        const stats = userHelpers.calculateStats(usersData);
        const totalRevenue = usersData.reduce(
          (sum, user) => sum + (user.recentAmount || 0),
          0
        );

        setDashboardStats({
          totalUsers: stats.totalUsers,
          totalReferrals: stats.totalReferrals,
          calculatorUser: 0,
          totalRevenue,
          totalCoinDistribution: stats.totalBalance,
          viewRewards: 0,
          usersWithWallets: stats.usersWithWallets,
        });

        setUsers(usersData);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
      }
    }

    loadDashboardData();
  }, []);

  const stats = [
    {
      label: "Total Users",
      value: dashboardStats.totalUsers,
      icon: <Users className="h-6 w-6 text-cyan-700" />,
    },
    {
      label: "Users with Wallets",
      value: dashboardStats.usersWithWallets,
      icon: <Wallet className="h-6 w-6 text-cyan-700" />,
    },
    {
      label: "Total Referrals",
      value: dashboardStats.totalReferrals,
      icon: <BadgePercent className="h-6 w-6 text-cyan-700" />,
    },
    {
      label: "Calculator User",
      value: dashboardStats.calculatorUser,
      icon: <Calculator className="h-6 w-6 text-cyan-700" />,
    },
    {
      label: "Total Revenue",
      value: dashboardStats.totalRevenue,
      icon: (
        <div className="flex items-center gap-1">
          <Wallet className="h-6 w-6 text-cyan-700" />
          <Eye className="h-4 w-4 text-gray-600" />
        </div>
      ),
    },
    {
      label: "Total Coin Distribution",
      value: dashboardStats.totalCoinDistribution,
      icon: <HandCoins className="h-6 w-6 text-cyan-700" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 bg-gray-50 p-4 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Hey <strong>Abdul Salam</strong> 👋
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((item, index) => (
            <Card key={index} className="rounded-xl border h-24 md:h-28">
              <CardContent className="flex flex-col justify-between h-full p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-800 font-medium">{item.label}</span>
                  {item.icon}
                </div>
                <div className="text-xl font-bold text-gray-900">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 gap-36 flex-1">
          <div className="h-[300px]">
            <UserGrowthChart users={users} />
          </div>
          <div className="h-[300px]">
            <RewardRevenueChart users={users} />
          </div>
        </div>
      </main>
    </div>
  );
}
