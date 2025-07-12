"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  X,
  User,
  Clock,
  FileText,
  Edit,
  Trash2,
  Plus,
  Eye,
  BarChart3,
  AlertCircle,
  Lock,
  Menu,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import { useUsers } from "../../hooks/useUsers";
import { useCourses } from "../../hooks/useCourses";

export default function CourseManagementPage() {
  const [currentView, setCurrentView] = useState("main");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseName: "",
    pages: [{ title: "", content: "", time: "" }],
  });

  // Fetch courses and users data
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshCourses,
    hasPermission,
    userRole,
    roleDisplayName,
    permissionsList,
    userData,
    isAuthenticated,
  } = useCourses();

  const { users, loading, error } = useUsers(1, 100);

  // Check authentication status on component mount
  useEffect(() => {
    console.log("Course Management Page - Current user:", userData);
    console.log("Course Management Page - Is authenticated:", isAuthenticated);
    console.log("Course Management Page - User role:", userRole);
    console.log("Course Management Page - Permissions:", permissionsList);
    if (!isAuthenticated) {
      console.warn("User not authenticated in Course Management");
    }
  }, [userData, isAuthenticated, userRole, permissionsList]);

  const handleViewCourse = () => {
    setCurrentView("course");
    setIsMobileMenuOpen(false);
  };

  const handleViewAnalytics = () => {
    setCurrentView("analytics");
    setIsMobileMenuOpen(false);
  };

  const handleUploadCourse = () => {
    if (!isAuthenticated) {
      alert("Please log in to create courses");
      return;
    }
    if (!hasPermission("create")) {
      alert("You don't have permission to create courses");
      return;
    }
    console.log(
      "Starting course creation for user:",
      userData?.email,
      "Role:",
      userRole
    );
    setCurrentView("upload");
    setFormData({
      courseName: "",
      pages: [{ title: "", content: "", time: "" }],
    });
    setIsEditing(false);
    setSelectedCourse(null);
    setIsMobileMenuOpen(false);
  };

  const handleSubmitCourse = async () => {
    if (!isAuthenticated) {
      alert("Please log in to create courses");
      return;
    }

    // Validate form data
    if (!formData.courseName.trim()) {
      alert("Please enter a course name");
      return;
    }

    if (
      formData.pages.some((page) => !page.title.trim() || !page.content.trim())
    ) {
      alert("Please fill in all page titles and content");
      return;
    }

    // if (formData.pages.some((page) => page.time < 0)) {
    //   alert("Duration must be a positive number");
    //   return;
    // }

    setIsSubmitting(true);
    console.log("Submitting course with user context:", userData?.email);

    try {
      let result;

      if (isEditing && selectedCourse) {
        console.log("Updating existing course:", selectedCourse._id);
        // Create a clean payload for editing
        const editPayload = {
          courseName: formData.courseName.trim(),
          pages: formData.pages.map((page) => ({
            title: page.title.trim(),
            content: page.content.trim(),
            time: String(page.time) || 0,
          })),
        };
        result = await updateCourse(selectedCourse._id, editPayload);
      } else {
        console.log("Creating new course");
        result = await createCourse(formData);
      }

      if (result.success) {
        console.log("Course operation successful");
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          setIsSuccessModalOpen(false);
          setCurrentView("main");
          setSelectedCourse(null);
          setIsEditing(false);
          // Reset form
          setFormData({
            courseName: "",
            pages: [{ title: "", content: "", time: "" }],
          });
        }, 2000);
      } else {
        console.error("Course operation failed:", result.error);
        alert(
          `Failed to ${isEditing ? "update" : "create"} course: ${result.error}`
        );
      }
    } catch (error) {
      console.error("Error during course submission:", error);
      alert(
        `Error ${isEditing ? "updating" : "creating"} course: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!isAuthenticated) {
      alert("Please log in to delete courses");
      return;
    }

    if (!hasPermission("delete")) {
      alert("You don't have permission to delete courses");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return;
    }

    console.log("Deleting course:", courseId, "by user:", userData?.email);
    const result = await deleteCourse(courseId);

    if (result.success) {
      alert("Course deleted successfully");
      // Refresh the courses list
      await refreshCourses();
    } else {
      alert(`Error deleting course: ${result.error}`);
    }
  };

  const handleEditCourse = (course) => {
    if (!isAuthenticated) {
      alert("Please log in to edit courses");
      return;
    }

    if (!hasPermission("edit")) {
      alert("You don't have permission to edit courses");
      return;
    }

    console.log(
      "Editing course:",
      course.courseName,
      "by user:",
      userData?.email
    );
    setSelectedCourse(course);
    // Properly set form data for editing
    setFormData({
      courseName: course.courseName || "",
      pages:
        course.pages && course.pages.length > 0
          ? course.pages.map((page) => ({
              title: page.title || "",
              content: page.content || "",
              time: String(page.time) || 0,
            }))
          : [{ title: "", content: "", time: "" }],
    });
    setIsEditing(true);
    setCurrentView("upload");
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCurrentView("course");
  };

  const addPage = () => {
    setFormData({
      ...formData,
      pages: [...formData.pages, { title: "", content: "", time: "" }],
    });
  };

  const removePage = (index) => {
    if (formData.pages.length > 1) {
      setFormData({
        ...formData,
        pages: formData.pages.filter((_, i) => i !== index),
      });
    }
  };

  const updatePage = (index, field, value) => {
    const updatedPages = formData.pages.map((page, i) =>
      i === index
        ? { ...page, [field]: field === "time" ? String(value) || "0" : value }
        : page
    );
    setFormData({ ...formData, pages: updatedPages });
  };

  // Calculate total duration for a course
  const getTotalDuration = (pages) => {
    return pages.reduce((total, page) => total + (page.time || "0"), 0);
  };

  // Format duration in minutes to readable format
  const formatDuration = (input) => {
    let totalSeconds = 0;

    // If input is in "mm:ss" format
    if (typeof input === "string" && input.includes(":")) {
      const [minStr, secStr] = input.split(":");
      const minutes = parseInt(minStr, 10);
      const seconds = parseInt(secStr, 10);
      totalSeconds = minutes * 60 + seconds;
    } else {
      // If input is a number (in minutes)
      totalSeconds = Number(input) * 60;
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0) result += `${seconds}s`;

    return result.trim();
  };

  // Generate analytics data from real courses and users
  const generateAnalyticsData = () => {
    if (!courses || courses.length === 0) {
      return [
        { name: "Active Courses", value: 25, color: "#0d9488" },
        { name: "Inactive Courses", value: 25, color: "#ef4444" },
        { name: "Total Pages", value: 25, color: "#22c55e" },
        { name: "Total Duration", value: 25, color: "#a855f7" },
      ];
    }

    const activeCourses = courses.filter(
      (course) => course.isActive !== false
    ).length;
    const inactiveCourses = courses.length - activeCourses;
    const totalPages = courses.reduce(
      (total, course) => total + course.pages.length,
      0
    );
    const totalDuration = courses.reduce(
      (total, course) => total + getTotalDuration(course.pages),
      0
    );

    const total =
      activeCourses +
      inactiveCourses +
      totalPages +
      Math.floor(totalDuration / 60);

    if (total === 0) {
      return [{ name: "No Data", value: 100, color: "#9ca3af" }];
    }

    return [
      {
        name: "Active Courses",
        value: Math.round((activeCourses / total) * 100) || 1,
        color: "#0d9488",
      },
      {
        name: "Inactive Courses",
        value: Math.round((inactiveCourses / total) * 100) || 1,
        color: "#ef4444",
      },
      {
        name: "Total Pages",
        value: Math.round((totalPages / total) * 100) || 1,
        color: "#22c55e",
      },
      {
        name: "Duration (hrs)",
        value: Math.round((Math.floor(totalDuration / 60) / total) * 100) || 1,
        color: "#a855f7",
      },
    ];
  };

  const analyticsData = generateAnalyticsData();

  // Mobile Course Card Component
  const CourseCard = ({ course }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">
          {course.courseName}
        </h3>
        <Badge
          className={
            course.isActive !== false
              ? "bg-green-100 text-green-800 hover:bg-green-100 border-0 text-xs flex-shrink-0"
              : "bg-red-100 text-red-800 hover:bg-red-100 border-0 text-xs flex-shrink-0"
          }
        >
          {course.isActive !== false ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 flex-shrink-0" />
          <span>{course.pages?.length || 0} pages</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>{formatDuration(getTotalDuration(course.pages || []))}</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-3 space-y-1">
        <div>
          Created:{" "}
          {course.createdAt
            ? new Date(course.createdAt).toLocaleDateString()
            : "N/A"}
        </div>
        <div>
          By: {course.uploadedBy?.username || course.uploadedBy || "Unknown"}
        </div>
      </div>

      {(hasPermission("edit") || hasPermission("delete")) && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {hasPermission("edit") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditCourse(course)}
              className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 text-xs h-8"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
          {hasPermission("delete") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteCourse(course._id)}
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs h-8"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // Show authentication warning if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="max-w-md mx-auto mt-8">
          <Card className="bg-white border border-red-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <AlertCircle className="h-10 sm:h-12 w-10 sm:w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-red-600 mb-2">
                Authentication Required
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                You need to be logged in to access the Course Management system.
              </p>
              <div className="space-y-2 text-xs sm:text-sm text-gray-500 mb-4">
                <p>Current user: {userData?.email || "Not logged in"}</p>
                <p>Role: {userRole || "No role assigned"}</p>
                <p>Permissions: {permissionsList || "No permissions"}</p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Upload Course View
  if (currentView === "upload") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("main")}
              className="p-2 -ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {isEditing ? "Edit Course" : "Create Course"}
              </h1>
              <p className="text-sm text-gray-600 truncate">
                {userData?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Desktop Header */}
          <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {isEditing ? "Edit Course" : "Create New Course"}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {roleDisplayName}
                </Badge>
                <p className="text-sm text-gray-600">{userData?.email}</p>
                {!hasPermission("create") && !isEditing && (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    No Create Permission
                  </Badge>
                )}
                {!hasPermission("edit") && isEditing && (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    No Edit Permission
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setCurrentView("main")}
              className="self-start sm:self-center"
            >
              ← Back to Courses
            </Button>
          </div>

          {/* Course Upload Form */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Course Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Course Name *
                    </Label>
                    <Input
                      value={formData.courseName}
                      onChange={(e) =>
                        setFormData({ ...formData, courseName: e.target.value })
                      }
                      className="border-gray-200 w-full"
                      placeholder="Enter course name..."
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Course Pages */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                      <Label className="text-sm font-medium text-gray-700">
                        Course Pages
                      </Label>
                      <Button
                        type="button"
                        onClick={addPage}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-sm w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Page
                      </Button>
                    </div>
                    {formData.pages.map((page, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                              Page {index + 1}
                            </h4>
                            {formData.pages.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePage(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Page Title *
                              </Label>
                              <Input
                                value={page.title}
                                onChange={(e) =>
                                  updatePage(index, "title", e.target.value)
                                }
                                className="border-gray-200 w-full"
                                placeholder="Enter page title..."
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Content *
                              </Label>
                              <Textarea
                                value={page.content}
                                onChange={(e) =>
                                  updatePage(index, "content", e.target.value)
                                }
                                className="border-gray-200 min-h-[80px] sm:min-h-[100px] w-full resize-none"
                                placeholder="Enter page content..."
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Duration (minutes) *
                              </Label>
                              <Input
                                type="text"
                                value={page.time}
                                onChange={(e) =>
                                  updatePage(index, "time", e.target.value)
                                }
                                className="border-gray-200 w-full"
                                placeholder="Enter duration in minutes..."
                                min="1"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSubmitCourse}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {isEditing ? "Updating..." : "Creating..."}
                        </div>
                      ) : isEditing ? (
                        "Update Course"
                      ) : (
                        "Create Course"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Modal */}
          <Dialog
            open={isSuccessModalOpen}
            onOpenChange={setIsSuccessModalOpen}
          >
            <DialogContent className="sm:max-w-sm w-[90%] max-w-sm bg-white text-center border-0 shadow-2xl rounded-xl p-4 sm:p-6">
              <div className="py-4 sm:py-6 px-2 sm:px-4">
                <div className="mx-auto w-16 sm:w-20 h-16 sm:h-20 mb-4 sm:mb-6">
                  <div className="w-full h-full bg-gradient-to-br from-teal-500 to-green-600 rounded-full flex items-center justify-center">
                    <FileText className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-teal-600 mb-1">
                  Course Successfully
                </h3>
                <h3 className="text-base sm:text-lg font-semibold text-teal-600 mb-4 sm:mb-6">
                  {isEditing ? "Updated!" : "Created!"}
                </h3>

                <p className="text-sm text-gray-600 mb-1">Please wait</p>
                <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                  Redirecting to course list...
                </p>

                <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // Main Course Management View
  if (currentView === "main") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header with Menu */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900">
                Course Management
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    userRole === "superadmin"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : userRole === "editor"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}
                >
                  {roleDisplayName}
                </Badge>
                <p className="text-xs text-gray-600 truncate max-w-32">
                  {userData?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <div className="p-4 space-y-2">
                <Button
                  onClick={handleViewCourse}
                  variant="ghost"
                  className="w-full justify-start text-left h-10"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Courses
                </Button>
                <Button
                  onClick={handleViewAnalytics}
                  variant="ghost"
                  className="w-full justify-start text-left h-10"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                {hasPermission("create") && (
                  <Button
                    onClick={handleUploadCourse}
                    variant="ghost"
                    className="w-full justify-start text-left h-10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Desktop Header */}
          <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Course Management
              </h1>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <Badge
                  variant="outline"
                  className={`${
                    userRole === "superadmin"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : userRole === "editor"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}
                >
                  {roleDisplayName}
                </Badge>
                <p className="text-sm text-gray-600">{userData?.email}</p>
                <p className="text-sm text-gray-600">{permissionsList}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={handleViewCourse}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Courses
              </Button>
              <Button
                onClick={handleViewAnalytics}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              {hasPermission("create") && (
                <Button
                  onClick={handleUploadCourse}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              )}
            </div>
          </div>

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="/coin1.png"
              alt="Earn More Zero Koin Banner"
              width={800}
              height={200}
              className="w-full h-24 sm:h-32 md:h-48 lg:h-auto object-cover"
            />
          </div>

          {/* Courses Table */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Courses
                </h3>
                {hasPermission("create") && (
                  <Button
                    onClick={handleUploadCourse}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Course
                  </Button>
                )}
              </div>

              {/* Mobile Course Cards */}
              <div className="block md:hidden">
                {coursesLoading ? (
                  <div className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600 text-sm">
                        Loading courses...
                      </span>
                    </div>
                  </div>
                ) : coursesError ? (
                  <div className="text-center py-8 text-red-600">
                    <p className="text-sm">
                      Error loading courses: {coursesError}
                    </p>
                    <div className="mt-2">
                      <Button
                        onClick={refreshCourses}
                        size="sm"
                        variant="outline"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-gray-300" />
                      <p className="text-sm">No courses found</p>
                      {hasPermission("create") && (
                        <Button
                          onClick={handleUploadCourse}
                          size="sm"
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create First Course
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <CourseCard key={course._id} course={course} />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-700 py-3 min-w-[200px]">
                        Course Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-3 min-w-[100px]">
                        Pages
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-3 min-w-[120px]">
                        Duration
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-3 min-w-[80px]">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-3 min-w-[120px]">
                        Created
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-3 min-w-[120px]">
                        Uploaded By
                      </TableHead>
                      {(hasPermission("edit") || hasPermission("delete")) && (
                        <TableHead className="font-semibold text-gray-700 py-3 min-w-[120px]">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursesLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="ml-2 text-gray-600">
                              Loading courses...
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : coursesError ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-red-600"
                        >
                          Error loading courses: {coursesError}
                          <div className="mt-2">
                            <Button
                              onClick={refreshCourses}
                              size="sm"
                              variant="outline"
                            >
                              Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : courses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-12 w-12 text-gray-300" />
                            <p>No courses found</p>
                            {hasPermission("create") && (
                              <Button
                                onClick={handleUploadCourse}
                                size="sm"
                                className="mt-2"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Create First Course
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      courses.map((course) => (
                        <TableRow
                          key={course._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <TableCell className="py-3 text-gray-900 text-sm font-medium">
                            {course.courseName}
                          </TableCell>
                          <TableCell className="py-3 text-gray-900 text-sm">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-gray-500" />
                              {course.pages?.length || 0}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-gray-900 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {formatDuration(
                                getTotalDuration(course.pages || [])
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge
                              className={
                                course.isActive !== false
                                  ? "bg-green-100 text-green-800 hover:bg-green-100 border-0 text-xs"
                                  : "bg-red-100 text-red-800 hover:bg-red-100 border-0 text-xs"
                              }
                            >
                              {course.isActive !== false
                                ? "Active"
                                : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-gray-900 text-sm">
                            {course.createdAt
                              ? new Date(course.createdAt).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell className="py-3 text-gray-900 text-sm">
                            {course.uploadedBy?.username ||
                              course.uploadedBy ||
                              "Administrator"}
                          </TableCell>
                          {(hasPermission("edit") ||
                            hasPermission("delete")) && (
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                {hasPermission("edit") && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCourse(course)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Edit Course"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {hasPermission("delete") && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteCourse(course._id)
                                    }
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete Course"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Course View (keeping the rest of the views the same but with authentication checks)
  if (currentView === "course") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("main")}
              className="p-2 -ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900">
                Course Viewer
              </h1>
              <p className="text-sm text-gray-600 truncate">
                {userData?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Desktop Header */}
          <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Course Viewer
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {roleDisplayName} • {userData?.email} • Browse and view course
                details
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {hasPermission("create") && (
                <Button
                  onClick={handleUploadCourse}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              )}
              <Button
                onClick={handleViewAnalytics}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button
                onClick={() => setCurrentView("main")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
              >
                Back to Main
              </Button>
            </div>
          </div>

          {/* Course Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Course Image */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-0">
                  <div className="relative w-full h-40 sm:h-48 md:h-60 lg:h-80 overflow-hidden rounded-lg">
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

            {/* All Courses List */}
            <div className="lg:col-span-1">
              <Card className="bg-white border border-gray-200 h-40 sm:h-48 md:h-60 lg:h-80">
                <CardContent className="p-3 sm:p-6 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      All Courses
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {courses.length} total
                    </Badge>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {coursesLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : courses.length === 0 ? (
                      <div className="text-center py-4">
                        <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          No courses available
                        </p>
                      </div>
                    ) : (
                      courses.map((course, index) => (
                        <div
                          key={course._id}
                          className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleCourseClick(course)}
                        >
                          <div className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-base flex-shrink-0">
                            {course.courseName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base truncate">
                              {course.courseName}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {course.pages?.length || 0} pages •{" "}
                              {formatDuration(
                                getTotalDuration(course.pages || [])
                              )}
                            </p>
                          </div>
                          <Badge
                            className={
                              course.isActive !== false
                                ? "bg-green-100 text-green-800 text-xs"
                                : "bg-red-100 text-red-800 text-xs"
                            }
                          >
                            {course.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Selected Course Details */}
          {selectedCourse && (
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 gap-3 lg:gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {selectedCourse.courseName}
                        </h4>
                        <span className="text-xs sm:text-sm text-gray-500">
                          Created:{" "}
                          {selectedCourse.createdAt
                            ? new Date(
                                selectedCourse.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 sm:h-4 w-3 sm:w-4" />
                          {selectedCourse.pages?.length || 0} pages
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 sm:h-4 w-3 sm:w-4" />
                          {formatDuration(
                            getTotalDuration(selectedCourse.pages || [])
                          )}
                        </div>
                        <Badge
                          className={
                            selectedCourse.isActive !== false
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {selectedCourse.isActive !== false
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {hasPermission("edit") && (
                    <Button
                      onClick={() => handleEditCourse(selectedCourse)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full lg:w-auto"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Course
                    </Button>
                  )}
                </div>

                {/* Course Pages */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 text-sm sm:text-base">
                    Course Content:
                  </h5>
                  {selectedCourse.pages && selectedCourse.pages.length > 0 ? (
                    selectedCourse.pages.map((page, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1 sm:gap-2">
                          <h6 className="font-medium text-gray-900 text-sm sm:text-base">
                            Page {index + 1}: {page.title}
                          </h6>
                          <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {page.time || 0} minutes
                          </span>
                        </div>
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                          {page.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">
                        No pages available for this course
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Analytics View
  if (currentView === "analytics") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("main")}
              className="p-2 -ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-600 truncate">
                {userData?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Desktop Header */}
          <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Course Analytics
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {roleDisplayName} • {userData?.email} • View course statistics
                and insights
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {hasPermission("create") && (
                <Button
                  onClick={handleUploadCourse}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              )}
              <Button
                onClick={() => setCurrentView("main")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
              >
                Back to Courses
              </Button>
            </div>
          </div>

          {/* Course Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Total Courses
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {courses.length}
                    </p>
                  </div>
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 sm:h-6 w-5 sm:w-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Active Courses
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {
                        courses.filter((course) => course.isActive !== false)
                          .length
                      }
                    </p>
                  </div>
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Badge className="bg-green-600 text-white text-xs">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <Card className="bg-white border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Total Pages
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {courses.reduce(
                        (total, course) => total + (course.pages?.length || 0),
                        0
                      )}
                    </p>
                  </div>
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* <Card className="bg-white border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Total Duration
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {formatDuration(
                        courses.reduce(
                          (total, course) =>
                            total + getTotalDuration(course.pages || []),
                          0
                        )
                      )}
                    </p>
                  </div>
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Course Analytics Chart */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
              Course Distribution
            </h2>

            {coursesLoading ? (
              <div className="flex justify-center items-center h-48 sm:h-64">
                <div className="w-6 sm:w-8 h-6 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : coursesError ? (
              <div className="text-center text-red-600 p-4">
                <p className="text-sm">
                  Error loading analytics: {coursesError}
                </p>
                <Button
                  onClick={refreshCourses}
                  size="sm"
                  variant="outline"
                  className="mt-2 bg-transparent"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <Card className="bg-white border border-gray-200 shadow-sm rounded-xl w-full max-w-4xl mx-auto">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  {/* Chart Section */}
                  <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData}
                          cx="50%"
                          cy="50%"
                          innerRadius="40%"
                          outerRadius="70%"
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {analyticsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center hidden md:block">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-700">
                          Course Summary
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Total: {courses.length} courses
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Legend Section */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    {analyticsData.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4  flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="text-xs sm:text-sm min-w-0">
                          <div className="font-medium text-gray-800 truncate">
                            {item.name}
                          </div>
                          <div className="text-white bg-gray-800 px-2 py-0.5 rounded text-[10px] inline-block">
                            {item.value}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }
}
