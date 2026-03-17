import express from 'express';
import { getChatHistory, getMyRooms } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history/:room', protect, getChatHistory);
router.get('/rooms', protect, getMyRooms);

export default router;
