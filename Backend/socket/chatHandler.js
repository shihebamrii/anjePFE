import Message from '../models/Message.js'; // Import the Message database model to store chat history

// Define the socket handler to attach listeners to an active client connection
export const chatHandler = (io, socket) => {
  // Listener for when a client requests to join a chat room
  socket.on('join_room', (room) => {
    socket.join(room); // Use Socket.io library's internal room join method
    console.log(`User ${socket.user.id} joined room ${room}`);
  });

  // Listener for handling incoming messages from clients
  socket.on('send_message', async (data) => {
    // Extract room identifier, message content, and type (defaults to 'text') from client payload
    const { room, content, type = 'text' } = data;
    
    try {
      // Create and save the message document in MongoDB using current socket user info
      const newMessage = await Message.create({
        sender: socket.user.id, // Current authenticated user ID
        senderName: `${socket.user.firstName} ${socket.user.lastName}`, // Full name of sender
        senderRole: socket.user.role, // Current user role
        content,
        room,
        type,
      });

      // Query database to populate details like first name, last name, and avatar of sender
      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'firstName lastName avatar');

      // Broadcast the populated message object to everyone connected to the current room
      io.to(room).emit('receive_message', populatedMessage);
    } catch (error) {
      // Log any database/network failures and notify the sender client
      console.error('Socket send_message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Listener for when a user starts typing in a chat room
  socket.on('typing', (data) => {
    // Broadcast the event to other users in the room, excluding the sender
    socket.to(data.room).emit('user_typing', {
      userId: socket.user.id,
      userName: `${socket.user.firstName} ${socket.user.lastName}`,
    });
  });

  // Listener for when a user stops typing in a chat room
  socket.on('stop_typing', (data) => {
    // Broadcast the stop typing event to other users in the room
    socket.to(data.room).emit('user_stop_typing', {
      userId: socket.user.id,
    });
  });

  // Listener for when a client explicitly leaves a chat room
  socket.on('leave_room', (room) => {
    socket.leave(room); // Remove socket from the specified room channel
    console.log(`User ${socket.user.id} left room ${room}`);
  });
};
