"use client"

import { useEffect, useState } from "react"

export const useCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  }

  // Get user role from localStorage
  const getUserRole = () => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role")
      return role?.toLowerCase() // Convert to lowercase for consistency
    }
    return null
  }

  // Create headers with auth token
  const getAuthHeaders = () => {
    const token = getAuthToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch courses: ${res.status}`)
      }

      const data = await res.json()
      setCourses(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // Create new course
  const createCourse = async (courseData) => {
    try {
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      })

      if (!res.ok) {
        throw new Error(`Failed to create course: ${res.status}`)
      }

      const newCourse = await res.json()
      setCourses((prev) => [...prev, newCourse])
      return { success: true, data: newCourse }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create course"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update existing course
  const updateCourse = async (courseId, courseData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      })

      if (!res.ok) {
        throw new Error(`Failed to update course: ${res.status}`)
      }

      const updatedCourse = await res.json()
      setCourses((prev) => prev.map((course) => (course._id === courseId ? updatedCourse : course)))
      return { success: true, data: updatedCourse }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update course"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Delete course
  const deleteCourse = async (courseId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!res.ok) {
        throw new Error(`Failed to delete course: ${res.status}`)
      }

      setCourses((prev) => prev.filter((course) => course._id !== courseId))
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete course"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Check if user has permission for action based on role
  const hasPermission = (action) => {
    const role = getUserRole()
    if (!role) return false

    switch (role) {
      case "superadmin":
        // Super admin has full access to everything
        return ["view", "create", "edit", "delete"].includes(action)

      case "editor":
        // Editor can view, create, and edit but cannot delete
        return ["view", "create", "edit"].includes(action)

      case "viewer":
        // Viewer can only view courses and analytics
        return action === "view"

      default:
        return false
    }
  }

  // Get user role display name
  const getRoleDisplayName = () => {
    const role = getUserRole()
    switch (role) {
      case "superadmin":
        return "Super Admin"
      case "editor":
        return "Editor"
      case "viewer":
        return "Viewer"
      default:
        return "Unknown"
    }
  }

  // Get permissions list for display
  const getPermissionsList = () => {
    const role = getUserRole()
    switch (role) {
      case "superadmin":
        return "Full Access (View, Create, Edit, Delete)"
      case "editor":
        return "Limited Access (View, Create, Edit)"
      case "viewer":
        return "Read Only (View Only)"
      default:
        return "No Permissions"
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCourses()
  }, [])

  return {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshCourses: fetchCourses,
    hasPermission,
    userRole: getUserRole(),
    roleDisplayName: getRoleDisplayName(),
    permissionsList: getPermissionsList(),
  }
}
