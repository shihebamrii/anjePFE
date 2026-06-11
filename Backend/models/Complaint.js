import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Define the database schema for student grade complaints
const complaintSchema = new mongoose.Schema(
  {
    // Reference to the Student who filed the complaint (User document)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to the specific Grade document being disputed
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
    },
    // Reason or text description explaining the dispute
    reason: {
      type: String,
      required: [true, 'La raison est obligatoire'], // 'Reason is required'
      trim: true,
    },
    // Resolution status of the complaint (Pending, Accepted, or Rejected)
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
    // Text response or explanation provided during resolution
    response: {
      type: String,
      default: '',
    },
    // Reference to the Teacher or Chef de Département who resolved the complaint
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Timestamp recording when the complaint was marked as resolved
    resolvedAt: {
      type: Date,
    },
  },
  // Automatically add 'createdAt' and 'updatedAt' database timestamps
  { timestamps: true }
);

// Define indices to optimize sorting and filtering query performance
complaintSchema.index({ student: 1, status: 1 });
complaintSchema.index({ status: 1 });

// Create the model
const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
