import express from 'express'; // Import Express web framework
import {
  getAttendance,
  markAttendance,
  markBulkAttendance,
  getStudentsByClass,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController.js'; // Import attendance handlers
import { protect, teacher } from '../middleware/authMiddleware.js'; // Import authentication security checks

const router = express.Router(); // Create Express router instance

// Resource routes for attendance collection
router.route('/')
  .get(protect, getAttendance) // Retrieve attendance records (Any authenticated user can read depending on their filters)
  .post(protect, teacher, markAttendance); // Record single attendance record (Requires Teacher role)

// Bulk register class attendance sheet
router.post('/bulk', protect, teacher, markBulkAttendance);

// Retrieve list of registered students in a specific class for attendance checklist
router.get('/students-by-class', protect, teacher, getStudentsByClass);

// Single resource endpoints for target attendance ID
router.route('/:id')
  .put(protect, teacher, updateAttendance) // Modify/justify student absence status
  .delete(protect, teacher, deleteAttendance); // Delete attendance record

export default router; // Export router bundle
