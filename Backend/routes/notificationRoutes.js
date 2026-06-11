// Import the Express framework to build our router
import express from 'express';
// Import the controller function that handles fetching notifications
import { getNotifications } from '../controllers/notificationController.js';
// Import the authentication middleware to secure the routes
import { protect } from '../middleware/authMiddleware.js';

// Create a new router instance
const router = express.Router();

// Define a GET route at '/' (which maps to /api/notifications/)
// It uses the 'protect' middleware to make sure the user is logged in
// and then calls 'getNotifications' to retrieve notifications for that user
router.get('/', protect, getNotifications);

// Export the router so it can be registered in the main server application
export default router;
