import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Define the database schema for chat Messages within rooms/channels
const messageSchema = new mongoose.Schema(
  {
    // Reference link to the User document who sent the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Cache name of the sender for immediate display without querying User
    senderName: {
      type: String,
      required: true,
    },
    // Role of the sender at the time the message was created (e.g. STUDENT, TEACHER)
    senderRole: {
      type: String,
      required: true,
    },
    // Text contents or file URL reference of the message
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // Target room or channel identifier where message is broadcasted
    room: {
      type: String, // e.g., 'general', 'class_123', 'dept_engineering'
      required: true,
      index: true, // Index for fast filtering of room history
    },
    // Format type of the message: plain text, image URL, or general file download
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
  },
  // Automatically add 'createdAt' and 'updatedAt' database timestamps
  { timestamps: true }
);

// Create the model
const Message = mongoose.model('Message', messageSchema);
export default Message;
