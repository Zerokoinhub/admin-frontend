// hooks/useCourses.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCurrentUser,
  isAuthenticated,
  hasPermission,
  getRoleDisplayName,
  getPermissionsList,
  getAuthHeaders,
  debugAuthState,
} from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://zerokoinapp-production.up.railway.app/api";

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated()) {
        console.warn("User not authenticated");
        setCourses([]);
        setLoading(false);
        return;
      }

      const currentUser = getCurrentUser();
      console.log("Fetching courses for user:", currentUser?.email);

      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Courses API response:", data);

      let coursesArray = [];
      
      if (data && data.success) {
        if (Array.isArray(data.courses)) {
          coursesArray = data.courses;
        } else if (data.data && Array.isArray(data.data)) {
          coursesArray = data.data;
        }
      } else if (Array.isArray(data)) {
        coursesArray = data;
      }

      console.log(`Loaded ${coursesArray.length} courses`);
      setCourses(coursesArray);
      
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourse = async (courseData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchCourses();
        return { success: true, data: data.course || data.data };
      } else {
        throw new Error(data.message || "Failed to create course");
      }
    } catch (err) {
      console.error("Error creating course:", err);
      return { success: false, error: err.message };
    }
  };

  const updateCourse = async (courseId, courseData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchCourses();
        return { success: true, data: data.course || data.data };
      } else {
        throw new Error(data.message || "Failed to update course");
      }
    } catch (err) {
      console.error("Error updating course:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCourses(prev => prev.filter(course => course._id !== courseId));
        return { success: true };
      } else {
        throw new Error(data.message || "Failed to delete course");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    console.log("useCourses hook initialized");
    debugAuthState();
    fetchCourses();
  }, [fetchCourses]);

  const currentUser = getCurrentUser();

  return {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshCourses: fetchCourses,
    hasPermission: (action) => hasPermission(action),
    userRole: currentUser?.role || "",
    roleDisplayName: getRoleDisplayName(),
    permissionsList: getPermissionsList(),
    userData: currentUser,
    isAuthenticated: isAuthenticated(),
  };
};
