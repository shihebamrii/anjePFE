import api from './api';

export const departmentService = {
  getMyDepartment: async () => {
    const res = await api.get('/departments/my');
    return res.data;
  },
  getAllDepartments: async () => {
    const res = await api.get('/departments');
    return res.data;
  },
  getDepartment: async (id) => {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },

  // Teacher CRUD
  addTeacher: async (data) => {
    const res = await api.post('/departments/my/teachers', data);
    return res.data;
  },
  updateTeacher: async (teacherId, data) => {
    const res = await api.put(`/departments/my/teachers/${teacherId}`, data);
    return res.data;
  },
  deleteTeacher: async (teacherId) => {
    const res = await api.delete(`/departments/my/teachers/${teacherId}`);
    return res.data;
  },

  // Class CRUD
  addClass: async (data) => {
    const res = await api.post('/departments/my/classes', data);
    return res.data;
  },
  updateClass: async (classId, data) => {
    const res = await api.put(`/departments/my/classes/${classId}`, data);
    return res.data;
  },
  deleteClass: async (classId) => {
    const res = await api.delete(`/departments/my/classes/${classId}`);
    return res.data;
  },
  addBulkStudents: async (classId, studentsArray) => {
    const res = await api.post(`/departments/my/classes/${classId}/students/bulk`, {
      students: studentsArray
    });
    return res.data;
  },
};
