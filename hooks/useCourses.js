"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  isAuthenticated,
  hasPermission,
  getRoleDisplayName,
  getPermissionsList,
  makeAuthenticatedRequest,
  debugAuthState,
} from "@/lib/auth";

// Use environment variable for base URL
const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses`;

export const useCourses = () => {
  const [courses, setCourses] = useState([]); // ✅ Already initialized as array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous error

      if (!isAuthenticated()) {
        console.warn("User not authenticated, setting empty courses");
        setCourses([]);
        setError("User not authenticated");
        return;
      }

      const currentUser = getCurrentUser();
      console.log("Fetching courses for:", currentUser?.email, currentUser?.role);

      const response = await makeAuthenticatedRequest(API_BASE, {
        method: "GET",
      });

      if (!response) {
        throw new Error("No response from server");
      }

      const data = await response.json();
      console.log("Courses data received:", data);

      // ✅ SAFE: Ensure courses is always an array
      if (data && data.success && Array.isArray(data.courses)) {
        setCourses(data.courses);
        console.log(`✅ Loaded ${data.courses.length} courses`);
      } else if (data && data.success && !Array.isArray(data.courses)) {
        console.error("Courses is not an array:", data.courses);
        setCourses([]);
        setError("Invalid courses data format from server");
      } else {
        console.warn("No courses returned or invalid response format");
        setCourses([]);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setCourses([]); // ✅ Always set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format time
  const formatTimeForBackend = (time, timeUnit = "minutes") => {
    if (typeof time === 'string' && time.includes('{')) {
      return time; // Already formatted
    }
    const value = parseInt(time) || 0;
    return JSON.stringify({ value, unit: timeUnit });
  };

  // Create a new course
  const createCourse = async (courseData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("User not authenticated. Please log in again.");
      }

      console.log("📤 createCourse received:", JSON.stringify(courseData, null, 2));

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();
      console.log("Create response:", data);

      if (data.success) {
        if (data.course) {
          setCourses((prev) => [...prev, data.course]);
        }
        return { success: true, data: data.course };
      } else {
        throw new Error(data.message || "Failed to create course");
      }
    } catch (err) {
      console.error("Error creating course:", err);
      return { success: false, error: err.message };
    }
  };

  // Edit/update course
  const updateCourse = async (courseId, courseData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("User not authenticated. Please log in again.");
      }

      let payload;
      
      if (courseData.languages) {
        payload = { languages: {} };
        
        Object.entries(courseData.languages).forEach(([langCode, langData]) => {
          if (langData && langData.courseName && langData.courseName.trim()) {
            payload.languages[langCode] = {
              courseName: langData.courseName.trim(),
              pages: langData.pages.map(page => ({
                title: page.title.trim(),
                content: page.content.trim(),
                time: formatTimeForBackend(page.time, page.timeUnit),
              })),
            };
          }
        });
      } else {
        payload = {
          languages: {
            en: {
              courseName: courseData.courseName?.trim() || "",
              pages: (courseData.pages || []).map(page => ({
                title: page.title?.trim() || "",
                content: page.content?.trim() || "",
                time: formatTimeForBackend(page.time, page.timeUnit),
              })),
            },
          },
        };
      }

      console.log("📤 FINAL UPDATE PAYLOAD:", JSON.stringify(payload, null, 2));

      const response = await makeAuthenticatedRequest(`${API_BASE}/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Update response:", data);

      if (data.success && data.course) {
        setCourses((prev) =>
          prev.map((course) => (course._id === courseId ? data.course : course))
        );
        return { success: true, data: data.course };
      } else {
        throw new Error(data.message || "Failed to update course");
      }
    } catch (err) {
      console.error("Error updating course:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update course";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete a course
  const deleteCourse = async (courseId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const response = await makeAuthenticatedRequest(`${API_BASE}/${courseId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      console.log("Delete response:", data);

      if (data.success) {
        setCourses((prev) => prev.filter((course) => course._id !== courseId));
        return { success: true };
      } else {
        throw new Error(data.message || "Failed to delete course");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete course";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Initial fetch
  useEffect(() => {
    console.log("useCourses hook initialized");
    debugAuthState();
    fetchCourses();
  }, []);

  const currentUser = getCurrentUser();

  // ✅ Ensure courses is always an array when returned
  const safeCourses = Array.isArray(courses) ? courses : [];

  return {
    courses: safeCourses, // Return safe array
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshCourses: fetchCourses,
    hasPermission,
    userRole: currentUser?.role || "",
    roleDisplayName: getRoleDisplayName(),
    permissionsList: getPermissionsList(),
    userData: currentUser,
    isAuthenticated: isAuthenticated(),
  };
};
