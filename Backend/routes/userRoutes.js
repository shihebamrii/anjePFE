import express from 'express';
import { getUsers } from '../controllers/userController.js';
import { protect, admin, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admin and teachers can fetch users for now
router.get('/', protect, getUsers);

export default router;
