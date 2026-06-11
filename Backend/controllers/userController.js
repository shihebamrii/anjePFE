// Import the User Mongoose model representing users/accounts in the database
import User from '../models/User.js';

// @desc    Get all users (filtered by role optionally)
// @route   GET /api/users
// @access  Private/Admin/Teacher
export const getUsers = async (req, res) => {
  try {
    // Read the role filter from query parameters if provided
    const { role } = req.query;
    
    // Initialize an empty query object
    let query = {};
    if (role) {
      query.role = role;
    }
    
    // Safety check: if the logged-in user is a TEACHER, restrict them to only viewing STUDENTS
    if (req.user.role === 'TEACHER') {
      query.role = 'STUDENT';
    }

    // Query the database for users, excluding the password field for security
    const users = await User.find(query).select('-password');
    
    // Respond with the list of users as JSON
    res.json(users);
  } catch (error) {
    // Send 500 server error status on failure
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user account
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    // Destructure registration details from the request body
    const { firstName, lastName, email, password, role, department, isActive } = req.body;
    
    // Check if a user with the specified email already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create the new user. If isActive is not explicitly provided, default it to true
    const user = await User.create({
      firstName, lastName, email, password, role, department, isActive: isActive !== undefined ? isActive : true
    });
    
    // Fetch the newly created user and exclude the password field before returning the response
    const userWithoutPassword = await User.findById(user._id).select('-password');
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    // Return a 500 status code on error
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details by ID
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    // Destructure update details from the request body
    const { firstName, lastName, email, role, department, password, isActive } = req.body;
    
    // Look up the user by the ID passed in the route parameters
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if new values are supplied in the request body
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    
    // If password is provided, assign it to the user object (it will be hashed by the User model's pre-save middleware)
    if (password) user.password = password; 
    if (isActive !== undefined) user.isActive = isActive;

    // Save the changes back to the database
    await user.save();
    
    // Fetch the updated user document without the password field
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    // Return a 500 status code on error
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user account by ID
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete the user record from the database
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User removed' });
  } catch (error) {
    // Return a 500 status code on error
    res.status(500).json({ message: error.message });
  }
};
