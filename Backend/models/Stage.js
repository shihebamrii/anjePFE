import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Define the database schema for Internship Offers (Offres de Stage)
const stageSchema = new mongoose.Schema(
  {
    // Title of the internship role (e.g. "React JS developer")
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Name of the recruiting host company
    companyName: {
      type: String,
      required: true,
    },
    // Location address of the internship (e.g. Gafsa, Tunis, Remote)
    location: {
      type: String,
      required: true,
    },
    // Duration period of the internship
    duration: {
      type: String,
      required: true, // e.g., "3 mois", "6 mois"
    },
    // Type/nature classification of the internship under Tunisian standards:
    // PFE (Final graduation project), OUVRIER (Introductory), PERFECTIONNEMENT (Intermediate), SUMMER (Summer placement)
    type: {
      type: String,
      enum: ['PFE', 'OUVRIER', 'PERFECTIONNEMENT', 'SUMMER'],
      required: true,
    },
    // Application availability status (Open, Closed, or Filled)
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'FILLED'],
      default: 'OPEN',
    },
    // Array of key requirements or skills needed for candidate selection
    requirements: [{
      type: String,
    }],
    // Description summarizing the tasks and expectations of the internship
    description: {
      type: String,
      required: true,
    },
    // Email where students should send their resumes/portfolios
    contactEmail: {
      type: String,
      required: true,
    },
    // Deadline date for accepting candidate applications
    deadline: {
      type: Date,
      required: true,
    },
    // Reference to the User who posted this offer (Partner or Admin User document)
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Partner or Admin who posted it
    },
    // Path or URL to company logo/promotional flyer image
    image: {
      type: String,
      default: '',
    },
    // Path or URL to detailed PDF document specification sheets
    document: {
      type: String,
      default: '',
    },
  },
  // Automatically add 'createdAt' and 'updatedAt' database timestamps
  { timestamps: true }
);

// Create the model
const Stage = mongoose.model('Stage', stageSchema);
export default Stage;
