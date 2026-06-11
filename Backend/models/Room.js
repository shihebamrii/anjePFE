import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Define the database schema for university Classrooms or Lab Rooms (Salles)
const roomSchema = new mongoose.Schema(
  {
    // Name or number of the classroom (e.g. "Amphi A", "Salle 102")
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Seat capacity threshold of the room
    capacity: {
      type: Number,
      default: 0,
    },
    // Category type of the room (e.g. COURS/Lecture, TP/Lab, TD/Tutorial, Amphi/Amphitheater)
    type: {
      type: String,
      default: 'COURS',
    },
    // Campus block or building designation (e.g. Block A)
    building: {
      type: String,
      default: '',
    },
    // Floor level index (0 = Ground floor, 1 = First floor, etc.)
    floor: {
      type: Number,
      default: 0,
    },
    // Availability flag (active/inactive state for scheduling sessions)
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Reference ID from administration systems or Excel sheet syncs
    externalId: {
      type: String,
      unique: true,
    },
  },
  // Automatically add 'createdAt' and 'updatedAt' database timestamps
  { timestamps: true }
);

// Create the model
const Room = mongoose.model('Room', roomSchema);

export default Room;
