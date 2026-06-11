import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)
import bcrypt from 'bcrypt'; // Library to hash passwords securely

// Define the schema representing a user in the system
const userSchema = new mongoose.Schema(
  {
    // User's first name
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true, // Automatically strip leading/trailing whitespace
    },
    // User's last name
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    // User's email address
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Restrict duplicate emails in the database
      lowercase: true, // Automatically convert email to lowercase before saving
      trim: true,
      // Regular expression validation to match email format standard
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    // Hashed password string
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6, // Enforce minimum password length of 6 characters
      select: false, // Do not fetch this field in database queries by default
    },
    // System authorization role
    role: {
      type: String,
      enum: ['ADMIN', 'STUDENT', 'TEACHER', 'PARTNER', 'CHEF_DEPT'], // Allowed roles in the platform
      default: 'STUDENT',
    },
    // URL or path pointing to the user's avatar image
    avatar: {
      type: String,
      default: '',
    },
    // Status flag to enable or disable accounts
    isActive: {
      type: Boolean,
      default: true,
    },
    // Optional profile fields based on role:
    department: { type: String }, // Department name (for teachers, students, department heads)
    studentId: { type: String }, // Unique identifier of a student (e.g. roll number)
    registrationNumber: { type: String }, // Registration code
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // Link to Class document
    className: { type: String }, // Plain text name of class for quick access
    teacherId: { type: String }, // Internal ID matching department records
  },
  // Automatically add 'createdAt' and 'updatedAt' database timestamps
  { timestamps: true }
);

// Mongoose pre-save hook to hash password before committing it to the database
userSchema.pre('save', async function (next) {
  // If the password has not been edited or updated, proceed without hashing
  if (!this.isModified('password')) return next();
  try {
    // Generate salt rounds
    const salt = await bcrypt.genSalt(10);
    // Hash password using salt value
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    // Pass execution error to database handler
    next(error);
  }
});

// Helper instance method on user document to compare password inputs with database hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the model
const User = mongoose.model('User', userSchema);
export default User;
