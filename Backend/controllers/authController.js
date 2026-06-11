import jwt from 'jsonwebtoken'; // Import jwt for token handling
import User from '../models/User.js'; // Import User model to retrieve credentials

// Helper function to generate a JSON Web Token (JWT) expiring in 30 days
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body; // Extract registration info from request body

    // Check if a user with the given email already exists in the database
    const userExists = await User.findOne({ email });

    if (userExists) {
      // If user exists, return 400 Bad Request
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create the new User document. Note: password will be hashed by the pre-save schema middleware
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'STUDENT', // Defaults to 'STUDENT' if no role specified
    });

    if (user) {
      // If user was successfully created, respond with user details and a fresh auth token
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // Extract login credentials from request body

    // Look up the user by email, explicitly requesting the password field which is hidden by default
    const user = await User.findOne({ email }).select('+password');

    // If the user exists and the candidate password matches the database hash
    if (user && (await user.comparePassword(password))) {
      // Respond with profile details and an auth token
      return res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        classId: user.classId,
        className: user.className,
        registrationNumber: user.registrationNumber,
        studentId: user.studentId,
        token: generateToken(user._id),
      });
    }

    // If verification fails, return a 401 Unauthorized status
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    // Look up the profile of the currently logged-in user from the database
    const user = await User.findById(req.user._id);

    if (user) {
      // Respond with the user's profile details
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
