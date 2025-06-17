"use client";
import RewardRevenueChart from "./charts/RewardRevenueChart";
import UserGrowthChart from "./charts/UserGrowthChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Eye,
  HandCoins,
  Calculator,
  Gift,
  Wallet,
  BadgePercent,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts";

const barData = [
  { name: "Mon", uv: 3000 },
  { name: "Tue", uv: 2000 },
  { name: "Wed", uv: 2780 },
  { name: "Thu", uv: 1890 },
  { name: "Fri", uv: 2390 },
  { name: "Sat", uv: 3490 },
  { name: "Sun", uv: 2000 },
];

const lineData = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 2210 },
  { name: "Mar", value: 2290 },
  { name: "Apr", value: 2000 },
  { name: "May", value: 2181 },
  { name: "Jun", value: 2500 },
];

const stats = [
  {
    label: "Total Miner",
    value: "00",
    icon: <HandCoins className="h-6 w-6 text-cyan-700" />,
  },
  {
    label: "Total Referrals",
    value: "00",
    icon: <BadgePercent className="h-6 w-6 text-cyan-700" />,
  },
  {
    label: "Calculator User",
    value: "00",
    icon: <Calculator className="h-6 w-6 text-cyan-700" />,
  },
  {
    label: "Total Revenue",
    value: "00",
    icon: (
      <div className="flex items-center gap-1">
        <Wallet className="h-6 w-6 text-cyan-700" />
        <Eye className="h-4 w-4 text-gray-600" />
      </div>
    ),
  },
  {
    label: "Total Coin Distribution",
    value: "00",
    icon: <Users className="h-6 w-6 text-cyan-700" />,
  },
  {
    label: "View Rewards",
    value: "00",
    icon: <Gift className="h-6 w-6 text-cyan-700" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-4 flex flex-col space-y-4 overflow-hidden">
        {/* Greeting */}
        <div className="shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Hey Admin 👋</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 shrink-0">
          {stats.map((item, index) => (
            <Card key={index} className="rounded-xl border h-28">
              <CardContent className="flex flex-col justify-between h-full p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-800 font-medium">
                    {item.label}
                  </span>
                  {item.icon}
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {item.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-auto">
          <div className="h-[300px]">
            <UserGrowthChart />
          </div>

          <div className="h-[300px]">
            <RewardRevenueChart />
          </div>
        </div>
      </main>
    </div>
  );
}
