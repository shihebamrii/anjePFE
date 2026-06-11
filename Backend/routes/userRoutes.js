// Import the Express framework
import express from 'express';
// Import user CRUD controller functions from userController
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
// Import authorization and middleware checks:
// protect (checks log in), admin (requires Admin role), teacher (requires Teacher role)
import { protect, admin, teacher } from '../middleware/authMiddleware.js';

// Create a new router instance
const router = express.Router();

// Define a GET route at '/' to fetch users. Access is granted to logged-in users who pass the check in protect
router.get('/', protect, getUsers);

// Define a POST route at '/' to create a new user. Restricted to Admins only
router.post('/', protect, admin, createUser);

// Define a PUT route at '/:id' to update user details by ID. Restricted to Admins only
router.put('/:id', protect, admin, updateUser);

// Define a DELETE route at '/:id' to delete a user by ID. Restricted to Admins only
router.delete('/:id', protect, admin, deleteUser);

// Export the router
export default router;
