import User from '../models/User.js';

// @desc    Get all users (filtered by role optionally)
// @route   GET /api/users
// @access  Private/Admin/Teacher
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }
    
    // Teachers can typically only see students
    if (req.user.role === 'TEACHER') {
      query.role = 'STUDENT';
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
