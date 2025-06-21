const ADMIN_API_BASE = "http://localhost:5000/api/admin/"

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
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

// Helper function to handle API responses
const handleApiResponse = async (response, operation) => {
  if (!response.ok) {
    const errorText = await response.text()
    console.error(`${operation} failed:`, {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    })

    // Try to parse error message from response
    try {
      const errorData = JSON.parse(errorText)
      throw new Error(errorData.message || errorData.error || `${operation} failed`)
    } catch {
      throw new Error(`${operation} failed: ${response.status} ${response.statusText}`)
    }
  }

  const data = await response.json()
  console.log(`${operation} response:`, data)
  return data
}

// ✅ 1. Login Admin
export async function loginAdmin({ email, password }) {
  try {
    console.log("Attempting admin login for:", email)

    const res = await fetch(`${ADMIN_API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })

    const data = await handleApiResponse(res, "Admin login")

    // Store token if provided
    if (data.token) {
      localStorage.setItem("token", data.token)
    }

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

// ✅ 2. Register Admin
export async function registerAdmin(adminData) {
  try {
    console.log("Registering new admin:", adminData.email)

    const res = await fetch(`${ADMIN_API_BASE}/register`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(adminData),
    })

    return await handleApiResponse(res, "Admin registration")
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

// ✅ 3. Get all admins
export async function getAllAdmins() {
  try {
    console.log("Fetching all admins...")

    const res = await fetch(ADMIN_API_BASE, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    })

    const data = await handleApiResponse(res, "Fetch all admins")
    console.log(data);
    // Handle different response structures
    if (data.success && data.admins) {
      console.log(`Found ${data.admins.length} admins`)
      return data.admins
    }

    // If data is directly an array
    if (Array.isArray(data)) {
      console.log(`Found ${data.length} admins (direct array)`)
      return data
    }

    // If data has a different structure
    if (data.data && Array.isArray(data.data)) {
      console.log(`Found ${data.data.length} admins (data.data)`)
      return data.data
    }

    console.warn("Unexpected response structure:", data)
    return []
  } catch (error) {
    console.error("Get all admins error:", error)
    throw error
  }
}

// ✅ 4. Get single admin by ID
export async function getAdminById(id) {
  try {
    console.log("Fetching admin by ID:", id)

    const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    })

    const data = await handleApiResponse(res, "Fetch admin by ID")

    // Handle nested response structure
    if (data.success && data.admin) {
      return data.admin
    }

    return data
  } catch (error) {
    console.error("Get admin by ID error:", error)
    throw error
  }
}

// ✅ 5. Create admin (alternative to registerAdmin)
export async function createAdmin(adminData) {
  try {
    console.log("Creating new admin:", adminData.email);

    const res = await fetch(`${ADMIN_API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(adminData),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Admin creation failed");
    }

    // ✅ Expected structure from your API response
    console.log("Admin created successfully:", data.data.admin.email);
    return data.data.admin;
  } catch (error) {
    console.error("Create admin error:", error.message);
    throw error;
  }
}


// ✅ 6. Update admin by ID
export async function updateAdmin(id, adminData) {
  try {
    //console.log("Updating admin:", id, adminData)

    const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(adminData),
    })

    const data = await handleApiResponse(res, "Update admin")

    // Handle nested response structure
    if (data.success && data.admin) {
      //console.log("Admin updated successfully:", data.admin.email)
      return data.admin
    }

    // Handle direct response
    if (data.email || data._id) {
      //console.log("Admin updated successfully:", data.email)
      return data
    }

    //console.log("Admin updated with response:", data)
    return data
  } catch (error) {
    console.error("Update admin error:", error)
    throw error
  }
}

// ✅ 7. Delete admin by ID
export async function deleteAdmin(id) {
  try {
    //console.log("Deleting admin:", id)

    const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    })

    const data = await handleApiResponse(res, "Delete admin")
    console.log("Admin deleted successfully")
    return data
  } catch (error) {
    console.error("Delete admin error:", error)
    throw error
  }
}

// ✅ 8. Logout Admin (bonus function)
export async function logoutAdmin() {
  try {
    console.log("Logging out admin...")

    const res = await fetch(`${ADMIN_API_BASE}/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    })

    // Clear token from localStorage
    localStorage.removeItem("token")

    if (res.ok) {
      const data = await res.json()
      console.log("Logout successful")
      return data
    } else {
      console.log("Logout endpoint not available, cleared local token")
      return { success: true, message: "Logged out locally" }
    }
  } catch (error) {
    console.error("Logout error:", error)
    // Still clear the token even if logout fails
    localStorage.removeItem("token")
    throw error
  }
}

// ✅ 9. Check if user is authenticated
export function isAuthenticated() {
  return !!getAuthToken()
}

// ✅ 10. Get current user info from token (if needed)
export function getCurrentUser() {
  const token = getAuthToken()
  if (!token) return null

  try {
    // If your token is JWT, you can decode it
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}
