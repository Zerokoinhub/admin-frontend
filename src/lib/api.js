const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Generic fetcher function to get data from the API
 * @param {string} endpoint - API endpoint (e.g., "/users")
 * @returns {Promise<any>} - The response data
 */
export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API fetch error:', error.message);
    throw error;
  }
}
