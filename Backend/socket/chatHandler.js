import Message from '../models/Message.js';

export const chatHandler = (io, socket) => {
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.user.id} joined room ${room}`);
  });

  socket.on('send_message', async (data) => {
    const { room, content, type = 'text' } = data;
    
    try {
      const newMessage = await Message.create({
        sender: socket.user.id,
        senderName: `${socket.user.firstName} ${socket.user.lastName}`,
        senderRole: socket.user.role,
        content,
        room,
        type,
      });

      // Populate sender info for the broadcast
      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'firstName lastName avatar');

      io.to(room).emit('receive_message', populatedMessage);
    } catch (error) {
      console.error('Socket send_message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('user_typing', {
      userId: socket.user.id,
      userName: `${socket.user.firstName} ${socket.user.lastName}`,
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.room).emit('user_stop_typing', {
      userId: socket.user.id,
    });
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`User ${socket.user.id} left room ${room}`);
  });
};
