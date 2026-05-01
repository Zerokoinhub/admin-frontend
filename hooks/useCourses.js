// lib/auth.js
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.error("No token found");
    return null;
  }

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    return response;
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
};
