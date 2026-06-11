import express from 'express'; // Import express framework
import { registerUser, loginUser, getProfile } from '../controllers/authController.js'; // Import authentication controller handlers
import { protect } from '../middleware/authMiddleware.js'; // Import the protect security middleware

const router = express.Router(); // Create a new router instance

router.post('/register', registerUser); // Endpoint to register a new user profile (Public)
router.post('/login', loginUser); // Endpoint to authenticate credentials and issue a token (Public)
router.get('/profile', protect, getProfile); // Endpoint to retrieve profile details of the current logged-in user (Private)

export default router; // Export the routing configuration bundle
