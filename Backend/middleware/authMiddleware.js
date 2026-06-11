import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token creation and verification
import User from '../models/User.js'; // Import the User model to query database users

// Middleware function to protect routes from unauthenticated requests
export const protect = async (req, res, next) => {
  let token; // Initialize a variable to hold the parsed token

  // Check if authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token string from the header (format: "Bearer <token_value>")
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Look up the user by the ID stored in the verified token, excluding the password field
      req.user = await User.findById(decoded.id).select('-password');

      // If the user no longer exists in the database, return a 401 Unauthorized response
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Proceed to the next middleware or route controller
      next();
    } catch (error) {
      // Log authentication error details and return 401 response
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token was found in the headers, deny access
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware function to restrict access to ADMIN or CHEF_DEPT roles
export const admin = (req, res, next) => {
  // Check if user object exists and role is ADMIN or CHEF_DEPT
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'CHEF_DEPT')) {
    next(); // Access granted, proceed
  } else {
    // Access denied, return 403 Forbidden
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Middleware function to restrict access to CHEF_DEPT or ADMIN roles
export const chefDept = (req, res, next) => {
  // Check if user object exists and role is CHEF_DEPT or ADMIN
  if (req.user && (req.user.role === 'CHEF_DEPT' || req.user.role === 'ADMIN')) {
    next(); // Access granted, proceed
  } else {
    // Access denied, return 403 Forbidden
    return res.status(403).json({ message: 'Not authorized as a department head' });
  }
};

// Middleware function to restrict access to TEACHER, ADMIN, or CHEF_DEPT roles
export const teacher = (req, res, next) => {
  // Check if user object exists and role matches teacher, admin, or department head
  if (req.user && (req.user.role === 'TEACHER' || req.user.role === 'ADMIN' || req.user.role === 'CHEF_DEPT')) {
    next(); // Access granted, proceed
  } else {
    // Access denied, return 403 Forbidden
    return res.status(403).json({ message: 'Not authorized as a teacher' });
  }
};
