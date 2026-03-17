import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware (also allows CHEF_DEPT)
export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'CHEF_DEPT')) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Chef de Département middleware
export const chefDept = (req, res, next) => {
  if (req.user && (req.user.role === 'CHEF_DEPT' || req.user.role === 'ADMIN')) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as a department head' });
  }
};

// Teacher middleware
export const teacher = (req, res, next) => {
  if (req.user && (req.user.role === 'TEACHER' || req.user.role === 'ADMIN' || req.user.role === 'CHEF_DEPT')) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as a teacher' });
  }
};
