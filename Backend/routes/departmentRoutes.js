import express from 'express'; // Import express web framework
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
} from '../controllers/departmentController.js'; // Import department controller actions
import { protect, admin, chefDept } from '../middleware/authMiddleware.js'; // Import authorization guards

const router = express.Router(); // Initialize a new router instance

// /my must come before /:id to avoid treating "my" as a parameter ObjectId
router.get('/my', protect, getMyDepartment); // Retrieve department details of logged-in chef (Private/ChefDept)
router.get('/', getDepartments); // Retrieve all departments overview metadata (Public access for home navigation)
router.get('/:id', protect, getDepartment); // Retrieve full details of a specific department (Private)

// Global Department CRUD (Admin authorization required)
router.post('/', protect, admin, createDepartment); // Add a new department profile
router.put('/:id', protect, admin, updateDepartment); // Update/edit an existing department's details
router.delete('/:id', protect, admin, deleteDepartment); // Remove a department profile

// Teacher CRUD (Chef de Département authorization required)
router.post('/my/teachers', protect, chefDept, addTeacher); // Add a new teacher profile to department array list
router.put('/my/teachers/:teacherId', protect, chefDept, updateTeacher); // Edit/modify existing department teacher's details
router.delete('/my/teachers/:teacherId', protect, chefDept, deleteTeacher); // Remove teacher profile from department array list

// Class CRUD (Chef de Département authorization required)
router.post('/my/classes', protect, chefDept, addClass); // Add a new student class group section to department
router.post('/my/classes/:classId/students/bulk', protect, chefDept, addBulkStudents); // Import multiple students into a class group
router.put('/my/classes/:classId', protect, chefDept, updateClass); // Edit/modify student class section details
router.delete('/my/classes/:classId', protect, chefDept, deleteClass); // Remove class group section

export default router; // Export router configuration bundle
