import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Define the database schema for student attendance records
const attendanceSchema = new mongoose.Schema(
  {
    // Reference to the Student (User document)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to the Teacher who recorded the attendance (User document)
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Name or title of the subject/course
    courseName: {
      type: String,
      required: true,
    },
    // Date of the class session
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Duration of the class session in hours (e.g. 1.5 hours)
    durationHours: {
      type: Number,
      required: true,
      default: 1.5,
    },
    // Attendance status (Present, Absent, Late, or Excused)
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
      required: true,
      default: 'ABSENT',
    },
    // Type of teaching session (Lecture/COURS, Tutorial/TD, Practical Work/TP, or Exam)
    sessionType: {
      type: String,
      enum: ['COURS', 'TD', 'TP', 'EXAM'],
      default: 'COURS',
    },
    // Text description justifying an absence (if provided by the student)
    justification: {
      type: String,
      default: '',
    },
    // Flag indicating whether the absence has been officially approved/justified
    justified: {
      type: Boolean,
      default: false,
    },
  },
  // Automatically add 'createdAt' and 'updatedAt' database timestamps
  { timestamps: true }
);

// Create compound database index for fast query retrieval of a student's attendance history
attendanceSchema.index({ student: 1, date: -1 });

// Create the model
const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
