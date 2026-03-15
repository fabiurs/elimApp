// Get the base URL for API calls
export const getApiBaseUrl = () => {
  // In development with Vite proxy, use relative path
  if (import.meta.env.DEV) {
    return '';
  }
  // In production, use the backend URL from environment variable
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
};

// Construct full API URL
export const apiUrl = (endpoint) => {
  return `${getApiBaseUrl()}${endpoint}`;
};
