const ADMIN_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL + "/admin";

// Get auth token from localStorage
const getAuthToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

// Create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle API responses
const handleApiResponse = async (response, operation) => {
  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    console.error(`${operation} failed: Invalid JSON response`);
    throw new Error(`${operation} failed: ${text}`);
  }

  if (!response.ok || (data && data.success === false)) {
    console.error(`${operation} failed`, {
      status: response.status,
      error: data.message || data.error || response.statusText,
    });
    throw new Error(data.message || data.error || `${operation} failed`);
  }

  console.log(`${operation} response:`, data);
  return data;
};

// ✅ 1. Login Admin
export async function loginAdmin({ email, password }) {
  const res = await fetch(`${ADMIN_API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await handleApiResponse(res, "Admin login");

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

// ✅ 2. Register Admin
export async function registerAdmin(adminData) {
  const res = await fetch(`${ADMIN_API_BASE}/register`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(adminData),
  });

  return await handleApiResponse(res, "Admin registration");
}

// ✅ 3. Get all admins
export async function getAllAdmins() {
  const res = await fetch(`${ADMIN_API_BASE}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  const data = await handleApiResponse(res, "Fetch all admins");

  if (data.success && data.admins) return data.admins;
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;

  return [];
}

// ✅ 4. Get single admin by ID
export async function getAdminById(id) {
  const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  const data = await handleApiResponse(res, "Fetch admin by ID");
  return data.admin || data;
}

// ✅ 5. Create admin (alias to registerAdmin)
export async function createAdmin(adminData) {
  const res = await fetch(`${ADMIN_API_BASE}/register`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(adminData),
  });

  const data = await handleApiResponse(res, "Create admin");

  return data?.data?.admin || data.admin || data;
}

// ✅ 6. Update admin by ID
export async function updateAdmin(id, adminData) {
  const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(adminData),
  });

  const data = await handleApiResponse(res, "Update admin");

  return data?.admin || data;
}

// ✅ 7. Delete admin by ID
export async function deleteAdmin(id) {
  const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  return await handleApiResponse(res, "Delete admin");
}

// ✅ 8. Logout Admin
export async function logoutAdmin() {
  const res = await fetch(`${ADMIN_API_BASE}/logout`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  localStorage.removeItem("token");

  if (res.ok) return await res.json();
  return { success: true, message: "Logged out locally" };
}

// ✅ 9. Check if user is authenticated
export function isAuthenticated() {
  return !!getAuthToken();
}

// ✅ 10. Get current user from JWT
export function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Token decode failed:", err);
    return null;
  }
}
