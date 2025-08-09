"use client"

// Auth utility functions that match the backend JWT middleware exactly

/**
 * Get current logged-in user data from localStorage
 * Returns user object with proper ID format for backend
 */
export const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const userData = JSON.parse(userStr)
        ////console.log("Current logged-in user:", userData)
        return {
          id: userData._id || userData.id || "", // Backend JWT expects decoded.id
          _id: userData._id || userData.id || "", // Keep both for compatibility
          username: userData.username || "",
          email: userData.email || "",
          role: userData.role || "", // Keep original case - don't convert to lowercase
          isActive: userData.isActive !== false, // Default to true if not specified
          token: userData.token || "", // Some systems store token with user data
        }
      }
    } catch (error) {
      console.error("Error parsing current user data from localStorage:", error)
    }
  }
  return null
}

/**
 * Get JWT token from localStorage
 * Backend middleware expects: req.headers.authorization.startsWith('Bearer')
 */
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    // Try different possible token storage keys
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("jwtToken")

    if (token) {
      ////console.log("Found JWT token")
      // Remove 'Bearer ' prefix if it exists (we'll add it in headers)
      return token.replace(/^Bearer\s+/i, "")
    }

    console.warn("No JWT token found in localStorage")
    return null
  }
  return null
}

/**
 * Create headers with JWT Bearer token as expected by backend middleware
 * Backend expects: Authorization: Bearer <token>
 */
export const getAuthHeaders = () => {
  const token = getAuthToken()
  const currentUser = getCurrentUser()

  if (!token) {
    console.warn("No JWT token found - request will be unauthorized")
    return {
      "Content-Type": "application/json",
    }
  }

  ////console.log("Using JWT Bearer token for user:", currentUser?.email || "unknown")

  // Backend middleware expects: req.headers.authorization.startsWith('Bearer')
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // This is what your middleware expects
  }
}

/**
 * Check if current user has valid JWT token and active account
 * Matches backend middleware validation logic
 */
export const isAuthenticated = () => {
  const token = getAuthToken()
  const currentUser = getCurrentUser()

  if (!token || !currentUser) {
    console.warn("User not authenticated - missing token or user data")
    return false
  }

  // Check if user account is active (as per your middleware)
  if (currentUser.isActive === false) {
    console.warn("User account is deactivated")
    return false
  }

  // Basic JWT token format validation (should have 3 parts separated by dots)
  const tokenParts = token.split(".")
  if (tokenParts.length !== 3) {
    console.warn("Invalid JWT token format")
    return false
  }

  return true
}

/**
 * Decode JWT payload (for debugging only - don't use in production)
 * Helps verify the token contains the expected user ID
 */
export const decodeJWTPayload = (token = null) => {
  try {
    const jwtToken = token || getAuthToken()
    if (!jwtToken) return null

    const payload = JSON.parse(atob(jwtToken.split(".")[1]))
    ////console.log("JWT Payload:", payload)
    return payload
  } catch (error) {
    console.error("Error decoding JWT:", error)
    return null
  }
}

/**
 * Validate JWT token structure and content
 * Ensures token has the user ID that backend expects
 */
export const validateJWTToken = () => {
  const token = getAuthToken()
  const currentUser = getCurrentUser()

  if (!token) {
    console.error("No JWT token found")
    return { valid: false, error: "No token found" }
  }

  // Decode and check payload
  const payload = decodeJWTPayload(token)
  if (!payload) {
    console.error("Invalid JWT token - cannot decode payload")
    return { valid: false, error: "Invalid token format" }
  }

  // Check if token has user ID (backend expects decoded.id)
  if (!payload.id) {
    console.error("JWT token missing user ID")
    return { valid: false, error: "Token missing user ID" }
  }

  // Check if token user ID matches localStorage user
  if (currentUser && currentUser.id !== payload.id) {
    console.error("JWT token user ID mismatch")
    return { valid: false, error: "Token user ID mismatch" }
  }

  // Check token expiration
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    console.error("JWT token has expired")
    return { valid: false, error: "Token expired" }
  }

  ////console.log("JWT token validation successful")
  return { valid: true, payload }
}

/**
 * Check if current user has permission for action based on role
 * Matches backend role authorization logic
 */
export const hasPermission = (action) => {
  const currentUser = getCurrentUser()
  const role = currentUser?.role // Keep original case - don't convert to lowercase

  if (!role) {
    console.warn("No role found for current user")
    return false
  }

  //////console.log("Checking permission for role:", role, "action:", action)

  // Match the exact role strings your backend uses
  switch (role) {
    case "superadmin": // Exact match for backend
    case "super_admin": // Support both formats
      return ["view", "create", "edit", "delete"].includes(action)

    case "editor":
      return ["view", "create", "edit"].includes(action)

    case "viewer":
      return action === "view"

    default:
      console.warn("Unknown role:", role)
      return false
  }
}

/**
 * Get user role display name for UI
 */
export const getRoleDisplayName = () => {
  const currentUser = getCurrentUser()
  const role = currentUser?.role
  switch (role) {
    case "superadmin":
    case "super_admin":
      return "Super Admin"
    case "editor":
      return "Editor"
    case "viewer":
      return "Viewer"
    default:
      return "Unknown"
  }
}

/**
 * Get permissions list for display in UI
 */
export const getPermissionsList = () => {
  const currentUser = getCurrentUser()
  const role = currentUser?.role
  switch (role) {
    case "superadmin":
    case "super_admin":
      return "Full Access (View, Create, Edit, Delete)"
    case "editor":
      return "Limited Access (View, Create, Edit)"
    case "viewer":
      return "Read Only (View Only)"
    default:
      return "No Permissions"
  }
}

/**
 * Handle authentication errors from backend
 * Matches specific error messages from your middleware
 */
export const handleAuthError = (error) => {
  console.error("Backend authentication error:", error)

  if (error.includes("Not authorized to access this route")) {
    alert("Authentication failed. Your session has expired. Please log in again.")
    clearAuthData()
  } else if (error.includes("User not found")) {
    alert("User account not found. Please log in again.")
    clearAuthData()
  } else if (error.includes("User account is deactivated")) {
    alert("Your account has been deactivated. Please contact support.")
    clearAuthData()
  } else if (error.includes("not authorized to access this route")) {
    alert(`Access Error: ${error}`)
  } else if (error.includes("Authentication failed") || error.includes("session may have expired")) {
    alert("Your session has expired. Please log in again.")
    clearAuthData()
  } else {
    alert(`Error: ${error}`)
  }
}

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  ////console.log("Clearing authentication data")
  localStorage.removeItem("token")
  localStorage.removeItem("authToken")
  localStorage.removeItem("accessToken")
  localStorage.removeItem("jwt")
  localStorage.removeItem("jwtToken")
  localStorage.removeItem("user")
}

/**
 * Store authentication data in localStorage
 */
export const setAuthData = (token, userData) => {
  ////console.log("Storing authentication data for user:", userData?.email)

  // Store token
  localStorage.setItem("token", token)

  // Store user data
  localStorage.setItem("user", JSON.stringify(userData))

  ////console.log("Authentication data stored successfully")
}

/**
 * Make authenticated API request with proper error handling
 */
export const makeAuthenticatedRequest = async (url, options = {}) => {
  try {
    // Check authentication before making request
    if (!isAuthenticated()) {
      throw new Error("User not authenticated. Please log in again.")
    }

    // Prepare headers
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    }

    // Make request
    const response = await fetch(url, {
      ...options,
      headers,
    })

    ////console.log(`API Request: ${options.method || "GET"} ${url} - Status: ${response.status}`)

    // Handle authentication errors
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData.message || "Authentication failed"
      console.error("401 Error:", message)
      throw new Error(`Authentication failed: ${message}. Please log in again.`)
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData.message || "Access denied"
      console.error("403 Error:", message)
      throw new Error(`Access denied: ${message}`)
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Request failed: ${response.status} ${response.statusText}`)
    }

    return response
  } catch (error) {
    console.error("Authenticated request failed:", error)
    throw error
  }
}

/**
 * Debug function to check authentication state
 */
export const debugAuthState = () => {
  //console.log("=== AUTH DEBUG ===")
  //console.log("Token:", getAuthToken() ? "Present" : "Missing")
  //console.log("User data:", getCurrentUser())
  //console.log("Is authenticated:", isAuthenticated())
  //console.log("Auth headers:", getAuthHeaders())
  //console.log("JWT validation:", validateJWTToken())
  //console.log("================")
}

/**
 * Check if user is super admin
 */
export const isSuperAdmin = () => {
  const currentUser = getCurrentUser()
  
  return currentUser?.role === "superadmin" || currentUser?.role === "super_admin"
}

/**
 * Check if user can manage notifications
 */
export const canManageNotifications = () => {
  return hasPermission("create") || hasPermission("edit")
}

/**
 * Get user context for API requests
 */
export const getUserContext = () => {
  const currentUser = getCurrentUser()
  return {
    userId: currentUser?.id || "",
    userEmail: currentUser?.email || "",
    userRole: currentUser?.role || "",
    isActive: currentUser?.isActive !== false,
  }
}

// Export all functions as default object for easy importing
export default {
  getCurrentUser,
  getAuthToken,
  getAuthHeaders,
  isAuthenticated,
  decodeJWTPayload,
  validateJWTToken,
  hasPermission,
  getRoleDisplayName,
  getPermissionsList,
  handleAuthError,
  clearAuthData,
  setAuthData,
  makeAuthenticatedRequest,
  debugAuthState,
  isSuperAdmin,
  canManageNotifications,
  getUserContext,
}
