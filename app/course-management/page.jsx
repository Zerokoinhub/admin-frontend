"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { X, User } from "lucide-react"
import Image from "next/image"
import { useUsers } from "../../hooks/useUsers"

// Course data for the table
const courseData = [
  {
    title: "Zero Koin Course",
    category: "Mining",
    language: "English",
    status: "Active",
    enroll: "5,430",
    revenue: "320.00",
  },
  {
    title: "Zero Koin Course",
    category: "Mining",
    language: "English",
    status: "Active",
    enroll: "5,430",
    revenue: "320.00",
  },
  {
    title: "Zero Koin Course",
    category: "Mining",
    language: "English",
    status: "Active",
    enroll: "5,430",
    revenue: "300.00",
  },
  {
    title: "Zero Koin Course",
    category: "Mining",
    language: "English",
    status: "Active",
    enroll: "5,430",
    revenue: "300.00",
  },
  {
    title: "Zero Koin Course",
    category: "Mining",
    language: "English",
    status: "Active",
    enroll: "5,430",
    revenue: "350.00",
  },
  {
    title: "Zero Koin Course",
    category: "Mining",
    language: "English",
    status: "Inactive",
    enroll: "5,430",
    revenue: "250.00",
  },
  {
    title: "Zero Koin Course",
    category: "Mining",
    language: "English",
    status: "Inactive",
    enroll: "5,430",
    revenue: "200.00",
  },
]

// Live courses data
const liveCourses = [
  { title: "Learn Mining", subtitle: "Total Blocks", icon: "⛏️", color: "bg-teal-600" },
  { title: "Blockchain Stock", subtitle: "Total Blocks", icon: "📊", color: "bg-blue-600" },
  { title: "Learn Crypto", subtitle: "Total Blocks", icon: "₿", color: "bg-teal-600" },
  { title: "NFT's", subtitle: "Total Blocks", icon: "¥", color: "bg-yellow-600" },
  { title: "Crypto Course", subtitle: "Total Blocks", icon: "€", color: "bg-teal-600" },
]

export default function CourseManagementPage() {
  const [currentView, setCurrentView] = useState("main")
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    language: "English",
    category: "Mining",
    content: "",
    timer: "2 Hour",
  })

  // Fetch users data for analytics
  const { users, loading, error } = useUsers(1, 100) // Get more users for analytics

  const handleViewCourse = () => {
    setCurrentView("course")
  }

  const handleViewAnalytics = () => {
    setCurrentView("analytics")
  }

  const handleUploadCourse = () => {
    setCurrentView("upload")
  }

  const handleSubmitCourse = () => {
    setIsSuccessModalOpen(true)
    setTimeout(() => {
      setIsSuccessModalOpen(false)
      setCurrentView("course")
    }, 3000)
  }

  // Generate analytics data from real users
  const generateAnalyticsData = () => {
    if (!users || users.length === 0) {
      return [
        { name: "Total User", value: 0, color: "#0d9488" },
        { name: "Active user", value: 0, color: "#22c55e" },
        { name: "Non active", value: 0, color: "#a855f7" },
        { name: "Absence", value: 0, color: "#c084fc" },
      ]
    }

    const totalUsers = users.length
    const activeUsers = Math.floor(totalUsers * 0.6) // Assume 60% are active
    const nonActiveUsers = Math.floor(totalUsers * 0.25) // 25% non-active
    const absenceUsers = totalUsers - activeUsers - nonActiveUsers // Remaining

    return [
      { name: "Total User", value: Math.round((totalUsers / totalUsers) * 100), color: "#0d9488" },
      { name: "Active user", value: Math.round((activeUsers / totalUsers) * 100), color: "#22c55e" },
      { name: "Non active", value: Math.round((nonActiveUsers / totalUsers) * 100), color: "#a855f7" },
      { name: "Absence", value: Math.round((absenceUsers / totalUsers) * 100), color: "#c084fc" },
    ]
  }

  const analyticsData = generateAnalyticsData()

  // Upload Course View (User Details as main page)
  if (currentView === "upload") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Zerokoin Course</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleUploadCourse}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
            >
              Upload new Course
            </Button>
            <Button
              onClick={handleViewAnalytics}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
            >
              View Course analytics
            </Button>
          </div>
        </div>

        {/* User Details Card */}
        <div className="flex justify-center px-3 sm:px-0">
          <Card className="bg-white border border-gray-200 w-full max-w-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("course")}
                  className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Select Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Arabian">Arabian</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Select Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mining">Mining</SelectItem>
                      <SelectItem value="Trading">Trading</SelectItem>
                      <SelectItem value="Crypto">Crypto</SelectItem>
                      <SelectItem value="Forex">Forex</SelectItem>
                      <SelectItem value="Web AI">Web AI</SelectItem>
                      <SelectItem value="Quotes">Quotes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="border-gray-200 min-h-[100px]"
                    placeholder="Enter course content..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Timer</Label>
                  <Input
                    value={formData.timer}
                    onChange={(e) => setFormData({ ...formData, timer: e.target.value })}
                    className="border-gray-200"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSubmitCourse}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
                  >
                    Upload Course
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Modal */}
        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="sm:max-w-sm bg-white text-center border-0 shadow-2xl mx-4">
            <div className="py-6 sm:py-8 px-4">
              {/* Animated Circle with Decorative Dots */}
              <div className="relative mx-auto w-20 sm:w-24 h-20 sm:h-24 mb-6 sm:mb-8">
                {/* Main Circle */}
                <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-teal-500 to-green-600 rounded-full flex items-center justify-center relative z-10">
                  <User className="h-8 sm:h-10 w-8 sm:w-10 text-white" />
                </div>

                {/* Decorative Dots */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
                  <div className="absolute w-2 sm:w-3 h-2 sm:h-3 bg-teal-500 rounded-full -top-1 left-1/2 transform -translate-x-1/2"></div>
                  <div className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full top-2 -right-1"></div>
                  <div className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-teal-400 rounded-full top-1/2 -right-2 transform -translate-y-1/2"></div>
                  <div className="absolute w-2 sm:w-3 h-2 sm:h-3 bg-green-400 rounded-full -bottom-1 right-2"></div>
                  <div className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-teal-500 rounded-full -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  <div className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full bottom-2 -left-1"></div>
                  <div className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-teal-400 rounded-full top-1/2 -left-2 transform -translate-y-1/2"></div>
                  <div className="absolute w-2 sm:w-3 h-2 sm:h-3 bg-green-400 rounded-full top-2 left-2"></div>
                </div>
              </div>

              {/* Success Text */}
              <h3 className="text-lg sm:text-xl font-semibold text-teal-600 mb-1">Your Course is</h3>
              <h3 className="text-lg sm:text-xl font-semibold text-teal-600 mb-4 sm:mb-6">Successfully Uploaded</h3>

              {/* Wait Text */}
              <p className="text-sm text-gray-600 mb-1">Please wait</p>
              <p className="text-sm text-gray-600 mb-6 sm:mb-8">You will be directed to the homepage soon</p>

              {/* Loading Spinner */}
              <div className="w-6 sm:w-8 h-6 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Main Course Management View
  if (currentView === "main") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Course Management</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleViewCourse}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
            >
              View Course
            </Button>
            <Button
              onClick={handleViewAnalytics}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
            >
              View Course analytics
            </Button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src="/coin1.png"
            alt="Earn More Zero Koin Banner"
            width={800}
            height={200}
            className="w-full h-32 sm:h-48 lg:h-auto object-cover"
          />
        </div>

        {/* Popular Courses History */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-3 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Popular Courses History</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[140px]">Title</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[100px]">Category</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[100px]">Language</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[80px]">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[120px]">Total Enroll</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 min-w-[130px]">Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseData.map((course, index) => (
                    <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="py-3 text-gray-900 text-sm">{course.title}</TableCell>
                      <TableCell className="py-3 text-gray-900 text-sm">{course.category}</TableCell>
                      <TableCell className="py-3 text-gray-900 text-sm">{course.language}</TableCell>
                      <TableCell className="py-3">
                        <Badge
                          className={
                            course.status === "Active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100 border-0 text-xs"
                              : "bg-red-100 text-red-800 hover:bg-red-100 border-0 text-xs"
                          }
                        >
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-gray-900 text-sm">{course.enroll}</TableCell>
                      <TableCell className="py-3 text-gray-900 text-sm">{course.revenue}</TableCell>
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

  // Course View
  if (currentView === "course") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Zerokoin Course</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleUploadCourse}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
            >
              Upload new Course
            </Button>
            <Button
              onClick={handleViewAnalytics}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
            >
              View Course analytics
            </Button>
          </div>
        </div>

        {/* Single Container with Coin Image and Live Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Course Image - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-0">
                <div className="relative w-full h-48 sm:h-60 lg:h-80 overflow-hidden rounded-lg">
                  <Image
                    src="/coin.png"
                    alt="Zero Koin"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 66vw"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Courses - Takes 1 column on large screens, full width on mobile */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-200 h-48 sm:h-60 lg:h-80">
              <CardContent className="p-3 sm:p-6 h-full overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Live Courses</h3>
                <div className="space-y-2 sm:space-y-3">
                  {liveCourses.map((course, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-8 sm:w-10 h-8 sm:h-10 ${course.color} rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0`}
                      >
                        {course.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{course.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{course.subtitle}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">Live now</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Description */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 sm:h-6 w-5 sm:w-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Zero Koin Course</h4>
                  <span className="text-sm text-gray-500">12 Minutes ago</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Zero Koin mining is the process of validating transactions and securing the Zero Koin blockchain by
                  solving complex mathematical problems, typically using computing power to earn rewards in Zero Koin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Analytics View
  if (currentView === "analytics") {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Zerokoin Course</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleUploadCourse}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
            >
              Upload new Course
            </Button>
            <Button
              onClick={handleViewAnalytics}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
            >
              View Course analytics
            </Button>
          </div>
        </div>

        {/* Course Analytics */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Course Analytics</h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-4">
              <p>Error loading analytics: {error}</p>
            </div>
          ) : (
            <Card className="bg-white border border-gray-200 max-w-lg mx-auto">
              <CardContent className="p-4 sm:p-8">
                <div className="relative h-60 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {analyticsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-gray-600">Course Summary</h3>
                      <p className="text-xs text-gray-500 mt-1">Total Users: {users.length}</p>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                  {analyticsData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0`}
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="text-xs min-w-0">
                        <div className="font-medium text-gray-900 truncate">{item.name}</div>
                        <div className="text-white bg-gray-800 px-1 rounded text-xs inline-block">{item.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }
}










