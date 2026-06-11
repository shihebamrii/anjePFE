import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Define the database schema representing a scheduled class Session (Séance de cours)
const sessionSchema = new mongoose.Schema(
  {
    // Reference to the main Course (Matière) document
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    // Plain text course name cached for immediate display
    courseName: {
      type: String,
    },
    // Sub-document holding teacher reference details
    teacher: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference User ID
      name: { type: String }, // Full name of the teacher
    },
    // Sub-document holding classroom details
    room: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // Reference Room ID
      name: { type: String }, // Classroom label (e.g. Salle 105)
    },
    // Identification reference code for the class cohort (supports mixed formats)
    classId: {
      type: mongoose.Schema.Types.Mixed, // External string ID (e.g., from Excel sheet) or Internal ObjectId
    },
    // Section/class name (e.g. DSI 3.1)
    className: {
      type: String,
    },
    // Category type of session (e.g. COURS/LECTURE, TD/TUTORIAL, TP/PRACTICAL)
    type: {
      type: String, // e.g., "LECTURE", "TUTORIAL", "PRACTICAL"
      default: 'LECTURE',
    },
    // Scheduled weekday index
    dayOfWeek: {
      type: Number, // 1 (Monday) to 6 (Saturday) - matches Tunisian standard academic calendar
      required: true,
    },
    // Scheduled time period index
    timeSlot: {
      type: Number, // 1 to 6 (1=08:30, 2=10:10, 3=11:50, 4=14:00, 5=15:40, 6=17:20)
      required: true,
    },
    // Target academic semester duration term
    semester: {
      type: Number,
      default: 1,
    },
    // Optional sub-group classification for lab work (TP groups)
    group: {
      type: String,
      default: '', // e.g. "Groupe 1", "Groupe 2"
    },
    // ID reference mapping key matching administration database sync records
    externalId: {
       type: String,
    }
  },
  // Automatically add 'createdAt' and 'updatedAt' database timestamps
  { timestamps: true }
);

// Create the model
const Session = mongoose.model('Session', sessionSchema);
export default Session;
