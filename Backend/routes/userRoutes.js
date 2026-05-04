import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, admin, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admin and teachers can fetch users for now
router.get('/', protect, getUsers);
router.post('/', protect, admin, createUser);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

export default router;
