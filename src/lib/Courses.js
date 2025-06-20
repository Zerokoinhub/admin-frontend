const API_BASE = 'http://localhost:5000/api/courses';

// Helper to get headers with Authorization token
function getAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// 1. Get all courses (requires: viewer/editor/superadmin)
export async function getCourses(token) {
  const res = await fetch(API_BASE, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

// 2. Get course by ID (requires: viewer/editor/superadmin)
export async function getCourseById(id, token) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!res.ok) throw new Error('Failed to fetch course');
  return res.json();
}

// 3. Create a new course (requires: editor/superadmin)
export async function createCourse(courseData, token) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(courseData),
  });

  if (!res.ok) throw new Error('Failed to create course');
  return res.json();
}

// 4. Update course by ID (requires: editor/superadmin)
export async function updateCourse(id, updatedData, token) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) throw new Error('Failed to update course');
  return res.json();
}

// 5. Delete course by ID (requires: superadmin only)
export async function deleteCourse(id, token) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!res.ok) throw new Error('Failed to delete course');
  return res.json();
}
