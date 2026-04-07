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

  const [formData, setFormData] = useState({
    courseName: "",
    pages: [{ title: "", content: "", time: "120" }],
  });

  const availableLanguages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
  ];

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
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold mb-4">
              {isEditing ? "Edit Course" : "Create Course"}
            </h1>
            
            <div className="space-y-4">
              <div>
                <Label>Course Name *</Label>
                <Input
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  placeholder="Enter course name"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Pages</Label>
                  <Button 
                    size="sm" 
                    onClick={() => setFormData({
                      ...formData,
                      pages: [...formData.pages, { title: "", content: "", time: "120" }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Page
                  </Button>
                </div>
                
                {formData.pages.map((page, index) => (
                  <Card key={index} className="mb-3">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Page {index + 1}</h4>
                        {formData.pages.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const newPages = formData.pages.filter((_, i) => i !== index);
                              setFormData({ ...formData, pages: newPages });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          placeholder="Title"
                          value={page.title}
                          onChange={(e) => {
                            const newPages = [...formData.pages];
                            newPages[index].title = e.target.value;
                            setFormData({ ...formData, pages: newPages });
                          }}
                        />
                        <Textarea
                          placeholder="Content"
                          value={page.content}
                          onChange={(e) => {
                            const newPages = [...formData.pages];
                            newPages[index].content = e.target.value;
                            setFormData({ ...formData, pages: newPages });
                          }}
                          rows={3}
                        />
                        <Input
                          type="number"
                          placeholder="Duration (minutes)"
                          value={page.time}
                          onChange={(e) => {
                            const newPages = [...formData.pages];
                            newPages[index].time = e.target.value;
                            setFormData({ ...formData, pages: newPages });
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button 
                className="w-full" 
                disabled={isSubmitting}
                onClick={async () => {
                  if (!formData.courseName) {
                    alert("Please enter a course name");
                    return;
                  }
                  
                  setIsSubmitting(true);
                  try {
                    const result = await createCourse({
                      languages: {
                        en: {
                          courseName: formData.courseName,
                          pages: formData.pages.map(p => ({
                            title: p.title,
                            content: p.content,
                            time: JSON.stringify({ value: parseInt(p.time) || 60, unit: "minutes" })
                          }))
                        }
                      },
                      uploadedBy: userData?.id || userData?._id
                    });
                    
                    if (result?.success) {
                      alert("Course created successfully!");
                      setCurrentView("main");
                      refreshCourses();
                    } else {
                      alert("Failed to create course: " + (result?.error || "Unknown error"));
                    }
                  } catch (err) {
                    alert("Error: " + err.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? "Saving..." : (isEditing ? "Update" : "Create")}
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
            disabled={true} // Disabled temporarily to avoid recharts error
          >
            <BarChart3 className="h-4 w-4 mr-2" /> Analytics (Disabled)
          </Button>
          {hasPermission?.("create") && (
            <Button onClick={() => {
              setFormData({ courseName: "", pages: [{ title: "", content: "", time: "120" }] });
              setIsEditing(false);
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
                    <TableHead>Pages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeCourses.map((course) => {
                    // Safely extract data
                    const courseName = course?.languages?.en?.courseName || course?.courseName || "Untitled";
                    const pageCount = course?.languages?.en?.pages?.length || course?.pages?.length || 0;
                    
                    return (
                      <TableRow key={course?._id || Math.random()}>
                        <TableCell className="font-medium">{courseName}</TableCell>
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
                                // Simplified edit - just show alert for now
                                alert("Edit feature - Course ID: " + course._id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
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

      {/* Simple Course Viewer (without analytics) */}
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
