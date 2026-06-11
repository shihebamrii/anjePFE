import express from 'express'; // Import express web framework
import { createComplaint, getComplaints, resolveComplaint } from '../controllers/complaintController.js'; // Import complaints handlers
import { protect, chefDept } from '../middleware/authMiddleware.js'; // Import authentication middleware rules

const router = express.Router(); // Create Express router instance

// Resource routes for complaints collection
router.route('/')
  .get(protect, getComplaints) // Retrieve complaints list (Students see their own, administrators see all)
  .post(protect, createComplaint); // Submit a new grade complaint (Only students are permitted)

// Resolve a pending grade dispute (Only Department heads or system administrators are authorized)
router.put('/:id/resolve', protect, chefDept, resolveComplaint);

export default router; // Export complaints routing configuration bundle
