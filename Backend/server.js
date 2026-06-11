// Import required external dependencies
import express from 'express'; // Web application framework for Node.js
import dotenv from 'dotenv'; // Loads environment variables from a .env file
import cors from 'cors'; // Middleware to enable Cross-Origin Resource Sharing
import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Import API route handlers for different features
import authRoutes from './routes/authRoutes.js'; // Authentication routes
import newsRoutes from './routes/newsRoutes.js'; // News management routes
import eventRoutes from './routes/eventRoutes.js'; // Events management routes
import gradeRoutes from './routes/gradeRoutes.js'; // Student grades management routes
import attendanceRoutes from './routes/attendanceRoutes.js'; // Student attendance tracking routes
import stageRoutes from './routes/stageRoutes.js'; // Internship (stages) management routes
import userRoutes from './routes/userRoutes.js'; // User management routes
import departmentRoutes from './routes/departmentRoutes.js'; // Department management routes
import academicRoutes from './routes/academicRoutes.js'; // Academic schedule/courses routes
import chatRoutes from './routes/chatRoutes.js'; // Chat configuration routes
import complaintRoutes from './routes/complaintRoutes.js'; // Student complaints management routes
import notificationRoutes from './routes/notificationRoutes.js'; // Notification management routes

// Import HTTP server and socket.io for real-time web socket communication
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken'; // JSON Web Token utility for token verification
import User from './models/User.js'; // User database model
import { chatHandler } from './socket/chatHandler.js'; // Chat logic event handler

// Utilities to work with file paths in ES Modules environment
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __filename and __dirname since they are not available by default in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize dotenv configuration to access variables in process.env
dotenv.config();

// Create the Express application instance
const app = express();

// Create an HTTP server using the Express app instance
const httpServer = createServer(app);

// Initialize Socket.io server and mount it onto the HTTP server with CORS enabled
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow connections from all origins (adjust for security in production)
    methods: ['GET', 'POST'], // Allowed HTTP methods for CORS requests
  },
});

// Define the port from environment variables, defaulting to 5000 if not specified
const PORT = process.env.PORT || 5000;

// Enable CORS middleware for all routes
app.use(cors());

// Enable JSON parsing middleware to read incoming request bodies (req.body) as JSON objects
app.use(express.json());

// Serve uploads directory statically so uploaded media files can be accessed via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Map route files to base URL endpoints
app.use('/api/auth', authRoutes); // Auth endpoints
app.use('/api/news', newsRoutes); // News endpoints
app.use('/api/events', eventRoutes); // Events endpoints
app.use('/api/grades', gradeRoutes); // Grades endpoints
app.use('/api/attendance', attendanceRoutes); // Attendance endpoints
app.use('/api/stages', stageRoutes); // Internships endpoints
app.use('/api/users', userRoutes); // Users endpoints
app.use('/api/departments', departmentRoutes); // Departments endpoints
app.use('/api/academic', academicRoutes); // Academic endpoints
app.use('/api/chat', chatRoutes); // Chat endpoints
app.use('/api/complaints', complaintRoutes); // Complaints endpoints
app.use('/api/notifications', notificationRoutes); // Notifications endpoints

// Socket.io Middleware to authenticate clients connecting via WebSocket
io.use(async (socket, next) => {
  // Retrieve the authentication token passed during the socket handshake
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error')); // Error if no token provided

  try {
    // Verify the JWT token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find the user associated with the token ID and exclude the password field
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found')); // Error if user does not exist in DB
    // Attach the authenticated user object to the socket session
    socket.user = user;
    next(); // Authenticated successfully, proceed
  } catch (err) {
    next(new Error('Authentication error')); // Catch verification errors
  }
});

// Configure Socket.io connection events
io.on('connection', (socket) => {
  // Log client connection with user's full name
  console.log('New client connected:', socket.user.firstName, socket.user.lastName);
  
  // Register the chat event listeners for this socket connection
  chatHandler(io, socket);
  
  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Connect to MongoDB and start the HTTP server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start listening for incoming network requests
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error('MongoDB connection error:', error));
