import express from 'express'; // Import express web framework
import { getChatHistory, getMyRooms } from '../controllers/chatController.js'; // Import chat controller methods
import { protect } from '../middleware/authMiddleware.js'; // Import route protection middleware

const router = express.Router(); // Initialize a new router instance

router.get('/history/:room', protect, getChatHistory); // Endpoint to fetch chat message logs for a specific room (Private)
router.get('/rooms', protect, getMyRooms); // Endpoint to retrieve list of active chat rooms available to current user (Private)

export default router; // Export router configuration bundle
