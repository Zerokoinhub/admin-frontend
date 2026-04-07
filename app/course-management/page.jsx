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
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import { useUsers } from "../../hooks/useUsers";
import { useCourses } from "../../hooks/useCourses";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Safely extract the pages array from a course object.
 * Always returns an Array (never null/undefined).
 */
const getPages = (course) => {
  if (!course) return [];
  const p = course?.languages?.en?.pages ?? course?.pages;
  return Array.isArray(p) ? p : [];
};

/**
 * Safely extract the display name from a course object.
 */
const getCourseName = (course) => {
  if (!course) return "Untitled";
  return (
    course?.languages?.en?.courseName ||
    course?.courseName ||
    "Untitled"
  );
};

/**
 * Calculate total duration in seconds from a pages array.
 * Handles JSON-encoded time objects AND plain numeric strings.
 */
const getTotalDuration = (pages) => {
  if (!Array.isArray(pages) || pages.length === 0) return 0;

  let totalSeconds = 0;

  for (const page of pages) {
    if (!page) continue;

    let timeValue = 0;
    let unit = "minutes";

    try {
      if (page.time) {
        const raw = String(page.time).trim();
        if (raw.startsWith("{")) {
          const parsed = JSON.parse(raw);
          timeValue = Number(parsed.value) || 0;
          unit = parsed.unit || "minutes";
        } else {
          timeValue = parseInt(raw, 10) || 0;
          unit = page.timeUnit || "minutes";
        }
      }
    } catch {
      timeValue = parseInt(page.time, 10) || 0;
    }

    totalSeconds += unit === "minutes" ? timeValue * 60 : timeValue;
  }

  return totalSeconds;
};

/**
 * Format a duration given in total seconds to a human-readable string.
 * Also accepts "mm:ss" strings for backwards compatibility.
 */
const formatDuration = (input) => {
  if (input == null) return "0m";

  let totalSeconds = 0;

  if (typeof input === "string" && input.includes(":")) {
    const [m, s] = input.split(":").map(Number);
    totalSeconds = (m || 0) * 60 + (s || 0);
  } else {
    totalSeconds = parseInt(input, 10) || 0;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let result = "";
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (seconds > 0) result += `${seconds}s`;

  return result.trim() || "0m";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CourseManagementPage() {
  const [currentView, setCurrentView] = useState("main");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [timeUnit, setTimeUnit] = useState("minutes");

  const [availableLanguages] = useState([
    { code: "hi", name: "हिंदी" },
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" },
    { code: "ur", name: "اردو" },
    { code: "es", name: "Español" },
  ]);

  const emptyPage = () => ({ title: "", content: "", time: "120", timeUnit: "minutes" });

  const emptyLanguageData = () => ({
    courseName: "",
    pages: [emptyPage()],
  });

  const [formData, setFormData] = useState({
    languages: { en: emptyLanguageData() },
  });

  const {
    courses,
    loading: coursesLoading,
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

  const { users } = useUsers(1, 100);

  useEffect(() => {
    console.log("Course Management - user:", userData);
    console.log("Course Management - authenticated:", isAuthenticated);
    console.log("Course Management - role:", userRole);
    console.log("Course Management - permissions:", permissionsList);
  }, [userData, isAuthenticated, userRole, permissionsList]);

  // ─── Navigation helpers ───────────────────────────────────────────────────

  const handleViewCourse = () => setCurrentView("course");
  const handleViewAnalytics = () => setCurrentView("analytics");

  const handleUploadCourse = () => {
    if (!isAuthenticated) { alert("Please log in to create courses"); return; }
    if (!hasPermission("create")) { alert("You don't have permission to create courses"); return; }

    setCurrentView("upload");
    setCurrentLanguage("en");
    setTimeUnit("minutes");
    setIsEditing(false);
    setSelectedCourse(null);

    setFormData({
      languages: {
        en: emptyLanguageData(),
        hi: emptyLanguageData(),
        ar: emptyLanguageData(),
        ur: emptyLanguageData(),
        es: emptyLanguageData(),
      },
    });
  };

  // ─── Form helpers ─────────────────────────────────────────────────────────

  const ensureLanguageExists = (langCode) => {
    setFormData((prev) => {
      if (prev.languages[langCode]) return prev;
      return {
        ...prev,
        languages: { ...prev.languages, [langCode]: emptyLanguageData() },
      };
    });
  };

  const updateCourseName = (value) => {
    setFormData((prev) => ({
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

  const updatePage = (index, field, value) => {
    setFormData((prev) => {
      const pages = [...(prev.languages[currentLanguage]?.pages || [])];
      pages[index] = { ...pages[index], [field]: value };
      return {
        ...prev,
        languages: {
          ...prev.languages,
          [currentLanguage]: { ...prev.languages[currentLanguage], pages },
        },
      };
    });
  };

  const addPage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: {
        ...prev.languages,
        [currentLanguage]: {
          ...prev.languages[currentLanguage],
          pages: [
            ...(prev.languages[currentLanguage]?.pages || []),
            { ...emptyPage(), timeUnit },
          ],
        },
      },
    }));
  };

  const removePage = (index) => {
    setFormData((prev) => {
      const pages = prev.languages[currentLanguage]?.pages || [];
      if (pages.length <= 1) return prev;
      return {
        ...prev,
        languages: {
          ...prev.languages,
          [currentLanguage]: {
            ...prev.languages[currentLanguage],
            pages: pages.filter((_, i) => i !== index),
          },
        },
      };
    });
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmitCourse = async () => {
    const currentLangData = formData.languages[currentLanguage];
    if (!currentLangData) { alert("Please fill in course details"); return; }

    const { courseName, pages } = currentLangData;

    if (!courseName?.trim()) { alert("Please enter a course name"); return; }
    if (!pages?.length) { alert("Please add at least one page"); return; }

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      if (!p?.title?.trim()) { alert(`Page ${i + 1} is missing a title`); return; }
      if (!p?.content?.trim()) { alert(`Page ${i + 1} is missing content`); return; }
      if (!p?.time) { alert(`Page ${i + 1} is missing duration`); return; }
    }

    setIsSubmitting(true);

    try {
      const uploadedById = userData?.id || userData?._id;
      if (!uploadedById) throw new Error("User ID not found. Please log in again.");

      const payload = {
        languages: {
          [currentLanguage]: {
            courseName: courseName.trim(),
            pages: pages.map((page) => ({
              title: page.title.trim(),
              content: page.content.trim(),
              time: JSON.stringify({
                value: parseInt(page.time, 10) || 60,
                unit: page.timeUnit || "minutes",
              }),
            })),
          },
        },
        uploadedBy: uploadedById,
      };

      const result = isEditing && selectedCourse
        ? await updateCourse(selectedCourse._id, { languages: payload.languages })
        : await createCourse(payload);

      if (result?.success) {
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          setIsSuccessModalOpen(false);
          setCurrentView("main");
          setSelectedCourse(null);
          setIsEditing(false);
          setCurrentLanguage("en");
          setTimeUnit("minutes");
          setFormData({ languages: { en: emptyLanguageData() } });
          refreshCourses();
        }, 2000);
      } else {
        alert(`Failed to ${isEditing ? "update" : "create"} course: ${result?.error || "Unknown error"}`);
      }
    } catch (err) {
      alert(`Error ${isEditing ? "updating" : "creating"} course: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDeleteCourse = async (courseId) => {
    if (!isAuthenticated) { alert("Please log in to delete courses"); return; }
    if (!hasPermission("delete")) { alert("You don't have permission to delete courses"); return; }
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

    const result = await deleteCourse(courseId);
    if (result.success) {
      alert("Course deleted successfully");
      await refreshCourses();
    } else {
      alert(`Error deleting course: ${result.error}`);
    }
  };

  // ─── Edit ─────────────────────────────────────────────────────────────────

  const handleEditCourse = (course) => {
    if (!isAuthenticated) { alert("Please log in to edit courses"); return; }
    if (!hasPermission("edit")) { alert("You don't have permission to edit courses"); return; }

    setSelectedCourse(course);

    const parsePage = (page) => {
      let timeValue = "0";
      let unit = "minutes";
      try {
        const raw = String(page?.time || "0").trim();
        if (raw.startsWith("{")) {
          const parsed = JSON.parse(raw);
          timeValue = String(parsed.value || 0);
          unit = parsed.unit || "minutes";
        } else {
          timeValue = raw;
          unit = page?.timeUnit || "minutes";
        }
      } catch {
        timeValue = String(page?.time || 0);
      }
      return { title: page?.title || "", content: page?.content || "", time: timeValue, timeUnit: unit };
    };

    let languagesData = {};

    if (course?.languages && typeof course.languages === "object") {
      for (const [lCode, langData] of Object.entries(course.languages)) {
        languagesData[lCode] = {
          courseName: langData?.courseName || "",
          pages: Array.isArray(langData?.pages) && langData.pages.length > 0
            ? langData.pages.map(parsePage)
            : [emptyPage()],
        };
      }
    } else {
      const langCode = course?.language || "en";
      languagesData[langCode] = {
        courseName: course?.courseName || "",
        pages: Array.isArray(course?.pages) && course.pages.length > 0
          ? course.pages.map(parsePage)
          : [emptyPage()],
      };
    }

    setFormData({ languages: languagesData });
    setCurrentLanguage(Object.keys(languagesData)[0] || "en");
    setTimeUnit("minutes");
    setIsEditing(true);
    setCurrentView("upload");
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCurrentView("course");
  };

  // ─── Analytics data ───────────────────────────────────────────────────────

  const generateAnalyticsData = () => {
    if (!Array.isArray(courses) || courses.length === 0) {
      return [
        { name: "Active Courses",   value: 25, color: "#0d9488" },
        { name: "Inactive Courses", value: 25, color: "#ef4444" },
        { name: "Total Pages",      value: 25, color: "#22c55e" },
        { name: "Total Duration",   value: 25, color: "#a855f7" },
      ];
    }

    let activeCourses = 0;
    let totalPages = 0;
    let totalDurationSeconds = 0;

    for (const course of courses) {
      if (!course) continue;
      if (course.isActive !== false) activeCourses++;
      const pages = getPages(course);
      totalPages += pages.length;
      totalDurationSeconds += getTotalDuration(pages);
    }

    const inactiveCourses = courses.length - activeCourses;
    const durationHours = Math.floor(totalDurationSeconds / 3600);
    const total = activeCourses + inactiveCourses + totalPages + durationHours;

    if (total === 0) return [{ name: "No Data", value: 100, color: "#9ca3af" }];

    return [
      { name: "Active Courses",   value: Math.max(1, Math.round((activeCourses   / total) * 100)), color: "#0d9488" },
      { name: "Inactive Courses", value: Math.max(1, Math.round((inactiveCourses / total) * 100)), color: "#ef4444" },
      { name: "Total Pages",      value: Math.max(1, Math.round((totalPages      / total) * 100)), color: "#22c55e" },
      { name: "Duration (hrs)",   value: Math.max(1, Math.round((durationHours   / total) * 100)), color: "#a855f7" },
    ];
  };

  const analyticsData = generateAnalyticsData();

  // ─── CourseCard ───────────────────────────────────────────────────────────

  const CourseCard = ({ course }) => {
    if (!course) return null;
    const displayName = getCourseName(course);
    const pages      = getPages(course);
    const duration   = getTotalDuration(pages);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">{displayName}</h3>
          <Badge className={course.isActive !== false ? "bg-green-100 text-green-800 border-0 text-xs" : "bg-red-100 text-red-800 border-0 text-xs"}>
            {course.isActive !== false ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{pages.length} pages</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-3">
          <div>Created: {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"}</div>
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

  // ─── Auth guard ───────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto mt-8">
          <Card className="bg-white border border-red-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">You need to be logged in to access the Course Management system.</p>
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">Refresh Page</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Upload / Edit view ───────────────────────────────────────────────────

  if (currentView === "upload") {
    const currentPages = formData.languages[currentLanguage]?.pages || [];

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile header */}
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

        <div className="p-4 lg:p-6 space-y-6">
          {/* Desktop header */}
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
                {/* Language tabs */}
                <div className="mb-6 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2 overflow-x-auto">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { ensureLanguageExists(lang.code); setCurrentLanguage(lang.code); }}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                          currentLanguage === lang.code
                            ? "border-b-2 border-teal-600 text-teal-600"
                            : "text-gray-600 hover:text-gray-900"
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
                  {/* Course name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Course Name ({currentLanguage.toUpperCase()}) *
                    </Label>
                    <Input
                      value={formData.languages[currentLanguage]?.courseName || ""}
                      onChange={(e) => updateCourseName(e.target.value)}
                      className="border-gray-200 w-full"
                      placeholder="Enter course name..."
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Pages */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-700">
                        Course Pages ({currentLanguage.toUpperCase()})
                      </Label>
                      <Button type="button" onClick={addPage} className="bg-teal-600 hover:bg-teal-700 text-white text-sm" disabled={isSubmitting}>
                        <Plus className="h-4 w-4 mr-1" /> Add Page
                      </Button>
                    </div>

                    {currentPages.map((page, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Page {index + 1}</h4>
                            {currentPages.length > 1 && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => removePage(index)} className="text-red-600 hover:bg-red-50" disabled={isSubmitting}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Page Title *</Label>
                              <Input
                                value={page?.title || ""}
                                onChange={(e) => updatePage(index, "title", e.target.value)}
                                className="border-gray-200 w-full"
                                placeholder="Enter page title..."
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Content *</Label>
                              <Textarea
                                value={page?.content || ""}
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
                                  value={page?.time || ""}
                                  onChange={(e) => updatePage(index, "time", e.target.value)}
                                  className="border-gray-200 flex-1"
                                  placeholder="Enter duration..."
                                  min="1"
                                  disabled={isSubmitting}
                                />
                                <select
                                  value={page?.timeUnit || "minutes"}
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
                      ) : isEditing ? "Update Course" : "Create Course"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success modal */}
          <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
            <DialogContent className="sm:max-w-sm w-[90%] max-w-sm bg-white text-center rounded-xl p-6">
              <div className="py-6">
                <div className="mx-auto w-20 h-20 mb-6 bg-gradient-to-br from-teal-500 to-green-600 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-teal-600 mb-4">
                  Course Successfully {isEditing ? "Updated!" : "Created!"}
                </h3>
                <p className="text-sm text-gray-600 mb-6">Redirecting to course list...</p>
                <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // ─── Main list view ───────────────────────────────────────────────────────

  if (currentView === "main") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Course Management</h1>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <Badge variant="outline" className="bg-green-50 text-green-700">{roleDisplayName}</Badge>
                <p className="text-sm text-gray-600">{userData?.email}</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
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
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-900">All Courses</h3>
                {hasPermission("create") && (
                  <Button onClick={handleUploadCourse} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-1" /> Add Course
                  </Button>
                )}
              </div>

              {coursesLoading ? (
                <div className="text-center py-8">Loading courses...</div>
              ) : !Array.isArray(courses) || courses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No courses found</div>
              ) : (
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
                      {courses.map((course) => {
                        if (!course) return null;
                        const displayName    = getCourseName(course);
                        const pages          = getPages(course);
                        const languageCount  = course?.languages ? Object.keys(course.languages).length : 1;

                        return (
                          <TableRow key={course._id}>
                            <TableCell className="font-medium">
                              <div>{displayName}</div>
                              {languageCount > 1 && (
                                <div className="text-xs text-gray-500 mt-1">{languageCount} languages</div>
                              )}
                            </TableCell>
                            <TableCell>{pages.length}</TableCell>
                            <TableCell>{formatDuration(getTotalDuration(pages))}</TableCell>
                            <TableCell>
                              <Badge className={course.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {course.isActive !== false ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"}</TableCell>
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
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Course viewer view ───────────────────────────────────────────────────

  if (currentView === "course") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Course Viewer</h1>
              <p className="text-sm text-gray-600 mt-1">{roleDisplayName} • {userData?.email}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleViewAnalytics} className="bg-purple-600 hover:bg-purple-700 text-white">
                <BarChart3 className="h-4 w-4 mr-2" /> Analytics
              </Button>
              <Button onClick={() => setCurrentView("main")} className="bg-gray-600 hover:bg-gray-700 text-white">
                Back to Main
              </Button>
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
              <Card className="bg-white h-96">
                <CardContent className="p-6 h-full overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">All Courses</h3>
                    <Badge variant="outline">{Array.isArray(courses) ? courses.length : 0} total</Badge>
                  </div>
                  <div className="space-y-3">
                    {(Array.isArray(courses) ? courses : []).map((course) => {
                      if (!course) return null;
                      const displayName = getCourseName(course);
                      const pages       = getPages(course);
                      return (
                        <div
                          key={course._id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCourseClick(course)}
                        >
                          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{displayName}</h4>
                            <p className="text-xs text-gray-500">{pages.length} pages</p>
                          </div>
                          <Badge className={course.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {course.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {selectedCourse && (() => {
            const pages = getPages(selectedCourse);
            return (
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{getCourseName(selectedCourse)}</h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          <span>📄 {pages.length} pages</span>
                          <span>⏱️ {formatDuration(getTotalDuration(pages))}</span>
                          <Badge className={selectedCourse.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {selectedCourse.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {hasPermission("edit") && (
                      <Button onClick={() => handleEditCourse(selectedCourse)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Edit className="h-4 w-4 mr-2" /> Edit Course
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4 mt-6">
                    <h5 className="font-medium text-gray-900">Course Content:</h5>
                    {pages.map((page, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                          <h6 className="font-medium text-gray-900">Page {index + 1}: {page?.title}</h6>
                          <span className="text-sm text-gray-500">⏱️ {page?.time || 0} minutes</span>
                        </div>
                        <p className="text-gray-700 text-sm">{page?.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>
    );
  }

  // ─── Analytics view ───────────────────────────────────────────────────────

  if (currentView === "analytics") {
    const safeCourses = Array.isArray(courses) ? courses : [];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Course Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">{roleDisplayName} • {userData?.email}</p>
            </div>
            <div className="flex gap-3">
              {hasPermission("create") && (
                <Button onClick={handleUploadCourse} className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Create Course
                </Button>
              )}
              <Button onClick={() => setCurrentView("main")} className="bg-gray-600 hover:bg-gray-700 text-white">
                Back to Courses
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{safeCourses.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{safeCourses.filter((c) => c?.isActive !== false).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Badge className="bg-green-600 text-white">✓</Badge>
                  </div>
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
                        {analyticsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  {analyticsData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="inline-block text-white bg-gray-800 px-2 py-0.5 rounded text-[10px]">{item.value}%</div>
                      </div>
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

  return null;
}
