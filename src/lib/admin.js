const ADMIN_API_BASE = "http://localhost:5000/api/admin";

// ✅ 1. Login Admin
export async function loginAdmin({ email, password }) {
  const res = await fetch(`${ADMIN_API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

// ✅ 2. Register Admin
export async function registerAdmin(adminData) {
  const res = await fetch(`${ADMIN_API_BASE}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(adminData),
  });

  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

// ✅ 3. Get single admin by ID
export async function getAdminById(id) {
  const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch admin");
  return res.json();
}

// ✅ 4. Create admin (alternative to registerAdmin)
export async function createAdmin(adminData) {
  const res = await fetch(ADMIN_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(adminData),
  });

  if (!res.ok) throw new Error("Failed to create admin");
  return res.json();
}

// ✅ 5. Update admin by ID
export async function updateAdmin(id, adminData) {
  const res = await fetch(`${ADMIN_API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(adminData),
  });

  if (!res.ok) throw new Error("Failed to update admin");
  return res.json();
}
