"use client"

import { useState, useEffect } from "react"
import { userAPI } from "../lib/api"

export function useUsers(page = 1, limit = 10) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [page, limit])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userAPI.getUsers(page, limit)

      if (response.success) {
        setUsers(response.data.users)
        setPagination(response.data.pagination)
      } else {
        throw new Error("Failed to fetch users")
      }
    } catch (err) {
      setError(err.message)
      console.error("Error in useUsers:", err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchUsers()
  }

  return {
    users,
    loading,
    error,
    pagination,
    refetch,
  }
}

export function useUser(userId) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userAPI.getUserById(userId)

      if (response.success) {
        setUser(response.data.user)
      } else {
        throw new Error("Failed to fetch user")
      }
    } catch (err) {
      setError(err.message)
      console.error("Error in useUser:", err)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  }
}
