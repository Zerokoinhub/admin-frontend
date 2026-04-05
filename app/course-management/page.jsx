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
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [availableLanguages] = useState([
    { code: "hi", name: "हिंदी" },
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" },
    { code: "ur", name: "اردو" },
    { code: "es", name: "Español" },
  ]);
  const [formData, setFormData] = useState({
    languages: {
      en: {
        courseName: "",
        pages: [{ title: "", content: "", time: "", timeUnit: "minutes" }],
      },
    },
  });

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
    console.log("Starting course creation for user:", userData?.email, "Role:", userRole);
    
    setCurrentView("upload");
    setCurrentLanguage("en");
    setTimeUnit("minutes");
    
    setFormData({
      languages: {
        en: {
          courseName: "",
          pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }],
        },
        hi: {
          courseName: "",
          pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }],
        },
        ar: {
          courseName: "",
          pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }],
        },
        ur: {
          courseName: "",
          pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }],
        },
        es: {
          courseName: "",
          pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }],
        },
      },
    });
    
    setIsEditing(false);
    setSelectedCourse(null);
    setIsMobileMenuOpen(false);
  };

  // Update course name with proper state management
  const updateCourseName = (value) => {
    console.log("Updating course name to:", value);
    setFormData(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        [currentLanguage]: {
          ...prev.languages[currentLanguage],
          courseName: value,
        },
      },
    }));
  };

  // Update page with proper state management
  const updatePage = (index, field, value) => {
    console.log("Updating page", index, field, "to:", value);
    setFormData(prev => {
      const updatedPages = [...prev.languages[currentLanguage].pages];
      updatedPages[index] = {
        ...updatedPages[index],
        [field]: value,
      };
      
      return {
        ...prev,
        languages: {
          ...prev.languages,
          [currentLanguage]: {
            ...prev.languages[currentLanguage],
            pages: updatedPages,
          },
        },
      };
    });
  };

  // Add page with proper state management
  const addPage = () => {
    setFormData(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        [currentLanguage]: {
          ...prev.languages[currentLanguage],
          pages: [
            ...prev.languages[currentLanguage].pages,
            { title: "", content: "", time: "", timeUnit: timeUnit },
          ],
        },
      },
    }));
  };

  // Remove page with proper state management
  const removePage = (index) => {
    setFormData(prev => {
      const currentPages = prev.languages[currentLanguage].pages;
      if (currentPages.length <= 1) return prev;
      
      const updatedPages = currentPages.filter((_, i) => i !== index);
      
      return {
        ...prev,
        languages: {
          ...prev.languages,
          [currentLanguage]: {
            ...prev.languages[currentLanguage],
            pages: updatedPages,
          },
        },
      };
    });
  };

  const ensureLanguageExists = (langCode) => {
    if (!formData.languages[langCode]) {
      setFormData(prev => ({
        ...prev,
        languages: {
          ...prev.languages,
          [langCode]: {
            courseName: "",
            pages: [{ title: "", content: "", time: "", timeUnit: "minutes" }],
          },
        },
      }));
    }
  };

  // ✅ FIXED: Safe getTotalDuration function
  const getTotalDuration = (pages) => {
    if (!pages || !Array.isArray(pages)) return 0;
    
    return pages.reduce((total, page) => {
      if (!page) return total;
      let timeValue = 0;
      let timeUnit = "minutes";
      
      try {
        if (page.time) {
          const parsed = JSON.parse(page.time);
          timeValue = parsed.value || 0;
          timeUnit = parsed.unit || "minutes";
        }
      } catch (e) {
        timeValue = typeof page.time === "string" ? parseInt(page.time) : (page.time || 0);
        timeUnit = "minutes";
      }
      
      let seconds = timeValue;
      if (timeUnit === "minutes") {
        seconds = timeValue * 60;
      }
      
      return total + seconds;
    }, 0);
  };

  // ✅ FIXED: Safe formatDuration function
  const formatDuration = (input) => {
    if (!input && input !== 0) return "0m";
    
    let totalSeconds = 0;

    if (typeof input === "string" && input.includes(":")) {
      const [minStr, secStr] = input.split(":");
      const minutes = parseInt(minStr, 10);
      const seconds = parseInt(secStr, 10);
      totalSeconds = (isNaN(minutes) ? 0 : minutes) * 60 + (isNaN(seconds) ? 0 : seconds);
    } else {
      totalSeconds = Number(input) || 0;
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0) result += `${seconds}s `;

    return result.trim() || "0m";
  };

  // ✅ FIXED: Submit course with proper payload
  const handleSubmitCourse = async () => {
    console.log("🔍 Starting course submission");
    
    const currentLangData = formData.languages[currentLanguage];
    
    console.log("Current Language:", currentLanguage);
    console.log("Current Language Data:", currentLangData);
    console.log("Full formData:", JSON.stringify(formData, null, 2));
    
    if (!currentLangData) {
      alert("Please fill in course details");
      return;
    }

    const courseName = currentLangData.courseName;
    const pages = currentLangData.pages;

    console.log("Extracted Course Name:", courseName);
    console.log("Extracted Pages:", pages);

    if (!courseName || courseName.trim() === "") {
      alert("Please enter a course name");
      return;
    }

    if (!pages || pages.length === 0) {
      alert("Please add at least one page");
      return;
    }

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page.title || page.title.trim() === "") {
        alert(`Page ${i + 1} is missing a title`);
        return;
      }
      if (!page.content || page.content.trim() === "") {
        alert(`Page ${i + 1} is missing content`);
        return;
      }
      if (!page.time || page.time === "") {
        alert(`Page ${i + 1} is missing duration`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const uploadedById = userData?.id || userData?._id;
      
      console.log("Uploaded By ID:", uploadedById);
      
      if (!uploadedById) {
        throw new Error("User ID not found. Please log in again.");
      }

      const payload = {
        languages: {
          [currentLanguage]: {
            courseName: courseName.trim(),
            pages: pages.map((page) => ({
              title: page.title.trim(),
              content: page.content.trim(),
              time: JSON.stringify({
                value: parseInt(page.time) || 60,
                unit: page.timeUnit || "minutes",
              }),
            })),
          },
        },
        uploadedBy: uploadedById,
      };

      console.log("📤 FINAL PAYLOAD BEING SENT:", JSON.stringify(payload, null, 2));

      let result;

      if (isEditing && selectedCourse) {
        console.log("Updating existing course:", selectedCourse._id);
        result = await updateCourse(selectedCourse._id, { languages: payload.languages });
      } else {
        console.log("Creating new course");
        result = await createCourse(payload);
      }

      console.log("Result from API:", result);

      if (result && result.success) {
        console.log("Course operation successful");
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          setIsSuccessModalOpen(false);
          setCurrentView("main");
          setSelectedCourse(null);
          setIsEditing(false);
          setCurrentLanguage("en");
          setTimeUnit("minutes");
          setFormData({
            languages: {
              en: {
                courseName: "",
                pages: [{ title: "", content: "", time: "", timeUnit: "minutes" }],
              },
            },
          });
          refreshCourses();
        }, 2000);
      } else {
        console.error("Course operation failed:", result?.error);
        alert(`Failed to ${isEditing ? "update" : "create"} course: ${result?.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error during course submission:", error);
      alert(`Error ${isEditing ? "updating" : "creating"} course: ${error.message}`);
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

    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    console.log("Deleting course:", courseId, "by user:", userData?.email);
    const result = await deleteCourse(courseId);

    if (result.success) {
      alert("Course deleted successfully");
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

    console.log("Editing course:", course?.courseName || course?.languages?.en?.courseName, "by user:", userData?.email);
    setSelectedCourse(course);

    let languagesData = {};
    const langCode = course?.language || "en";
    
    if (course?.languages && typeof course.languages === "object") {
      languagesData = Object.entries(course.languages).reduce((acc, [lCode, langData]) => {
        acc[lCode] = {
          courseName: langData?.courseName || "",
          pages: langData?.pages && langData.pages.length > 0
            ? langData.pages.map((page) => {
                let timeValue = page?.time || "0";
                let timeUnit = "minutes";
                try {
                  const parsed = JSON.parse(page.time);
                  timeValue = String(parsed.value || 0);
                  timeUnit = parsed.unit || "minutes";
                } catch (e) {
                  timeValue = String(page?.time || 0);
                }
                return {
                  title: page?.title || "",
                  content: page?.content || "",
                  time: timeValue,
                  timeUnit: timeUnit,
                };
              })
            : [{ title: "", content: "", time: "", timeUnit: "minutes" }],
        };
        return acc;
      }, {});
    } else {
      languagesData = {
        [langCode]: {
          courseName: course?.courseName || "",
          pages: course?.pages && course.pages.length > 0
            ? course.pages.map((page) => {
                let timeValue = page?.time || "0";
                let timeUnit = "minutes";
                try {
                  const parsed = JSON.parse(page.time);
                  timeValue = String(parsed.value || 0);
                  timeUnit = parsed.unit || "minutes";
                } catch (e) {
                  timeValue = String(page?.time || 0);
                }
                return {
                  title: page?.title || "",
                  content: page?.content || "",
                  time: timeValue,
                  timeUnit: timeUnit,
                };
              })
            : [{ title: "", content: "", time: "", timeUnit: "minutes" }],
        },
      };
    }

    setFormData({ languages: languagesData });
    setCurrentLanguage(langCode);
    setTimeUnit("minutes");
    setIsEditing(true);
    setCurrentView("upload");
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCurrentView("course");
  };

  // ✅ FIXED: Safe generateAnalyticsData function
  const generateAnalyticsData = () => {
    if (!courses || courses.length === 0) {
      return [
        { name: "Active Courses", value: 25, color: "#0d9488" },
        { name: "Inactive Courses", value: 25, color: "#ef4444" },
        { name: "Total Pages", value: 25, color: "#22c55e" },
        { name: "Total Duration", value: 25, color: "#a855f7" },
      ];
    }

    const activeCourses = courses.filter((course) => course?.isActive !== false).length;
    const inactiveCourses = courses.length - activeCourses;
    
    const totalPages = courses.reduce((total, course) => {
      const pages = course?.languages?.en?.pages || course?.pages || [];
      return total + (Array.isArray(pages) ? pages.length : 0);
    }, 0);
    
    const totalDuration = courses.reduce((total, course) => {
      const pages = course?.languages?.en?.pages || course?.pages || [];
      return total + getTotalDuration(pages);
    }, 0);

    const total = activeCourses + inactiveCourses + totalPages + Math.floor(totalDuration / 60);

    if (total === 0) {
      return [{ name: "No Data", value: 100, color: "#9ca3af" }];
    }

    return [
      { name: "Active Courses", value: Math.round((activeCourses / total) * 100) || 1, color: "#0d9488" },
      { name: "Inactive Courses", value: Math.round((inactiveCourses / total) * 100) || 1, color: "#ef4444" },
      { name: "Total Pages", value: Math.round((totalPages / total) * 100) || 1, color: "#22c55e" },
      { name: "Duration (hrs)", value: Math.round((Math.floor(totalDuration / 60) / total) * 100) || 1, color: "#a855f7" },
    ];
  };

  const analyticsData = generateAnalyticsData();

  // ✅ FIXED: Safe CourseCard component
  const CourseCard = ({ course }) => {
    const displayName = course?.languages?.en?.courseName || course?.courseName || "Untitled";
    const displayPages = course?.languages?.en?.pages || course?.pages || [];

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">{displayName}</h3>
          <Badge className={course?.isActive !== false ? "bg-green-100 text-green-800 border-0 text-xs" : "bg-red-100 text-red-800 border-0 text-xs"}>
            {course?.isActive !== false ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{Array.isArray(displayPages) ? displayPages.length : 0} pages</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(getTotalDuration(displayPages))}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-3">
          <div>Created: {course?.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"}</div>
          <div>By: {course?.uploadedBy?.username || course?.uploadedBy || "Unknown"}</div>
        </div>

        {(hasPermission("edit") || hasPermission("delete")) && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            {hasPermission("edit") && (
              <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)} className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 text-xs h-8">
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
            )}
            {hasPermission("delete") && (
              <Button variant="outline" size="sm" onClick={() => handleDeleteCourse(course._id)} className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs h-8">
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="max-w-md mx-auto mt-8">
          <Card className="bg-white border border-red-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <AlertCircle className="h-10 sm:h-12 w-10 sm:w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-red-600 mb-2">Authentication Required</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">You need to be logged in to access the Course Management system.</p>
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">Refresh Page</Button>
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
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("main")} className="p-2 -ml-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{isEditing ? "Edit Course" : "Create Course"}</h1>
              <p className="text-sm text-gray-600 truncate">{userData?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          <div className="hidden lg:flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{isEditing ? "Edit Course" : "Create New Course"}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">{roleDisplayName}</Badge>
                <p className="text-sm text-gray-600">{userData?.email}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setCurrentView("main")}>← Back to Courses</Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="mb-6 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2 overflow-x-auto">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          ensureLanguageExists(lang.code);
                          setCurrentLanguage(lang.code);
                        }}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                          currentLanguage === lang.code ? "border-b-2 border-teal-600 text-teal-600" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {lang.name}
                        {formData.languages[lang.code]?.courseName && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Course Name ({currentLanguage.toUpperCase()}) *</Label>
                    <Input
                      value={formData.languages[currentLanguage]?.courseName || ""}
                      onChange={(e) => updateCourseName(e.target.value)}
                      className="border-gray-200 w-full"
                      placeholder={`Enter course name in ${availableLanguages.find(l => l.code === currentLanguage)?.name}...`}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-700">Course Pages ({currentLanguage.toUpperCase()})</Label>
                      <Button type="button" onClick={addPage} className="bg-teal-600 hover:bg-teal-700 text-white text-sm" disabled={isSubmitting}>
                        <Plus className="h-4 w-4 mr-1" /> Add Page
                      </Button>
                    </div>
                    
                    {(formData.languages[currentLanguage]?.pages || []).map((page, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Page {index + 1}</h4>
                            {(formData.languages[currentLanguage]?.pages?.length || 0) > 1 && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => removePage(index)} className="text-red-600 hover:bg-red-50" disabled={isSubmitting}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Page Title *</Label>
                              <Input
                                value={page.title}
                                onChange={(e) => updatePage(index, "title", e.target.value)}
                                className="border-gray-200 w-full"
                                placeholder="Enter page title..."
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Content *</Label>
                              <Textarea
                                value={page.content}
                                onChange={(e) => updatePage(index, "content", e.target.value)}
                                className="border-gray-200 min-h-[100px] w-full"
                                placeholder="Enter page content..."
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Duration *</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={page.time}
                                  onChange={(e) => updatePage(index, "time", e.target.value)}
                                  className="border-gray-200 flex-1"
                                  placeholder="Enter duration..."
                                  min="1"
                                  disabled={isSubmitting}
                                />
                                <select
                                  value={page.timeUnit || "minutes"}
                                  onChange={(e) => updatePage(index, "timeUnit", e.target.value)}
                                  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                                  disabled={isSubmitting}
                                >
                                  <option value="seconds">Seconds</option>
                                  <option value="minutes">Minutes</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSubmitCourse} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {isEditing ? "Updating..." : "Creating..."}
                        </div>
                      ) : isEditing ? "Update Course" : "Create Course"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
            <DialogContent className="sm:max-w-sm w-[90%] max-w-sm bg-white text-center rounded-xl p-6">
              <div className="py-6">
                <div className="mx-auto w-20 h-20 mb-6 bg-gradient-to-br from-teal-500 to-green-600 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-teal-600 mb-4">Course Successfully {isEditing ? "Updated!" : "Created!"}</h3>
                <p className="text-sm text-gray-600 mb-6">Redirecting to course list...</p>
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
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Course Management</h1>
              <div className="flex items-center gap-4 mt-1">
                <Badge variant="outline" className="bg-green-50 text-green-700">{roleDisplayName}</Badge>
                <p className="text-sm text-gray-600">{userData?.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleViewCourse} className="bg-teal-600 hover:bg-teal-700 text-white">
                <Eye className="h-4 w-4 mr-2" /> View Courses
              </Button>
              <Button onClick={handleViewAnalytics} className="bg-purple-600 hover:bg-purple-700 text-white">
                <BarChart3 className="h-4 w-4 mr-2" /> Analytics
              </Button>
              {hasPermission("create") && (
                <Button onClick={handleUploadCourse} className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Create Course
                </Button>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg">
            <Image src="/coin1.png" alt="Earn More Zero Koin Banner" width={800} height={200} className="w-full h-32 object-cover" />
          </div>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">All Courses</h3>
                {hasPermission("create") && (
                  <Button onClick={handleUploadCourse} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-1" /> Add Course
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursesLoading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                    ) : courses.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No courses found</TableCell></TableRow>
                    ) : (
                      courses.map((course) => {
                        const displayName = course?.languages?.en?.courseName || course?.courseName || "";
                        const displayPages = course?.languages?.en?.pages || course?.pages || [];
                        const languageCount = course?.languages ? Object.keys(course.languages).length : 1;

                        return (
                          <TableRow key={course._id}>
                            <TableCell className="font-medium">
                              <div>{displayName}</div>
                              {languageCount > 1 && <div className="text-xs text-gray-500 mt-1">{languageCount} languages</div>}
                            </TableCell>
                            <TableCell>{Array.isArray(displayPages) ? displayPages.length : 0}</TableCell>
                            <TableCell>{formatDuration(getTotalDuration(displayPages))}</TableCell>
                            <TableCell>
                              <Badge className={course?.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {course?.isActive !== false ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{course?.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                            <TableCell>{course?.uploadedBy?.username || course?.uploadedBy || "Admin"}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {hasPermission("edit") && (
                                  <Button variant="ghost" size="sm" onClick={() => handleEditCourse(course)} className="text-blue-600">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {hasPermission("delete") && (
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course._id)} className="text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
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

  // Course Viewer View
  if (currentView === "course") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Course Viewer</h1>
              <p className="text-sm text-gray-600 mt-1">{roleDisplayName} • {userData?.email}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleViewAnalytics} className="bg-purple-600 hover:bg-purple-700 text-white"><BarChart3 className="h-4 w-4 mr-2" /> Analytics</Button>
              <Button onClick={() => setCurrentView("main")} className="bg-gray-600 hover:bg-gray-700 text-white">Back to Main</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-white">
                <CardContent className="p-0">
                  <div className="relative w-full h-64 overflow-hidden rounded-lg">
                    <Image src="/coin.png" alt="Zero Koin" fill className="object-cover" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-white h-64">
                <CardContent className="p-6 h-full overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">All Courses</h3>
                    <Badge variant="outline">{courses.length} total</Badge>
                  </div>
                  <div className="space-y-3">
                    {courses.map((course) => {
                      const displayName = course?.languages?.en?.courseName || course?.courseName || "";
                      return (
                        <div key={course._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => handleCourseClick(course)}>
                          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">{displayName.charAt(0).toUpperCase()}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{displayName}</h4>
                            <p className="text-xs text-gray-500">{course?.languages?.en?.pages?.length || course?.pages?.length || 0} pages</p>
                          </div>
                          <Badge className={course?.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{course?.isActive !== false ? "Active" : "Inactive"}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {selectedCourse && (
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-gray-600" /></div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{selectedCourse?.languages?.en?.courseName || selectedCourse?.courseName}</h4>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>📄 {(selectedCourse?.languages?.en?.pages || selectedCourse?.pages || []).length} pages</span>
                        <span>⏱️ {formatDuration(getTotalDuration(selectedCourse?.languages?.en?.pages || selectedCourse?.pages || []))}</span>
                        <Badge className={selectedCourse?.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{selectedCourse?.isActive !== false ? "Active" : "Inactive"}</Badge>
                      </div>
                    </div>
                  </div>
                  {hasPermission("edit") && <Button onClick={() => handleEditCourse(selectedCourse)} className="bg-blue-600 hover:bg-blue-700 text-white"><Edit className="h-4 w-4 mr-2" /> Edit Course</Button>}
                </div>

                <div className="space-y-4 mt-6">
                  <h5 className="font-medium text-gray-900">Course Content:</h5>
                  {(selectedCourse?.languages?.en?.pages || selectedCourse?.pages || []).map((page, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="font-medium text-gray-900">Page {index + 1}: {page?.title}</h6>
                        <span className="text-sm text-gray-500">⏱️ {page?.time || 0} minutes</span>
                      </div>
                      <p className="text-gray-700 text-sm">{page?.content}</p>
                    </div>
                  ))}
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
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Course Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">{roleDisplayName} • {userData?.email}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleUploadCourse} className="bg-green-600 hover:bg-green-700 text-white"><Plus className="h-4 w-4 mr-2" /> Create Course</Button>
              <Button onClick={() => setCurrentView("main")} className="bg-gray-600 hover:bg-gray-700 text-white">Back to Courses</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div><p className="text-sm font-medium text-gray-600">Total Courses</p><p className="text-2xl font-bold text-gray-900">{courses.length}</p></div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center"><FileText className="h-6 w-6 text-teal-600" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div><p className="text-sm font-medium text-gray-600">Active Courses</p><p className="text-2xl font-bold text-gray-900">{courses.filter(c => c?.isActive !== false).length}</p></div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Badge className="bg-green-600 text-white">✓</Badge></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Course Distribution</h2>
            <Card className="bg-white max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="relative w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analyticsData} cx="50%" cy="50%" innerRadius="40%" outerRadius="70%" paddingAngle={2} dataKey="value">
                        {analyticsData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  {analyticsData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4" style={{ backgroundColor: item.color }}></div>
                      <div className="text-sm"><div className="font-medium text-gray-800">{item.name}</div><div className="text-white bg-gray-800 px-2 py-0.5 rounded text-[10px] inline-block">{item.value}%</div></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
