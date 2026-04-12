"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useCourses } from "../../hooks/useCourses";

// Simple loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Simple error component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 p-4">
    <Card className="bg-white border border-red-200 max-w-md mx-auto mt-8">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700 text-white">
          Retry
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default function CourseManagementPage() {
  const [currentView, setCurrentView] = useState("main");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [hasRenderError, setHasRenderError] = useState(false);
  
  const {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshCourses,
    hasPermission,
    userRole,
    roleDisplayName,
    userData,
    isAuthenticated,
  } = useCourses();

  // All 5 languages
  const availableLanguages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "ar", name: "العربية" },
    { code: "ur", name: "اردو" },
    { code: "es", name: "Español" },
  ];

  // Multi-language form data
  const [formData, setFormData] = useState({
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

  // Debug logging
  useEffect(() => {
    console.log("=== DEBUG ===");
    console.log("Courses:", courses);
    console.log("Courses type:", typeof courses);
    console.log("Is array:", Array.isArray(courses));
    console.log("Loading:", loading);
    console.log("Error:", error);
    console.log("Auth:", isAuthenticated);
  }, [courses, loading, error, isAuthenticated]);

  // Safe courses array
  const safeCourses = Array.isArray(courses) ? courses : [];

  // Ensure language exists in formData
  const ensureLanguageExists = (langCode) => {
    if (!formData.languages[langCode]) {
      setFormData(prev => ({
        ...prev,
        languages: {
          ...prev.languages,
          [langCode]: {
            courseName: "",
            pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }],
          },
        },
      }));
    }
  };

  // Update course name for current language
  const updateCourseName = (value) => {
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

  // Update page for current language
  const updatePage = (index, field, value) => {
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

  // Add page for current language
  const addPage = () => {
    setFormData(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        [currentLanguage]: {
          ...prev.languages[currentLanguage],
          pages: [
            ...prev.languages[currentLanguage].pages,
            { title: "", content: "", time: "120", timeUnit: "minutes" },
          ],
        },
      },
    }));
  };

  // Remove page for current language
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

  // Handle render errors gracefully
  if (hasRenderError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="bg-white border border-red-200 max-w-md mx-auto mt-8">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Render Error</h2>
            <p className="text-gray-600 mb-4">Something went wrong rendering the component.</p>
            <Button onClick={() => {
              setHasRenderError(false);
              window.location.reload();
            }} className="bg-blue-600 hover:bg-blue-700 text-white">
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={refreshCourses} />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="bg-white border border-red-200 max-w-md mx-auto mt-8">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to continue.</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Upload Course View
  if (currentView === "upload") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Button variant="ghost" onClick={() => setCurrentView("main")} className="mb-4">
          ← Back
        </Button>
        
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold mb-4">
              {isEditing ? "Edit Course" : "Create Course"}
            </h1>
            
            {/* Language Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      ensureLanguageExists(lang.code);
                      setCurrentLanguage(lang.code);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      currentLanguage === lang.code
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {lang.name}
                    {formData.languages[lang.code]?.courseName && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-1 py-0.5 rounded">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Course Name ({currentLanguage.toUpperCase()}) *</Label>
                <Input
                  value={formData.languages[currentLanguage]?.courseName || ""}
                  onChange={(e) => updateCourseName(e.target.value)}
                  placeholder={`Enter course name in ${currentLanguage.toUpperCase()}...`}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Pages ({currentLanguage.toUpperCase()})</Label>
                  <Button 
                    size="sm" 
                    onClick={addPage}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Page
                  </Button>
                </div>
                
                {(formData.languages[currentLanguage]?.pages || []).map((page, index) => (
                  <Card key={index} className="mb-3">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Page {index + 1}</h4>
                        {(formData.languages[currentLanguage]?.pages?.length || 0) > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removePage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          placeholder="Title"
                          value={page.title}
                          onChange={(e) => updatePage(index, "title", e.target.value)}
                        />
                        <Textarea
                          placeholder="Content"
                          value={page.content}
                          onChange={(e) => updatePage(index, "content", e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Duration"
                            value={page.time}
                            onChange={(e) => updatePage(index, "time", e.target.value)}
                            className="flex-1"
                          />
                          <select
                            value={page.timeUnit || "minutes"}
                            onChange={(e) => updatePage(index, "timeUnit", e.target.value)}
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                          >
                            <option value="seconds">Seconds</option>
                            <option value="minutes">Minutes</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button 
                className="w-full" 
                disabled={isSubmitting}
                onClick={async () => {
                  const currentLangData = formData.languages[currentLanguage];
                  
                  if (!currentLangData?.courseName) {
                    alert(`Please enter a course name in ${currentLanguage.toUpperCase()}`);
                    return;
                  }
                  
                  // Validate all pages for current language
                  for (let i = 0; i < currentLangData.pages.length; i++) {
                    const page = currentLangData.pages[i];
                    if (!page.title) {
                      alert(`Page ${i + 1} is missing a title in ${currentLanguage.toUpperCase()}`);
                      return;
                    }
                    if (!page.content) {
                      alert(`Page ${i + 1} is missing content in ${currentLanguage.toUpperCase()}`);
                      return;
                    }
                    if (!page.time) {
                      alert(`Page ${i + 1} is missing duration in ${currentLanguage.toUpperCase()}`);
                      return;
                    }
                  }
                  
                  setIsSubmitting(true);
                  try {
                    // Build languages object with all non-empty languages
                    const languages = {};
                    for (const lang of availableLanguages) {
                      const langData = formData.languages[lang.code];
                      if (langData && langData.courseName && langData.courseName.trim()) {
                        languages[lang.code] = {
                          courseName: langData.courseName.trim(),
                          pages: langData.pages.map(p => ({
                            title: p.title.trim(),
                            content: p.content.trim(),
                            time: JSON.stringify({ 
                              value: parseInt(p.time) || 60, 
                              unit: p.timeUnit || "minutes" 
                            }),
                          })),
                        };
                      }
                    }
                    
                    const payload = {
                      languages: languages,
                      uploadedBy: userData?.id || userData?._id
                    };
                    
                    let result;
                    if (isEditing && selectedCourse) {
                      result = await updateCourse(selectedCourse._id, payload);
                    } else {
                      result = await createCourse(payload);
                    }
                    
                    if (result?.success) {
                      alert(`Course ${isEditing ? "updated" : "created"} successfully!`);
                      setCurrentView("main");
                      refreshCourses();
                    } else {
                      alert("Failed to save course: " + (result?.error || "Unknown error"));
                    }
                  } catch (err) {
                    alert("Error: " + err.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? "Saving..." : (isEditing ? "Update Course" : "Create Course")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main View - Courses List
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Deployment Banner */}
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-sm text-center mb-4">
        ✅ Code Deployed | Safe Mode | Courses: {safeCourses.length}
      </div>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Course Management</h1>
          <p className="text-sm text-gray-600">{userData?.email} • {roleDisplayName}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setCurrentView("analytics")} 
            variant="outline"
            disabled={true}
          >
            <BarChart3 className="h-4 w-4 mr-2" /> Analytics (Disabled)
          </Button>
          {hasPermission?.("create") && (
            <Button onClick={() => {
              // Reset form data
              setFormData({
                languages: {
                  en: { courseName: "", pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }] },
                  hi: { courseName: "", pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }] },
                  ar: { courseName: "", pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }] },
                  ur: { courseName: "", pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }] },
                  es: { courseName: "", pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }] },
                },
              });
              setIsEditing(false);
              setCurrentLanguage("en");
              setCurrentView("upload");
            }}>
              <Plus className="h-4 w-4 mr-2" /> Create Course
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Courses ({safeCourses.length})</h2>

          {safeCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No courses found. Click "Create Course" to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeCourses.map((course) => {
                    const courseName = course?.languages?.en?.courseName || course?.courseName || "Untitled";
                    const pageCount = course?.languages?.en?.pages?.length || course?.pages?.length || 0;
                    const languages = course?.languages ? Object.keys(course.languages) : [];
                    
                    return (
                      <TableRow key={course?._id || Math.random()}>
                        <TableCell className="font-medium">{courseName}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {languages.map(lang => (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {lang.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{pageCount}</TableCell>
                        <TableCell>
                          <Badge className={course?.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {course?.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{course?.uploadedBy?.username || course?.uploadedBy || "Unknown"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Load course data for editing
                                if (course?.languages) {
                                  const newFormData = { languages: {} };
                                  for (const lang of availableLanguages) {
                                    const langData = course.languages[lang.code];
                                    if (langData) {
                                      newFormData.languages[lang.code] = {
                                        courseName: langData.courseName || "",
                                        pages: (langData.pages || []).map(page => ({
                                          title: page.title || "",
                                          content: page.content || "",
                                          time: page.time ? (JSON.parse(page.time)?.value?.toString() || "120") : "120",
                                          timeUnit: page.time ? (JSON.parse(page.time)?.unit || "minutes") : "minutes",
                                        })),
                                      };
                                    } else {
                                      newFormData.languages[lang.code] = {
                                        courseName: "",
                                        pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }],
                                      };
                                    }
                                  }
                                  setFormData(newFormData);
                                  setIsEditing(true);
                                  setSelectedCourse(course);
                                  setCurrentLanguage("en");
                                  setCurrentView("upload");
                                } else {
                                  alert("Edit feature - Course ID: " + course._id);
                                }
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {hasPermission?.("delete") && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600"
                                onClick={async () => {
                                  if (confirm("Delete this course?")) {
                                    const result = await deleteCourse(course._id);
                                    if (result.success) {
                                      alert("Deleted!");
                                      refreshCourses();
                                    }
                                  }
                                }}
                              >
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

      {/* Simple Course Viewer */}
      {currentView === "course" && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedCourse?.languages?.en?.courseName || selectedCourse?.courseName}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCourse(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {(selectedCourse?.languages?.en?.pages || selectedCourse?.pages || []).map((page, idx) => (
                  <div key={idx} className="border rounded p-4">
                    <h3 className="font-medium">{page?.title}</h3>
                    <p className="text-gray-600 mt-2">{page?.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
