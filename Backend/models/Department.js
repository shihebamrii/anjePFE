import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  grade: { type: String, default: '' },
  gradeAbbr: { type: String, default: '' },
  specialization: { type: String, default: '' },
  externalId: { type: String },
}, { _id: true });

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: Number, required: true },
  track: { type: String, default: '' },
  students: { type: Number, default: 0 },
  academicYear: { type: String, default: '2025-2026' },
  externalId: { type: String },
}, { _id: true });

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    head: {
      type: String,
      required: [true, 'Department head name is required'],
      trim: true,
    },
    headEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    teachers: [teacherSchema],
    classes: [classSchema],
  },
  { timestamps: true }
);

const Department = mongoose.model('Department', departmentSchema);
export default Department;
