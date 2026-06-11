import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Sub-schema representing teachers assigned to this department
const teacherSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true }, // Teacher's first name
  lastName: { type: String, required: true, trim: true }, // Teacher's last name
  email: { type: String, trim: true }, // Contact email address
  grade: { type: String, default: '' }, // Academic status rank (e.g. Maitre de conferences, Assistant, etc.)
  gradeAbbr: { type: String, default: '' }, // Abbreviation of teacher's rank grade
  specialization: { type: String, default: '' }, // Professional subject specialization focus
  externalId: { type: String }, // Matching reference code from administration Excel sheets
}, { _id: true }); // Automatically generate an _id for each department teacher

// Sub-schema representing student classes or cohorts within the department (e.g. DSI 3.1)
const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // Full class section name
  level: { type: Number, required: true }, // Study level/year (e.g. 1st year, 2nd year, 3rd year)
  track: { type: String, default: '' }, // Option track path (e.g. DSI, SEM, RSI)
  students: { type: Number, default: 0 }, // Total headcount of students registered in class section
  academicYear: { type: String, default: '2025-2026' }, // Academic session duration term
  externalId: { type: String }, // Administration synchronization ID
}, { _id: true }); // Automatically generate an _id for each class section

// Main schema representing a university Department
const departmentSchema = new mongoose.Schema(
  {
    // Name of the department (e.g. Department of Information Technology)
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    // Brief summary of department courses or description
    description: {
      type: String,
      default: '',
    },
    // Name of the department director (Chef de Département)
    head: {
      type: String,
      required: [true, 'Department head name is required'],
      trim: true,
    },
    // Email address of the department director
    headEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    // Sub-document array listing all teachers assigned to this department
    teachers: [teacherSchema],
    // Sub-document array listing all classes managed by this department
    classes: [classSchema],
  },
  // Automatically manage 'createdAt' and 'updatedAt' timestamps in DB
  { timestamps: true }
);

// Create the model
const Department = mongoose.model('Department', departmentSchema);
export default Department;
