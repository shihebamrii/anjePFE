// Import the configured base API Axios client
import api from './api';

// Export a userService object containing methods for CRUD operations on user accounts
export const userService = {
  // Fetch users, with optional filtering by role (e.g. STUDENT, TEACHER)
  getUsers: async (role = '') => {
    const query = role ? `?role=${role}` : '';
    const response = await api.get(`/users${query}`);
    return response.data;
  },
  
  // Create a new user account (Admin only)
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  // Update an existing user's details by their database ID (Admin only)
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  // Delete/remove a user account by their database ID (Admin only)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
