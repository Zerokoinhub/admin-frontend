"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GraduationCap, Edit, Target, X, ChevronDown, Trash2, Edit3 } from "lucide-react"

// Admin data for the table
const adminData = [
  { email: "anas24@gmail.com", role: "Super Admin", id: 1 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 2 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 3 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 4 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 5 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 6 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 7 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 8 },
  { email: "anas24@gmail.com", role: "Super Admin", id: 9 },
]

export default function SettingPage() {
  const [currentView, setCurrentView] = useState("main")
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false)
  const [selectedExpiry, setSelectedExpiry] = useState("02:00")
  const [formData, setFormData] = useState({
    name: "Fayhan",
    email: "Menog",
    role: "Super Admin",
    time: "1 Month",
  })

  const handleAddNewAdmin = () => {
    setCurrentView("permissions")
  }

  const handleViewControl = () => {
    setCurrentView("control")
  }

  // Main Settings View
  if (currentView === "main") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Setting</h1>
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
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Learning Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">45</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Edit className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Referrals Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">4657</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Ad Base Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">575</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expiry Dropdown */}
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
                        setSelectedExpiry(option.split(" ")[0] + ":00")
                        setShowExpiryDropdown(false)
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

        {/* Navigation Button */}
        <div className="flex justify-center pt-4 sm:pt-8">
          <Button
            onClick={handleViewControl}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            View Admin Control
          </Button>
        </div>
      </div>
    )
  }

  // Maintained Control View
  if (currentView === "control") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Maintained control</h1>
          <Button
            onClick={handleAddNewAdmin}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            Add New Admin
          </Button>
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
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Learning Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">45</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Edit className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Referrals Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">4657</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Ad Base Rewards</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">575</p>
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
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[160px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminData.map((admin) => (
                    <TableRow key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="py-3 text-gray-900 text-sm">{admin.email}</TableCell>
                      <TableCell className="py-3 text-gray-900 text-sm">{admin.role}</TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 text-xs flex items-center gap-1 justify-center"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="hidden sm:inline">Remove</span>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 text-xs flex items-center gap-1 justify-center"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </div>
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

  // Permissions new Admin View
  if (currentView === "permissions") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Permissions new Admin</h1>
          <Button
            onClick={() => setCurrentView("control")}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
          >
            Add New Admin
          </Button>
        </div>

        {/* Add New Admin Detail Card */}
        <div className="flex justify-center px-3 sm:px-0">
          <Card className="bg-white border border-gray-200 w-full max-w-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Add New Admin Detail</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("control")}
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-gray-200 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-gray-200 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="border-gray-200 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                    Time
                  </Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="border-gray-200 text-gray-900"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setCurrentView("control")}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}


