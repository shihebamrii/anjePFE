import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Define the database schema representing an academic Course (Matière)
const courseSchema = new mongoose.Schema(
  {
    // Name or title of the course
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Codification of the course (e.g. "INF-01", "MATH-02")
    code: {
      type: String,
      required: true,
      trim: true,
    },
    // Semester in which the course is taught (e.g. Semester 1, 2, etc.)
    semester: {
      type: Number,
      default: 1,
    },
    // Academic study level or year (e.g. Year 1, 2, 3)
    level: {
      type: Number,
      default: 1,
    },
    // Structured workload allocation hours
    hours: {
      lectures: { type: Number, default: 0 }, // Lecture session hours (Cours)
      tutorials: { type: Number, default: 0 }, // Tutorial session hours (TD)
      practicals: { type: Number, default: 0 }, // Lab session hours (TP)
    },
    // Reference link to the parent Department document
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    // Specialty track option or focus field (e.g. DSI, SEM, etc.)
    trackName: {
      type: String,
      default: '',
    },
    // Unique ID used to sync or map from external systems (e.g. Excel templates)
    externalId: {
      type: String,
      unique: true,
    },
  },
  // Automatically add 'createdAt' and 'updatedAt' database timestamps
  { timestamps: true }
);

// Create the model
const Course = mongoose.model('Course', courseSchema);

export default Course;
