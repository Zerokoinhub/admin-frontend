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
  Loader2,
} from "lucide-react";

// Simple loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="inline-block animate-spin rounded-full h-12 w-12 text-teal-600" />
      <p className="mt-4 text-gray-600">Loading courses...</p>
    </div>
  </div>
);

// Simple error component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 p-4">
    <Card className="bg-white border border-red-200 max-w-md mx-auto mt-8">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Courses</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onRetry} className="bg-teal-600 hover:bg-teal-700 text-white">
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
  const [localCourses, setLocalCourses] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  
  const {
    courses: hookCourses,
    loading: hookLoading,
    error: hookError,
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

  // Use local state to track courses
  useEffect(() => {
    console.log("Hook courses updated:", hookCourses);
    if (hookCourses && Array.isArray(hookCourses)) {
      setLocalCourses(hookCourses);
    } else if (hookCourses && typeof hookCourses === 'object') {
      // If hook returns an object with data property
      const coursesArray = hookCourses.data || hookCourses.courses || [];
      setLocalCourses(Array.isArray(coursesArray) ? coursesArray : []);
    } else {
      setLocalCourses([]);
    }
    setLocalLoading(hookLoading);
    setLocalError(hookError);
  }, [hookCourses, hookLoading, hookError]);

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
    console.log("=== COURSE MANAGEMENT DEBUG ===");
    console.log("Hook Courses:", hookCourses);
    console.log("Local Courses:", localCourses);
    console.log("Courses type:", typeof hookCourses);
    console.log("Is array:", Array.isArray(hookCourses));
    console.log("Hook Loading:", hookLoading);
    console.log("Local Loading:", localLoading);
    console.log("Hook Error:", hookError);
    console.log("Local Error:", localError);
    console.log("Auth:", isAuthenticated);
    console.log("User Data:", userData);
  }, [hookCourses, localCourses, hookLoading, localLoading, hookError, localError, isAuthenticated, userData]);

  // Safe courses array
  const safeCourses = Array.isArray(localCourses) && localCourses.length > 0 ? localCourses : [];

  // Try to manually fetch courses if hook fails
  const manualFetchCourses = async () => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://zerokoinapp-production.up.railway.app/api/courses", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Manual fetch result:", result);
        
        let coursesArray = [];
        if (result.success && result.data) {
          coursesArray = Array.isArray(result.data) ? result.data : [];
        } else if (Array.isArray(result)) {
          coursesArray = result;
        } else if (result.courses && Array.isArray(result.courses)) {
          coursesArray = result.courses;
        }
        
        setLocalCourses(coursesArray);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Manual fetch error:", err);
      setLocalError(err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Retry function
  const handleRetry = () => {
    if (refreshCourses) {
      refreshCourses();
    }
    manualFetchCourses();
  };

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
            }} className="bg-teal-600 hover:bg-teal-700 text-white">
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (localLoading || hookLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (localError || hookError) {
    return <ErrorDisplay error={localError || hookError} onRetry={handleRetry} />;
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
            <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700 text-white">
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
                      if (refreshCourses) refreshCourses();
                      manualFetchCourses();
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
      {/* Debug Banner */}
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-lg text-sm text-center mb-4">
        📊 Debug | Courses in State: {safeCourses.length} | Loading: {String(localLoading)} | Auth: {String(isAuthenticated)}
      </div>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Course Management</h1>
          <p className="text-sm text-gray-600">{userData?.email || userData?.username || "User"} • {roleDisplayName || userRole || "Loading..."}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={manualFetchCourses}
            variant="outline"
          >
            Refresh
          </Button>
          {hasPermission?.("create") && (
            <Button onClick={() => {
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
              <p>No courses found.</p>
              <p className="text-sm mt-2">Click "Create Course" to add one, or "Refresh" to reload.</p>
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
                    // Safely extract course data
                    const courseId = course?._id || course?.id;
                    const courseName = course?.languages?.en?.courseName || 
                                      course?.courseName || 
                                      "Untitled";
                    const pageCount = course?.languages?.en?.pages?.length || 
                                    course?.pages?.length || 
                                    0;
                    const languages = course?.languages ? Object.keys(course.languages) : [];
                    const isActive = course?.isActive !== false;
                    const createdBy = course?.uploadedBy?.username || 
                                     course?.uploadedBy?.email || 
                                     course?.uploadedBy || 
                                     "Unknown";
                    
                    return (
                      <TableRow key={courseId || Math.random()}>
                        <TableCell className="font-medium">{courseName}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {languages.length > 0 ? languages.map(lang => (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {lang.toUpperCase()}
                              </Badge>
                            )) : (
                              <Badge variant="outline" className="text-xs">EN</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{pageCount}</TableCell>
                        <TableCell>
                          <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{createdBy}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // View course
                                setSelectedCourse(course);
                                setCurrentView("course");
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
                                        pages: (langData.pages || []).map(page => {
                                          let timeValue = "120";
                                          let timeUnit = "minutes";
                                          try {
                                            if (page.time) {
                                              const parsed = JSON.parse(page.time);
                                              timeValue = parsed?.value?.toString() || "120";
                                              timeUnit = parsed?.unit || "minutes";
                                            }
                                          } catch (e) {
                                            timeValue = page.time || "120";
                                          }
                                          return {
                                            title: page.title || "",
                                            content: page.content || "",
                                            time: timeValue,
                                            timeUnit: timeUnit,
                                          };
                                        }),
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
                                  alert("Edit feature - Course ID: " + courseId);
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
                                    const result = await deleteCourse(courseId);
                                    if (result?.success) {
                                      alert("Deleted successfully!");
                                      if (refreshCourses) refreshCourses();
                                      manualFetchCourses();
                                    } else {
                                      alert("Failed to delete: " + (result?.error || "Unknown error"));
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
                  {selectedCourse?.languages?.en?.courseName || selectedCourse?.courseName || "Course Details"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedCourse(null);
                  setCurrentView("main");
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {(selectedCourse?.languages?.en?.pages || selectedCourse?.pages || []).map((page, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{page?.title || `Page ${idx + 1}`}</h3>
                    <p className="text-gray-600 mt-2 whitespace-pre-wrap">{page?.content || "No content"}</p>
                    {page?.time && (
                      <p className="text-sm text-gray-400 mt-2">
                        Duration: {typeof page.time === 'string' ? page.time : JSON.stringify(page.time)}
                      </p>
                    )}
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
