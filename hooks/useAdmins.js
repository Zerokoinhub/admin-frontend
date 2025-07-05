"use client"

import { useState, useEffect } from "react"
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from "../src/lib/admin"

export function useAdmins() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch admins function
  const fetchAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching admins...")

      const data = await getAllAdmins()
      console.log("✅ Admins fetched successfully:", data)

      setAdmins(data || [])
    } catch (err) {
      console.error("❌ Error fetching admins:", err)
      setError(err.message)
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  // Add admin function
  const addAdmin = async (adminData) => {
    try {
      console.log("🔄 Adding admin:", adminData)

      const newAdmin = await createAdmin(adminData)
      console.log("✅ Admin added successfully:", newAdmin)

      // Refresh the admin list
      await fetchAdmins()

      return { success: true, data: newAdmin }
    } catch (err) {
      console.error("❌ Error adding admin:", err)
      return { success: false, error: err.message }
    }
  }

  // Edit admin function
  const editAdmin = async (adminId, adminData) => {
    try {
      console.log("🔄 Updating admin:", adminId, adminData)

      const updatedAdmin = await updateAdmin(adminId, adminData)
      console.log("✅ Admin updated successfully:", updatedAdmin)

      // Refresh the admin list
      await fetchAdmins()

      return { success: true, data: updatedAdmin }
    } catch (err) {
      console.error("❌ Error updating admin:", err)
      return { success: false, error: err.message }
    }
  }

  // Remove admin function
  const removeAdmin = async (adminId) => {
    try {
      console.log("🔄 Removing admin:", adminId)

      await deleteAdmin(adminId)
      console.log("✅ Admin removed successfully")

      // Refresh the admin list
      await fetchAdmins()

      return { success: true }
    } catch (err) {
      console.error("❌ Error removing admin:", err)
      return { success: false, error: err.message }
    }
  }

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins()
  }, [])

  return {
    admins,
    loading,
    error,
    addAdmin,
    editAdmin,
    removeAdmin,
    refetch: fetchAdmins,
  }
}
