"use client"

import { useEffect, useState } from "react"
import {
  getCurrentUser,
  isAuthenticated,
  hasPermission,
  getRoleDisplayName,
  getPermissionsList,
  makeAuthenticatedRequest,
  debugAuthState,
} from "@/lib/auth"

export const useCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all courses using authenticated request
  const fetchCourses = async () => {
    try {
      setLoading(true)

      if (!isAuthenticated()) {
        throw new Error("User not authenticated. Please log in again.")
      }

      const currentUser = getCurrentUser()
      console.log("Fetching courses for user:", currentUser?.email, "with role:", currentUser?.role)

      const response = await makeAuthenticatedRequest("http://localhost:5000/api/courses", {
        method: "GET",
      })

      const data = await response.json()
      console.log("Courses data received:", data)

      // Backend returns { success: true, courses: [...] }
      if (data.success && data.courses) {
        setCourses(data.courses)
        console.log("Successfully loaded", data.courses.length, "courses")
      } else {
        setCourses([])
        console.log("No courses found in response")
      }
      setError(null)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // Create new course with current user as uploader
  const createCourse = async (courseData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("User not authenticated. Please log in again.")
      }

      const currentUser = getCurrentUser()
      console.log("Creating course for user:", currentUser?.email)

      // Add current user context to course data
      const coursePayload = {
        ...courseData,
        uploadedBy: currentUser?.id, // Ensure current user is set as uploader
      }

      console.log("Course payload:", coursePayload)

      const response = await makeAuthenticatedRequest("http://localhost:5000/api/courses", {
        method: "POST",
        body: JSON.stringify(coursePayload),
      })

      const data = await response.json()
      console.log("Create course response:", data)

      // Backend returns { success: true, course: {...} }
      if (data.success && data.course) {
        setCourses((prev) => [...prev, data.course])
        console.log("Course created successfully:", data.course.courseName)
        return { success: true, data: data.course }
      } else {
        throw new Error(data.message || "Failed to create course")
      }
    } catch (err) {
      console.error("Error creating course:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create course"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update existing course with current user authorization
  const updateCourse = async (courseId, courseData) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("User not authenticated. Please log in again.")
      }

      const currentUser = getCurrentUser()
      console.log("Updating course for user:", currentUser?.email)

      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/courses/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(courseData),
      })

      const data = await response.json()
      console.log("Update course response:", data)

      // Backend returns { success: true, course: {...} }
      if (data.success && data.course) {
        setCourses((prev) => prev.map((course) => (course._id === courseId ? data.course : course)))
        console.log("Course updated successfully:", data.course.courseName)
        return { success: true, data: data.course }
      } else {
        throw new Error(data.message || "Failed to update course")
      }
    } catch (err) {
      console.error("Error updating course:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update course"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Delete course with current user authorization
  const deleteCourse = async (courseId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error("User not authenticated. Please log in again.")
      }

      const currentUser = getCurrentUser()
      console.log("Deleting course for user:", currentUser?.email)

      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/courses/${courseId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      console.log("Delete course response:", data)

      // Backend returns { success: true, message: "Course deleted" }
      if (data.success) {
        setCourses((prev) => prev.filter((course) => course._id !== courseId))
        console.log("Course deleted successfully")
        return { success: true }
      } else {
        throw new Error(data.message || "Failed to delete course")
      }
    } catch (err) {
      console.error("Error deleting course:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete course"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Initial fetch when component mounts
  useEffect(() => {
    console.log("useCourses hook initialized")
    debugAuthState() // Debug authentication state
    fetchCourses()
  }, [])

  const currentUser = getCurrentUser()

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
  }
}
