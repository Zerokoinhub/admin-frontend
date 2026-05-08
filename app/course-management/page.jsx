"use client";

import { useState, useEffect, useCallback } from "react";
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
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_BASE_URL = "https://admin-backend-production-4ff2.up.railway.app/api/courses";

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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState("main");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState("");

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
        setUserRole(user.role || "");
      }
    } catch (err) {
      console.error("Error getting user data:", err);
    }
  }, []);

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.warn("No token found");
        setCourses([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/list-active`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Courses data:", data);
        
        if (data && data.success && Array.isArray(data.courses)) {
          setCourses(data.courses);
          console.log(`Loaded ${data.courses.length} courses`);
        } else {
          setCourses([]);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch all courses with complete language data from /all endpoint
  const fetchAllCoursesWithLanguages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/all`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.courses)) {
          return data.courses;
        }
      }
      return [];
    } catch (err) {
      console.error("Error fetching all courses:", err);
      return [];
    }
  };

  // Create a new course
  const createCourse = async (courseData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Not authenticated");
      }

      console.log("Creating course at:", API_BASE_URL);
      
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });

      const data = await response.json();
      console.log("Create response:", data);

      if (response.ok && data.success) {
        await fetchCourses();
        return { success: true };
      } else {
        throw new Error(data.message || "Failed to create course");
      }
    } catch (err) {
      console.error("Error creating course:", err);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing course
  const updateCourse = async (courseId, courseData) => {
    if (!courseId) {
      console.error("Cannot update course: No course ID provided");
      return { success: false, error: "Course ID is required" };
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Not authenticated");
      }

      const url = `${API_BASE_URL}/${courseId}`;
      console.log("Updating course at:", url);
      console.log("Update payload:", JSON.stringify(courseData, null, 2));
      
      const response = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });

      const data = await response.json();
      console.log("Update response:", data);

      if (response.ok && data.success) {
        await fetchCourses();
        return { success: true };
      } else {
        throw new Error(data.message || "Failed to update course");
      }
    } catch (err) {
      console.error("Error updating course:", err);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a course
  const deleteCourse = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Not authenticated");
      }

      if (!confirm("Are you sure you want to delete this course?")) {
        return { success: false };
      }

      console.log("Deleting course at:", `${API_BASE_URL}/${courseId}`);
      
      const response = await fetch(`${API_BASE_URL}/${courseId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      console.log("Delete response:", data);

      if (response.ok && data.success) {
        setCourses(prev => prev.filter(course => course.id !== courseId));
        return { success: true };
      } else {
        throw new Error(data.message || "Failed to delete course");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Error: " + err.message);
      return { success: false, error: err.message };
    }
  };

  const hasPermission = (action) => {
    switch (userRole?.toLowerCase()) {
      case "superadmin":
        return true;
      case "editor":
        return ["view", "create", "edit"].includes(action);
      case "viewer":
        return action === "view";
      default:
        return false;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const getRoleDisplayName = () => {
    switch (userRole?.toLowerCase()) {
      case "superadmin": return "Super Admin";
      case "editor": return "Editor";
      case "viewer": return "Viewer";
      default: return "User";
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && courses.length === 0) {
    return <ErrorDisplay error={error} onRetry={fetchCourses} />;
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
                    const courseId = selectedCourse.id || selectedCourse._id;
                    if (!courseId) {
                      alert("Course ID not found");
                      return;
                    }
                    result = await updateCourse(courseId, payload);
                  } else {
                    result = await createCourse(payload);
                  }
                  
                  if (result?.success) {
                    alert(`Course ${isEditing ? "updated" : "created"} successfully!`);
                    setCurrentView("main");
                  } else {
                    alert("Failed to save course: " + (result?.error || "Unknown error"));
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
        ✅ Courses Loaded: {courses.length} | Role: {getRoleDisplayName()}
      </div>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Course Management</h1>
          <p className="text-sm text-gray-600">{userData?.email} • {getRoleDisplayName()}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchCourses} variant="outline">
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
                    const courseName = course.englishName || course.courseName || "Untitled";
                    const pageCount = course.pagesCount?.en || 0;
                    const languages = course.availableLanguages || [];
                    
                    return (
                      <TableRow key={course.id}>
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
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {/* ✅ FIXED: Edit Button - Uses /all endpoint to get all languages data */}
                            {hasPermission("edit") && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    // ✅ Fetch all courses with complete language data from /all endpoint
                                    const allCourses = await fetchAllCoursesWithLanguages();
                                    
                                    // Find the specific course
                                    let fullCourse = allCourses.find(c => c.id === course.id || c._id === course.id);
                                    
                                    // If not found in /all, try fetching directly
                                    if (!fullCourse) {
                                      const directResponse = await fetch(`${API_BASE_URL}/${course.id}`, {
                                        headers: getAuthHeaders(),
                                      });
                                      const directData = await directResponse.json();
                                      fullCourse = directData.course || directData.data || directData;
                                    }
                                    
                                    console.log("Full course data for edit:", fullCourse);
                                    
                                    if (fullCourse && fullCourse.languages) {
                                      const newFormData = { languages: {} };
                                      
                                      // ✅ Load ALL languages data from the full course
                                      for (const lang of availableLanguages) {
                                        const langData = fullCourse.languages[lang.code];
                                        if (langData && langData.courseName) {
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
                                          // Empty data for languages without content
                                          newFormData.languages[lang.code] = {
                                            courseName: "",
                                            pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }],
                                          };
                                        }
                                      }
                                      
                                      setFormData(newFormData);
                                      setIsEditing(true);
                                      setSelectedCourse(fullCourse);
                                      setCurrentLanguage("en");
                                      setCurrentView("upload");
                                    } else if (fullCourse) {
                                      // Fallback - if languages object doesn't exist
                                      const newFormData = { languages: {} };
                                      newFormData.languages.en = {
                                        courseName: fullCourse.courseName || fullCourse.englishName || "",
                                        pages: (fullCourse.pages || []).map(page => ({
                                          title: page.title || "",
                                          content: page.content || "",
                                          time: page.time?.value?.toString() || "120",
                                          timeUnit: page.time?.unit || "minutes",
                                        })),
                                      };
                                      for (const lang of availableLanguages) {
                                        if (lang.code !== 'en') {
                                          newFormData.languages[lang.code] = {
                                            courseName: "",
                                            pages: [{ title: "", content: "", time: "120", timeUnit: "minutes" }],
                                          };
                                        }
                                      }
                                      setFormData(newFormData);
                                      setIsEditing(true);
                                      setSelectedCourse(fullCourse);
                                      setCurrentLanguage("en");
                                      setCurrentView("upload");
                                    } else {
                                      alert("Could not load course data for editing");
                                    }
                                  } catch (err) {
                                    console.error("Error loading course for edit:", err);
                                    alert("Failed to load course data");
                                  }
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Delete Button */}
                            {hasPermission("delete") && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600"
                                onClick={async () => {
                                  const result = await deleteCourse(course.id);
                                  if (result.success) {
                                    alert("Course deleted successfully!");
                                    fetchCourses();
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
    </div>
  );
}
