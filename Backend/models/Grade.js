import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Define the database schema for student grades/marks
const gradeSchema = new mongoose.Schema(
  {
    // Reference to the Student receiving the grade (User document)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to the Teacher who graded the assessment (User document)
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // General course name group/module
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    // Department of the course (e.g. "TI", "Mecanique")
    department: {
      type: String,
      required: true,
    },
    // Specific subject or element evaluated
    subject: {
      type: String,
      required: true,
    },
    // Score obtained by the student (scale of 0 to 20 under Tunisian grading standards)
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
    },
    // Assessment weight coefficient multiplier (used in computing weighted GPA averages)
    coefficient: {
      type: Number,
      required: true,
      default: 1,
    },
    // Target semester period designation (e.g., Semester 1, Semester 2)
    semester: {
      type: String,
      required: true,
    },
    // Assessment category type (DS/Continuous, EXAM, TP/Practical, TD/Tutorial, or PROJECT)
    type: {
      type: String,
      enum: ['DS', 'EXAM', 'TP', 'TD', 'PROJECT'],
      required: true,
    },
    // Date when the grade was registered
    date: {
      type: Date,
      default: Date.now,
    },
    // Optional remark notes or feedback from the instructor
    notes: {
      type: String,
      default: '',
    },
  },
  // Automatically add 'createdAt' and 'updatedAt' database timestamps
  { timestamps: true }
);

// Indexes to speed up queries by student
gradeSchema.index({ student: 1, semester: 1 });

// Create the model
const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;
