// app/course-management/page.js
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
  Edit,
  Trash2,
  Plus,
  Eye,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ✅ THIS IS THE IMPORT THAT WAS MISSING - ADD THIS LINE
import { useCourses } from "@/hooks/useCourses";

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="inline-block animate-spin rounded-full h-12 w-12 text-teal-600" />
      <p className="mt-4 text-gray-600">Loading courses...</p>
    </div>
  </div>
);

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
  // ✅ NOW useCourses() will be defined because we imported it above
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

  const [currentView, setCurrentView] = useState("main");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  const availableLanguages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "ar", name: "العربية" },
    { code: "ur", name: "اردو" },
    { code: "es", name: "Español" },
  ];

  const [formData, setFormData] = useState({
    languages: {
      en: { courseName: "", pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }] },
      hi: { courseName: "", pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }] },
      ar: { courseName: "", pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }] },
      ur: { courseName: "", pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }] },
      es: { courseName: "", pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }] },
    },
  });

  // Debug logging
  useEffect(() => {
    console.log("=== CourseManagementPage Debug ===");
    console.log("Courses:", courses);
    console.log("Loading:", loading);
    console.log("Error:", error);
    console.log("Authenticated:", isAuthenticated);
    console.log("================================");
  }, [courses, loading, error, isAuthenticated]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refreshCourses} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="bg-white border border-red-200 max-w-md mx-auto mt-8">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access courses.</p>
            <Button onClick={() => window.location.href = "/login"} className="bg-teal-600 hover:bg-teal-700 text-white">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create/Edit View
  if (currentView === "upload") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Button variant="ghost" onClick={() => setCurrentView("main")} className="mb-4">
          ← Back to Courses
        </Button>
        
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold mb-4">
              {isEditing ? "Edit Course" : "Create New Course"}
            </h1>
            
            <div className="mb-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.code)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      currentLanguage === lang.code
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Course Name *</Label>
                <Input
                  value={formData.languages[currentLanguage]?.courseName || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    languages: {
                      ...prev.languages,
                      [currentLanguage]: {
                        ...prev.languages[currentLanguage],
                        courseName: e.target.value,
                      },
                    },
                  }))}
                  placeholder="Enter course name..."
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Course Pages</Label>
                  <Button size="sm" onClick={() => {
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
                  }}>
                    <Plus className="h-4 w-4 mr-1" /> Add Page
                  </Button>
                </div>
                
                {(formData.languages[currentLanguage]?.pages || []).map((page, index) => (
                  <Card key={index} className="mb-3">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Page {index + 1}</h4>
                        {(formData.languages[currentLanguage]?.pages?.length || 0) > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              languages: {
                                ...prev.languages,
                                [currentLanguage]: {
                                  ...prev.languages[currentLanguage],
                                  pages: prev.languages[currentLanguage].pages.filter((_, i) => i !== index),
                                },
                              },
                            }));
                          }}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Input
                          placeholder="Page Title"
                          value={page.title}
                          onChange={(e) => {
                            const updatedPages = [...formData.languages[currentLanguage].pages];
                            updatedPages[index] = { ...updatedPages[index], title: e.target.value };
                            setFormData(prev => ({
                              ...prev,
                              languages: {
                                ...prev.languages,
                                [currentLanguage]: {
                                  ...prev.languages[currentLanguage],
                                  pages: updatedPages,
                                },
                              },
                            }));
                          }}
                        />
                        <Textarea
                          placeholder="Page Content"
                          value={page.content}
                          onChange={(e) => {
                            const updatedPages = [...formData.languages[currentLanguage].pages];
                            updatedPages[index] = { ...updatedPages[index], content: e.target.value };
                            setFormData(prev => ({
                              ...prev,
                              languages: {
                                ...prev.languages,
                                [currentLanguage]: {
                                  ...prev.languages[currentLanguage],
                                  pages: updatedPages,
                                },
                              },
                            }));
                          }}
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Duration"
                            value={page.time}
                            onChange={(e) => {
                              const updatedPages = [...formData.languages[currentLanguage].pages];
                              updatedPages[index] = { ...updatedPages[index], time: e.target.value };
                              setFormData(prev => ({
                                ...prev,
                                languages: {
                                  ...prev.languages,
                                  [currentLanguage]: {
                                    ...prev.languages[currentLanguage],
                                    pages: updatedPages,
                                  },
                                },
                              }));
                            }}
                            className="flex-1"
                          />
                          <select
                            value={page.timeUnit || "minutes"}
                            onChange={(e) => {
                              const updatedPages = [...formData.languages[currentLanguage].pages];
                              updatedPages[index] = { ...updatedPages[index], timeUnit: e.target.value };
                              setFormData(prev => ({
                                ...prev,
                                languages: {
                                  ...prev.languages,
                                  [currentLanguage]: {
                                    ...prev.languages[currentLanguage],
                                    pages: updatedPages,
                                  },
                                },
                              }));
                            }}
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
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isSubmitting}
                onClick={async () => {
                  const currentLangData = formData.languages[currentLanguage];
                  
                  if (!currentLangData?.courseName) {
                    alert(`Please enter a course name in ${currentLanguage.toUpperCase()}`);
                    return;
                  }
                  
                  for (let i = 0; i < currentLangData.pages.length; i++) {
                    const page = currentLangData.pages[i];
                    if (!page.title) {
                      alert(`Page ${i + 1} is missing a title`);
                      return;
                    }
                    if (!page.content) {
                      alert(`Page ${i + 1} is missing content`);
                      return;
                    }
                  }
                  
                  setIsSubmitting(true);
                  try {
                    const languages = {};
                    for (const lang of availableLanguages) {
                      const langData = formData.languages[lang.code];
                      if (langData && langData.courseName && langData.courseName.trim()) {
                        languages[lang.code] = {
                          courseName: langData.courseName.trim(),
                          pages: langData.pages.map(p => ({
                            title: p.title.trim(),
                            content: p.content.trim(),
                            time: JSON.stringify({ value: parseInt(p.time) || 60, unit: p.timeUnit || "minutes" }),
                          })),
                        };
                      }
                    }
                    
                    const payload = { languages };
                    
                    let result;
                    if (isEditing && selectedCourse) {
                      result = await updateCourse(selectedCourse._id, payload);
                    } else {
                      result = await createCourse(payload);
                    }
                    
                    if (result?.success) {
                      alert(`Course ${isEditing ? "updated" : "created"} successfully!`);
                      setCurrentView("main");
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

  // Main Courses List View
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-sm text-center mb-4">
        ✅ Courses Loaded: {courses.length} | Role: {roleDisplayName}
      </div>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Course Management</h1>
          <p className="text-sm text-gray-600">{userData?.email} • {roleDisplayName}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshCourses} variant="outline">
            Refresh
          </Button>
          {hasPermission("create") && (
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
          <h2 className="text-lg font-semibold mb-4">All Courses ({courses.length})</h2>

          {courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No courses found.</p>
              {hasPermission("create") && (
                <p className="text-sm mt-2">Click "Create Course" to add your first course.</p>
              )}
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => {
                    const courseName = course?.languages?.en?.courseName || course?.courseName || "Untitled";
                    const pageCount = course?.languages?.en?.pages?.length || course?.pages?.length || 0;
                    const languages = course?.languages ? Object.keys(course.languages) : [];
                    
                    return (
                      <TableRow key={course._id}>
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
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedCourse(course);
                                setCurrentView("course");
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {hasPermission("edit") && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  const newFormData = { languages: {} };
                                  for (const lang of availableLanguages) {
                                    const langData = course.languages?.[lang.code];
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
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {hasPermission("delete") && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600"
                                onClick={async () => {
                                  if (confirm("Delete this course?")) {
                                    const result = await deleteCourse(course._id);
                                    if (result.success) {
                                      alert("Course deleted!");
                                    } else {
                                      alert("Failed to delete: " + result.error);
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

      {/* Course Viewer Modal */}
      {currentView === "course" && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedCourse?.languages?.en?.courseName || selectedCourse?.courseName}
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
                    <h3 className="font-semibold text-lg">{page.title || `Page ${idx + 1}`}</h3>
                    <p className="text-gray-600 mt-2 whitespace-pre-wrap">{page.content || "No content"}</p>
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
