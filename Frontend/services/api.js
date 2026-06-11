// Import the Axios library for making HTTP requests
import axios from 'axios';

// Define the base API URL using environment variables, defaulting to localhost if not specified
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create a configured instance of Axios
const api = axios.create({
  baseURL: API_URL, // Base URL for all request paths (e.g. /users, /auth)
  headers: {
    'Content-Type': 'application/json', // Default headers indicating JSON content type
  },
});

// Request interceptor: runs automatically before every outgoing request
api.interceptors.request.use(
  (config) => {
    // If running in the browser context (not SSR), retrieve the auth token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // If a token exists, attach it to the request authorization header as a Bearer token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Return the updated config to proceed with the request
    return config;
  },
  // If request setup fails, reject the promise with the error
  (error) => Promise.reject(error)
);

// Response interceptor: runs automatically on receiving responses
api.interceptors.response.use(
  // If response is successful, pass it through directly
  (response) => response,
  // If response returns an error status code
  (error) => {
    // Check if error status is 401 (Unauthorized - token expired or invalid)
    if (error.response && error.response.status === 401) {
      // If in browser context, clear stored auth details and redirect user to login page
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    // Reject the promise with the error so calling functions can handle it locally
    return Promise.reject(error);
  }
);

// Export the customized Axios instance
export default api;
