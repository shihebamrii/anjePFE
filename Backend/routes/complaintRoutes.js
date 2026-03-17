import express from 'express';
import { createComplaint, getComplaints, resolveComplaint } from '../controllers/complaintController.js';
import { protect, chefDept } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getComplaints)
  .post(protect, createComplaint);

router.put('/:id/resolve', protect, chefDept, resolveComplaint);

export default router;
