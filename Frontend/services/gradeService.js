// Import the configured base API Axios client
import api from './api';

// Export a gradeService object containing methods to manage student academic grades
export const gradeService = {
  // Fetch grades with optional filters for semester and specific student ID
  getGrades: async (semester = '', studentId = '') => {
    // Construct query parameters dynamically
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester);
    if (studentId) params.append('studentId', studentId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    // Send a GET request to retrieve student grades
    const response = await api.get(`/grades${query}`);
    return response.data;
  },

  // Save/add a grade for a student manually
  addGrade: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },

  // Delete/remove a grade entry by its database ID
  deleteGrade: async (id) => {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  },

  // Upload grades in bulk by sending an Excel spreadsheet (requires multipart/form-data)
  bulkUploadGrades: async (formData) => {
    const response = await api.post('/grades/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
