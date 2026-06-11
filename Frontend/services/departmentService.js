// Import the configured base API Axios client
import api from './api';

// Export a departmentService object containing methods for department, teacher, and class administration
export const departmentService = {
  // Fetch details of the department belonging to the logged-in Department Head (CHEF_DEPT)
  getMyDepartment: async () => {
    const res = await api.get('/departments/my');
    return res.data;
  },
  
  // Fetch all departments in the university portal
  getAllDepartments: async () => {
    const res = await api.get('/departments');
    return res.data;
  },
  
  // Fetch details of a single department using its ID
  getDepartment: async (id) => {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },
  
  // Create/add a new department (Admin access)
  createDepartment: async (data) => {
    const res = await api.post('/departments', data);
    return res.data;
  },
  
  // Update an existing department details by its ID (Admin access)
  updateDepartment: async (id, data) => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },
  
  // Delete/remove a department by its ID (Admin access)
  deleteDepartment: async (id) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },

  // --- Teacher Management (Department Head context) ---
  
  // Add a new teacher to the department head's department
  addTeacher: async (data) => {
    const res = await api.post('/departments/my/teachers', data);
    return res.data;
  },
  
  // Update details of a teacher by their teacherId
  updateTeacher: async (teacherId, data) => {
    const res = await api.put(`/departments/my/teachers/${teacherId}`, data);
    return res.data;
  },
  
  // Remove/delete a teacher from the department
  deleteTeacher: async (teacherId) => {
    const res = await api.delete(`/departments/my/teachers/${teacherId}`);
    return res.data;
  },

  // --- Class Group Management (Department Head context) ---
  
  // Add a new class group (e.g., DSI31) to the department
  addClass: async (data) => {
    const res = await api.post('/departments/my/classes', data);
    return res.data;
  },
  
  // Update a class group details by classId
  updateClass: async (classId, data) => {
    const res = await api.put(`/departments/my/classes/${classId}`, data);
    return res.data;
  },
  
  // Delete a class group by classId
  deleteClass: async (classId) => {
    const res = await api.delete(`/departments/my/classes/${classId}`);
    return res.data;
  },
  
  // Add multiple students to a class group at once using an array of student data
  addBulkStudents: async (classId, studentsArray) => {
    const res = await api.post(`/departments/my/classes/${classId}/students/bulk`, {
      students: studentsArray
    });
    return res.data;
  },
};
