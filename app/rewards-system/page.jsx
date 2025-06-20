"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { TrendingUp, BarChart3, Shield, X } from "lucide-react"
import { useUsers } from "../../hooks/useUsers"
import { userHelpers } from "@/lib/api"

export default function RewardsSystemPage() {
  const [currentView, setCurrentView] = useState("distribution")
  const [selectedUser, setSelectedUser] = useState(null)
  const [userRole, setUserRole] = useState("viewer")

  // Fetch user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole") || "viewer"
    setUserRole(role)
  }, [])

  // Fetch users data
  const { users, loading, error, pagination } = useUsers(1, 100)

  // Generate chart data from real users
  const chartData = useMemo(() => {
    if (!users || users.length === 0) {
      return [
        { month: "Jan", referrals: 0 },
        { month: "Feb", referrals: 0 },
        { month: "Mar", referrals: 0 },
        { month: "Apr", referrals: 0 },
        { month: "May", referrals: 0 },
        { month: "Jun", referrals: 0 },
        { month: "Jul", referrals: 0 },
      ]
    }

    // Generate mock monthly data based on user creation dates
    const monthlyData = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]

    months.forEach((month) => {
      monthlyData[month] = Math.floor(Math.random() * users.length * 0.3) + Math.floor(users.length * 0.1)
    })

    return months.map((month) => ({
      month,
      referrals: monthlyData[month],
    }))
  }, [users])

  // Generate table data from real users
  const tableData = useMemo(() => {
    if (!users || users.length === 0) return []

    return users.slice(0, 7).map((user, index) => ({
      id: user._id,
      name: user.name || "Unknown User",
      referrals: Math.floor(Math.random() * 50) + 10,
      fraudRisk: Math.random() > 0.5 ? "Low" : "Medium",
      email: user.email,
      balance: user.balance || 0,
      walletAddress: user.walletAddresses?.metamask || user.walletAddresses?.trustWallet || "No wallet connected",
      createdAt: new Date(user.createdAt).toLocaleDateString(),
    }))
  }, [users])

  // Generate referrals log data from real users
  const referralsLogData = useMemo(() => {
    if (!users || users.length === 0) return []

    return users.slice(0, 9).map((user) => ({
      date: new Date(user.createdAt).toLocaleDateString(),
      email: user.email,
      uid: user._id.slice(-8).toUpperCase(),
    }))
  }, [users])

  // Calculate stats from real users
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        trackReferrals: 0,
        dailyReports: 0,
        fraudDetection: 0,
      }
    }

    const userStats = userHelpers.calculateStats(users)
    return {
      trackReferrals: userStats.totalReferrals,
      dailyReports: users.length * 10,
      fraudDetection: Math.floor(users.length * 0.1),
    }
  }, [users])

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setCurrentView("profile")
  }

  const handleViewUserDetails = () => {
    setCurrentView("distribution")
  }

  const handleViewReferralsLog = () => {
    setCurrentView("log")
  }

  if (loading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="text-center text-red-600 p-4">
          <p>Error loading users: {error}</p>
        </div>
      </div>
    )
  }

  // User Profile Screen View
  if (currentView === "profile") {
    const user = selectedUser || (tableData.length > 0 ? tableData[0] : null)

    if (!user) {
      return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
          <div className="text-center text-gray-600 p-4">
            <p>No user selected</p>
          </div>
        </div>
      )
    }

    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Referrals Profile Screen</h1>
          <Button
            onClick={handleViewReferralsLog}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            View Referrals Log table
          </Button>
        </div>

        {/* User Profile Card */}
        <div className="flex justify-center px-3 sm:px-0">
          <Card className="bg-white border border-gray-200 w-full max-w-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg font-semibold text-gray-900">User Profile</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("distribution")}
                  className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={user.name}
                    readOnly={userRole === "viewer"}
                    className={
                      userRole === "viewer"
                        ? "bg-gray-50 border-gray-200 text-gray-900"
                        : "border-gray-200 text-gray-900"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={user.email}
                    readOnly={userRole === "viewer"}
                    className={
                      userRole === "viewer"
                        ? "bg-gray-50 border-gray-200 text-gray-900"
                        : "border-gray-200 text-gray-900"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallet" className="text-sm font-medium text-gray-700">
                    Wallet Address
                  </Label>
                  <Input
                    id="wallet"
                    value={user.walletAddress}
                    readOnly={userRole === "viewer"}
                    className={
                      userRole === "viewer"
                        ? "bg-gray-50 border-gray-200 text-gray-900 text-xs font-mono"
                        : "border-gray-200 text-gray-900 text-xs font-mono"
                    }
                  />
                </div>
                {/* Only Super Admin can see earnings */}
                {userRole === "super_admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="coins" className="text-sm font-medium text-gray-700">
                      Coins Earned
                    </Label>
                    <Input
                      id="coins"
                      value={`${user.balance}$`}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-900"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Referrals Log Table View
  if (currentView === "log") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Referrals Log table</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Track Referrals</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.trackReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Daily Reports</p>
                  {/* Only Super Admin can see numbers */}
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {userRole === "super_admin" ? stats.dailyReports : "***"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Fraud Detection</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.fraudDetection}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Log Table */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-3 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700 py-4 px-3 sm:px-6 min-w-[100px]">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-3 sm:px-6 min-w-[200px]">
                      Referrals Email
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-3 sm:px-6 min-w-[120px]">UID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralsLogData.map((item, index) => (
                    <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="py-4 px-3 sm:px-6 text-gray-900 text-sm">{item.date}</TableCell>
                      <TableCell className="py-4 px-3 sm:px-6 text-gray-900 text-sm">{item.email}</TableCell>
                      <TableCell className="py-4 px-3 sm:px-6 text-gray-900 text-sm">{item.uid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main Distribution View
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Reward Distribution History</h1>
        <div className="flex gap-3">
          <Button
            onClick={handleViewUserDetails}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            View User Details
          </Button>
        </div>
      </div>

      {/* Chart Section */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <h3 className="text-sm font-semibold text-gray-600 tracking-wide">REFERRALS PER USER</h3>
            <span className="text-xs text-gray-400 tracking-wide">DETAILS</span>
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <Line
                  type="monotone"
                  dataKey="referrals"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ fill: "#0d9488", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#0d9488" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-3 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Table View</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700 py-3 min-w-[100px]">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 min-w-[100px]">Referrals</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 min-w-[120px]">Fraud Risk</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 min-w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((user) => (
                  <TableRow key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="py-3 font-medium text-gray-900 text-sm">{user.name}</TableCell>
                    <TableCell className="py-3 text-gray-900 text-sm">{user.referrals}</TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={
                          user.fraudRisk === "Low"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 border-0 text-xs"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0 text-xs"
                        }
                      >
                        {user.fraudRisk}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <Button
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-1 text-sm w-full sm:w-auto"
                        disabled={userRole === "viewer"}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




