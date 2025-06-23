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
  try {
    const res = await fetch(API_BASE, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
    return data;
  } catch (err) {
    console.error("Error fetching courses:", err);
    throw err;
  }
}

// 2. Create a new course (requires: editor/superadmin)
export async function createCourse(courseData, token) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(courseData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create course');
    return data;
  } catch (err) {
    console.error("Error creating course:", err);
    throw err;
  }
}

// 3. Update course by ID (requires: editor/superadmin)
export async function updateCourse(id, updatedData, token) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updatedData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update course');
    return data;
  } catch (err) {
    console.error("Error updating course:", err);
    throw err;
  }
}

// 4. Delete course by ID (requires: superadmin only)
export async function deleteCourse(id, token) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete course');
    return data;
  } catch (err) {
    console.error("Error deleting course:", err);
    throw err;
  }
}
