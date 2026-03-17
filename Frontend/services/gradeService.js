import api from './api';

export const gradeService = {
  getGrades: async (semester = '', studentId = '') => {
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester);
    if (studentId) params.append('studentId', studentId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/grades${query}`);
    return response.data;
  },

  addGrade: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },

  deleteGrade: async (id) => {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  },

  bulkUploadGrades: async (formData) => {
    const response = await api.post('/grades/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
