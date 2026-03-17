import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
    },
    coefficient: {
      type: Number,
      required: true,
      default: 1,
    },
    semester: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['DS', 'EXAM', 'TP', 'TD', 'PROJECT'],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes to speed up queries by student
gradeSchema.index({ student: 1, semester: 1 });

const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;
