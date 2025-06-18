"use client";

import React, { useState } from "react";
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
import UserModal from "../../src/components/ui/modals/UserModal"; // ✅ Modal import

const chartData = [
  { year: "2010", value1: 5, value2: 5, value3: 5, value4: 5 },
  { year: "2011", value1: 15, value2: 10, value3: 12, value4: 11 },
  { year: "2012", value1: 25, value2: 17, value3: 18, value4: 17 },
  { year: "2013", value1: 40, value2: 22, value3: 23, value4: 22 },
  { year: "2014", value1: 60, value2: 27, value3: 29, value4: 27 },
  { year: "2015", value1: 65, value2: 40, value3: 36, value4: 33 },
  { year: "2016", value1: 80, value2: 53, value3: 45, value4: 39 },
  { year: "2017", value1: 95, value2: 60, value3: 55, value4: 45 },
  { year: "2018", value1: 110, value2: 67, value3: 65, value4: 51 },
  { year: "2019", value1: 123.2, value2: 125.2, value3: 115.3, value4: 90.6 },
];

const users = [
  {
    name: "Annette Black",
    email: "john@gmail.com",
    country: "Pakistan",
    wallet: "0/0 L.k",
    referral: "REF12345",
    coins: 4000,
    status: "Connected",
  },
  {
    name: "Floyd Miles",
    email: "john@gmail.com",
    country: "Pakistan",
    wallet: "0/0 L.k",
    referral: "REF12345",
    coins: 1500,
    status: "Not Connected",
  },
  {
    name: "Robert Fox",
    email: "john@gmail.com",
    country: "Pakistan",
    wallet: "0/0 L.k",
    referral: "REF12345",
    coins: 1450,
    status: "Not Connected",
  },
  {
    name: "Darlene",
    email: "john@gmail.com",
    country: "Pakistan",
    wallet: "0/0 L.k",
    referral: "REF12345",
    coins: 400,
    status: "Connected",
  },
  {
    name: "Marvin",
    email: "john@gmail.com",
    country: "Pakistan",
    wallet: "0/0 L.k",
    referral: "REF12345",
    coins: 350,
    status: "Not Connected",
  },
  {
    name: "Bessie Cooper",
    email: "john@gmail.com",
    country: "Pakistan",
    wallet: "0/0 L.k",
    referral: "REF12345",
    coins: 300,
    status: "Connected",
  },
  {
    name: "Guy Hawkins",
    email: "john@gmail.com",
    country: "Pakistan",
    wallet: "0/0 L.k",
    referral: "REF12345",
    coins: 350,
    status: "Connected",
  },
  {
    name: "Darrell Steward",
    email: "john@gmail.com",
    country: "Pakistan",
    wallet: "0/0 L.k",
    referral: "REF12345",
    coins: 200,
    status: "Not Connected",
  },
  {
    name: "Jacob Jones",
    email: "john@gmail.com",
    country: "Pakistan",
    wallet: "0/0 L.k",
    referral: "REF12345",
    coins: 150,
    status: "Connected",
  },
];

const Page = () => {
  const [showTable, setShowTable] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // ✅ Modal state
  const [open, setOpen] = useState(false); // ✅ Modal state

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button
          onClick={() => setShowTable(!showTable)}
          className="bg-[#0F82F4] cursor-pointer hover:bg-[#0d6fd1] text-white rounded-md px-6 py-2 h-auto text-sm font-medium"
        >
          {showTable ? "View Status" : "View All User"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard icon={User} label="Total User" value="00" />
        <DashboardStatCard icon={Wallet} label="Wallet Address" value="00" />
        <DashboardStatCard icon={Coins} label="Coin Earned" value="00" />
      </div>

      {showTable ? (
        <DataTable
          data={users}
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
                <YAxis
                  label={{
                    value: "Units of Measure",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value1"
                  stroke="#0F82F4"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="value2"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="value3"
                  stroke="#10B981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="value4"
                  stroke="#FBBF24"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* ✅ Modal shown only when user is selected */}
      <UserModal user={selectedUser} open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default Page;
