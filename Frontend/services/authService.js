// Import the configured base API Axios client
import api from './api';

// Export an authService object containing methods for authentication and session management
export const authService = {
  // Register a new user account on the platform
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // If registration is successful and returns a JWT token, store user session data in localStorage
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Authenticate user with their credentials
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // If credentials are valid and a JWT token is received, store user session data in localStorage
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // End the user's session by removing their session data from localStorage
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // Fetch the current logged-in user's profile details from the server
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Retrieve the locally cached user info from localStorage if available (returns null otherwise)
  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) return JSON.parse(userStr);
    }
    return null;
  },
};
