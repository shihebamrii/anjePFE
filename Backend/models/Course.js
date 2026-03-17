import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      default: 1,
    },
    level: {
      type: Number,
      default: 1,
    },
    hours: {
      lectures: { type: Number, default: 0 },
      tutorials: { type: Number, default: 0 },
      practicals: { type: Number, default: 0 },
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    trackName: {
      type: String,
      default: '',
    },
    externalId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;
