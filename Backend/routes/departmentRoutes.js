import express from 'express';
import {
  getDepartments,
  getDepartment,
  getMyDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  addClass,
  updateClass,
  deleteClass,
  addBulkStudents,
} from '../controllers/departmentController.js';
import { protect, admin, chefDept } from '../middleware/authMiddleware.js';

const router = express.Router();

// /my must come before /:id to avoid treating "my" as an ObjectId
router.get('/my', protect, getMyDepartment);
router.get('/', getDepartments); // public access for homepage
router.get('/:id', protect, getDepartment);

// Global Department CRUD (admin only)
router.post('/', protect, admin, createDepartment);
router.put('/:id', protect, admin, updateDepartment);
router.delete('/:id', protect, admin, deleteDepartment);

// Teacher CRUD (chef only)
router.post('/my/teachers', protect, chefDept, addTeacher);
router.put('/my/teachers/:teacherId', protect, chefDept, updateTeacher);
router.delete('/my/teachers/:teacherId', protect, chefDept, deleteTeacher);

// Class CRUD (chef only)
router.post('/my/classes', protect, chefDept, addClass);
router.post('/my/classes/:classId/students/bulk', protect, chefDept, addBulkStudents);
router.put('/my/classes/:classId', protect, chefDept, updateClass);
router.delete('/my/classes/:classId', protect, chefDept, deleteClass);

export default router;
