import api from './api';

export const attendanceService = {
  getAttendance: async (date = '', studentId = '') => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (studentId) params.append('studentId', studentId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/attendance${query}`);
    return response.data;
  },

  markAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  markBulkAttendance: async (data) => {
    const response = await api.post('/attendance/bulk', data);
    return response.data;
  },

  getStudentsByClass: async (className) => {
    const response = await api.get(`/attendance/students-by-class?className=${encodeURIComponent(className)}`);
    return response.data;
  },

  updateAttendance: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  deleteAttendance: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
};
