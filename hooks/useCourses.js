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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated()) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const currentUser = getCurrentUser();
      console.log(
        "Fetching courses for:",
        currentUser?.email,
        currentUser?.role
      );

      const response = await makeAuthenticatedRequest(API_BASE, {
        method: "GET",
      });

      const data = await response.json();
      console.log("Courses data received:", data);

      if (data.success && data.courses) {
        setCourses(data.courses);
      } else {
        setCourses([]);
        console.warn("No courses returned from server.");
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format time properly
  const formatTime = (time, timeUnit = "minutes") => {
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

      const currentUser = getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("User ID not found.");
      }

      const currUsr = localStorage.getItem("user");
      const currUsrStr = JSON.parse(currUsr);
      const uploadedBy = currUsrStr.username
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .map((word, index) =>
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join("");

      // ✅ FIX: Convert to the format backend expects
      let payload;
      
      // Check if courseData already has the languages structure
      if (courseData.languages) {
        // Already in correct format - ensure time fields are properly formatted
        const formattedLanguages = {};
        Object.entries(courseData.languages).forEach(([langCode, langData]) => {
          formattedLanguages[langCode] = {
            courseName: langData.courseName,
            pages: langData.pages.map(page => ({
              title: page.title,
              content: page.content,
              time: formatTime(page.time, page.timeUnit),
            })),
          };
        });
        payload = {
          languages: formattedLanguages,
          uploadedBy: uploadedBy,
        };
      } else {
        // Convert from simple format to languages format
        payload = {
          languages: {
            en: {
              courseName: courseData.courseName,
              pages: courseData.pages.map(page => ({
                title: page.title,
                content: page.content,
                time: formatTime(page.time, page.timeUnit),
              })),
            },
          },
          uploadedBy: uploadedBy,
        };
      }

      console.log("📤 Creating course with payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Create response:", data);

      if (data.success && data.course) {
        setCourses((prev) => [...prev, data.course]);
        return { success: true, data: data.course };
      } else {
        throw new Error(data.message || "Failed to create course");
      }
    } catch (err) {
      console.error("Error creating course:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create course";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Edit/update course
  const updateCourse = async (courseId, courseData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("User not authenticated. Please log in again.");
      }

      // ✅ FIX: Format the payload correctly for update
      let payload;
      
      if (courseData.languages) {
        // Already in correct format - ensure time fields are properly formatted
        const formattedLanguages = {};
        Object.entries(courseData.languages).forEach(([langCode, langData]) => {
          formattedLanguages[langCode] = {
            courseName: langData.courseName,
            pages: langData.pages.map(page => ({
              title: page.title,
              content: page.content,
              time: formatTime(page.time, page.timeUnit),
            })),
          };
        });
        payload = { languages: formattedLanguages };
      } else {
        // Convert from simple format to languages format
        payload = {
          languages: {
            en: {
              courseName: courseData.courseName,
              pages: courseData.pages.map(page => ({
                title: page.title,
                content: page.content,
                time: formatTime(page.time, page.timeUnit),
              })),
            },
          },
        };
      }

      console.log("📤 Updating course with payload:", JSON.stringify(payload, null, 2));

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
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update course";
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
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete course";
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

  return {
    courses,
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
